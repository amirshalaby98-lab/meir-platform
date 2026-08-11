import { z } from "zod";
import { publicProcedure, router } from "../../_core/trpc";
import { getDb } from "../../shared/database";
import { courses, lessons } from "../../../drizzle/schema";
import { eq, like, or, desc } from "drizzle-orm";

/**
 * Courses Router - إدارة الدورات التدريبية
 */
export const coursesRouter = router({
  /**
   * Get all courses with optional filtering
   */
  getAll: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        category: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db.select().from(courses);

      if (input?.search) {
        query = query.where(
          or(
            like(courses.title, `%${input.search}%`),
            like(courses.description, `%${input.search}%`)
          )
        ) as any;
      }

      if (input?.level) {
        query = query.where(eq(courses.level, input.level)) as any;
      }

      if (input?.category) {
        query = query.where(eq(courses.category, input.category)) as any;
      }

      const result = await query.orderBy(desc(courses.createdAt));
      return result;
    }),

  /**
   * Get course by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [course] = await db
        .select()
        .from(courses)
        .where(eq(courses.id, input.id));
      return course;
    }),

  /**
   * Get course by slug
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [course] = await db
        .select()
        .from(courses)
        .where(eq(courses.slug, input.slug));
      return course;
    }),

  /**
   * Create new course
   */
  create: publicProcedure
    .input(
      z.object({
        title: z.string(),
        slug: z.string(),
        description: z.string(),
        thumbnail: z.string().optional(),
        level: z.enum(["beginner", "intermediate", "advanced"]),
        category: z.string(),
        duration: z.string(),
        price: z.number(),
        instructor: z.string(),
        totalLessons: z.number().default(0),
        totalDuration: z.number().default(0),
        published: z.number().default(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [result] = await db.insert(courses).values(input);
      return { id: result.insertId };
    }),

  /**
   * Update course
   */
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        thumbnail: z.string().optional(),
        level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        category: z.string().optional(),
        duration: z.string().optional(),
        price: z.number().optional(),
        instructor: z.string().optional(),
        totalLessons: z.number().optional(),
        totalDuration: z.number().optional(),
        published: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...data } = input;
      await db.update(courses).set(data).where(eq(courses.id, id));
      return { success: true };
    }),

  /**
   * Delete course
   */
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Delete all lessons first
      await db.delete(lessons).where(eq(lessons.courseId, input.id));
      // Then delete the course
      await db.delete(courses).where(eq(courses.id, input.id));
      return { success: true };
    }),

  /**
   * Get course statistics
   */
  getStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const allCourses = await db.select().from(courses);
    return {
      total: allCourses.length,
      published: allCourses.filter((c: any) => c.published === 1).length,
      draft: allCourses.filter((c: any) => c.published === 0).length,
      totalStudents: allCourses.reduce((sum: number, c: any) => sum + (c.enrolledCount || 0), 0),
    };
  }),
});
