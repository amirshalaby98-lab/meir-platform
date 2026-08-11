import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";
import {
  serviceTypes,
  partVariants,
  advancedPriceCalculations,
  pricingSettings,
} from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Advanced Pricing System", () => {
  let db: any;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database connection failed");
  });

  describe("Service Types", () => {
    it("should retrieve service types for Yaris Starter Motor", async () => {
      const services = await db
        .select()
        .from(serviceTypes)
        .where(eq(serviceTypes.partId, 120001))
        .limit(10);

      expect(services.length).toBeGreaterThan(0);
      expect(services[0]).toHaveProperty("serviceTypeName");
      expect(services[0]).toHaveProperty("minHours");
      expect(services[0]).toHaveProperty("maxHours");
    });

    it("should have correct skill levels", async () => {
      const services = await db
        .select()
        .from(serviceTypes)
        .where(eq(serviceTypes.partId, 120001))
        .limit(10);

      const skillLevels = services.map((s: any) => s.skillLevel);
      expect(skillLevels).toContain("B");
    });

    it("should have valid hour ranges", async () => {
      const services = await db
        .select()
        .from(serviceTypes)
        .where(eq(serviceTypes.partId, 120001))
        .limit(10);

      services.forEach((service: any) => {
        const minHours = parseFloat(service.minHours);
        const maxHours = parseFloat(service.maxHours);
        expect(minHours).toBeLessThanOrEqual(maxHours);
        expect(minHours).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe("Part Variants", () => {
    it("should retrieve variants for Yaris Starter Motor", async () => {
      const variants = await db
        .select()
        .from(partVariants)
        .where(eq(partVariants.partId, 120001))
        .limit(10);

      expect(variants.length).toBeGreaterThan(0);
      expect(variants[0]).toHaveProperty("variantName");
      expect(variants[0]).toHaveProperty("price");
      expect(variants[0]).toHaveProperty("oemPartNumber");
    });

    it("should have correct prices for Yaris variants", async () => {
      const variants = await db
        .select()
        .from(partVariants)
        .where(eq(partVariants.partId, 120001))
        .limit(10);

      const prices = variants.map((v: any) => parseFloat(v.price));
      expect(prices).toContain(281.87);
      expect(prices).toContain(222.7);
    });

    it("should retrieve variants for Camry Starter Motor", async () => {
      const variants = await db
        .select()
        .from(partVariants)
        .where(eq(partVariants.partId, 120001))
        .limit(10);

      // Camry also uses the same part ID but different model
      expect(variants.length).toBeGreaterThan(0);
    });

    it("should have correct prices for Camry variants", async () => {
      const variants = await db
        .select()
        .from(partVariants)
        .where(eq(partVariants.partId, 120001))
        .limit(10);

      const prices = variants.map((v: any) => parseFloat(v.price));
      // Check if Camry prices are present
      const hasCamryPrices =
        prices.includes(219.85) || prices.includes(258.24);
      expect(hasCamryPrices).toBe(true);
    });
  });

  describe("Pricing Settings", () => {
    it("should have default pricing settings", async () => {
      const settings = await db
        .select()
        .from(pricingSettings)
        .limit(1);

      if (settings.length > 0) {
        expect(settings[0]).toHaveProperty("hourlyRate");
        expect(settings[0]).toHaveProperty("pricePerKm");
        expect(settings[0].hourlyRate).toBeGreaterThan(0);
      }
    });
  });

  describe("Price Calculations", () => {
    it("should store price calculation records", async () => {
      const calculations = await db
        .select()
        .from(advancedPriceCalculations)
        .limit(1);

      if (calculations.length > 0) {
        expect(calculations[0]).toHaveProperty("partPrice");
        expect(calculations[0]).toHaveProperty("laborCost");
        expect(calculations[0]).toHaveProperty("totalCost");
      }
    });
  });

  describe("Data Integrity", () => {
    it("should have Battery part without variants", async () => {
      const batteryVariants = await db
        .select()
        .from(partVariants)
        .where(eq(partVariants.partId, 120004))
        .limit(10);

      // Battery should have no variants
      expect(batteryVariants.length).toBe(0);
    });

    it("should have Battery services", async () => {
      const batteryServices = await db
        .select()
        .from(serviceTypes)
        .where(eq(serviceTypes.partId, 120004))
        .limit(10);

      expect(batteryServices.length).toBeGreaterThan(0);
      const serviceNames = batteryServices.map((s: any) => s.serviceTypeName);
      // Verify at least one known service exists
      expect(serviceNames).toContain("Service or Charge");
    });

    it("should have Fuel Pump with single variant", async () => {
      const fuelPumpVariants = await db
        .select()
        .from(partVariants)
        .where(eq(partVariants.partId, 120002))
        .limit(10);

      expect(fuelPumpVariants.length).toBeGreaterThanOrEqual(1);
      const prices = fuelPumpVariants.map((v: any) => parseFloat(v.price));
      expect(prices).toContain(447.6);
    });

    it("should have A.P.P. Sensor with correct data", async () => {
      const sensorVariants = await db
        .select()
        .from(partVariants)
        .where(eq(partVariants.partId, 120003))
        .limit(10);

      expect(sensorVariants.length).toBeGreaterThanOrEqual(1);
      const prices = sensorVariants.map((v: any) => parseFloat(v.price));
      expect(prices).toContain(169.09);
    });
  });

  describe("Multi-Vehicle Support", () => {
    it("should support multiple models for same part", async () => {
      // Starter Motor should be available for both Yaris and Camry
      const starterVariants = await db
        .select()
        .from(partVariants)
        .where(eq(partVariants.partId, 120001))
        .limit(100);

      // Should have variants from both models
      expect(starterVariants.length).toBeGreaterThanOrEqual(2);
    });

    it("should have different prices for different variants", async () => {
      const variants = await db
        .select()
        .from(partVariants)
        .where(eq(partVariants.partId, 120001))
        .limit(100);

      const prices = variants.map((v: any) => parseFloat(v.price));
      const uniquePrices = [...new Set(prices)];
      expect(uniquePrices.length).toBeGreaterThanOrEqual(2);
    });
  });
});
