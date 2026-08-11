import { publicProcedure, router } from "../../_core/trpc";
import { z } from "zod";
import { getDb } from "../../shared/database";
import {
  serviceTypes,
  partVariants,
  optionalLabor,
  advancedPriceCalculations,
  pricingSettings,
} from "../../../drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";

export const advancedPricingRouter = router({
  /**
   * Get service types for a specific part and model
   */
  getServiceTypes: publicProcedure
    .input(
      z.object({
        partId: z.number(),
        modelId: z.number(),
      })
    )
    .query(async ({ input }: { input: { partId: number; modelId: number } }) => {
      const database = await getDb();
      if (!database) throw new Error("Database connection failed");

      const services = await database
        .select()
        .from(serviceTypes)
        .where(
          and(
            eq(serviceTypes.partId, input.partId),
            eq(serviceTypes.modelId, input.modelId)
          )
        );

      return services;
    }),

  /**
   * Get part variants for a specific part and model
   */
  getPartVariants: publicProcedure
    .input(
      z.object({
        partId: z.number(),
        modelId: z.number(),
      })
    )
    .query(async ({ input }: { input: { partId: number; modelId: number } }) => {
      const database = await getDb();
      if (!database) throw new Error("Database connection failed");

      const variants = await database
        .select()
        .from(partVariants)
        .where(
          and(
            eq(partVariants.partId, input.partId),
            eq(partVariants.modelId, input.modelId),
            eq(partVariants.isActive, true)
          )
        );

      return variants;
    }),

  /**
   * Get optional labor for a specific service type
   */
  getOptionalLabor: publicProcedure
    .input(
      z.object({
        serviceTypeId: z.number(),
      })
    )
    .query(async ({ input }: { input: { serviceTypeId: number } }) => {
      const database = await getDb();
      if (!database) throw new Error("Database connection failed");

      const labor = await database
        .select()
        .from(optionalLabor)
        .where(eq(optionalLabor.serviceTypeId, input.serviceTypeId));

      return labor;
    }),

  /**
   * Calculate advanced price
   */
  calculateAdvancedPrice: publicProcedure
    .input(
      z.object({
        brandId: z.number(),
        modelId: z.number(),
        partId: z.number(),
        partVariantId: z.number().optional(),
        serviceTypeId: z.number(),
        selectedOptionalLaborIds: z.array(z.number()).optional(),
        distance: z.number().default(15),
        customerIp: z.string().optional(),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ input }: { input: any }) => {
      const database = await getDb();
      if (!database) throw new Error("Database connection failed");
      try {
        // Get pricing settings
        const settings = await database.select().from(pricingSettings).limit(1);
        const hourlyRate = settings[0]?.hourlyRate || 150; // Default 150 SAR
        const pricePerKm = settings[0]?.pricePerKm || 2;

        // Get service type details
        const service = await database
          .select()
          .from(serviceTypes)
          .where(eq(serviceTypes.id, input.serviceTypeId))
          .limit(1);

        if (!service || service.length === 0) {
          throw new Error("Service type not found");
        }

        const serviceData = service[0];

        // Get part variant price
        let partPrice = 0;
        if (input.partVariantId) {
          const variant = await database
            .select()
            .from(partVariants)
            .where(eq(partVariants.id, input.partVariantId))
            .limit(1);

          if (variant && variant.length > 0) {
            partPrice = parseFloat(variant[0].price.toString());
          }
        }

        // Calculate labor hours (use average of min and max)
        const laborHours =
          (parseFloat(serviceData.minHours.toString()) +
            parseFloat(serviceData.maxHours.toString())) /
          2;

        // Calculate optional labor hours
        let optionalLaborHours = 0;
        if (input.selectedOptionalLaborIds && input.selectedOptionalLaborIds.length > 0) {
          const optionalLabors = await database
            .select()
            .from(optionalLabor)
            .where(inArray(optionalLabor.id, input.selectedOptionalLaborIds));

          optionalLabors.forEach((labor) => {
            const hours =
              (parseFloat(labor.minHours.toString()) +
                parseFloat(labor.maxHours.toString())) /
              2;
            optionalLaborHours += hours;
          });
        }

        // Calculate total hours
        const totalLaborHours = laborHours + optionalLaborHours;

        // Calculate costs
        const laborCost = totalLaborHours * hourlyRate;
        const distanceCost = input.distance * pricePerKm;
        const subtotal = partPrice + laborCost + distanceCost;

        // Calculate tax (15% VAT)
        const taxAmount = subtotal * 0.15;
        const totalCost = subtotal + taxAmount;

        // Save calculation
        const result = await database.insert(advancedPriceCalculations).values({
          brandId: input.brandId,
          modelId: input.modelId,
          partId: input.partId,
          partVariantId: input.partVariantId || null,
          serviceTypeId: input.serviceTypeId,
          selectedOptionalLabor:
            input.selectedOptionalLaborIds?.join(",") || null,
          partPrice: partPrice.toString(),
          laborHours: totalLaborHours.toString(),
          hourlyRate: hourlyRate.toString(),
          laborCost: laborCost.toString(),
          distance: input.distance,
          pricePerKm: pricePerKm.toString(),
          distanceCost: distanceCost.toString(),
          subtotal: subtotal.toString(),
          taxAmount: taxAmount.toString(),
          discountAmount: "0",
          totalCost: totalCost.toString(),
          customerIp: input.customerIp || null,
          userAgent: input.userAgent || null,
        });

        return {
          success: true,
          calculation: {
            partPrice: partPrice.toFixed(2),
            laborHours: totalLaborHours.toFixed(2),
            hourlyRate: hourlyRate.toFixed(2),
            laborCost: laborCost.toFixed(2),
            distance: input.distance,
            pricePerKm: pricePerKm.toFixed(2),
            distanceCost: distanceCost.toFixed(2),
            subtotal: subtotal.toFixed(2),
            taxAmount: taxAmount.toFixed(2),
            totalCost: totalCost.toFixed(2),
          },
        };
      } catch (error: any) {
        throw new Error(`Failed to calculate price: ${error.message}`);
      }
    }),

  /**
   * Get calculation history
   */
  getCalculationHistory: publicProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }: { input: { limit: number; offset: number } }) => {
      const database = await getDb();
      if (!database) throw new Error("Database connection failed");

      const calculations = await database
        .select()
        .from(advancedPriceCalculations)
        .limit(input.limit);

      return calculations;
    }),

  /**
   * Update pricing settings
   */
  updatePricingSettings: publicProcedure
    .input(
      z.object({
        hourlyRate: z.number().optional(),
        pricePerKm: z.number().optional(),
      })
    )
    .mutation(async ({ input }: { input: { hourlyRate?: number; pricePerKm?: number } }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database connection failed");

        // Get current settings
        const settings = await database.select().from(pricingSettings).limit(1);

        if (settings.length === 0) {
          // Create new settings
          await database.insert(pricingSettings).values({
            hourlyRate: input.hourlyRate || 150,
            pricePerKm: input.pricePerKm || 2,
          });
        } else {
          // Update existing settings
          const updateData: any = {};
          if (input.hourlyRate !== undefined) {
            updateData.hourlyRate = input.hourlyRate;
          }
          if (input.pricePerKm !== undefined) {
            updateData.pricePerKm = input.pricePerKm;
          }

          if (Object.keys(updateData).length > 0) {
            await database
              .update(pricingSettings)
              .set(updateData)
              .where(eq(pricingSettings.id, settings[0].id));
          }
        }

        return { success: true };
      } catch (error: any) {
        throw new Error(`Failed to update pricing settings: ${error.message}`);
      }
    }),
});
