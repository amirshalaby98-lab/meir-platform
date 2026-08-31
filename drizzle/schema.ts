import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  /** bcrypt hash for local email/password accounts. Null for Manus-OAuth-origin accounts. */
  passwordHash: varchar("passwordHash", { length: 255 }),
  role: mysqlEnum("role", ["user", "admin", "technician"]).default("user").notNull(),
  /** User type selected after first login: customer, technician, or service_provider */
  userType: mysqlEnum("userType", ["customer", "technician", "service_provider"]),
  phone: varchar("phone", { length: 20 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Password reset OTP codes for local email/password accounts.
 */
export const passwordResetCodes = mysqlTable("passwordResetCodes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  code: varchar("code", { length: 10 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Contact messages table to store contact form submissions
 */
export const contactMessages = mysqlTable("contactMessages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 320 }),
  message: text("message").notNull(),
  read: int("read").default(0).notNull(), // 0 = unread, 1 = read
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;

// Old reviews table removed - using the new comprehensive reviews table below

/**
 * Loyalty Points table to store customer points
 */
export const loyaltyPoints = mysqlTable("loyaltyPoints", {
  id: int("id").autoincrement().primaryKey(),
  customerPhone: varchar("customerPhone", { length: 20 }).notNull().unique(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  points: int("points").notNull().default(0),
  totalEarned: int("totalEarned").notNull().default(0),
  totalRedeemed: int("totalRedeemed").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LoyaltyPoints = typeof loyaltyPoints.$inferSelect;
export type InsertLoyaltyPoints = typeof loyaltyPoints.$inferInsert;

/**
 * Points History table to track point transactions
 */
export const pointsHistory = mysqlTable("pointsHistory", {
  id: int("id").autoincrement().primaryKey(),
  customerPhone: varchar("customerPhone", { length: 20 }).notNull(),
  points: int("points").notNull(),
  type: mysqlEnum("type", ["earn", "redeem"]).notNull(),
  reason: varchar("reason", { length: 255 }).notNull(),
  bookingId: int("bookingId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PointsHistory = typeof pointsHistory.$inferSelect;
export type InsertPointsHistory = typeof pointsHistory.$inferInsert;

/**
 * Training Platform Tables
 */

/**
 * Courses table to store training courses
 */
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  thumbnail: varchar("thumbnail", { length: 500 }),
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced"]).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // بطارية، سلف، دينمو، ECU، شامل
  duration: varchar("duration", { length: 50 }).notNull(), // "أسبوعان", "3 أسابيع", إلخ
  price: int("price").default(0).notNull(), // السعر بالريال
  instructor: varchar("instructor", { length: 255 }).notNull(),
  totalLessons: int("totalLessons").default(0).notNull(),
  totalDuration: int("totalDuration").default(0).notNull(), // بالدقائق
  published: int("published").default(1).notNull(), // 0 = draft, 1 = published
  enrolledCount: int("enrolledCount").default(0).notNull(),
  rating: int("rating").default(5).notNull(), // 1-5
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

/**
 * Lessons table to store course lessons/modules
 */
export const lessons = mysqlTable("lessons", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  content: text("content"), // محتوى نصي
  videoUrl: varchar("videoUrl", { length: 500 }), // رابط فيديو YouTube/Vimeo
  duration: int("duration").default(0).notNull(), // بالدقائق
  order: int("order").notNull(), // ترتيب الدرس في الدورة
  attachments: text("attachments"), // JSON array of file URLs
  published: int("published").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;

/**
 * Enrollments table to track student course enrollments
 */
export const enrollments = mysqlTable("enrollments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  courseId: int("courseId").notNull(),
  status: mysqlEnum("status", ["active", "completed", "dropped"])
    .default("active")
    .notNull(),
  progress: int("progress").default(0).notNull(), // 0-100%
  completedLessons: int("completedLessons").default(0).notNull(),
  certificateIssued: int("certificateIssued").default(0).notNull(), // 0 = no, 1 = yes
  enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  lastAccessedAt: timestamp("lastAccessedAt").defaultNow().notNull(),
});

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = typeof enrollments.$inferInsert;

/**
 * Lesson Progress table to track individual lesson completion
 */
export const lessonProgress = mysqlTable("lessonProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  lessonId: int("lessonId").notNull(),
  courseId: int("courseId").notNull(),
  completed: int("completed").default(0).notNull(), // 0 = not completed, 1 = completed
  watchedDuration: int("watchedDuration").default(0).notNull(), // بالثواني
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LessonProgress = typeof lessonProgress.$inferSelect;
export type InsertLessonProgress = typeof lessonProgress.$inferInsert;

/**
 * Certificates table to store issued certificates
 */
export const certificates = mysqlTable("certificates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  courseId: int("courseId").notNull(),
  certificateNumber: varchar("certificateNumber", { length: 100 }).notNull().unique(),
  studentName: varchar("studentName", { length: 255 }).notNull(),
  courseName: varchar("courseName", { length: 255 }).notNull(),
  completionDate: timestamp("completionDate").notNull(),
  issueDate: timestamp("issueDate").defaultNow().notNull(),
  verificationCode: varchar("verificationCode", { length: 50 }).notNull().unique(),
  pdfUrl: varchar("pdfUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;

/**
 * Instructors table to store training instructors
 */
export const instructors = mysqlTable("instructors", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // ربط مع جدول users (optional)
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  bio: text("bio"),
  avatar: varchar("avatar", { length: 500 }),
  specialization: varchar("specialization", { length: 255 }), // بطارية، سلف، ECU، إلخ
  experience: int("experience").default(0), // سنوات الخبرة
  rating: int("rating").default(5).notNull(), // 1-5
  totalCourses: int("totalCourses").default(0).notNull(),
  totalStudents: int("totalStudents").default(0).notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Instructor = typeof instructors.$inferSelect;
export type InsertInstructor = typeof instructors.$inferInsert;

/**
 * Labor Time System - نظام التسعير
 */

// Car Brands - ماركات السيارات
export const carBrands = mysqlTable("car_brands", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("nameAr", { length: 100 }).notNull(),
  logo: varchar("logo", { length: 500 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CarBrand = typeof carBrands.$inferSelect;

// Car Models - موديلات السيارات
export const carModels = mysqlTable("car_models", {
  id: int("id").autoincrement().primaryKey(),
  brandId: int("brandId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("nameAr", { length: 100 }).notNull(),
  image: varchar("image", { length: 500 }),
  yearFrom: int("yearFrom"),
  yearTo: int("yearTo"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CarModel = typeof carModels.$inferSelect;

// Service Parts - القطع
export const serviceParts = mysqlTable("service_parts", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nameAr: varchar("nameAr", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ServicePart = typeof serviceParts.$inferSelect;

// Parts Prices - أسعار القطع
export const partsPrices = mysqlTable("parts_prices", {
  id: int("id").autoincrement().primaryKey(),
  partId: int("partId").notNull(),
  modelId: int("modelId").notNull(), // لكل موديل سعر مختلف
  priceMin: int("priceMin").notNull(), // السعر الأدنى
  priceMax: int("priceMax").notNull(), // السعر الأقصى
  priceAverage: int("priceAverage").notNull(), // السعر المتوسط
  quality: mysqlEnum("quality", ["original", "oem", "aftermarket"]).default("oem").notNull(), // نوع القطعة
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PartsPrice = typeof partsPrices.$inferSelect;
export type InsertPartsPrice = typeof partsPrices.$inferInsert;

// Labor Times - أوقات الفك والتركيب
export const laborTimes = mysqlTable("labor_times", {
  id: int("id").autoincrement().primaryKey(),
  modelId: int("modelId").notNull(),
  partId: int("partId").notNull(),
  hours: varchar("hours", { length: 10 }).notNull(), // e.g., "1.5"
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LaborTime = typeof laborTimes.$inferSelect;

// Pricing Settings - إعدادات التسعير
export const pricingSettings = mysqlTable("pricing_settings", {
  id: int("id").autoincrement().primaryKey(),
  hourlyRate: int("hourlyRate").default(100).notNull(), // سعر الساعة
  pricePerKm: int("pricePerKm").default(2).notNull(), // سعر الكيلو
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PricingSetting = typeof pricingSettings.$inferSelect;

// Price Calculations - سجل الأسعار المحسوبة
export const priceCalculations = mysqlTable("price_calculations", {
  id: int("id").autoincrement().primaryKey(),
  brandId: int("brandId").notNull(),
  brandName: varchar("brandName", { length: 100 }).notNull(),
  modelId: int("modelId").notNull(),
  modelName: varchar("modelName", { length: 100 }).notNull(),
  partId: int("partId").notNull(),
  partName: varchar("partName", { length: 100 }).notNull(),
  distance: int("distance").notNull(), // المسافة بالكيلومتر
  laborHours: varchar("laborHours", { length: 10 }).notNull(), // ساعات العمل
  hourlyRate: int("hourlyRate").notNull(), // سعر الساعة
  pricePerKm: int("pricePerKm").notNull(), // سعر الكيلو
  laborCost: int("laborCost").notNull(), // تكلفة العمل
  distanceCost: int("distanceCost").notNull(), // تكلفة المسافة
  totalCost: int("totalCost").notNull(), // التكلفة الإجمالية
  customerIp: varchar("customerIp", { length: 50 }), // IP العميل (اختياري)
  userAgent: text("userAgent"), // معلومات المتصفح (اختياري)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PriceCalculation = typeof priceCalculations.$inferSelect;
export type InsertPriceCalculation = typeof priceCalculations.$inferInsert;

/**
 * Promotions table for managing discounts and special offers
 */
export const promotions = mysqlTable("promotions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // اسم العرض
  description: text("description"), // وصف العرض
  discountType: mysqlEnum("discountType", ["percentage", "fixed"]).notNull(), // نوع الخصم: نسبة مئوية أو مبلغ ثابت
  discountValue: int("discountValue").notNull(), // قيمة الخصم (10 = 10% أو 10 ريال)
  targetType: mysqlEnum("targetType", ["all", "specific_parts"]).default("all").notNull(), // الهدف: كل الخدمات أو قطع محددة
  targetPartIds: text("targetPartIds"), // IDs القطع المستهدفة (مفصولة بفاصلة)
  startDate: timestamp("startDate").notNull(), // تاريخ بداية العرض
  endDate: timestamp("endDate").notNull(), // تاريخ نهاية العرض
  isActive: boolean("isActive").default(true).notNull(), // حالة العرض (مفعل/معطل)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = typeof promotions.$inferInsert;

/**
 * Notifications table to store system notifications for admins and users
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // المستخدم المستقبل للإشعار
  type: mysqlEnum("type", ["booking", "review", "message", "system"]).notNull(), // نوع الإشعار
  title: varchar("title", { length: 255 }).notNull(), // عنوان الإشعار
  message: text("message").notNull(), // محتوى الإشعار
  relatedId: int("relatedId"), // معرّف العنصر المرتبط (booking ID, review ID, إلخ)
  isRead: boolean("isRead").default(false).notNull(), // هل تم قراءة الإشعار
  actionUrl: varchar("actionUrl", { length: 500 }), // رابط الإجراء (مثل /admin/bookings/123)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Invoices table to store generated invoices
 */
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(), // معرّف الحجز المرتبط
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(), // رقم الفاتورة
  customerName: varchar("customerName", { length: 255 }).notNull(), // اسم العميل
  customerPhone: varchar("customerPhone", { length: 20 }).notNull(), // هاتف العميل
  customerEmail: varchar("customerEmail", { length: 320 }), // بريد العميل
  serviceDescription: text("serviceDescription").notNull(), // وصف الخدمة
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // المبلغ الإجمالي
  taxAmount: decimal("taxAmount", { precision: 10, scale: 2 }).default("0"), // مبلغ الضريبة
  discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }).default("0"), // مبلغ الخصم
  finalAmount: decimal("finalAmount", { precision: 10, scale: 2 }).notNull(), // المبلغ النهائي
  status: mysqlEnum("status", ["draft", "issued", "paid", "cancelled"]).default("draft").notNull(), // حالة الفاتورة
  pdfUrl: varchar("pdfUrl", { length: 500 }), // رابط ملف PDF
  issueDate: timestamp("issueDate").defaultNow().notNull(), // تاريخ الإصدار
  dueDate: timestamp("dueDate"), // تاريخ الاستحقاق
  paymentDate: timestamp("paymentDate"), // تاريخ الدفع
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

/**
 * Vendors table for sellers (parts shops, technicians, junkyards)
 */
export const vendors = mysqlTable("vendors", {
  id: int("id").autoincrement().primaryKey(),
  vendorType: mysqlEnum("vendorType", ["parts_shop", "technician", "junkyard", "tow_truck", "trainer"]).notNull(), // نوع البائع
  businessName: varchar("businessName", { length: 255 }).notNull(), // اسم المتجر/الورشة
  ownerName: varchar("ownerName", { length: 255 }).notNull(), // اسم المالك
  phone: varchar("phone", { length: 20 }).notNull(), // الهاتف
  email: varchar("email", { length: 320 }).notNull(), // البريد الإلكتروني
  city: varchar("city", { length: 100 }).notNull(), // المدينة
  area: varchar("area", { length: 100 }).notNull(), // المنطقة
  address: text("address"), // العنوان التفصيلي
  description: text("description"), // وصف الخدمات
  commercialLicense: varchar("commercialLicense", { length: 100 }), // رقم السجل التجاري
  taxId: varchar("taxId", { length: 100 }), // رقم الضريبة
  bankAccount: varchar("bankAccount", { length: 100 }), // حساب بنكي
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"), // التقييم
  status: mysqlEnum("status", ["pending", "verified", "approved", "rejected", "suspended"]).default("pending").notNull(), // حالة الموافقة
  verificationCode: varchar("verificationCode", { length: 10 }), // رمز التحقق
  verificationCodeExpiry: timestamp("verificationCodeExpiry"), // انتهاء صلاحية الرمز
  verifiedAt: timestamp("verifiedAt"), // وقت التحقق
  approvedAt: timestamp("approvedAt"), // وقت الموافقة
  rejectionReason: text("rejectionReason"), // سبب الرفض
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = typeof vendors.$inferInsert;

/**
 * Vendor verification codes table
 */
export const vendorVerificationCodes = mysqlTable("vendor_verification_codes", {
  id: int("id").autoincrement().primaryKey(),
  vendorId: int("vendorId").notNull(), // معرّف البائع
  code: varchar("code", { length: 10 }).notNull(), // رمز التحقق
  type: mysqlEnum("type", ["email", "sms"]).notNull(), // نوع التحقق
  expiresAt: timestamp("expiresAt").notNull(), // وقت انتهاء الصلاحية
  usedAt: timestamp("usedAt"), // وقت الاستخدام
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VendorVerificationCode = typeof vendorVerificationCodes.$inferSelect;
export type InsertVendorVerificationCode = typeof vendorVerificationCodes.$inferInsert;

/**
 * Vendor documents table for storing uploaded documents
 */
export const vendorDocuments = mysqlTable("vendor_documents", {
  id: int("id").autoincrement().primaryKey(),
  vendorId: int("vendorId").notNull(), // معرّف البائع
  documentType: mysqlEnum("documentType", ["commercial_license", "tax_certificate", "bank_details", "id_card"]).notNull(), // نوع المستند
  documentUrl: varchar("documentUrl", { length: 500 }).notNull(), // رابط المستند
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  verifiedAt: timestamp("verifiedAt"), // وقت التحقق من المستند
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VendorDocument = typeof vendorDocuments.$inferSelect;
export type InsertVendorDocument = typeof vendorDocuments.$inferInsert;

/**
 * Vendor services table
 */
export const vendorServices = mysqlTable("vendor_services", {
  id: int("id").autoincrement().primaryKey(),
  vendorId: int("vendorId").notNull(), // معرّف البائع
  serviceName: varchar("serviceName", { length: 255 }).notNull(), // اسم الخدمة
  description: text("description"), // وصف الخدمة
  price: decimal("price", { precision: 10, scale: 2 }), // السعر (اختياري)
  isActive: boolean("isActive").default(true).notNull(), // هل الخدمة مفعلة
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VendorService = typeof vendorServices.$inferSelect;
export type InsertVendorService = typeof vendorServices.$inferInsert;


/**
 * Service Types table - أنواع الخدمات (Replace, Overhaul, Optional Labor, etc.)
 */
export const serviceTypes = mysqlTable("service_types", {
  id: int("id").autoincrement().primaryKey(),
  partId: int("partId").notNull(), // معرّف القطعة
  modelId: int("modelId").notNull(), // معرّف الموديل
  serviceTypeCode: varchar("serviceTypeCode", { length: 50 }).notNull(), // كود الخدمة (e.g., "REPLACE", "OVERHAUL")
  serviceTypeName: varchar("serviceTypeName", { length: 255 }).notNull(), // اسم الخدمة (e.g., "Replace Starter Motor")
  description: text("description"), // وصف الخدمة
  skillLevel: varchar("skillLevel", { length: 10 }).notNull(), // مستوى المهارة (A, B, C, etc.)
  minHours: decimal("minHours", { precision: 5, scale: 2 }).notNull(), // الحد الأدنى لساعات العمل
  maxHours: decimal("maxHours", { precision: 5, scale: 2 }).notNull(), // الحد الأقصى لساعات العمل
  notes: text("notes"), // ملاحظات إضافية
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ServiceType = typeof serviceTypes.$inferSelect;
export type InsertServiceType = typeof serviceTypes.$inferInsert;

/**
 * Part Variants table - متغيرات القطع (Non Reduction Type, Reduction Type, etc.)
 */
export const partVariants = mysqlTable("part_variants", {
  id: int("id").autoincrement().primaryKey(),
  partId: int("partId").notNull(), // معرّف القطعة
  modelId: int("modelId").notNull(), // معرّف الموديل
  variantCode: varchar("variantCode", { length: 50 }).notNull(), // كود المتغير (e.g., "NON_REDUCTION", "REDUCTION")
  variantName: varchar("variantName", { length: 255 }).notNull(), // اسم المتغير
  oemPartNumber: varchar("oemPartNumber", { length: 100 }), // رقم القطعة الأصلية
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), // السعر
  currency: varchar("currency", { length: 3 }).default("USD").notNull(), // العملة
  description: text("description"), // وصف المتغير
  isActive: boolean("isActive").default(true).notNull(), // هل المتغير مفعل
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PartVariant = typeof partVariants.$inferSelect;
export type InsertPartVariant = typeof partVariants.$inferInsert;

/**
 * Optional Labor table - العمل الإضافي الاختياري
 */
export const optionalLabor = mysqlTable("optional_labor", {
  id: int("id").autoincrement().primaryKey(),
  serviceTypeId: int("serviceTypeId").notNull(), // معرّف نوع الخدمة
  partId: int("partId").notNull(), // معرّف القطعة
  modelId: int("modelId").notNull(), // معرّف الموديل
  laborCode: varchar("laborCode", { length: 50 }).notNull(), // كود العمل (e.g., "R&R_ARMATURE")
  laborName: varchar("laborName", { length: 255 }).notNull(), // اسم العمل (e.g., "To R&R Armature")
  skillLevel: varchar("skillLevel", { length: 10 }).notNull(), // مستوى المهارة
  minHours: decimal("minHours", { precision: 5, scale: 2 }).notNull(), // الحد الأدنى لساعات العمل
  maxHours: decimal("maxHours", { precision: 5, scale: 2 }).notNull(), // الحد الأقصى لساعات العمل
  description: text("description"), // وصف العمل
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OptionalLabor = typeof optionalLabor.$inferSelect;
export type InsertOptionalLabor = typeof optionalLabor.$inferInsert;

/**
 * Advanced Price Calculations - حسابات الأسعار المتقدمة
 */
export const advancedPriceCalculations = mysqlTable("advanced_price_calculations", {
  id: int("id").autoincrement().primaryKey(),
  brandId: int("brandId").notNull(), // معرّف الماركة
  modelId: int("modelId").notNull(), // معرّف الموديل
  partId: int("partId").notNull(), // معرّف القطعة
  partVariantId: int("partVariantId"), // معرّف متغير القطعة
  serviceTypeId: int("serviceTypeId").notNull(), // معرّف نوع الخدمة
  selectedOptionalLabor: text("selectedOptionalLabor"), // IDs العمل الإضافي المختار (مفصولة بفاصلة)
  
  // Pricing Details
  partPrice: decimal("partPrice", { precision: 10, scale: 2 }).notNull(), // سعر القطعة
  laborHours: decimal("laborHours", { precision: 5, scale: 2 }).notNull(), // ساعات العمل
  hourlyRate: decimal("hourlyRate", { precision: 10, scale: 2 }).notNull(), // سعر الساعة
  laborCost: decimal("laborCost", { precision: 10, scale: 2 }).notNull(), // تكلفة العمل
  
  distance: int("distance").notNull(), // المسافة بالكيلومتر
  pricePerKm: decimal("pricePerKm", { precision: 10, scale: 2 }).notNull(), // سعر الكيلومتر
  distanceCost: decimal("distanceCost", { precision: 10, scale: 2 }).notNull(), // تكلفة المسافة
  
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(), // المجموع الفرعي
  taxAmount: decimal("taxAmount", { precision: 10, scale: 2 }).default("0"), // مبلغ الضريبة
  discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }).default("0"), // مبلغ الخصم
  totalCost: decimal("totalCost", { precision: 10, scale: 2 }).notNull(), // التكلفة الإجمالية
  
  // Metadata
  customerIp: varchar("customerIp", { length: 50 }), // IP العميل
  userAgent: text("userAgent"), // معلومات المتصفح
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdvancedPriceCalculation = typeof advancedPriceCalculations.$inferSelect;
export type InsertAdvancedPriceCalculation = typeof advancedPriceCalculations.$inferInsert;


/**
 * Conversations - المحادثات بين العملاء والبائعين
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(), // معرّف العميل
  vendorId: int("vendorId").notNull(), // معرّف البائع
  bookingId: int("bookingId"), // معرّف الحجز (إن وجد)
  subject: varchar("subject", { length: 255 }).notNull(), // موضوع المحادثة
  status: mysqlEnum("status", ["active", "closed", "archived"]).default("active").notNull(),
  lastMessageAt: timestamp("lastMessageAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Messages - الرسائل في المحادثات
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(), // معرّف المحادثة
  senderId: int("senderId").notNull(), // معرّف المرسل
  senderType: mysqlEnum("senderType", ["customer", "vendor"]).notNull(), // نوع المرسل
  content: text("content").notNull(), // محتوى الرسالة
  messageType: mysqlEnum("messageType", ["text", "offer", "image"]).default("text").notNull(), // نوع الرسالة
  
  // للرسائل التي تحتوي على عرض سعر
  offerId: int("offerId"), // معرّف العرض المرتبط
  
  // للرسائل التي تحتوي على صورة
  imageUrl: varchar("imageUrl", { length: 500 }),
  
  // حالة الرسالة
  isRead: boolean("isRead").default(false).notNull(),
  readAt: timestamp("readAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Price Offers - عروض الأسعار للتفاوض
 */
export const priceOffers = mysqlTable("price_offers", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(), // معرّف المحادثة
  vendorId: int("vendorId").notNull(), // معرّف البائع (المقدم للعرض)
  customerId: int("customerId").notNull(), // معرّف العميل
  bookingId: int("bookingId"), // معرّف الحجز
  
  // تفاصيل العرض
  description: text("description").notNull(), // وصف الخدمة
  originalPrice: decimal("originalPrice", { precision: 10, scale: 2 }).notNull(), // السعر الأصلي
  offeredPrice: decimal("offeredPrice", { precision: 10, scale: 2 }).notNull(), // السعر المعروض
  discountPercentage: decimal("discountPercentage", { precision: 5, scale: 2 }).default("0"), // نسبة الخصم
  
  // تفاصيل العمل
  laborHours: decimal("laborHours", { precision: 5, scale: 2 }), // ساعات العمل
  parts: text("parts"), // تفاصيل القطع (JSON)
  
  // حالة العرض
  status: mysqlEnum("status", ["pending", "accepted", "rejected", "expired"]).default("pending").notNull(),
  expiresAt: timestamp("expiresAt"), // انتهاء صلاحية العرض
  acceptedAt: timestamp("acceptedAt"), // وقت قبول العرض
  rejectedAt: timestamp("rejectedAt"), // وقت رفض العرض
  rejectionReason: text("rejectionReason"), // سبب الرفض
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PriceOffer = typeof priceOffers.$inferSelect;
export type InsertPriceOffer = typeof priceOffers.$inferInsert;

/**
 * Chat Participants - المشاركون في المحادثة
 */
export const chatParticipants = mysqlTable("chat_participants", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(), // معرّف المحادثة
  userId: int("userId").notNull(), // معرّف المستخدم
  userType: mysqlEnum("userType", ["customer", "vendor"]).notNull(), // نوع المستخدم
  lastReadMessageId: int("lastReadMessageId"), // آخر رسالة مقروءة
  unreadCount: int("unreadCount").default(0).notNull(), // عدد الرسائل غير المقروءة
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});
export type ChatParticipant = typeof chatParticipants.$inferSelect;
export type InsertChatParticipant = typeof chatParticipants.$inferInsert;

/**
 * Chat Notifications - إشعارات الدردشة
 */
export const chatNotifications = mysqlTable("chat_notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // معرّف المستخدم
  conversationId: int("conversationId").notNull(), // معرّف المحادثة
  messageId: int("messageId").notNull(), // معرّف الرسالة
  type: mysqlEnum("type", ["new_message", "offer_received", "offer_accepted", "offer_rejected"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ChatNotification = typeof chatNotifications.$inferSelect;
export type InsertChatNotification = typeof chatNotifications.$inferInsert;


/**
 * Vendor Statistics - إحصائيات البائعين
 */
export const vendorStats = mysqlTable("vendor_stats", {
  id: int("id").autoincrement().primaryKey(),
  vendorId: int("vendorId").notNull().unique(), // معرّف البائع
  totalRevenue: decimal("totalRevenue", { precision: 12, scale: 2 }).default("0").notNull(), // إجمالي الأرباح
  monthlyRevenue: decimal("monthlyRevenue", { precision: 12, scale: 2 }).default("0").notNull(), // الأرباح الشهرية
  totalOrders: int("totalOrders").default(0).notNull(), // إجمالي الطلبات
  completedOrders: int("completedOrders").default(0).notNull(), // الطلبات المكتملة
  pendingOrders: int("pendingOrders").default(0).notNull(), // الطلبات المعلقة
  cancelledOrders: int("cancelledOrders").default(0).notNull(), // الطلبات الملغاة
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }).default("0").notNull(), // متوسط التقييم
  totalReviews: int("totalReviews").default(0).notNull(), // عدد التقييمات
  totalCustomers: int("totalCustomers").default(0).notNull(), // عدد العملاء الفريدين
  repeatCustomers: int("repeatCustomers").default(0).notNull(), // العملاء المتكررين
  responseTime: int("responseTime").default(0).notNull(), // متوسط وقت الرد بالدقائق
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type VendorStat = typeof vendorStats.$inferSelect;
export type InsertVendorStat = typeof vendorStats.$inferInsert;

/**
 * Service Analytics - تحليلات الخدمات
 */
export const serviceAnalytics = mysqlTable("service_analytics", {
  id: int("id").autoincrement().primaryKey(),
  vendorId: int("vendorId").notNull(), // معرّف البائع
  serviceId: int("serviceId").notNull(), // معرّف الخدمة
  serviceName: varchar("serviceName", { length: 255 }).notNull(), // اسم الخدمة
  totalRequests: int("totalRequests").default(0).notNull(), // عدد الطلبات
  completedRequests: int("completedRequests").default(0).notNull(), // الطلبات المكتملة
  totalRevenue: decimal("totalRevenue", { precision: 12, scale: 2 }).default("0").notNull(), // الإيرادات
  averagePrice: decimal("averagePrice", { precision: 10, scale: 2 }).default("0").notNull(), // متوسط السعر
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }).default("0").notNull(), // متوسط التقييم
  lastMonthRequests: int("lastMonthRequests").default(0).notNull(), // الطلبات في الشهر الماضي
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ServiceAnalytic = typeof serviceAnalytics.$inferSelect;
export type InsertServiceAnalytic = typeof serviceAnalytics.$inferInsert;

/**
 * Revenue Tracking - تتبع الإيرادات
 */
export const revenueTracking = mysqlTable("revenue_tracking", {
  id: int("id").autoincrement().primaryKey(),
  vendorId: int("vendorId").notNull(), // معرّف البائع
  orderId: int("orderId").notNull(), // معرّف الطلب
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // المبلغ
  commission: decimal("commission", { precision: 10, scale: 2 }).default("0").notNull(), // العمولة
  netAmount: decimal("netAmount", { precision: 10, scale: 2 }).notNull(), // المبلغ الصافي
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  transactionDate: timestamp("transactionDate").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type RevenueTracking = typeof revenueTracking.$inferSelect;
export type InsertRevenueTracking = typeof revenueTracking.$inferInsert;

/**
 * Monthly Revenue - الأرباح الشهرية
 */
export const monthlyRevenue = mysqlTable("monthly_revenue", {
  id: int("id").autoincrement().primaryKey(),
  vendorId: int("vendorId").notNull(), // معرّف البائع
  month: varchar("month", { length: 7 }).notNull(), // YYYY-MM
  revenue: decimal("revenue", { precision: 12, scale: 2 }).default("0").notNull(), // الإيرادات
  orders: int("orders").default(0).notNull(), // عدد الطلبات
  commission: decimal("commission", { precision: 12, scale: 2 }).default("0").notNull(), // العمولة
  netRevenue: decimal("netRevenue", { precision: 12, scale: 2 }).default("0").notNull(), // الإيرادات الصافية
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type MonthlyRevenue = typeof monthlyRevenue.$inferSelect;
export type InsertMonthlyRevenue = typeof monthlyRevenue.$inferInsert;

/**
 * Customer Metrics - مقاييس العملاء
 */
export const customerMetrics = mysqlTable("customer_metrics", {
  id: int("id").autoincrement().primaryKey(),
  vendorId: int("vendorId").notNull(), // معرّف البائع
  customerId: int("customerId").notNull(), // معرّف العميل
  totalOrders: int("totalOrders").default(0).notNull(), // عدد الطلبات
  totalSpent: decimal("totalSpent", { precision: 12, scale: 2 }).default("0").notNull(), // إجمالي المبلغ المنفق
  lastOrderDate: timestamp("lastOrderDate"), // تاريخ آخر طلب
  averageOrderValue: decimal("averageOrderValue", { precision: 10, scale: 2 }).default("0").notNull(), // متوسط قيمة الطلب
  customerLifetimeValue: decimal("customerLifetimeValue", { precision: 12, scale: 2 }).default("0").notNull(), // قيمة العميل مدى الحياة
  isRepeat: boolean("isRepeat").default(false).notNull(), // هل هو عميل متكرر
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CustomerMetric = typeof customerMetrics.$inferSelect;
export type InsertCustomerMetric = typeof customerMetrics.$inferInsert;


/**
 * Reviews - المراجعات (تقييمات مفصلة)
 * Note: DB has columns: id, name, rating, comment, service, location, approved, createdAt, updatedAt
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // اسم المقيّم
  rating: int("rating").notNull(), // التقييم (1-5)
  comment: text("comment"), // محتوى المراجعة
  service: varchar("service", { length: 255 }), // الخدمة
  location: varchar("location", { length: 255 }), // الموقع
  approved: int("approved").default(0).notNull(), // هل تمت الموافقة على المراجعة
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Review Votes - التصويت على المراجعات
 */
export const reviewVotes = mysqlTable("review_votes", {
  id: int("id").autoincrement().primaryKey(),
  reviewId: int("reviewId").notNull(), // معرّف المراجعة
  userId: int("userId").notNull(), // معرّف المستخدم
  voteType: mysqlEnum("voteType", ["helpful", "unhelpful"]).notNull(), // نوع التصويت
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ReviewVote = typeof reviewVotes.$inferSelect;
export type InsertReviewVote = typeof reviewVotes.$inferInsert;

/**
 * Review Responses - إجابات البائع على المراجعات
 */
export const reviewResponses = mysqlTable("review_responses", {
  id: int("id").autoincrement().primaryKey(),
  reviewId: int("reviewId").notNull(), // معرّف المراجعة
  vendorId: int("vendorId").notNull(), // معرّف البائع
  response: text("response").notNull(), // نص الإجابة
  helpful: int("helpful").default(0).notNull(), // عدد الأشخاص الذين وجدوا الإجابة مفيدة
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ReviewResponse = typeof reviewResponses.$inferSelect;
export type InsertReviewResponse = typeof reviewResponses.$inferInsert;

/**
 * Vendor Rating Summary - ملخص تقييم البائع
 */
export const vendorRatingSummary = mysqlTable("vendor_rating_summary", {
  id: int("id").autoincrement().primaryKey(),
  vendorId: int("vendorId").notNull().unique(), // معرّف البائع
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }).default("0").notNull(), // متوسط التقييم
  totalReviews: int("totalReviews").default(0).notNull(), // عدد المراجعات
  fiveStarCount: int("fiveStarCount").default(0).notNull(), // عدد التقييمات 5 نجوم
  fourStarCount: int("fourStarCount").default(0).notNull(), // عدد التقييمات 4 نجوم
  threeStarCount: int("threeStarCount").default(0).notNull(), // عدد التقييمات 3 نجوم
  twoStarCount: int("twoStarCount").default(0).notNull(), // عدد التقييمات نجمتين
  oneStarCount: int("oneStarCount").default(0).notNull(), // عدد التقييمات نجمة واحدة
  recommendationPercentage: decimal("recommendationPercentage", { precision: 5, scale: 2 }).default("0").notNull(), // نسبة التوصيات
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type VendorRatingSummary = typeof vendorRatingSummary.$inferSelect;
export type InsertVendorRatingSummary = typeof vendorRatingSummary.$inferInsert;


/**
 * Saved Filters table - لتخزين إعدادات الفلاتر المحفوظة للمديرين
 */
export const savedFilters = mysqlTable("savedFilters", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(), // اسم الفلتر المحفوظ
  description: text("description"), // وصف اختياري للفلتر
  
  // Filter settings
  startDate: timestamp("startDate"), // تاريخ البداية
  endDate: timestamp("endDate"), // تاريخ النهاية
  technicianId: int("technicianId"), // معرف الفني (اختياري)
  minRating: decimal("minRating", { precision: 3, scale: 1 }).default("1").notNull(), // الحد الأدنى للتقييم
  maxRating: decimal("maxRating", { precision: 3, scale: 1 }).default("5").notNull(), // الحد الأقصى للتقييم
  minReviews: int("minReviews").default(0).notNull(), // الحد الأدنى للتقييمات
  sortBy: mysqlEnum("sortBy", ["rating", "jobs", "reviews", "name"]).default("rating").notNull(), // ترتيب حسب
  
  // Metadata
  isDefault: boolean("isDefault").default(false).notNull(), // هل هذا الفلتر الافتراضي
  usageCount: int("usageCount").default(0).notNull(), // عدد مرات استخدام الفلتر
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
});

export type SavedFilter = typeof savedFilters.$inferSelect;
export type InsertSavedFilter = typeof savedFilters.$inferInsert;



// ═══════════════════════════════════════════════════════════════
// OBD2 Diagnostics & AI Module Tables
// ═══════════════════════════════════════════════════════════════

/**
 * OBD Scan Sessions - جلسات فحص OBD2
 */
export const obdSessions = mysqlTable("obdSessions", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId"), // ربط بالحجز (اختياري)
  technicianId: int("technicianId"), // الفني الذي أجرى الفحص
  userId: int("userId"), // المستخدم/العميل
  // Vehicle info
  vin: varchar("vin", { length: 20 }), // Vehicle Identification Number
  vehicleMake: varchar("vehicleMake", { length: 100 }),
  vehicleModel: varchar("vehicleModel", { length: 100 }),
  vehicleYear: varchar("vehicleYear", { length: 10 }),
  engineType: varchar("engineType", { length: 100 }),
  // Connection info
  deviceName: varchar("deviceName", { length: 100 }), // OBDLink LX, ELM327, etc.
  protocol: varchar("protocol", { length: 100 }), // ISO 15765-4 CAN, etc.
  connectionType: mysqlEnum("connectionType", ["bluetooth", "wifi", "usb", "simulation"]).default("simulation"),
  // Session info
  sessionType: mysqlEnum("sessionType", ["full_scan", "dtc_read", "dtc_clear", "live_data", "ai_diagnosis"]).default("full_scan"),
  dtcCount: int("dtcCount").default(0),
  status: mysqlEnum("status", ["active", "completed", "failed"]).default("active"),
  notes: text("notes"),
  // Timestamps
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ObdSession = typeof obdSessions.$inferSelect;
export type InsertObdSession = typeof obdSessions.$inferInsert;

/**
 * OBD DTC Results - نتائج أكواد الأعطال
 */
export const obdDtcResults = mysqlTable("obdDtcResults", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(), // ربط بالجلسة
  dtcCode: varchar("dtcCode", { length: 10 }).notNull(), // P0300, B1000, etc.
  category: mysqlEnum("category", ["P", "B", "C", "U"]).notNull(), // Powertrain, Body, Chassis, Network
  severity: mysqlEnum("severity", ["low", "medium", "high"]).default("medium"),
  description: text("description"), // وصف العطل
  system: varchar("system", { length: 100 }), // نظام الاحتراق، نظام الوقود، إلخ
  causes: json("causes"), // الأسباب المحتملة
  solution: text("solution"), // الحل المقترح
  estimatedCost: varchar("estimatedCost", { length: 50 }), // التكلفة التقديرية
  isCleared: boolean("isCleared").default(false), // هل تم مسح الكود
  clearedAt: timestamp("clearedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ObdDtcResult = typeof obdDtcResults.$inferSelect;
export type InsertObdDtcResult = typeof obdDtcResults.$inferInsert;

/**
 * AI Diagnostic Reports - تقارير التشخيص الذكي
 */
export const aiDiagnosticReports = mysqlTable("aiDiagnosticReports", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId"), // ربط بجلسة OBD (اختياري)
  userId: int("userId"),
  // Request info
  requestType: mysqlEnum("requestType", ["obd_code", "symptom_description", "photo_analysis", "sound_analysis", "full_report"]).default("obd_code"),
  inputData: text("inputData"), // البيانات المدخلة (كود/وصف/رابط صورة)
  vehicleInfo: json("vehicleInfo"), // معلومات السيارة
  // AI Response
  diagnosis: text("diagnosis"), // التشخيص
  recommendations: json("recommendations"), // التوصيات
  estimatedCosts: json("estimatedCosts"), // التكاليف التقديرية
  urgencyLevel: mysqlEnum("urgencyLevel", ["low", "medium", "high", "critical"]).default("medium"),
  confidence: int("confidence").default(0), // نسبة الثقة 0-100
  // Status
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AiDiagnosticReport = typeof aiDiagnosticReports.$inferSelect;
export type InsertAiDiagnosticReport = typeof aiDiagnosticReports.$inferInsert;

/**
 * Consultations - الاستشارات الهندسية
 */
export const consultations = mysqlTable("consultations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  engineerId: int("engineerId"), // المهندس المعين
  // Request info
  consultationType: mysqlEnum("consultationType", ["quick", "detailed", "emergency"]).default("quick"),
  vehicleInfo: json("vehicleInfo"),
  description: text("description"),
  attachments: json("attachments"), // روابط الصور/الفيديو/PDF
  // Response
  engineerReport: text("engineerReport"),
  recommendations: json("recommendations"),
  // Payment
  price: decimal("price", { precision: 10, scale: 2 }),
  isPaid: boolean("isPaid").default(false),
  paidAt: timestamp("paidAt"),
  // Status
  status: mysqlEnum("status", ["pending_payment", "pending", "assigned", "in_progress", "completed", "cancelled"]).default("pending_payment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Consultation = typeof consultations.$inferSelect;
export type InsertConsultation = typeof consultations.$inferInsert;

/**
 * Quizzes - الاختبارات
 */
export const quizzes = mysqlTable("quizzes", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId"), // ربط بالدورة
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  passingScore: int("passingScore").default(70), // نسبة النجاح
  timeLimit: int("timeLimit"), // بالدقائق
  questionCount: int("questionCount").default(0),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = typeof quizzes.$inferInsert;

/**
 * Quiz Questions - أسئلة الاختبارات
 */
export const quizQuestions = mysqlTable("quizQuestions", {
  id: int("id").autoincrement().primaryKey(),
  quizId: int("quizId").notNull(),
  question: text("question").notNull(),
  options: json("options").notNull(), // ["خيار 1", "خيار 2", "خيار 3", "خيار 4"]
  correctAnswer: int("correctAnswer").notNull(), // index of correct option
  explanation: text("explanation"), // شرح الإجابة
  points: int("points").default(1),
  orderIndex: int("orderIndex").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = typeof quizQuestions.$inferInsert;

/**
 * Quiz Attempts - محاولات الاختبارات
 */
export const quizAttempts = mysqlTable("quizAttempts", {
  id: int("id").autoincrement().primaryKey(),
  quizId: int("quizId").notNull(),
  userId: int("userId").notNull(),
  score: int("score").default(0),
  totalQuestions: int("totalQuestions").default(0),
  correctAnswers: int("correctAnswers").default(0),
  passed: boolean("passed").default(false),
  answers: json("answers"), // [{questionId, selectedAnswer, isCorrect}]
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = typeof quizAttempts.$inferInsert;

/**
 * Consultation Reports - تقارير الاستشارات
 */
export const consultationReports = mysqlTable("consultationReports", {
  id: int("id").autoincrement().primaryKey(),
  consultationId: int("consultationId").notNull(),
  engineerId: int("engineerId").notNull(),
  diagnosis: text("diagnosis"),
  recommendations: text("recommendations"),
  estimatedCost: decimal("estimatedCost", { precision: 10, scale: 2 }),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium"),
  partsNeeded: json("partsNeeded"), // [{name, partNumber, estimatedPrice}]
  attachments: json("reportAttachments"), // [{type, url, name}]
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ConsultationReport = typeof consultationReports.$inferSelect;
export type InsertConsultationReport = typeof consultationReports.$inferInsert;

/**
 * Consultation Payments - دفعات الاستشارات (نفس نمط orderPayments اليدوي)
 */
export const consultationPayments = mysqlTable("consultationPayments", {
  id: int("id").autoincrement().primaryKey(),
  consultationId: int("consultationId").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["bank_transfer", "stc_pay", "mada", "credit_card", "cash"]).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "failed", "refunded"]).default("pending").notNull(),
  reference: varchar("reference", { length: 255 }),
  receiptUrl: varchar("receiptUrl", { length: 500 }),
  confirmedAt: timestamp("confirmedAt"),
  confirmedBy: varchar("confirmedBy", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ConsultationPayment = typeof consultationPayments.$inferSelect;
export type InsertConsultationPayment = typeof consultationPayments.$inferInsert;

// ============================================================
// المتجر - بيع جهاز الفحص (Marketplace)
// ============================================================

/**
 * Products - كتالوج المنتجات (يديره الأدمن من لوحة التحكم)
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stockQuantity: int("stockQuantity").default(0).notNull(),
  images: json("images"), // string[] من روابط /uploads/...
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Product Orders - طلبات شراء المنتجات
 */
export const productOrders = mysqlTable("productOrders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 20 }).notNull().unique(), // PO-YYYY-XXXX
  customerId: int("customerId").notNull(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }),
  productId: int("productId").notNull(),
  productNameSnapshot: varchar("productNameSnapshot", { length: 255 }).notNull(),
  quantity: int("quantity").notNull().default(1),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  shippingName: varchar("shippingName", { length: 255 }).notNull(),
  shippingPhone: varchar("shippingPhone", { length: 20 }).notNull(),
  shippingAddress: text("shippingAddress").notNull(),
  shippingCity: varchar("shippingCity", { length: 100 }).notNull(),
  status: mysqlEnum("orderStatus", [
    "pending_payment", // بانتظار الدفع
    "paid",            // تم تأكيد الدفع
    "processing",      // جاري التجهيز
    "shipped",         // تم الشحن
    "delivered",       // تم التسليم
    "cancelled",       // ملغي
  ]).default("pending_payment").notNull(),
  adminNotes: text("adminNotes"),
  shippedAt: timestamp("shippedAt"),
  deliveredAt: timestamp("deliveredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ProductOrder = typeof productOrders.$inferSelect;
export type InsertProductOrder = typeof productOrders.$inferInsert;

/**
 * Product Order Payments - دفعات طلبات المنتجات (نفس نمط orderPayments اليدوي)
 */
export const productOrderPayments = mysqlTable("productOrderPayments", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["bank_transfer", "stc_pay", "mada", "credit_card", "cash"]).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "failed", "refunded"]).default("pending").notNull(),
  reference: varchar("reference", { length: 255 }),
  receiptUrl: varchar("receiptUrl", { length: 500 }),
  notes: text("notes"),
  confirmedAt: timestamp("confirmedAt"),
  confirmedBy: varchar("confirmedBy", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ProductOrderPayment = typeof productOrderPayments.$inferSelect;
export type InsertProductOrderPayment = typeof productOrderPayments.$inferInsert;

// ============================================================
// نظام طلبات الخدمة (Job Card System) 🎫
// ============================================================

/**
 * Service Orders (Job Cards) - الطلبات الرئيسية
 * كل طلب خدمة يمثل Job Card كامل من البداية للنهاية
 */
export const serviceOrders = mysqlTable("serviceOrders", {
  id: int("id").autoincrement().primaryKey(),
  /** رقم الطلب الفريد المعروض للعميل (مثل JC-2026-0001) */
  orderNumber: varchar("orderNumber", { length: 20 }).notNull().unique(),
  /** العميل صاحب الطلب */
  customerId: int("customerId").notNull(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }),
  /** موقع العميل */
  customerLocation: text("customerLocation"),
  customerLat: decimal("customerLat", { precision: 10, scale: 7 }),
  customerLng: decimal("customerLng", { precision: 10, scale: 7 }),
  /** بيانات السيارة */
  vehicleId: int("vehicleId"),
  /** شكوى العميل */
  complaint: text("complaint").notNull(),
  /** حالة الطلب */
  status: mysqlEnum("orderStatus", [
    "pending_payment",      // بانتظار دفع رسوم الكشف
    "paid",                 // تم الدفع - بانتظار تعيين فني
    "assigned",             // تم تعيين فني
    "accepted",             // الأدمن قبل الطلب
    "en_route",             // الفني في الطريق
    "arrived",              // الفني وصل
    "diagnosing",           // جاري الفحص
    "diagnosis_complete",   // اكتمل الفحص - التقرير جاهز
    "quote_sent",           // تم إرسال عرض الصيانة
    "quote_approved",       // العميل وافق على الصيانة
    "repair_payment_pending", // بانتظار دفع الصيانة
    "repair_paid",          // تم دفع الصيانة
    "repairing",            // جاري الصيانة
    "repair_complete",      // اكتملت الصيانة
    "completed",            // مكتمل - الفاتورة صدرت
    "cancelled"             // ملغي
  ]).default("pending_payment").notNull(),
  /** الفني المعيّن */
  technicianId: int("orderTechnicianId"),
  technicianName: varchar("orderTechnicianName", { length: 255 }),
  /** رسوم الكشف */
  inspectionFee: decimal("inspectionFee", { precision: 10, scale: 2 }).default("200.00"),
  /** إجمالي تكلفة الصيانة (بعد الموافقة) */
  repairCost: decimal("repairCost", { precision: 10, scale: 2 }),
  /** الإجمالي النهائي */
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }),
  /** ملاحظات */
  adminNotes: text("adminNotes"),
  technicianNotes: text("technicianNotes"),
  /** التواريخ */
  assignedAt: timestamp("assignedAt"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ServiceOrder = typeof serviceOrders.$inferSelect;
export type InsertServiceOrder = typeof serviceOrders.$inferInsert;

/**
 * Vehicles - بيانات السيارات المرتبطة بالطلبات
 */
export const orderVehicles = mysqlTable("orderVehicles", {
  id: int("id").autoincrement().primaryKey(),
  /** مالك السيارة */
  customerId: int("vehicleCustomerId").notNull(),
  /** بيانات السيارة */
  brand: varchar("vehicleBrand", { length: 100 }).notNull(),
  model: varchar("vehicleModel", { length: 100 }).notNull(),
  year: varchar("vehicleYear", { length: 4 }).notNull(),
  plateNumber: varchar("plateNumber", { length: 20 }),
  vin: varchar("vin", { length: 17 }),
  color: varchar("vehicleColor", { length: 50 }),
  mileage: int("vehicleMileage"),
  engineType: varchar("engineType", { length: 50 }), // بنزين، ديزل، هايبرد، كهربائي
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type OrderVehicle = typeof orderVehicles.$inferSelect;
export type InsertOrderVehicle = typeof orderVehicles.$inferInsert;

/**
 * Order Videos - فيديوهات حالة السيارة المرفقة بالطلب
 */
export const orderVideos = mysqlTable("orderVideos", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("videoOrderId").notNull(),
  /** رابط الفيديو على S3 */
  s3Key: varchar("videoS3Key", { length: 500 }).notNull(),
  /** اسم الملف الأصلي */
  originalName: varchar("videoOriginalName", { length: 255 }),
  /** نوع الملف */
  mimeType: varchar("videoMimeType", { length: 50 }).notNull(),
  /** حجم الملف بالبايت */
  fileSize: int("videoFileSize").notNull(),
  /** مدة الفيديو بالثواني */
  duration: int("videoDuration"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type OrderVideo = typeof orderVideos.$inferSelect;
export type InsertOrderVideo = typeof orderVideos.$inferInsert;

/**
 * Order Status History - سجل تغييرات حالة الطلب
 */
export const orderStatusHistory = mysqlTable("orderStatusHistory", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("statusOrderId").notNull(),
  /** الحالة السابقة */
  fromStatus: varchar("fromStatus", { length: 50 }),
  /** الحالة الجديدة */
  toStatus: varchar("toStatus", { length: 50 }).notNull(),
  /** من قام بالتغيير */
  changedBy: varchar("changedBy", { length: 100 }),
  changedByRole: mysqlEnum("changedByRole", ["system", "admin", "technician", "customer"]).default("system"),
  /** ملاحظات */
  notes: text("statusNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect;
export type InsertOrderStatusHistory = typeof orderStatusHistory.$inferInsert;

/**
 * OBD Scan Results - نتائج فحص OBD مربوطة بالطلب
 */
export const obdScanResults = mysqlTable("obdScanResults", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("scanOrderId").notNull(),
  /** بيانات الفحص */
  scanDate: timestamp("scanDate").defaultNow().notNull(),
  /** VIN المقروء من السيارة */
  vehicleVin: varchar("scannedVin", { length: 17 }),
  /** البروتوكول المستخدم */
  protocol: varchar("obdProtocol", { length: 50 }),
  /** أكواد الأعطال المخزنة (Stored DTCs) */
  storedCodes: json("storedCodes"), // [{code, description, severity}]
  /** أكواد معلقة (Pending DTCs) */
  pendingCodes: json("pendingCodes"), // [{code, description}]
  /** أكواد دائمة (Permanent DTCs) */
  permanentCodes: json("permanentCodes"), // [{code, description}]
  /** بيانات حية وقت الفحص */
  liveData: json("liveData"), // {rpm, coolantTemp, speed, voltage, ...}
  /** Freeze Frame Data */
  freezeFrameData: json("freezeFrameData"),
  /** ملاحظات الفني */
  technicianDiagnosis: text("technicianDiagnosis"),
  /** التوصيات */
  recommendations: text("scanRecommendations"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ObdScanResult = typeof obdScanResults.$inferSelect;
export type InsertObdScanResult = typeof obdScanResults.$inferInsert;

/**
 * Repair Quotes - عروض الصيانة
 */
export const repairQuotes = mysqlTable("repairQuotes", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("quoteOrderId").notNull(),
  /** بنود العرض */
  items: json("quoteItems").notNull(), // [{description, partName, partCost, laborHours, laborCost, total}]
  /** الإجمالي */
  subtotal: decimal("quoteSubtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("quoteTax", { precision: 10, scale: 2 }).default("0.00"),
  discount: decimal("quoteDiscount", { precision: 10, scale: 2 }).default("0.00"),
  totalAmount: decimal("quoteTotalAmount", { precision: 10, scale: 2 }).notNull(),
  /** حالة العرض */
  status: mysqlEnum("quoteStatus", ["pending", "approved", "rejected", "expired"]).default("pending").notNull(),
  /** موافقة العميل */
  approvedAt: timestamp("approvedAt"),
  approvedBy: varchar("approvedBy", { length: 255 }),
  /** ملاحظات */
  notes: text("quoteNotes"),
  /** صلاحية العرض */
  validUntil: timestamp("validUntil"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type RepairQuote = typeof repairQuotes.$inferSelect;
export type InsertRepairQuote = typeof repairQuotes.$inferInsert;

/**
 * Payments - الدفعات (كشف + صيانة)
 */
export const orderPayments = mysqlTable("orderPayments", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("paymentOrderId").notNull(),
  /** نوع الدفعة */
  paymentType: mysqlEnum("paymentType", ["inspection", "repair", "additional"]).notNull(),
  /** المبلغ */
  amount: decimal("paymentAmount", { precision: 10, scale: 2 }).notNull(),
  /** طريقة الدفع */
  paymentMethod: mysqlEnum("paymentMethod", ["bank_transfer", "stc_pay", "mada", "credit_card", "cash"]).notNull(),
  /** حالة الدفع */
  status: mysqlEnum("paymentStatus", ["pending", "confirmed", "failed", "refunded"]).default("pending").notNull(),
  /** مرجع الدفع (رقم التحويل أو رقم العملية) */
  reference: varchar("paymentReference", { length: 255 }),
  /** إيصال التحويل (رابط S3) */
  receiptUrl: varchar("receiptUrl", { length: 500 }),
  /** ملاحظات */
  notes: text("paymentNotes"),
  /** تأكيد الأدمن */
  confirmedAt: timestamp("confirmedAt"),
  confirmedBy: varchar("confirmedBy", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type OrderPayment = typeof orderPayments.$inferSelect;
export type InsertOrderPayment = typeof orderPayments.$inferInsert;

/**
 * Order Photos - صور تأكيد الانتهاء (قبل وبعد)
 */
export const orderPhotos = mysqlTable("orderPhotos", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("photoOrderId").notNull(),
  /** نوع الصورة */
  photoType: mysqlEnum("photoType", ["before", "after", "during", "receipt"]).notNull(),
  /** رابط الصورة على S3 */
  s3Key: varchar("photoS3Key", { length: 500 }).notNull(),
  /** وصف */
  caption: varchar("photoCaption", { length: 255 }),
  /** من رفع الصورة */
  uploadedBy: varchar("uploadedBy", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type OrderPhoto = typeof orderPhotos.$inferSelect;
export type InsertOrderPhoto = typeof orderPhotos.$inferInsert;

/**
 * Service Invoices - فواتير طلبات الخدمة (Job Card)
 */
export const serviceInvoices = mysqlTable("serviceInvoices", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("invoiceOrderId").notNull(),
  /** رقم الفاتورة */
  invoiceNumber: varchar("svcInvoiceNumber", { length: 30 }).notNull().unique(),
  /** بيانات العميل */
  customerName: varchar("svcInvoiceCustomerName", { length: 255 }).notNull(),
  customerPhone: varchar("svcInvoiceCustomerPhone", { length: 20 }).notNull(),
  /** بيانات السيارة */
  vehicleInfo: varchar("svcInvoiceVehicleInfo", { length: 500 }),
  /** البنود */
  items: json("svcInvoiceItems").notNull(), // [{description, quantity, unitPrice, total}]
  /** المبالغ */
  subtotal: decimal("svcInvoiceSubtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("svcInvoiceTax", { precision: 10, scale: 2 }).default("0.00"),
  discount: decimal("svcInvoiceDiscount", { precision: 10, scale: 2 }).default("0.00"),
  totalAmount: decimal("svcInvoiceTotalAmount", { precision: 10, scale: 2 }).notNull(),
  /** حالة الفاتورة */
  status: mysqlEnum("svcInvoiceStatus", ["draft", "issued", "paid", "cancelled"]).default("draft").notNull(),
  /** تاريخ الإصدار */
  issuedAt: timestamp("svcInvoiceIssuedAt"),
  /** ملاحظات */
  notes: text("svcInvoiceNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ServiceInvoice = typeof serviceInvoices.$inferSelect;
export type InsertServiceInvoice = typeof serviceInvoices.$inferInsert;


/**
 * User Vehicles - سيارات العملاء المسجلة
 */
export const userVehicles = mysqlTable("userVehicles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("vehicleUserId").notNull(),
  /** الماركة */
  make: varchar("vehicleMake", { length: 100 }).notNull(),
  /** الموديل */
  model: varchar("vehicleModel", { length: 100 }).notNull(),
  /** سنة الصنع */
  year: int("vehicleYear"),
  /** رقم الهيكل VIN */
  vin: varchar("vehicleVin", { length: 50 }),
  /** عداد الكيلومترات */
  mileage: int("vehicleMileage"),
  /** اللون */
  color: varchar("vehicleColor", { length: 50 }),
  /** رقم اللوحة */
  plateNumber: varchar("vehiclePlateNumber", { length: 20 }),
  /** نوع الوقود */
  fuelType: mysqlEnum("vehicleFuelType", ["gasoline", "diesel", "hybrid", "electric"]).default("gasoline"),
  /** ملاحظات */
  notes: text("vehicleNotes"),
  /** سيارة افتراضية */
  isDefault: boolean("vehicleIsDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type UserVehicle = typeof userVehicles.$inferSelect;
export type InsertUserVehicle = typeof userVehicles.$inferInsert;

/**
 * OBD Scan Reports - تقارير فحص OBD المرتبطة بالعميل وسيارته
 */
export const obdScanReports = mysqlTable("obdScanReports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("reportUserId").notNull(),
  vehicleId: int("reportVehicleId"),
  /** نسبة صحة المحرك */
  healthScore: int("reportHealthScore").default(0),
  /** أكواد الأعطال (JSON) */
  dtcCodes: json("reportDtcCodes"),
  /** البيانات الحية (JSON) */
  liveData: json("reportLiveData"),
  /** نتائج Multi-ECU (JSON) */
  multiEcuData: json("reportMultiEcuData"),
  /** بروتوكول الاتصال */
  protocol: varchar("reportProtocol", { length: 100 }),
  /** رقم الهيكل */
  vin: varchar("reportVin", { length: 50 }),
  /** الماركة */
  make: varchar("reportMake", { length: 100 }),
  /** الموديل */
  model: varchar("reportModel", { length: 100 }),
  /** السنة */
  year: int("reportYear"),
  /** الكيلومترات */
  mileage: int("reportMileage"),
  /** ملاحظات الفني */
  technicianNotes: text("reportTechnicianNotes"),
  /** حالة المراجعة */
  reviewStatus: mysqlEnum("reportReviewStatus", ["pending", "reviewed", "action_required"]).default("pending").notNull(),
  /** تاريخ الفحص */
  scanDate: timestamp("reportScanDate").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ObdScanReport = typeof obdScanReports.$inferSelect;
export type InsertObdScanReport = typeof obdScanReports.$inferInsert;
