/**
 * Courses Feature Module
 * 
 * Provides lazy-loadable page factories for the courses/learning feature.
 */

export const coursePages = {
  Courses: () => import("@/pages/Courses"),
  CourseDetail: () => import("@/pages/CourseDetail"),
  CourseLearn: () => import("@/pages/CourseLearn"),
  ManageCourses: () => import("@/pages/ManageCourses"),
  ManageLessons: () => import("@/pages/ManageLessons"),
  MyLearning: () => import("@/pages/MyLearning"),
  Certificate: () => import("@/pages/Certificate"),
};
