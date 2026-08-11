import { getDb } from "./db.js";
import {
  carBrands,
  carModels,
  serviceParts,
  serviceTypes,
  partVariants,
} from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

const CAMRY_DATA = {
  vehicle: "2008 Toyota Camry",
  engine: "L4-2.4L (2AZ-FE)",
  brand: "Toyota",
  model: "Camry",
  year: 2008,
  parts: [
    {
      name: "Starter Motor",
      category: "Starting and Charging",
      variants: [
        { name: "Japan Built", oemPart: "281002002084", price: 219.85 },
        { name: "USA Built", oemPart: "281000A01084", price: 258.24 },
      ],
      services: [
        { name: "Replace", skill: "B", minHours: 0.5, maxHours: 0.6 },
        { name: "Overhaul/Rebuild", skill: "A", minHours: 0.9, maxHours: 1.1 },
      ],
    },
  ],
};

async function seedCamryData() {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    console.log("🔄 Starting Camry data seed...");

    // Check if brand exists
    let brand = await db
      .select()
      .from(carBrands)
      .where(eq(carBrands.nameAr, CAMRY_DATA.brand))
      .limit(1);

    if (brand.length === 0) {
      console.log(`📝 Creating brand: ${CAMRY_DATA.brand}`);
      await db.insert(carBrands).values({
        nameAr: CAMRY_DATA.brand,
        name: CAMRY_DATA.brand,
      });
      brand = await db
        .select()
        .from(carBrands)
        .where(eq(carBrands.nameAr, CAMRY_DATA.brand))
        .limit(1);
    }

    const brandId = brand[0].id;
    console.log(`✅ Brand ID: ${brandId}`);

    // Check if model exists
    let model = await db
      .select()
      .from(carModels)
      .where(eq(carModels.nameAr, CAMRY_DATA.model))
      .limit(1);

    if (model.length === 0) {
      console.log(`📝 Creating model: ${CAMRY_DATA.model}`);
      await db.insert(carModels).values({
        brandId,
        nameAr: CAMRY_DATA.model,
        name: CAMRY_DATA.model,
        year: CAMRY_DATA.year,
      });
      model = await db
        .select()
        .from(carModels)
        .where(eq(carModels.nameAr, CAMRY_DATA.model))
        .limit(1);
    }

    const modelId = model[0].id;
    console.log(`✅ Model ID: ${modelId}`);

    // Seed parts and services
    for (const part of CAMRY_DATA.parts) {
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

    console.log("\n✅ Camry data seed completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding Camry data:", error);
    process.exit(1);
  }
}

seedCamryData();
