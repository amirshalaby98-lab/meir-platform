import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { technicians, workshops, vendors } from "./drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const firstNames = ["أحمد", "خالد", "محمد", "عبدالرحمن", "سعود", "فهد", "ناصر", "تركي", "بندر", "سلطان"];
const lastNames = ["العتيبي", "السالم", "الغامدي", "القحطاني", "الشهري", "الحربي", "المطيري", "الزهراني", "الدوسري", "العمري"];
const areas = [
  { city: "مكة المكرمة", area: "العزيزية" },
  { city: "مكة المكرمة", area: "الشوقية" },
  { city: "مكة المكرمة", area: "النسيم" },
  { city: "جدة", area: "الروضة" },
  { city: "جدة", area: "الصفا" },
  { city: "جدة", area: "الشاطئ" },
  { city: "جدة", area: "السلامة" },
  { city: "مكة المكرمة", area: "العوالي" },
  { city: "جدة", area: "النزهة" },
  { city: "مكة المكرمة", area: "الزاهر" },
];
const specializations = [
  "بطارية، دينمو، كهرباء",
  "تشخيص أعطال، ECU، حساسات",
  "بطارية، طرمبة بنزين، فلاتر",
  "دينمو، سلف، كهرباء",
  "تشخيص شامل، ECU، كمبيوتر",
  "فرامل، تعليق، زيوت",
  "تكييف، ردياتير، طرمبة ماء",
  "بواجي، سيور، تايمن",
  "بودي وسمكرة",
  "كهرباء عامة وبطاريات",
];

function phone(seed: number): string {
  return "05" + String(10000000 + seed).padStart(8, "0");
}

async function main() {
  console.log("🔄 جاري إضافة بيانات تجريبية للفنيين والورش والموردين...\n");

  // 10 technicians
  for (let i = 0; i < 10; i++) {
    const name = `${firstNames[i]} ${lastNames[i]}`;
    const loc = areas[i];
    await db.insert(technicians).values({
      name,
      phone: phone(1000 + i),
      email: `tech${i + 1}@meir.sa`,
      specialization: specializations[i],
      yearsExperience: 2 + (i % 8),
      location: loc.city,
      status: i % 3 === 0 ? "busy" : "available",
      approvalStatus: "approved",
      rating: 3 + (i % 3),
      completedJobs: 20 + i * 15,
    });
    console.log(`✅ فني: ${name} - ${loc.city}`);
  }

  // 10 workshops
  const workshopSpecialties = [
    ["ميكانيكا", "كهرباء"],
    ["بودي", "سمكرة", "دهان"],
    ["تكييف", "ردياتير"],
    ["فرامل", "تعليق"],
    ["صيانة دورية", "زيوت"],
    ["تشخيص كمبيوتر"],
    ["إطارات", "بنشر"],
    ["جير أوتوماتيك"],
    ["كهرباء سيارات"],
    ["ميكانيكا عامة"],
  ];
  for (let i = 0; i < 10; i++) {
    const loc = areas[(i + 3) % areas.length];
    const name = `ورشة ${lastNames[i]} للسيارات`;
    await db.insert(workshops).values({
      name,
      ownerName: `${firstNames[(i + 2) % firstNames.length]} ${lastNames[i]}`,
      phone: phone(2000 + i),
      email: `workshop${i + 1}@meir.sa`,
      city: loc.city,
      area: loc.area,
      address: `حي ${loc.area}، ${loc.city}`,
      description: `ورشة متخصصة في ${workshopSpecialties[i].join("، ")}`,
      specialties: workshopSpecialties[i],
      workingHours: "9:00 ص - 10:00 م",
      rating: (3.5 + (i % 3) * 0.5).toFixed(2),
      totalReviews: 5 + i * 3,
      completedJobs: 30 + i * 10,
      status: "approved",
      approvedAt: new Date(),
    });
    console.log(`✅ ورشة: ${name} - ${loc.city}`);
  }

  // 10 vendors, split across parts_shop / tow_truck / junkyard
  const vendorTypes = ["parts_shop", "tow_truck", "junkyard"] as const;
  const vendorTypeLabelAr: Record<(typeof vendorTypes)[number], string> = {
    parts_shop: "محل قطع غيار",
    tow_truck: "سطحة",
    junkyard: "تشليح",
  };
  let vendorCount = 0;
  for (const vendorType of vendorTypes) {
    for (let i = 0; i < 10; i++) {
      const loc = areas[(i + 5) % areas.length];
      const businessName = `${vendorTypeLabelAr[vendorType]} ${lastNames[(i + 4) % lastNames.length]}`;
      await db.insert(vendors).values({
        vendorType,
        businessName,
        ownerName: `${firstNames[(i + 6) % firstNames.length]} ${lastNames[(i + 1) % lastNames.length]}`,
        phone: phone(3000 + vendorCount),
        email: `${vendorType}${i + 1}@meir.sa`,
        city: loc.city,
        area: loc.area,
        address: `حي ${loc.area}، ${loc.city}`,
        description: `${vendorTypeLabelAr[vendorType]} معتمد في ${loc.city}`,
        rating: (3.5 + (i % 3) * 0.5).toFixed(2),
        status: "approved",
        verifiedAt: new Date(),
        approvedAt: new Date(),
      });
      console.log(`✅ ${vendorTypeLabelAr[vendorType]}: ${businessName} - ${loc.city}`);
      vendorCount++;
    }
  }

  console.log("\n✅ تم إضافة جميع البيانات التجريبية بنجاح!");
  console.log("📊 10 فنيين، 10 ورش، 30 مورد (10 قطع غيار + 10 سطحات + 10 تشليح)");
  process.exit(0);
}

main().catch((error) => {
  console.error("❌ خطأ في إضافة البيانات:", error);
  process.exit(1);
});
