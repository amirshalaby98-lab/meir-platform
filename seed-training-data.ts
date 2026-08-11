import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema';

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'services_company',
});

const db = drizzle(connection, { schema, mode: 'default' });

console.log('🌱 Starting to seed training data...\n');

// 1. إضافة المدربين
console.log('📚 Adding instructors...');
const instructorsData = [
  {
    name: 'م. أحمد السعيد',
    email: 'ahmed.alsaeed@meir.sa',
    phone: '0501234567',
    bio: 'خبير في صيانة البطاريات مع أكثر من 15 عاماً من الخبرة في مجال صيانة السيارات',
    specialization: 'بطارية',
    experience: 15,
    rating: 5,
    totalCourses: 2,
    totalStudents: 150,
    status: 'active',
  },
  {
    name: 'م. محمد الأحمدي',
    email: 'mohammed.alahmadi@meir.sa',
    phone: '0502345678',
    bio: 'متخصص في أنظمة الشحن والتشغيل (السلف والدينمو) مع خبرة 12 عاماً',
    specialization: 'سلف ودينمو',
    experience: 12,
    rating: 5,
    totalCourses: 1,
    totalStudents: 120,
    status: 'active',
  },
  {
    name: 'م. خالد العتيبي',
    email: 'khaled.alotaibi@meir.sa',
    phone: '0503456789',
    bio: 'خبير في تشخيص ECU والأنظمة الإلكترونية المتقدمة مع 10 سنوات خبرة',
    specialization: 'ECU',
    experience: 10,
    rating: 5,
    totalCourses: 1,
    totalStudents: 80,
    status: 'active',
  },
  {
    name: 'م. عبدالله القحطاني',
    email: 'abdullah.alqahtani@meir.sa',
    phone: '0504567890',
    bio: 'مدرب معتمد في الصيانة الشاملة للسيارات مع 20 عاماً من الخبرة',
    specialization: 'صيانة شاملة',
    experience: 20,
    rating: 5,
    totalCourses: 2,
    totalStudents: 200,
    status: 'active',
  },
];

for (const instructor of instructorsData) {
  await db.insert(schema.instructors).values(instructor);
  console.log(`✅ Added instructor: ${instructor.name}`);
}

// 2. إضافة الدورات
console.log('\n📖 Adding courses...');
const coursesData = [
  {
    title: 'تدريب صيانة البطاريات',
    slug: 'battery-maintenance',
    description: 'دورة شاملة لتعلم كل شيء عن تشخيص وصيانة واستبدال بطاريات السيارات',
    thumbnail: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80',
    level: 'beginner',
    category: 'بطارية',
    duration: 'أسبوعان',
    price: 500,
    instructor: 'م. أحمد السعيد',
    totalLessons: 12,
    totalDuration: 480, // 8 ساعات
    published: 1,
    enrolledCount: 150,
    rating: 5,
  },
  {
    title: 'تدريب السلف والدينمو',
    slug: 'alternator-starter',
    description: 'إصلاح وصيانة أنظمة الشحن والتشغيل بشكل احترافي',
    thumbnail: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80',
    level: 'intermediate',
    category: 'سلف ودينمو',
    duration: '3 أسابيع',
    price: 750,
    instructor: 'م. محمد الأحمدي',
    totalLessons: 18,
    totalDuration: 900, // 15 ساعة
    published: 1,
    enrolledCount: 120,
    rating: 5,
  },
  {
    title: 'تشخيص ECU المتقدم',
    slug: 'ecu-diagnostics',
    description: 'تشخيص الأعطال الإلكترونية المعقدة باستخدام أجهزة OBD',
    thumbnail: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&q=80',
    level: 'advanced',
    category: 'ECU',
    duration: 'شهر واحد',
    price: 1200,
    instructor: 'م. خالد العتيبي',
    totalLessons: 24,
    totalDuration: 1440, // 24 ساعة
    published: 1,
    enrolledCount: 80,
    rating: 5,
  },
  {
    title: 'الصيانة الشاملة',
    slug: 'comprehensive-maintenance',
    description: 'برنامج تدريبي شامل يغطي جميع أنظمة السيارة',
    thumbnail: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800&q=80',
    level: 'beginner',
    category: 'شامل',
    duration: '3 أشهر',
    price: 2000,
    instructor: 'م. عبدالله القحطاني',
    totalLessons: 48,
    totalDuration: 2880, // 48 ساعة
    published: 1,
    enrolledCount: 200,
    rating: 5,
  },
  {
    title: 'أنظمة الكهرباء في السيارات',
    slug: 'electrical-systems',
    description: 'فهم شامل لأنظمة الكهرباء والإلكترونيات في السيارات الحديثة',
    thumbnail: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80',
    level: 'intermediate',
    category: 'كهرباء',
    duration: '5 أسابيع',
    price: 900,
    instructor: 'م. عبدالله القحطاني',
    totalLessons: 20,
    totalDuration: 1000, // 16.7 ساعة
    published: 1,
    enrolledCount: 95,
    rating: 5,
  },
  {
    title: 'تشخيص أعطال المحرك',
    slug: 'engine-diagnostics',
    description: 'تقنيات متقدمة لتشخيص وإصلاح أعطال المحرك',
    thumbnail: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800&q=80',
    level: 'advanced',
    category: 'محرك',
    duration: '6 أسابيع',
    price: 1100,
    instructor: 'م. أحمد السعيد',
    totalLessons: 22,
    totalDuration: 1320, // 22 ساعة
    published: 1,
    enrolledCount: 70,
    rating: 5,
  },
];

const insertedCourses = [];
for (const course of coursesData) {
  const result = await db.insert(schema.courses).values(course);
  insertedCourses.push({ ...course, id: Number(result[0].insertId) });
  console.log(`✅ Added course: ${course.title}`);
}

// 3. إضافة الدروس لكل دورة
console.log('\n📝 Adding lessons...');

// دروس دورة البطاريات
const batteryLessons = [
  { title: 'مقدمة عن بطاريات السيارات', duration: 30, order: 1, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'أنواع البطاريات المختلفة', duration: 45, order: 2, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'كيفية فحص البطارية', duration: 40, order: 3, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'تشخيص أعطال البطارية', duration: 50, order: 4, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'شحن البطارية بشكل صحيح', duration: 35, order: 5, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'استبدال البطارية', duration: 30, order: 6, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'صيانة البطارية الدورية', duration: 40, order: 7, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'السلامة المهنية عند التعامل مع البطاريات', duration: 35, order: 8, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'أدوات فحص البطارية', duration: 45, order: 9, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'حل المشاكل الشائعة', duration: 50, order: 10, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'البطاريات الحديثة (AGM & EFB)', duration: 40, order: 11, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'الاختبار النهائي والشهادة', duration: 60, order: 12, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
];

const courseId1 = insertedCourses[0].id;
for (const lesson of batteryLessons) {
  await db.insert(schema.lessons).values({
    courseId: courseId1,
    slug: lesson.title.toLowerCase().replace(/\s+/g, '-'),
    description: `درس شامل عن ${lesson.title}`,
    content: `محتوى تفصيلي عن ${lesson.title}`,
    ...lesson,
  });
  console.log(`  ✅ Added lesson: ${lesson.title}`);
}

// دروس دورة السلف والدينمو
const alternatorLessons = [
  { title: 'مقدمة عن نظام الشحن', duration: 40, order: 1, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'مكونات نظام الشحن', duration: 45, order: 2, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'كيف يعمل الدينمو', duration: 50, order: 3, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'فحص الدينمو', duration: 55, order: 4, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'أعطال الدينمو الشائعة', duration: 50, order: 5, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'إصلاح الدينمو', duration: 60, order: 6, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'مقدمة عن نظام التشغيل', duration: 40, order: 7, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'مكونات السلف', duration: 45, order: 8, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'كيف يعمل السلف', duration: 50, order: 9, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'فحص السلف', duration: 55, order: 10, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'أعطال السلف الشائعة', duration: 50, order: 11, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'إصلاح السلف', duration: 60, order: 12, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'التشخيص الكهربائي', duration: 55, order: 13, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'استخدام الملتيميتر', duration: 50, order: 14, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'الاستبدال والتركيب', duration: 45, order: 15, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'الصيانة الدورية', duration: 40, order: 16, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'حل المشاكل المعقدة', duration: 55, order: 17, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'الاختبار النهائي', duration: 60, order: 18, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
];

const courseId2 = insertedCourses[1].id;
for (const lesson of alternatorLessons) {
  await db.insert(schema.lessons).values({
    courseId: courseId2,
    slug: lesson.title.toLowerCase().replace(/\s+/g, '-'),
    description: `درس شامل عن ${lesson.title}`,
    content: `محتوى تفصيلي عن ${lesson.title}`,
    ...lesson,
  });
  console.log(`  ✅ Added lesson: ${lesson.title}`);
}

console.log('\n✅ Training data seeded successfully!');
await connection.end();
