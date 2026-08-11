-- ============================================================
-- Database Indexes for Meir Platform
-- Run this migration to add performance indexes
-- ============================================================

-- Users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_lastSignedIn ON users(lastSignedIn);

-- Bookings table (most queried table)
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(phone);
CREATE INDEX IF NOT EXISTS idx_bookings_technicianId ON bookings(technicianId);
CREATE INDEX IF NOT EXISTS idx_bookings_createdAt ON bookings(createdAt);
CREATE INDEX IF NOT EXISTS idx_bookings_status_createdAt ON bookings(status, createdAt);
CREATE INDEX IF NOT EXISTS idx_bookings_location ON bookings(location);

-- Contact Messages
CREATE INDEX IF NOT EXISTS idx_contactMessages_read ON contactMessages(`read`);
CREATE INDEX IF NOT EXISTS idx_contactMessages_createdAt ON contactMessages(createdAt);

-- Technicians
CREATE INDEX IF NOT EXISTS idx_technicians_status ON technicians(status);
CREATE INDEX IF NOT EXISTS idx_technicians_location ON technicians(location);
CREATE INDEX IF NOT EXISTS idx_technicians_status_location ON technicians(status, location);

-- Loyalty Points
CREATE INDEX IF NOT EXISTS idx_pointsHistory_customerPhone ON pointsHistory(customerPhone);
CREATE INDEX IF NOT EXISTS idx_pointsHistory_type ON pointsHistory(type);

-- Courses & Training
CREATE INDEX IF NOT EXISTS idx_lessons_courseId ON lessons(courseId);
CREATE INDEX IF NOT EXISTS idx_lessons_courseId_order ON lessons(courseId, `order`);
CREATE INDEX IF NOT EXISTS idx_enrollments_userId ON enrollments(userId);
CREATE INDEX IF NOT EXISTS idx_enrollments_courseId ON enrollments(courseId);
CREATE INDEX IF NOT EXISTS idx_enrollments_userId_courseId ON enrollments(userId, courseId);
CREATE INDEX IF NOT EXISTS idx_lessonProgress_userId ON lessonProgress(userId);
CREATE INDEX IF NOT EXISTS idx_lessonProgress_lessonId ON lessonProgress(lessonId);
CREATE INDEX IF NOT EXISTS idx_certificates_userId ON certificates(userId);

-- Car Models & Parts
CREATE INDEX IF NOT EXISTS idx_carModels_brandId ON car_models(brandId);
CREATE INDEX IF NOT EXISTS idx_laborTimes_modelId ON labor_times(modelId);
CREATE INDEX IF NOT EXISTS idx_laborTimes_partId ON labor_times(partId);
CREATE INDEX IF NOT EXISTS idx_laborTimes_modelId_partId ON labor_times(modelId, partId);

-- Price Calculations
CREATE INDEX IF NOT EXISTS idx_priceCalculations_createdAt ON price_calculations(createdAt);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications(userId);
CREATE INDEX IF NOT EXISTS idx_notifications_userId_isRead ON notifications(userId, isRead);
CREATE INDEX IF NOT EXISTS idx_notifications_createdAt ON notifications(createdAt);

-- Invoices
CREATE INDEX IF NOT EXISTS idx_invoices_bookingId ON invoices(bookingId);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Vendors
CREATE INDEX IF NOT EXISTS idx_vendors_userId ON vendors(userId);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendorDocuments_vendorId ON vendor_documents(vendorId);
CREATE INDEX IF NOT EXISTS idx_vendorServices_vendorId ON vendor_services(vendorId);

-- Service Types & Part Variants (Advanced Pricing)
CREATE INDEX IF NOT EXISTS idx_serviceTypes_partId ON service_types(partId);
CREATE INDEX IF NOT EXISTS idx_partVariants_partId ON part_variants(partId);

-- Chat & Conversations
CREATE INDEX IF NOT EXISTS idx_messages_conversationId ON messages(conversationId);
CREATE INDEX IF NOT EXISTS idx_messages_conversationId_createdAt ON messages(conversationId, createdAt);
CREATE INDEX IF NOT EXISTS idx_chatParticipants_conversationId ON chat_participants(conversationId);
CREATE INDEX IF NOT EXISTS idx_chatParticipants_userId ON chat_participants(userId);
CREATE INDEX IF NOT EXISTS idx_chatNotifications_userId ON chat_notifications(userId);
CREATE INDEX IF NOT EXISTS idx_priceOffers_conversationId ON price_offers(conversationId);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_reviews_vendorId ON reviews(vendorId);
CREATE INDEX IF NOT EXISTS idx_reviews_userId ON reviews(userId);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved);
CREATE INDEX IF NOT EXISTS idx_reviewVotes_reviewId ON review_votes(reviewId);

-- Analytics
CREATE INDEX IF NOT EXISTS idx_serviceAnalytics_vendorId ON service_analytics(vendorId);
CREATE INDEX IF NOT EXISTS idx_revenueTracking_vendorId ON revenue_tracking(vendorId);
CREATE INDEX IF NOT EXISTS idx_vendorStats_vendorId ON vendor_stats(vendorId);

-- Saved Filters
CREATE INDEX IF NOT EXISTS idx_savedFilters_userId ON savedFilters(userId);

-- Gamification
CREATE INDEX IF NOT EXISTS idx_technicianBadges_technicianId ON technicianBadges(technicianId);
CREATE INDEX IF NOT EXISTS idx_technicianRewards_technicianId ON technicianRewards(technicianId);
CREATE INDEX IF NOT EXISTS idx_leaderboard_technicianId ON leaderboard(technicianId);
CREATE INDEX IF NOT EXISTS idx_leaderboard_period ON leaderboard(period);
