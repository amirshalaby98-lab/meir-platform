import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { lessons, courses } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Lessons Router - إدارة الدروس
 */
export const lessonsRouter = router({
  /**
   * Get all lessons for a course
   */
  getByCourseId: publicProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db
        .select()
        .from(lessons)
        .where(eq(lessons.courseId, input.courseId))
        .orderBy(lessons.order);
      return result;
    }),

  /**
   * Get lesson by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [lesson] = await db
        .select()
        .from(lessons)
        .where(eq(lessons.id, input.id));
      return lesson;
    }),

  /**
   * Get lesson by slug
   */
  getBySlug: publicProcedure
    .input(z.object({ courseId: z.number(), slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const allLessons = await db
        .select()
        .from(lessons)
        .where(eq(lessons.courseId, input.courseId));
      
      const lesson = allLessons.find((l: any) => l.slug === input.slug);
      return lesson;
    }),

  /**
   * Create new lesson
   */
  create: publicProcedure
    .input(
      z.object({
        courseId: z.number(),
        title: z.string(),
        slug: z.string(),
        description: z.string(),
        videoUrl: z.string().optional(),
        duration: z.number(),
        order: z.number(),
        published: z.number().default(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [result] = await db.insert(lessons).values(input);
      
      // Update course totalLessons
      const courseLessons = await db
        .select()
        .from(lessons)
        .where(eq(lessons.courseId, input.courseId));
      
      await db
        .update(courses)
        .set({ 
          totalLessons: courseLessons.length + 1,
          totalDuration: courseLessons.reduce((sum: number, l: any) => sum + (l.duration || 0), 0) + input.duration
        })
        .where(eq(courses.id, input.courseId));

      return { id: result.insertId };
    }),

  /**
   * Update lesson
   */
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        videoUrl: z.string().optional(),
        duration: z.number().optional(),
        order: z.number().optional(),
        published: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...data } = input;
      await db.update(lessons).set(data).where(eq(lessons.id, id));
      
      // Update course statistics if duration changed
      if (data.duration !== undefined) {
        const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
        if (lesson) {
          const courseLessons = await db
            .select()
            .from(lessons)
            .where(eq(lessons.courseId, lesson.courseId));
          
          await db
            .update(courses)
            .set({ 
              totalDuration: courseLessons.reduce((sum: number, l: any) => sum + (l.duration || 0), 0)
            })
            .where(eq(courses.id, lesson.courseId));
        }
      }

      return { success: true };
    }),

  /**
   * Delete lesson
   */
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get lesson info before deleting
      const [lesson] = await db.select().from(lessons).where(eq(lessons.id, input.id));
      
      if (lesson) {
        // Delete the lesson
        await db.delete(lessons).where(eq(lessons.id, input.id));
        
        // Update course statistics
        const courseLessons = await db
          .select()
          .from(lessons)
          .where(eq(lessons.courseId, lesson.courseId));
        
        await db
          .update(courses)
          .set({ 
            totalLessons: courseLessons.length,
            totalDuration: courseLessons.reduce((sum: number, l: any) => sum + (l.duration || 0), 0)
          })
          .where(eq(courses.id, lesson.courseId));
      }

      return { success: true };
    }),

  /**
   * Reorder lessons
   */
  reorder: publicProcedure
    .input(
      z.object({
        courseId: z.number(),
        lessonIds: z.array(z.number()),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Update order for each lesson
      for (let i = 0; i < input.lessonIds.length; i++) {
        await db
          .update(lessons)
          .set({ order: i + 1 })
          .where(eq(lessons.id, input.lessonIds[i]));
      }

      return { success: true };
    }),
});
