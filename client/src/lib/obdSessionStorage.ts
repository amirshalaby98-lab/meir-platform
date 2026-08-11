/**
 * OBD Session Storage - حفظ جلسات التشخيص محلياً
 * ═══════════════════════════════════════════════════════
 * Uses IndexedDB for persistent local storage of diagnostic sessions
 * 
 * Features:
 * - Save/load complete scan reports
 * - Session comparison (diff between two scans)
 * - Export to PDF/Text/JSON
 * - Share via WhatsApp/Email
 * - Auto-cleanup of old sessions (configurable retention)
 * 
 * @version 1.0.0
 */

import type { ScanReport, OBDLiveData, OBDDTCCode, FreezeFrameData, Mode6TestResult, O2SensorData, OBDAlert } from "./obdBleService";

// ═══════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════

export interface StoredSession {
  id: string;
  timestamp: number;
  vin: string;
  protocol: string;
  make: string;
  model: string;
  year: number;
  mileage?: number;
  notes?: string;
  report: ScanReport;
  healthScore: number;
  dtcCount: number;
  duration: number; // scan duration in seconds
}

export interface SessionComparison {
  session1: StoredSession;
  session2: StoredSession;
  changes: ComparisonChange[];
  healthDelta: number;
  newDTCs: string[];
  resolvedDTCs: string[];
  summary: string;
}

export interface ComparisonChange {
  parameter: string;
  parameterAr: string;
  value1: number | string;
  value2: number | string;
  unit: string;
  delta: number | null;
  status: "improved" | "worsened" | "unchanged" | "new" | "resolved";
}

// ═══════════════════════════════════════════════════════
// INDEXEDDB WRAPPER
// ═══════════════════════════════════════════════════════

const DB_NAME = "meir_obd_sessions";
const DB_VERSION = 1;
const STORE_NAME = "sessions";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("timestamp", "timestamp", { unique: false });
        store.createIndex("vin", "vin", { unique: false });
        store.createIndex("make", "make", { unique: false });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ═══════════════════════════════════════════════════════
// SESSION CRUD OPERATIONS
// ═══════════════════════════════════════════════════════

export async function saveSession(session: StoredSession): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(session);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getSession(id: string): Promise<StoredSession | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllSessions(): Promise<StoredSession[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).index("timestamp").getAll();
    request.onsuccess = () => {
      // Sort by timestamp descending (newest first)
      const sessions = (request.result || []).sort((a, b) => b.timestamp - a.timestamp);
      resolve(sessions);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getSessionsByVIN(vin: string): Promise<StoredSession[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).index("vin").getAll(vin);
    request.onsuccess = () => {
      const sessions = (request.result || []).sort((a, b) => b.timestamp - a.timestamp);
      resolve(sessions);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteSession(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearAllSessions(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getSessionCount(): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ═══════════════════════════════════════════════════════
// SESSION COMPARISON
// ═══════════════════════════════════════════════════════

export function compareSessions(session1: StoredSession, session2: StoredSession): SessionComparison {
  const changes: ComparisonChange[] = [];
  
  // Compare live data parameters
  const liveParams: Array<{ key: keyof OBDLiveData; name: string; nameAr: string; unit: string }> = [
    { key: "rpm", name: "RPM", nameAr: "دورات المحرك", unit: "rpm" },
    { key: "coolantTemp", name: "Coolant Temp", nameAr: "حرارة المحرك", unit: "°C" },
    { key: "voltage", name: "Battery Voltage", nameAr: "جهد البطارية", unit: "V" },
    { key: "engineLoad", name: "Engine Load", nameAr: "حمل المحرك", unit: "%" },
    { key: "throttlePos", name: "Throttle Position", nameAr: "دواسة الوقود", unit: "%" },
    { key: "fuelLevel", name: "Fuel Level", nameAr: "مستوى الوقود", unit: "%" },
    { key: "shortFuelTrim", name: "Short Fuel Trim", nameAr: "Short Fuel Trim", unit: "%" },
    { key: "longFuelTrim", name: "Long Fuel Trim", nameAr: "Long Fuel Trim", unit: "%" },
    { key: "oilTemp", name: "Oil Temperature", nameAr: "حرارة الزيت", unit: "°C" },
    { key: "mafRate", name: "MAF Rate", nameAr: "MAF", unit: "g/s" },
    { key: "timingAdvance", name: "Timing Advance", nameAr: "توقيت الإشعال", unit: "°" },
    { key: "fuelPressure", name: "Fuel Pressure", nameAr: "ضغط الوقود", unit: "kPa" },
  ];

  for (const param of liveParams) {
    const val1 = session1.report.liveData[param.key] as number | undefined;
    const val2 = session2.report.liveData[param.key] as number | undefined;
    
    if (val1 !== undefined && val2 !== undefined) {
      const delta = val2 - val1;
      let status: ComparisonChange["status"] = "unchanged";
      
      // Determine if change is improvement or worsening
      if (Math.abs(delta) > 0.5) {
        if (param.key === "coolantTemp" || param.key === "oilTemp") {
          status = delta > 5 ? "worsened" : delta < -5 ? "improved" : "unchanged";
        } else if (param.key === "voltage") {
          status = (val2 < 12.5 || val2 > 15.0) ? "worsened" : "improved";
        } else if (param.key === "shortFuelTrim" || param.key === "longFuelTrim") {
          status = Math.abs(val2) > Math.abs(val1) ? "worsened" : "improved";
        } else {
          status = "unchanged";
        }
      }
      
      changes.push({
        parameter: param.name,
        parameterAr: param.nameAr,
        value1: val1,
        value2: val2,
        unit: param.unit,
        delta,
        status,
      });
    }
  }

  // Compare DTCs
  const dtcs1 = new Set(session1.report.dtcCodes.map(d => d.code));
  const dtcs2 = new Set(session2.report.dtcCodes.map(d => d.code));
  
  const newDTCs = Array.from(dtcs2).filter(d => !dtcs1.has(d));
  const resolvedDTCs = Array.from(dtcs1).filter(d => !dtcs2.has(d));

  // Health delta
  const healthDelta = (session2.report.engineHealthScore || 0) - (session1.report.engineHealthScore || 0);

  // Generate summary
  let summary = "";
  if (healthDelta > 10) summary = "تحسن ملحوظ في صحة المحرك";
  else if (healthDelta > 0) summary = "تحسن طفيف";
  else if (healthDelta < -10) summary = "تراجع ملحوظ - يحتاج فحص";
  else if (healthDelta < 0) summary = "تراجع طفيف";
  else summary = "لا تغيير يذكر";

  if (newDTCs.length > 0) summary += ` | ${newDTCs.length} أعطال جديدة`;
  if (resolvedDTCs.length > 0) summary += ` | ${resolvedDTCs.length} أعطال تم حلها`;

  return { session1, session2, changes, healthDelta, newDTCs, resolvedDTCs, summary };
}

// ═══════════════════════════════════════════════════════
// EXPORT FUNCTIONS
// ═══════════════════════════════════════════════════════

export function exportSessionAsJSON(session: StoredSession): string {
  return JSON.stringify(session, null, 2);
}

export function exportSessionAsText(session: StoredSession): string {
  const line = "━".repeat(50);
  const doubleLine = "═".repeat(50);
  
  let text = `${doubleLine}\n`;
  text += `  تقرير فحص OBD2 - مركز مير\n`;
  text += `${doubleLine}\n\n`;
  text += `📅 التاريخ: ${new Date(session.timestamp).toLocaleString("ar-SA")}\n`;
  text += `🚗 السيارة: ${session.make} ${session.model} ${session.year}\n`;
  text += `🔑 VIN: ${session.vin || "غير متاح"}\n`;
  text += `📡 البروتوكول: ${session.protocol}\n`;
  if (session.mileage) text += `📏 الكيلومترات: ${session.mileage.toLocaleString()} km\n`;
  text += `💚 صحة المحرك: ${session.healthScore}%\n`;
  text += `⏱ مدة الفحص: ${session.duration} ثانية\n\n`;

  // Live Data
  text += `${line}\n  📊 البيانات الحية\n${line}\n`;
  const ld = session.report.liveData;
  if (ld.rpm !== undefined) text += `  RPM: ${ld.rpm.toFixed(0)} rpm\n`;
  if (ld.speed !== undefined) text += `  السرعة: ${ld.speed} km/h\n`;
  if (ld.coolantTemp !== undefined) text += `  حرارة المحرك: ${ld.coolantTemp}°C\n`;
  if (ld.voltage !== undefined) text += `  جهد البطارية: ${ld.voltage.toFixed(1)} V\n`;
  if (ld.engineLoad !== undefined) text += `  حمل المحرك: ${ld.engineLoad.toFixed(1)}%\n`;
  if (ld.throttlePos !== undefined) text += `  دواسة الوقود: ${ld.throttlePos.toFixed(1)}%\n`;
  if (ld.oilTemp !== undefined) text += `  حرارة الزيت: ${ld.oilTemp}°C\n`;
  if (ld.mafRate !== undefined) text += `  MAF: ${ld.mafRate.toFixed(2)} g/s\n`;
  if (ld.shortFuelTrim !== undefined) text += `  Short FT: ${ld.shortFuelTrim.toFixed(1)}%\n`;
  if (ld.longFuelTrim !== undefined) text += `  Long FT: ${ld.longFuelTrim.toFixed(1)}%\n`;

  // DTCs
  text += `\n${line}\n  🔧 أكواد الأعطال (${session.report.dtcCodes.length})\n${line}\n`;
  if (session.report.dtcCodes.length === 0) {
    text += `  ✅ لا توجد أعطال\n`;
  } else {
    session.report.dtcCodes.forEach(dtc => { text += `  ❌ ${dtc.code}\n`; });
  }

  // Mode 6
  if (session.report.mode6Results.length > 0) {
    const failed = session.report.mode6Results.filter(t => t.status === "fail");
    text += `\n${line}\n  Mode 6 (${failed.length} يحتاج مراجعة من ${session.report.mode6Results.length})\n${line}\n`;
    failed.forEach(t => { text += `  ❌ ${t.component}: ${t.value.toFixed(2)} ${t.unit}\n`; });
  }

  // Notes
  if (session.notes) {
    text += `\n${line}\n  📝 ملاحظات\n${line}\n`;
    text += `  ${session.notes}\n`;
  }

  text += `\n${doubleLine}\n`;
  text += `  MEIR - مير للخدمات - meirservic.co\n`;
  text += `${doubleLine}\n`;

  return text;
}

// ═══════════════════════════════════════════════════════
// SHARE FUNCTIONS
// ═══════════════════════════════════════════════════════

export function shareViaWhatsApp(session: StoredSession, phoneNumber?: string): void {
  const text = generateShareText(session);
  const encoded = encodeURIComponent(text);
  const url = phoneNumber 
    ? `https://wa.me/${phoneNumber}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
  window.open(url, "_blank");
}

export function shareViaEmail(session: StoredSession, email?: string): void {
  const subject = encodeURIComponent(`تقرير فحص OBD2 - ${session.make} ${session.model} ${session.year}`);
  const body = encodeURIComponent(generateShareText(session));
  const url = email 
    ? `mailto:${email}?subject=${subject}&body=${body}`
    : `mailto:?subject=${subject}&body=${body}`;
  window.open(url, "_blank");
}

export async function shareNative(session: StoredSession): Promise<boolean> {
  if (!navigator.share) return false;
  
  try {
    await navigator.share({
      title: `تقرير فحص - ${session.make} ${session.model}`,
      text: generateShareText(session),
    });
    return true;
  } catch {
    return false;
  }
}

function generateShareText(session: StoredSession): string {
  const healthStatus = session.healthScore >= 90 ? "جيد جداً" : session.healthScore >= 75 ? "جيد" : session.healthScore >= 55 ? "متوسط" : "يحتاج صيانة";
  const scanDate = new Date(session.timestamp);
  const dateStr = scanDate.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
  const timeStr = scanDate.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
  const ld = session.report.liveData;

  let text = "";
  text += `MEIR - مير للتشخيص الاحترافي\n`;
  text += `تقرير فحص OBD2 الشامل\n`;
  text += `——————————————————————————————\n`;
  text += `التاريخ: ${dateStr}  الوقت: ${timeStr}\n`;
  text += `——————————————————————————————\n\n`;

  // Vehicle Info
  text += `[ معلومات السيارة ]\n`;
  if (session.make) text += `الماركة: ${session.make}\n`;
  if (session.model) text += `الموديل: ${session.model}\n`;
  if (session.year) text += `سنة الصنع: ${session.year}\n`;
  if (session.mileage) text += `الكيلومترات: ${session.mileage.toLocaleString()} كم\n`;
  if (session.vin) text += `رقم الشاسيه (VIN): ${session.vin}\n`;
  if (session.protocol) text += `بروتوكول الاتصال: ${session.protocol}\n`;
  text += `\n`;

  // Health Score
  text += `[ صحة المحرك ]\n`;
  text += `التقييم العام: ${session.healthScore}% - ${healthStatus}\n\n`;

  // DTC Codes
  text += `[ نتائج الأعطال ]\n`;
  if (session.report.dtcCodes.length === 0) {
    text += `لا توجد أعطال مسجلة\n`;
  } else {
    text += `عدد الأعطال: ${session.report.dtcCodes.length}\n`;
    session.report.dtcCodes.forEach((dtc, i) => {
      text += `${i + 1}. ${dtc.code}\n`;
    });
  }
  text += `\n`;

  // Live Data
  text += `[ بيانات التشخيص الحية ]\n`;
  if (ld.rpm !== undefined && ld.rpm > 0) text += `سرعة المحرك (RPM): ${Math.round(ld.rpm)}\n`;
  if (ld.speed !== undefined) text += `سرعة السيارة: ${ld.speed} كم/سا\n`;
  if (ld.coolantTemp !== undefined) text += `حرارة المحرك: ${ld.coolantTemp} درجة مئوية\n`;
  if (ld.voltage !== undefined && ld.voltage > 0) text += `جهد البطارية: ${ld.voltage.toFixed(1)} فولت\n`;
  if (ld.engineLoad !== undefined && ld.engineLoad > 0) text += `حمل المحرك: ${ld.engineLoad.toFixed(1)}%\n`;
  if (ld.throttlePos !== undefined && ld.throttlePos > 0) text += `وضع الخنق: ${ld.throttlePos.toFixed(1)}%\n`;
  if (ld.fuelLevel !== undefined && ld.fuelLevel > 0) text += `مستوى الوقود: ${ld.fuelLevel.toFixed(0)}%\n`;
  if (ld.intakeTemp !== undefined && ld.intakeTemp > 0) text += `حرارة هواء السحب: ${ld.intakeTemp} درجة مئوية\n`;
  if (ld.mafRate !== undefined && ld.mafRate > 0) text += `تدفق الهواء (MAF): ${ld.mafRate.toFixed(2)} جم/ثانية\n`;
  if (ld.shortFuelTrim !== undefined) text += `تعديل الوقود قصير: ${ld.shortFuelTrim.toFixed(1)}%\n`;
  if (ld.longFuelTrim !== undefined) text += `تعديل الوقود طويل: ${ld.longFuelTrim.toFixed(1)}%\n`;
  if (ld.oilTemp !== undefined && ld.oilTemp > 0) text += `حرارة الزيت: ${ld.oilTemp} درجة مئوية\n`;
  if (ld.timingAdvance !== undefined && ld.timingAdvance !== 0) text += `تقدم الاشتعال: ${ld.timingAdvance.toFixed(1)} درجة\n`;
  text += `\n`;

  // Readiness
  const readiness = session.report.readinessTests;
  if (readiness && Object.keys(readiness).length > 0) {
    text += `[ جاهزية الأنظمة ]\n`;
    const readinessNames: Record<string, string> = {
      catalyst: "المحول الحفازي",
      heatedCatalyst: "المحول الحفازي المسخن",
      evap: "نظام EVAP",
      secondaryAir: "الهواء الثانوي",
      o2Sensor: "حساس O2",
      o2SensorHeater: "سخان O2",
      egrSystem: "نظام EGR",
    };
    Object.entries(readiness).forEach(([key, val]) => {
      const name = readinessNames[key] || key;
      const status = val === "pass" ? "جاهز" : val === "fail" ? "غير جاهز" : "---";
      text += `${name}: ${status}\n`;
    });
    text += `\n`;
  }

  // Footer
  text += `——————————————————————————————\n`;
  text += `MEIR - مير للخدمات\n`;
  text += `meirservic.co\n`;
  text += `هاتف: 0543257872`;

  return text;
}

// ═══════════════════════════════════════════════════════
// HELPER: Create session from scan report
// ═══════════════════════════════════════════════════════

export function createSessionFromReport(
  report: ScanReport,
  make: string,
  model: string,
  year: number,
  duration: number,
  mileage?: number,
  notes?: string,
): StoredSession {
  return {
    id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    timestamp: Date.now(),
    vin: report.vin || "",
    protocol: report.protocol || "",
    make,
    model,
    year,
    mileage,
    notes,
    report,
    healthScore: report.engineHealthScore || 0,
    dtcCount: report.dtcCodes.length,
    duration,
  };
}

// ═══════════════════════════════════════════════════════
// AUTO-CLEANUP (keep last 100 sessions)
// ═══════════════════════════════════════════════════════

export async function cleanupOldSessions(maxSessions: number = 100): Promise<number> {
  const sessions = await getAllSessions();
  if (sessions.length <= maxSessions) return 0;
  
  // Delete oldest sessions beyond the limit
  const toDelete = sessions.slice(maxSessions);
  for (const session of toDelete) {
    await deleteSession(session.id);
  }
  
  return toDelete.length;
}
