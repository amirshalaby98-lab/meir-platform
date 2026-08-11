import { getDb } from "./db.js";
import {
  carBrands,
  carModels,
  serviceParts,
  serviceTypes,
  partVariants,
} from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

const REPAIR_DATA = {
  vehicle: "2008 Toyota Yaris",
  engine: "L4-1.5L (1NZ-FE)",
  brand: "Toyota",
  model: "Yaris",
  year: 2008,
  parts: [
    {
      name: "Starter Motor",
      category: "Starting and Charging",
      variants: [
        { name: "Non Reduction Type", oemPart: "281002102084", price: 281.87 },
        { name: "Reduction Type", oemPart: "281002106284", price: 222.7 },
      ],
      services: [
        { name: "Replace", skill: "B", minHours: 0.6, maxHours: 0.7 },
        { name: "Overhaul/Rebuild", skill: "B", minHours: 1.4, maxHours: 1.7 },
        { name: "R&R Armature", skill: "B", minHours: 0.8, maxHours: 1.0 },
        { name: "R&R Bushing", skill: "B", minHours: 0.4, maxHours: 0.5 },
        { name: "R&R Field Coil", skill: "B", minHours: 0.4, maxHours: 0.5 },
      ],
    },
    {
      name: "Fuel Pump",
      category: "Fuel Delivery and Air Induction",
      variants: [{ name: "Standard", oemPart: "2322021132", price: 447.6 }],
      services: [{ name: "Replace", skill: "B", minHours: 0.6, maxHours: 0.9 }],
    },
    {
      name: "A.P.P. Sensor",
      category: "Sensors and Switches",
      variants: [
        { name: "Pedal Travel Sensor", oemPart: "7811052020", price: 169.09 },
      ],
      services: [{ name: "Replace", skill: "B", minHours: 0.0, maxHours: 0.4 }],
    },
    {
      name: "Battery",
      category: "Starting and Charging",
      variants: [],
      services: [
        { name: "Service or Charge", skill: "B", minHours: 0.0, maxHours: 0.4 },
        { name: "Replace", skill: "C", minHours: 0.3, maxHours: 0.3 },
        { name: "Clean Terminals", skill: "C", minHours: 0.0, maxHours: 0.3 },
      ],
    },
  ],
};

async function seedRepairData() {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    console.log("🔄 Starting repair data seed...");

    // Check if brand exists
    let brand = await db
      .select()
      .from(carBrands)
      .where(eq(carBrands.nameAr, REPAIR_DATA.brand))
      .limit(1);

    if (brand.length === 0) {
      console.log(`📝 Creating brand: ${REPAIR_DATA.brand}`);
      await db.insert(carBrands).values({
        nameAr: REPAIR_DATA.brand,
        name: REPAIR_DATA.brand,
      });
      brand = await db
        .select()
        .from(carBrands)
        .where(eq(carBrands.nameAr, REPAIR_DATA.brand))
        .limit(1);
    }

    const brandId = brand[0].id;
    console.log(`✅ Brand ID: ${brandId}`);

    // Check if model exists
    let model = await db
      .select()
      .from(carModels)
      .where(eq(carModels.nameAr, REPAIR_DATA.model))
      .limit(1);

    if (model.length === 0) {
      console.log(`📝 Creating model: ${REPAIR_DATA.model}`);
      await db.insert(carModels).values({
        brandId,
        nameAr: REPAIR_DATA.model,
        name: REPAIR_DATA.model,
        year: REPAIR_DATA.year,
      });
      model = await db
        .select()
        .from(carModels)
        .where(eq(carModels.nameAr, REPAIR_DATA.model))
        .limit(1);
    }

    const modelId = model[0].id;
    console.log(`✅ Model ID: ${modelId}`);

    // Seed parts and services
    for (const part of REPAIR_DATA.parts) {
      console.log(`\n📦 Processing part: ${part.name}`);

      // Check if part exists
      let servicePart = await db
        .select()
        .from(serviceParts)
        .where(eq(serviceParts.nameAr, part.name))
        .limit(1);

      if (servicePart.length === 0) {
        console.log(`  📝 Creating part: ${part.name}`);
        await db.insert(serviceParts).values({
          nameAr: part.name,
          name: part.name,
          category: part.category,
        });
        servicePart = await db
          .select()
          .from(serviceParts)
          .where(eq(serviceParts.nameAr, part.name))
          .limit(1);
      }

      const partId = servicePart[0].id;
      console.log(`  ✅ Part ID: ${partId}`);

      // Add variants
      if (part.variants.length > 0) {
        console.log(`  📝 Adding ${part.variants.length} variant(s)...`);
        for (const variant of part.variants) {
          const existingVariant = await db
            .select()
            .from(partVariants)
            .where(eq(partVariants.oemPartNumber, variant.oemPart))
            .limit(1);

          if (existingVariant.length === 0) {
            await db.insert(partVariants).values({
              partId,
              modelId,
              variantCode: variant.name.toUpperCase().replace(/\s+/g, "_"),
              variantName: variant.name,
              oemPartNumber: variant.oemPart,
              price: variant.price.toString(),
              currency: "USD",
              description: `${part.name} - ${variant.name}`,
              isActive: true,
            });
            console.log(`    ✅ Added variant: ${variant.name} ($${variant.price})`);
          }
        }
      }

      // Add services
      if (part.services.length > 0) {
        console.log(`  📝 Adding ${part.services.length} service(s)...`);
        for (const service of part.services) {
          const existingService = await db
            .select()
            .from(serviceTypes)
            .where(eq(serviceTypes.serviceTypeName, service.name))
            .limit(1);

          if (existingService.length === 0) {
            await db.insert(serviceTypes).values({
              partId,
              modelId,
              serviceTypeCode: service.name.toUpperCase().replace(/\s+/g, "_"),
              serviceTypeName: service.name,
              description: `${part.name} - ${service.name}`,
              skillLevel: service.skill,
              minHours: service.minHours.toString(),
              maxHours: service.maxHours.toString(),
            });
            console.log(
              `    ✅ Added service: ${service.name} (${service.minHours}-${service.maxHours}h, Skill: ${service.skill})`
            );
          }
        }
      }
    }

    console.log("\n✅ Repair data seed completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding repair data:", error);
    process.exit(1);
  }
}

seedRepairData();
