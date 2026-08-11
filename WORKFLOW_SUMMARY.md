# 📋 ملخص سير عمل منصة مير

## 🎯 نظرة عامة
منصة **مير** هي منصة خدمات متكاملة لإصلاح وصيانة السيارات تجمع بين:
- **موقع عام** للعملاء (حجز الخدمات، التقييمات، التتبع)
- **منصة تدريب** للفنيين (دورات، شهادات، تقدم)
- **لوحة إدارة** متقدمة (إدارة الحجوزات، الفنيين، الأسعار)
- **نظام تسعير ذكي** (حساب تلقائي بناءً على Labor Time)
- **نظام دفع متعدد** (STC Pay، مدى، تحويل بنكي)

---

## 🏗️ البنية التقنية

### المكونات الرئيسية:
```
services_company/
├── client/                    # واجهة المستخدم (React + Vite)
│   ├── src/pages/            # الصفحات الرئيسية
│   ├── src/components/       # المكونات المعاد استخدامها
│   └── src/lib/              # المكتبات المساعدة
├── server/                    # الخادم الخلفي (Express + tRPC)
│   ├── routers.ts            # API endpoints الرئيسية
│   ├── notifications.ts      # نظام الإشعارات والفواتير
│   ├── pricing.ts            # حسابات الأسعار والتسعير
│   ├── courses.ts            # إدارة الدورات التدريبية
│   └── db.ts                 # عمليات قاعدة البيانات
├── drizzle/                  # قاعدة البيانات (MySQL)
│   └── schema.ts             # تعريف الجداول والعلاقات
└── dist/                     # الملفات المترجمة للإنتاج
```

### التقنيات المستخدمة:
| الطبقة | التقنيات |
|------|---------|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS, Wouter |
| **Backend** | Express, tRPC, Node.js |
| **Database** | MySQL, Drizzle ORM |
| **UI Components** | Radix UI, Lucide Icons, Sonner (Toast) |
| **State Management** | TanStack Query, React Context |
| **Charts** | Chart.js, Recharts |
| **Maps** | Google Maps API |
| **Testing** | Vitest |

---

## 🔄 سير العمل الرئيسي

### 1️⃣ العملية الأولى: الحجز
```
العميل → ملء نموذج الحجز → التحقق من البيانات → إرسال SMS تأكيد
         ↓
    حفظ في قاعدة البيانات → إشعار للإدارة → تعيين فني
         ↓
    تحديث حالة الحجز → تتبع الحجز → إكمال الخدمة
```

**الحقول المطلوبة:**
- البيانات الشخصية: الاسم، الهاتف، البريد
- بيانات السيارة: النوع، الماركة، الموديل، السنة
- تفاصيل الخدمة: نوع الخدمة، الموقع، التاريخ، الوقت

**API Endpoints:**
- `POST /api/booking.create` - إنشاء حجز جديد
- `GET /api/tracking.getBooking` - تتبع الحجز
- `PUT /api/admin.updateBookingStatus` - تحديث حالة الحجز

---

### 2️⃣ نظام التسعير الذكي
```
اختيار السيارة → اختيار القطعة → حساب Labor Time → حساب المسافة
         ↓
    السعر الأساسي = (ساعات العمل × سعر الساعة) + (المسافة × سعر الكيلو)
         ↓
    تطبيق العروض والخصومات → السعر النهائي
```

**المعادلات:**
- تكلفة العمل = ساعات العمل × 150 ريال/ساعة
- تكلفة المسافة = المسافة × 5 ريال/كم
- السعر النهائي = (تكلفة العمل + تكلفة المسافة) - الخصم

**API Endpoints:**
- `GET /api/pricing.getBrands` - قائمة الماركات
- `GET /api/pricing.getModelsByBrand` - الموديلات
- `GET /api/pricing.getParts` - القطع المتاحة
- `POST /api/pricing.calculatePrice` - حساب السعر

**قاعدة البيانات:**
| الجدول | الوصف |
|------|-------|
| `car_brands` | 30+ ماركة سيارة |
| `car_models` | 60+ موديل |
| `service_parts` | 15+ قطعة/خدمة |
| `labor_times` | أوقات العمل لكل قطعة |
| `pricing_settings` | إعدادات الأسعار |
| `promotions` | العروض والخصومات |
| `price_calculations` | سجل الحسابات |

---

### 3️⃣ منصة التدريب
```
الفني → تصفح الدورات → الاشتراك → تعلم الدروس → تتبع التقدم
         ↓
    إكمال الدورة → اختبار → إصدار شهادة رقمية
```

**الميزات:**
- 6 دورات تدريبية متخصصة
- 106 درس تعليمي
- 4 مدربين متخصصين
- نظام تتبع التقدم
- شهادات رقمية قابلة للتحميل

**قاعدة البيانات:**
| الجدول | الوصف |
|------|-------|
| `courses` | الدورات التدريبية |
| `lessons` | الدروس والمحاضرات |
| `instructors` | المدربين |
| `enrollments` | تسجيل المتدربين |
| `lesson_progress` | تتبع التقدم |
| `certificates` | الشهادات الرقمية |

**API Endpoints:**
- `GET /api/courses.getAll` - قائمة الدورات
- `POST /api/courses.enroll` - الاشتراك في دورة
- `GET /api/lessons.getByModule` - دروس الوحدة
- `POST /api/progress.updateProgress` - تحديث التقدم
- `POST /api/certificates.generate` - إصدار شهادة

---

### 4️⃣ نظام الإشعارات والفواتير
```
حدث جديد (حجز/تقييم) → إنشاء إشعار → إرسال للمسؤول
         ↓
    عرض في لوحة التحكم → تحديث كمقروء → حفظ في قاعدة البيانات
```

**الإشعارات:**
- إشعارات الحجوزات الجديدة
- إشعارات التقييمات الجديدة
- إشعارات الرسائل
- إشعارات النظام

**الفواتير:**
- إنشاء فواتير تلقائية
- تتبع حالة الفاتورة (مسودة، صادرة، مدفوعة، ملغاة)
- تحميل PDF
- سجل الفواتير

**قاعدة البيانات:**
| الجدول | الوصف |
|------|-------|
| `notifications` | الإشعارات |
| `invoices` | الفواتير |

**API Endpoints:**
- `GET /api/notifications.getNotifications` - جلب الإشعارات
- `POST /api/notifications.createNotification` - إنشاء إشعار
- `POST /api/notifications.markAsRead` - تحديث كمقروء
- `POST /api/notifications.createInvoice` - إنشاء فاتورة
- `PUT /api/notifications.updateInvoiceStatus` - تحديث حالة الفاتورة

---

### 5️⃣ لوحة التحكم الإدارية
```
تسجيل الدخول → اختيار القسم → عرض البيانات → إجراء التعديلات
```

**الأقسام الرئيسية:**
| القسم | الوصف | الصفحة |
|------|-------|--------|
| **لوحة التحكم** | إحصائيات عامة | `/admin/dashboard` |
| **الحجوزات** | إدارة الحجوزات | `/admin/bookings` |
| **المستخدمين** | إدارة المستخدمين | `/admin/users` |
| **الماركات** | إدارة ماركات السيارات | `/admin/brands` |
| **الموديلات** | إدارة موديلات السيارات | `/admin/models` |
| **القطع** | إدارة القطع والخدمات | `/admin/parts` |
| **أوقات العمل** | إدارة Labor Time | `/admin/labor-times-advanced` |
| **الأسعار** | إعدادات التسعير | `/admin/pricing-settings` |
| **العروض** | إدارة الخصومات | `/admin/promotions` |
| **التقارير** | تقارير المبيعات | `/admin/reports` |
| **الإشعارات** | إدارة الإشعارات | `/admin/notifications` |
| **الفواتير** | إدارة الفواتير | `/admin/invoices` |

**الميزات:**
- لوحة معلومات شاملة
- جداول بيانات متقدمة
- فلترة وبحث
- تصدير البيانات
- رسوم بيانية وإحصائيات

---

## 📊 قاعدة البيانات

### الجداول الرئيسية:
```sql
-- المستخدمين والمصادقة
users                    -- حسابات المستخدمين

-- الحجوزات والخدمات
bookings                 -- سجل الحجوزات
reviews                  -- التقييمات
contact_messages         -- رسائل التواصل
technicians              -- الفنيين

-- نظام التسعير
car_brands               -- ماركات السيارات
car_models               -- موديلات السيارات
service_parts            -- القطع والخدمات
labor_times              -- أوقات العمل
pricing_settings         -- إعدادات الأسعار
promotions               -- العروض والخصومات
price_calculations       -- سجل الحسابات

-- منصة التدريب
courses                  -- الدورات التدريبية
lessons                  -- الدروس
instructors              -- المدربين
enrollments              -- تسجيل المتدربين
lesson_progress          -- تتبع التقدم
certificates             -- الشهادات الرقمية

-- نظام الولاء
loyalty_points           -- نقاط الولاء
points_history           -- سجل النقاط

-- الإشعارات والفواتير
notifications            -- الإشعارات
invoices                 -- الفواتير

-- الخدمات الإضافية
tow_trucks               -- السطحات المعتمدة
parts_shops              -- محلات القطع
junkyards                -- التشاليح المعتمدة
```

---

## 🔐 نظام المصادقة والأدوار

### الأدوار المتاحة:
| الدور | الصلاحيات |
|------|----------|
| **Admin** | الوصول الكامل لجميع الأقسام |
| **User** | الحجز، التقييم، تتبع الحجز |
| **Instructor** | إدارة الدورات والدروس |

### طرق المصادقة:
- OAuth (تسجيل دخول موحد)
- JWT Tokens
- Session Cookies

---

## 📱 واجهات المستخدم الرئيسية

### الصفحات العامة:
| الصفحة | الرابط | الوصف |
|------|--------|-------|
| الرئيسية | `/` | الصفحة الرئيسية |
| الحجز | `/` | نموذج الحجز المتقدم |
| التتبع | `/track` | تتبع الحجز |
| الدورات | `/courses` | منصة التدريب |
| حاسبة الأسعار | `/price-calculator` | حساب التسعير |
| المقارنة | `/price-comparison` | مقارنة الأسعار |
| النقاط | `/my-points` | نظام الولاء |

### صفحات الإدارة:
- `/admin` - لوحة التحكم الرئيسية
- `/admin/dashboard` - الإحصائيات
- `/admin/bookings` - إدارة الحجوزات
- `/admin/notifications` - الإشعارات
- `/admin/invoices` - الفواتير

---

## 🔌 API الرئيسية

### Booking API:
```typescript
// إنشاء حجز
POST /api/booking.create
{
  name: string
  phone: string
  email?: string
  service: string
  location: string
  date: string
  time: string
  carType?: string
  carBrand?: string
  carModel?: string
  carYear?: string
}

// تتبع الحجز
GET /api/tracking.getBooking?id=1
```

### Pricing API:
```typescript
// حساب السعر
POST /api/pricing.calculatePrice
{
  brandId: number
  modelId: number
  partId: number
  distance: number
}

// الحصول على الماركات
GET /api/pricing.getBrands
```

### Notifications API:
```typescript
// إنشاء إشعار
POST /api/notifications.createNotification
{
  userId: number
  type: "booking" | "review" | "message" | "system"
  title: string
  message: string
}

// إنشاء فاتورة
POST /api/notifications.createInvoice
{
  bookingId: number
  invoiceNumber: string
  customerName: string
  amount: string
  finalAmount: string
}
```

---

## 📈 الإحصائيات والتقارير

### لوحة المعلومات:
- إجمالي الحجوزات
- الحجوزات المكتملة
- متوسط التقييم
- إجمالي الإيرادات
- عدد المتدربين
- عدد الشهادات المصدرة

### التقارير المتقدمة:
- تقرير المبيعات الشهري
- تقرير الخدمات الأكثر طلباً
- تقرير أداء الفنيين
- تقرير رضا العملاء
- تقرير الدورات التدريبية

---

## 🚀 خطوات التشغيل

### التثبيت:
```bash
cd /home/ubuntu/services_company
pnpm install
```

### التطوير:
```bash
pnpm dev
```

### البناء:
```bash
pnpm build
```

### الإنتاج:
```bash
pnpm start
```

### الاختبارات:
```bash
pnpm test
```

### تحديث قاعدة البيانات:
```bash
pnpm db:push
```

---

## 📝 ملاحظات مهمة

### الميزات الحالية:
✅ نظام الحجز الكامل
✅ نظام التسعير الذكي
✅ منصة التدريب
✅ لوحة التحكم الإدارية
✅ نظام الإشعارات والفواتير
✅ نظام الولاء والنقاط
✅ نظام الدفع المتعدد
✅ تطبيق PWA

### الميزات المخطط إضافتها:
⏳ نظام إرسال الفواتير عبر البريد
⏳ تنبيهات فورية عبر WebSocket
⏳ تقارير متقدمة بالفواتير
⏳ نظام الشراكات المتقدم
⏳ تطبيق موبايل native

---

## 🔗 الروابط المهمة

- **الموقع الرئيسي**: https://servicesco-wemmmnce.manus.space
- **لوحة التحكم**: https://servicesco-wemmmnce.manus.space/admin
- **منصة التدريب**: https://servicesco-wemmmnce.manus.space/courses
- **حاسبة الأسعار**: https://servicesco-wemmmnce.manus.space/price-calculator

---

## 📞 معلومات التواصل

**رقم الاتصال الموحد**: 0543257872
- ✅ يدعم الاتصال المباشر
- ✅ يدعم واتساب

---

**آخر تحديث**: مايو 2026
**الإصدار**: 1.0.0
**الحالة**: جاهز للإنتاج ✅
