import { relations } from "drizzle-orm";
import {
  users,
  bookings,
  contactMessages,
  technicians,
  loyaltyPoints,
  pointsHistory,
  courses,
  lessons,
  enrollments,
  lessonProgress,
  certificates,
  instructors,
  towTrucks,
  partsShops,
  junkyards,
  carBrands,
  carModels,
  serviceParts,
  partsPrices,
  laborTimes,
  pricingSettings,
  priceCalculations,
  promotions,
  notifications,
  invoices,
  vendors,
  vendorVerificationCodes,
  vendorDocuments,
  vendorServices,
  serviceTypes,
  partVariants,
  optionalLabor,
  advancedPriceCalculations,
  conversations,
  messages,
  priceOffers,
  chatParticipants,
  chatNotifications,
  vendorStats,
  serviceAnalytics,
  revenueTracking,
  monthlyRevenue,
  customerMetrics,
  reviews,
  reviewVotes,
  reviewResponses,
  vendorRatingSummary,
  savedFilters,
  badges,
  technicianBadges,
  rewards,
  technicianRewards,
  leaderboard,
} from "./schema";

// ─── User Relations ─────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  notifications: many(notifications),
  invoices: many(invoices),
  loyaltyPoints: many(loyaltyPoints),
  pointsHistory: many(pointsHistory),
  enrollments: many(enrollments),
  savedFilters: many(savedFilters),
  chatParticipants: many(chatParticipants),
  reviewVotes: many(reviewVotes),
}));

// ─── Booking Relations ──────────────────────────────────────────────────────
export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  technician: one(technicians, {
    fields: [bookings.technicianId],
    references: [technicians.id],
  }),
  invoices: many(invoices),
}));

// ─── Technician Relations ───────────────────────────────────────────────────
export const techniciansRelations = relations(technicians, ({ many }) => ({
  bookings: many(bookings),
  technicianBadges: many(technicianBadges),
  technicianRewards: many(technicianRewards),
  leaderboard: many(leaderboard),
}));

// ─── Loyalty Relations ──────────────────────────────────────────────────────
export const loyaltyPointsRelations = relations(loyaltyPoints, ({ one }) => ({
  user: one(users, {
    fields: [loyaltyPoints.userId],
    references: [users.id],
  }),
}));

export const pointsHistoryRelations = relations(pointsHistory, ({ one }) => ({
  user: one(users, {
    fields: [pointsHistory.userId],
    references: [users.id],
  }),
}));

// ─── Course Relations ───────────────────────────────────────────────────────
export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(instructors, {
    fields: [courses.instructorId],
    references: [instructors.id],
  }),
  lessons: many(lessons),
  enrollments: many(enrollments),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  course: one(courses, {
    fields: [lessons.courseId],
    references: [courses.id],
  }),
  progress: many(lessonProgress),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  enrollment: one(enrollments, {
    fields: [lessonProgress.enrollmentId],
    references: [enrollments.id],
  }),
  lesson: one(lessons, {
    fields: [lessonProgress.lessonId],
    references: [lessons.id],
  }),
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
  enrollment: one(enrollments, {
    fields: [certificates.enrollmentId],
    references: [enrollments.id],
  }),
}));

export const instructorsRelations = relations(instructors, ({ many }) => ({
  courses: many(courses),
}));

// ─── Car Data Relations ─────────────────────────────────────────────────────
export const carBrandsRelations = relations(carBrands, ({ many }) => ({
  models: many(carModels),
}));

export const carModelsRelations = relations(carModels, ({ one, many }) => ({
  brand: one(carBrands, {
    fields: [carModels.brandId],
    references: [carBrands.id],
  }),
  laborTimes: many(laborTimes),
  partsPrices: many(partsPrices),
}));

export const servicePartsRelations = relations(serviceParts, ({ many }) => ({
  laborTimes: many(laborTimes),
  partsPrices: many(partsPrices),
}));

export const partsPricesRelations = relations(partsPrices, ({ one }) => ({
  model: one(carModels, {
    fields: [partsPrices.modelId],
    references: [carModels.id],
  }),
  part: one(serviceParts, {
    fields: [partsPrices.partId],
    references: [serviceParts.id],
  }),
}));

export const laborTimesRelations = relations(laborTimes, ({ one }) => ({
  model: one(carModels, {
    fields: [laborTimes.modelId],
    references: [carModels.id],
  }),
  part: one(serviceParts, {
    fields: [laborTimes.partId],
    references: [serviceParts.id],
  }),
}));

// ─── Pricing Relations ──────────────────────────────────────────────────────
export const serviceTypesRelations = relations(serviceTypes, ({ many }) => ({
  partVariants: many(partVariants),
  optionalLabor: many(optionalLabor),
}));

export const partVariantsRelations = relations(partVariants, ({ one }) => ({
  serviceType: one(serviceTypes, {
    fields: [partVariants.serviceTypeId],
    references: [serviceTypes.id],
  }),
}));

export const optionalLaborRelations = relations(optionalLabor, ({ one }) => ({
  serviceType: one(serviceTypes, {
    fields: [optionalLabor.serviceTypeId],
    references: [serviceTypes.id],
  }),
}));

// ─── Notification & Invoice Relations ───────────────────────────────────────
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  booking: one(bookings, {
    fields: [invoices.bookingId],
    references: [bookings.id],
  }),
}));

// ─── Vendor Relations ───────────────────────────────────────────────────────
export const vendorsRelations = relations(vendors, ({ many }) => ({
  verificationCodes: many(vendorVerificationCodes),
  documents: many(vendorDocuments),
  services: many(vendorServices),
  stats: many(vendorStats),
  conversations: many(conversations),
  reviews: many(reviews),
  vendorRatingSummary: many(vendorRatingSummary),
}));

export const vendorVerificationCodesRelations = relations(vendorVerificationCodes, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorVerificationCodes.vendorId],
    references: [vendors.id],
  }),
}));

export const vendorDocumentsRelations = relations(vendorDocuments, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorDocuments.vendorId],
    references: [vendors.id],
  }),
}));

export const vendorServicesRelations = relations(vendorServices, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorServices.vendorId],
    references: [vendors.id],
  }),
}));

// ─── Chat Relations ─────────────────────────────────────────────────────────
export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [conversations.vendorId],
    references: [vendors.id],
  }),
  messages: many(messages),
  participants: many(chatParticipants),
  priceOffers: many(priceOffers),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const priceOffersRelations = relations(priceOffers, ({ one }) => ({
  conversation: one(conversations, {
    fields: [priceOffers.conversationId],
    references: [conversations.id],
  }),
}));

export const chatParticipantsRelations = relations(chatParticipants, ({ one }) => ({
  conversation: one(conversations, {
    fields: [chatParticipants.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [chatParticipants.userId],
    references: [users.id],
  }),
}));

export const chatNotificationsRelations = relations(chatNotifications, ({ one }) => ({
  conversation: one(conversations, {
    fields: [chatNotifications.conversationId],
    references: [conversations.id],
  }),
}));

// ─── Analytics Relations ────────────────────────────────────────────────────
export const vendorStatsRelations = relations(vendorStats, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorStats.vendorId],
    references: [vendors.id],
  }),
}));

export const serviceAnalyticsRelations = relations(serviceAnalytics, ({ one }) => ({
  vendor: one(vendors, {
    fields: [serviceAnalytics.vendorId],
    references: [vendors.id],
  }),
}));

export const revenueTrackingRelations = relations(revenueTracking, ({ one }) => ({
  vendor: one(vendors, {
    fields: [revenueTracking.vendorId],
    references: [vendors.id],
  }),
}));

export const monthlyRevenueRelations = relations(monthlyRevenue, ({ one }) => ({
  vendor: one(vendors, {
    fields: [monthlyRevenue.vendorId],
    references: [vendors.id],
  }),
}));

export const customerMetricsRelations = relations(customerMetrics, ({ one }) => ({
  vendor: one(vendors, {
    fields: [customerMetrics.vendorId],
    references: [vendors.id],
  }),
}));

// ─── Review Relations ───────────────────────────────────────────────────────
export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [reviews.vendorId],
    references: [vendors.id],
  }),
  votes: many(reviewVotes),
  responses: many(reviewResponses),
}));

export const reviewVotesRelations = relations(reviewVotes, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewVotes.reviewId],
    references: [reviews.id],
  }),
  user: one(users, {
    fields: [reviewVotes.userId],
    references: [users.id],
  }),
}));

export const reviewResponsesRelations = relations(reviewResponses, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewResponses.reviewId],
    references: [reviews.id],
  }),
}));

export const vendorRatingSummaryRelations = relations(vendorRatingSummary, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorRatingSummary.vendorId],
    references: [vendors.id],
  }),
}));

// ─── Saved Filters Relations ────────────────────────────────────────────────
export const savedFiltersRelations = relations(savedFilters, ({ one }) => ({
  user: one(users, {
    fields: [savedFilters.userId],
    references: [users.id],
  }),
}));

// ─── Gamification Relations ─────────────────────────────────────────────────
export const technicianBadgesRelations = relations(technicianBadges, ({ one }) => ({
  technician: one(technicians, {
    fields: [technicianBadges.technicianId],
    references: [technicians.id],
  }),
  badge: one(badges, {
    fields: [technicianBadges.badgeId],
    references: [badges.id],
  }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  technicianBadges: many(technicianBadges),
}));

export const technicianRewardsRelations = relations(technicianRewards, ({ one }) => ({
  technician: one(technicians, {
    fields: [technicianRewards.technicianId],
    references: [technicians.id],
  }),
  reward: one(rewards, {
    fields: [technicianRewards.rewardId],
    references: [rewards.id],
  }),
}));

export const rewardsRelations = relations(rewards, ({ many }) => ({
  technicianRewards: many(technicianRewards),
}));

export const leaderboardRelations = relations(leaderboard, ({ one }) => ({
  technician: one(technicians, {
    fields: [leaderboard.technicianId],
    references: [technicians.id],
  }),
}));
