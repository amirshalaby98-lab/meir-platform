import { getDb } from "./db.js";
import {
  serviceParts,
  serviceTypes,
  partVariants,
  carModels,
} from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

async function addCamryFuelPump() {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    console.log("🔄 Adding Camry Fuel Pump data...");

    // Get Camry model
    const camryModel = await db
      .select()
      .from(carModels)
      .where(eq(carModels.nameAr, "Camry"))
      .limit(1);

    if (camryModel.length === 0) {
      throw new Error("Camry model not found");
    }

    const modelId = camryModel[0].id;
    console.log(`✅ Camry Model ID: ${modelId}`);

    // Get or create Fuel Pump part
    let fuelPumpPart = await db
      .select()
      .from(serviceParts)
      .where(eq(serviceParts.nameAr, "Fuel Pump"))
      .limit(1);

    let partId;
    if (fuelPumpPart.length === 0) {
      console.log("📝 Creating Fuel Pump part...");
      await db.insert(serviceParts).values({
        nameAr: "Fuel Pump",
        name: "Fuel Pump",
        category: "Fuel Delivery and Air Induction",
      });
      fuelPumpPart = await db
        .select()
        .from(serviceParts)
        .where(eq(serviceParts.nameAr, "Fuel Pump"))
        .limit(1);
    }

    partId = fuelPumpPart[0].id;
    console.log(`✅ Fuel Pump Part ID: ${partId}`);

    // Add variants
    const variants = [
      { name: "High Pressure Pump", oemPart: "12716496", price: 363.24 },
      { name: "Low Pressure Pump", oemPart: "85513196", price: 192.10 },
    ];

    console.log("📝 Adding variants...");
    for (const variant of variants) {
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
          description: `Fuel Pump - ${variant.name}`,
          isActive: true,
        });
        console.log(`  ✅ Added: ${variant.name} ($${variant.price})`);
      }
    }

    // Add service
    const existingService = await db
      .select()
      .from(serviceTypes)
      .where(eq(serviceTypes.serviceTypeName, "Remove & Replace"))
      .limit(1);

    if (existingService.length === 0) {
      await db.insert(serviceTypes).values({
        partId,
        modelId,
        serviceTypeCode: "REMOVE_REPLACE",
        serviceTypeName: "Remove & Replace",
        description: "Fuel Pump - Remove & Replace",
        skillLevel: "B",
        minHours: "0.0",
        maxHours: "1.5",
      });
      console.log("  ✅ Added service: Remove & Replace (0.0-1.5h, Skill B)");
    }

    console.log("\n✅ Camry Fuel Pump data added successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

addCamryFuelPump();
