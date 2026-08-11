/**
 * Pricing Module - Database Repository
 * Handles car brands, models, service parts, and price calculations
 */
import { eq, and, gte, lte } from "drizzle-orm";
import { getDb } from "../../shared/database";

// Car Brands
export async function getAllCarBrands() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { carBrands } = await import("../../../drizzle/schema");
  return await db.select().from(carBrands).orderBy(carBrands.nameAr);
}

export async function getCarBrandById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { carBrands } = await import("../../../drizzle/schema");
  const result = await db.select().from(carBrands).where(eq(carBrands.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCarBrand(data: { name: string; nameAr: string; logo?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { carBrands } = await import("../../../drizzle/schema");
  return await db.insert(carBrands).values(data);
}

export async function updateCarBrand(id: number, data: { name?: string; nameAr?: string; logo?: string; isActive?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { carBrands } = await import("../../../drizzle/schema");
  // Filter out undefined values
  const updateData: Record<string, any> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.nameAr !== undefined) updateData.nameAr = data.nameAr;
  if (data.logo !== undefined) updateData.logo = data.logo;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (Object.keys(updateData).length > 0) {
    await db.update(carBrands).set(updateData).where(eq(carBrands.id, id));
  }
}

export async function deleteCarBrand(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { carBrands } = await import("../../../drizzle/schema");
  await db.delete(carBrands).where(eq(carBrands.id, id));
}

// Car Models
export async function getAllCarModels() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { carModels } = await import("../../../drizzle/schema");
  return await db.select().from(carModels).orderBy(carModels.nameAr);
}

export async function getCarModelsByBrand(brandId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { carModels } = await import("../../../drizzle/schema");
  return await db.select().from(carModels).where(eq(carModels.brandId, brandId)).orderBy(carModels.nameAr);
}

export async function getCarModelById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { carModels } = await import("../../../drizzle/schema");
  const result = await db.select().from(carModels).where(eq(carModels.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCarModel(data: { brandId: number; name: string; nameAr: string; image?: string; yearFrom?: number; yearTo?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { carModels } = await import("../../../drizzle/schema");
  return await db.insert(carModels).values(data);
}

export async function updateCarModel(id: number, data: { name?: string; nameAr?: string; image?: string; yearFrom?: number; yearTo?: number; isActive?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { carModels } = await import("../../../drizzle/schema");
  const updateData: Record<string, any> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.nameAr !== undefined) updateData.nameAr = data.nameAr;
  if (data.image !== undefined) updateData.image = data.image;
  if (data.yearFrom !== undefined) updateData.yearFrom = data.yearFrom;
  if (data.yearTo !== undefined) updateData.yearTo = data.yearTo;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (Object.keys(updateData).length > 0) {
    await db.update(carModels).set(updateData).where(eq(carModels.id, id));
  }
}

export async function deleteCarModel(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { carModels } = await import("../../../drizzle/schema");
  await db.delete(carModels).where(eq(carModels.id, id));
}

// Service Parts
export async function getAllServiceParts() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { serviceParts } = await import("../../../drizzle/schema");
  return await db.select().from(serviceParts).orderBy(serviceParts.nameAr);
}

export async function getServicePartById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { serviceParts } = await import("../../../drizzle/schema");
  const result = await db.select().from(serviceParts).where(eq(serviceParts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createServicePart(data: { name: string; nameAr: string; description?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { serviceParts } = await import("../../../drizzle/schema");
  return await db.insert(serviceParts).values(data);
}

export async function updateServicePart(id: number, data: { name?: string; nameAr?: string; description?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { serviceParts } = await import("../../../drizzle/schema");
  await db.update(serviceParts).set(data).where(eq(serviceParts.id, id));
}

export async function deleteServicePart(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { serviceParts } = await import("../../../drizzle/schema");
  await db.delete(serviceParts).where(eq(serviceParts.id, id));
}

// Price Calculations
export async function getPriceCalculationsByDateRange(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { priceCalculations } = await import("../../../drizzle/schema");
  return await db.select().from(priceCalculations)
    .where(and(gte(priceCalculations.createdAt, startDate), lte(priceCalculations.createdAt, endDate)))
    .orderBy(priceCalculations.createdAt);
}
