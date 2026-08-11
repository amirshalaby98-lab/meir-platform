import { drizzle } from "drizzle-orm/mysql2";
import { technicians } from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

const sampleTechnicians = [
  {
    name: "أحمد محمد العتيبي",
    phone: "0501234567",
    email: "ahmed@meir.sa",
    specialization: "بطارية، دينمو، كهرباء",
    location: "مكة المكرمة",
    status: "available",
    rating: 5,
    completedJobs: 127,
  },
  {
    name: "خالد عبدالله السالم",
    phone: "0509876543",
    email: "khaled@meir.sa",
    specialization: "تشخيص أعطال، ECU، حساسات",
    location: "جدة",
    status: "available",
    rating: 5,
    completedJobs: 98,
  },
  {
    name: "محمد سعيد الغامدي",
    phone: "0551234567",
    email: "mohammed@meir.sa",
    specialization: "بطارية، طرمبة بنزين، فلاتر",
    location: "مكة المكرمة",
    status: "busy",
    rating: 4,
    completedJobs: 156,
  },
  {
    name: "عبدالرحمن فهد القحطاني",
    phone: "0559876543",
    email: "abdulrahman@meir.sa",
    specialization: "دينمو، سلف، كهرباء",
    location: "جدة",
    status: "available",
    rating: 5,
    completedJobs: 203,
  },
  {
    name: "سعود ناصر الشهري",
    phone: "0561234567",
    email: "saud@meir.sa",
    specialization: "تشخيص شامل، ECU، كمبيوتر",
    location: "مكة المكرمة",
    status: "available",
    rating: 5,
    completedJobs: 89,
  },
];

async function seedTechnicians() {
  try {
    console.log("🔄 جاري إضافة الفنيين التجريبيين...");
    
    for (const tech of sampleTechnicians) {
      await db.insert(technicians).values(tech);
      console.log(`✅ تمت إضافة: ${tech.name}`);
    }
    
    console.log("\n✅ تم إضافة جميع الفنيين التجريبيين بنجاح!");
    console.log(`📊 إجمالي الفنيين: ${sampleTechnicians.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ خطأ في إضافة البيانات:", error);
    process.exit(1);
  }
}

seedTechnicians();
