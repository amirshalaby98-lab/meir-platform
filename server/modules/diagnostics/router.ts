import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../../_core/trpc";
import { getDb } from "../../shared/database";
import { obdSessions, obdDtcResults, aiDiagnosticReports } from "../../../drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";
import { dtcDatabase, lookupDTC, searchDTCs } from "./dtcDatabase";
import { invokeLLM } from "../../_core/llm";

export const diagnosticsRouter = router({
  // ═══ DTC Database Queries ═══
  lookupDTC: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(({ input }) => {
      const result = lookupDTC(input.code);
      return result || null;
    }),

  searchDTCs: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(({ input }) => {
      return searchDTCs(input.query);
    }),

  getAllDTCs: publicProcedure.query(() => {
    return Object.values(dtcDatabase);
  }),

  // ═══ OBD Sessions ═══
  createSession: protectedProcedure
    .input(z.object({
      bookingId: z.number().optional(),
      vin: z.string().optional(),
      vehicleMake: z.string().optional(),
      vehicleModel: z.string().optional(),
      vehicleYear: z.string().optional(),
      engineType: z.string().optional(),
      deviceName: z.string().optional(),
      protocol: z.string().optional(),
      connectionType: z.enum(["bluetooth", "wifi", "usb", "simulation"]).optional(),
      sessionType: z.enum(["full_scan", "dtc_read", "dtc_clear", "live_data", "ai_diagnosis"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(obdSessions).values({
        userId: ctx.user.id,
        ...input,
      });
      return { id: result.insertId };
    }),

  completeSession: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      dtcCount: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(obdSessions)
        .set({
          status: "completed",
          dtcCount: input.dtcCount || 0,
          notes: input.notes,
          completedAt: new Date(),
        })
        .where(eq(obdSessions.id, input.sessionId));
      return { success: true };
    }),

  saveDtcResults: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      dtcCodes: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const results = input.dtcCodes.map((code) => {
        const dtcInfo = lookupDTC(code);
        return {
          sessionId: input.sessionId,
          dtcCode: code,
          category: (dtcInfo?.category || code.charAt(0)) as "P" | "B" | "C" | "U",
          severity: dtcInfo?.severity || "medium" as const,
          description: dtcInfo?.description || `كود عطل غير معروف: ${code}`,
          system: dtcInfo?.system || "غير محدد",
          causes: dtcInfo?.causes || [],
          solution: dtcInfo?.solution || "يرجى مراجعة فني متخصص",
          estimatedCost: dtcInfo?.estimatedCost || "غير محدد",
        };
      });

      for (const result of results) {
        await db.insert(obdDtcResults).values(result);
      }

      return { saved: results.length };
    }),

  getSessionHistory: protectedProcedure
    .input(z.object({
      limit: z.number().optional().default(20),
      offset: z.number().optional().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const sessions = await db.select()
        .from(obdSessions)
        .where(eq(obdSessions.userId, ctx.user.id))
        .orderBy(desc(obdSessions.createdAt))
        .limit(input.limit)
        .offset(input.offset);
      return sessions;
    }),

  getSessionById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [session] = await db.select()
        .from(obdSessions)
        .where(eq(obdSessions.id, input.id));
      if (!session) return null;

      const dtcResults = await db.select()
        .from(obdDtcResults)
        .where(eq(obdDtcResults.sessionId, input.id));

      return { ...session, dtcResults };
    }),

  // ═══ AI Diagnosis ═══
  aiDiagnose: protectedProcedure
    .input(z.object({
      requestType: z.enum(["obd_code", "symptom_description", "full_report"]),
      inputData: z.string(),
      vehicleInfo: z.object({
        make: z.string().optional(),
        model: z.string().optional(),
        year: z.string().optional(),
        engineType: z.string().optional(),
      }).optional(),
      sessionId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Create report record
      const [reportResult] = await db.insert(aiDiagnosticReports).values({
        userId: ctx.user.id,
        sessionId: input.sessionId,
        requestType: input.requestType,
        inputData: input.inputData,
        vehicleInfo: input.vehicleInfo || {},
        status: "processing",
      });
      const reportId = reportResult.insertId;

      // Build AI prompt using OBDMeir AI system
      const vehicleStr = input.vehicleInfo ? `${input.vehicleInfo.make || ""} ${input.vehicleInfo.model || ""} ${input.vehicleInfo.year || ""}`.trim() : "غير محدد";
      let prompt = "";
      if (input.requestType === "obd_code") {
        const dtcInfo = lookupDTC(input.inputData);
        prompt = `البيانات الواردة من جهاز OBD-II:
• كود العطل: ${input.inputData}
${dtcInfo ? `• الوصف: ${dtcInfo.description}\n• النظام: ${dtcInfo.system}\n• الأسباب المعروفة: ${dtcInfo.causes.join("، ")}\n• الحل المرجعي: ${dtcInfo.solution}\n• التكلفة المرجعية: ${dtcInfo.estimatedCost}` : "• كود غير موجود في قاعدة البيانات المحلية"}
• المركبة: ${vehicleStr}

قدم تقرير تشخيص شامل يتضمن:
1. ملخص الحالة (وصف العطل بلغة بسيطة)
2. العطل الرئيسي والبروتوكول المستخدم (ISO 15765 / KWP2000 / J1850 / CAN)
3. احتمالات الأسباب مرتبة بالنسبة المئوية
4. خطوات الفحص العملية (قياس الجهد، تحليل CAN Logs، قراءة EEPROM)
5. القيم المرجعية من المصنع لهذه المركبة
6. الحل المقترح والتكلفة التقديرية
7. درجة الثقة في التشخيص (%)
8. تنبؤ بالأعطال المستقبلية المرتبطة
9. هل يمكن الاستمرار بالقيادة أم يجب التوقف فوراً`;
      } else if (input.requestType === "symptom_description") {
        prompt = `البيانات الواردة من العميل:
• وصف المشكلة: "${input.inputData}"
• المركبة: ${vehicleStr}

قدم تقرير تشخيص شامل يتضمن:
1. ملخص الحالة
2. التشخيص المبدئي بناءً على الأعراض
3. احتمالات الأسباب مرتبة بالنسبة المئوية
4. أكواد OBD-II المتوقعة مع شرحها
5. خطوات الفحص العملية باستخدام أجهزة الفحص (Multimeter، Oscilloscope، OBD Scanner)
6. القيم المرجعية من المصنع
7. الحل المقترح والتكلفة التقديرية
8. درجة الثقة في التشخيص (%)
9. تنبؤ بالأعطال المستقبلية
10. هل يمكن القيادة بأمان أم يجب التوقف فوراً`;
      } else {
        prompt = `البيانات الواردة:
${input.inputData}
• المركبة: ${vehicleStr}

قدم تقرير تشخيص شامل يتضمن:
1. ملخص الحالة
2. تحليل البيانات (Live Data: الجهد، السرعات، درجات الحرارة)
3. العلاقات بين الأكواد والقراءات لتحديد السبب الجذري
4. احتمالات الأسباب مرتبة
5. خطوات الفحص العملية باستخدام أجهزة Autel/Launch/Topdon
6. القيم المرجعية من المصنع
7. الحل المقترح والتكلفة
8. درجة الثقة (%)
9. تنبؤات مستقبلية`;
      }

      // OBDMeir AI System Prompt
      const OBDMEIR_SYSTEM_PROMPT = `أنت OBDMeir AI، منصة التشخيص الذكية المتقدمة لمركز Meir. أنت خبير في تحليل البيانات من المركبات باستخدام بروتوكولات OBD-II، CAN Bus، LIN، UDS، وDoIP.

تفهم جميع أنواع الاتصال: USB (1.0/2.0/3.0)، Bluetooth Classic، BLE، Wi-Fi Direct، والشبكات اللاسلكية.
تتعامل مع أجهزة Autel، Launch، Topdon، وتعرف كيفية إرسال واستقبال البيانات بشكل آمن.
لديك معرفة واسعة في خوارزميات Seed-Key وبرمجة وحدات ECU وTCM وBCM.

قواعد العمل:
1. حدد البروتوكول المستخدم (ISO 15765، KWP2000، J1850، CAN 11-bit/29-bit)
2. حلل Live Data: قيم الجهد، السرعات، درجات الحرارة
3. احسب العلاقات بين الأكواد والقراءات لتحديد السبب الجذري
4. اربط البيانات بسجل السيارة بناءً على VIN
5. قدم خطوات فحص عملية (قياس الجهد، تحليل CAN Logs، قراءة EEPROM)
6. اعتمد على مواصفات المصنع لكل مركبة، وقارن البيانات الفعلية مع القيم المرجعية
7. استخدم خوارزميات ذكاء اصطناعي للتنبؤ بالأعطال المستقبلية

شكل الرد: تقرير تشخيص شامل يتضمن: ملخص الحالة، العطل الرئيسي، احتمالات الأسباب، خطوات الفحص، ودرجة الثقة.
أجب دائماً باللغة العربية.`;

      try {
        const aiResult = await invokeLLM({
          messages: [
            { role: "system", content: OBDMEIR_SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
        });

        const aiResponse = typeof aiResult.choices[0]?.message?.content === "string"
          ? aiResult.choices[0].message.content
          : "لم يتم الحصول على رد من النظام";

        await db.update(aiDiagnosticReports)
          .set({
            diagnosis: aiResponse,
            status: "completed",
            urgencyLevel: input.requestType === "obd_code" ? (lookupDTC(input.inputData)?.severity === "high" ? "high" : "medium") : "medium",
            confidence: 85,
          })
          .where(eq(aiDiagnosticReports.id, reportId));

        return {
          id: reportId,
          diagnosis: aiResponse,
          status: "completed" as const,
        };
      } catch (error) {
        await db.update(aiDiagnosticReports)
          .set({ status: "failed" })
          .where(eq(aiDiagnosticReports.id, reportId));

        return {
          id: reportId,
          diagnosis: "حدث خطأ أثناء التشخيص. يرجى المحاولة مرة أخرى.",
          status: "failed" as const,
        };
      }
    }),

  getAiReports: protectedProcedure
    .input(z.object({
      limit: z.number().optional().default(20),
      offset: z.number().optional().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const reports = await db.select()
        .from(aiDiagnosticReports)
        .where(eq(aiDiagnosticReports.userId, ctx.user.id))
        .orderBy(desc(aiDiagnosticReports.createdAt))
        .limit(input.limit)
        .offset(input.offset);
      return reports;
    }),

  // ═══ Admin Stats ═══
  getAdminStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { sessions: { total: 0, completed: 0, totalDtcs: 0 }, aiReports: { total: 0, completed: 0 }, recentSessions: [] };

    const [sessionStats] = await db.select({
      total: sql<number>`COUNT(*)`,
      completed: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
      totalDtcs: sql<number>`SUM(COALESCE(dtcCount, 0))`,
    }).from(obdSessions);

    const [aiStats] = await db.select({
      total: sql<number>`COUNT(*)`,
      completed: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
    }).from(aiDiagnosticReports);

    const recentSessions = await db.select()
      .from(obdSessions)
      .orderBy(desc(obdSessions.createdAt))
      .limit(10);

    return {
      sessions: sessionStats,
      aiReports: aiStats,
      recentSessions,
    };
  }),
});
