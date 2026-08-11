import { z } from "zod";
import { publicProcedure, adminProcedure, router } from "../../_core/trpc";
import {
  getAllCarBrands,
  getCarBrandById,
  createCarBrand,
  updateCarBrand,
  deleteCarBrand,
  getAllCarModels,
  getCarModelsByBrand,
  getCarModelById,
  createCarModel,
  updateCarModel,
  deleteCarModel,
  getAllServiceParts,
  getServicePartById,
  createServicePart,
  updateServicePart,
  deleteServicePart,
} from "../../db";

export const carDataRouter = router({
  // Car Brands
  getCarBrands: publicProcedure.query(async () => {
    return await getAllCarBrands();
  }),

  getCarBrandById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getCarBrandById(input.id);
    }),

  createCarBrand: adminProcedure
    .input(z.object({ name: z.string().min(1).max(100).trim(), nameAr: z.string().min(1).max(100).trim(), logo: z.string().max(500).optional() }))
    .mutation(async ({ input }) => {
      return await createCarBrand(input);
    }),

  updateCarBrand: adminProcedure
    .input(z.object({ id: z.number().int().positive(), name: z.string().min(1).max(100).trim().optional(), nameAr: z.string().min(1).max(100).trim().optional(), logo: z.string().max(500).optional(), isActive: z.boolean().optional() }))
    .mutation(async ({ input }) => {
      return await updateCarBrand(input.id, { name: input.name, nameAr: input.nameAr, logo: input.logo, isActive: input.isActive });
    }),

  deleteCarBrand: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await deleteCarBrand(input.id);
    }),

  // Car Models
  getCarModels: publicProcedure.query(async () => {
    return await getAllCarModels();
  }),

  getCarModelsByBrand: publicProcedure
    .input(z.object({ brandId: z.number() }))
    .query(async ({ input }) => {
      return await getCarModelsByBrand(input.brandId);
    }),

  getCarModelById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getCarModelById(input.id);
    }),

  createCarModel: adminProcedure
    .input(z.object({ brandId: z.number().int().positive(), name: z.string().min(1).max(100).trim(), nameAr: z.string().min(1).max(100).trim(), image: z.string().max(500).optional(), yearFrom: z.number().int().min(1900).max(2100).optional(), yearTo: z.number().int().min(1900).max(2100).optional() }))
    .mutation(async ({ input }) => {
      return await createCarModel(input);
    }),

  updateCarModel: adminProcedure
    .input(z.object({ id: z.number().int().positive(), name: z.string().min(1).max(100).trim().optional(), nameAr: z.string().min(1).max(100).trim().optional(), image: z.string().max(500).optional(), yearFrom: z.number().int().min(1900).max(2100).optional(), yearTo: z.number().int().min(1900).max(2100).optional(), isActive: z.boolean().optional() }))
    .mutation(async ({ input }) => {
      return await updateCarModel(input.id, { name: input.name, nameAr: input.nameAr, image: input.image, yearFrom: input.yearFrom, yearTo: input.yearTo, isActive: input.isActive });
    }),

  deleteCarModel: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await deleteCarModel(input.id);
    }),

  // Service Parts
  getServiceParts: publicProcedure.query(async () => {
    return await getAllServiceParts();
  }),

  getServicePartById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getServicePartById(input.id);
    }),

  createServicePart: adminProcedure
    .input(z.object({ name: z.string().min(1).max(200).trim(), nameAr: z.string().min(1).max(200).trim(), category: z.string().max(100).trim().optional() }))
    .mutation(async ({ input }) => {
      return await createServicePart(input);
    }),

  updateServicePart: adminProcedure
    .input(z.object({ id: z.number().int().positive(), name: z.string().min(1).max(200).trim().optional(), nameAr: z.string().min(1).max(200).trim().optional(), description: z.string().max(1000).trim().optional() }))
    .mutation(async ({ input }) => {
      return await updateServicePart(input.id, { name: input.name, nameAr: input.nameAr, description: input.description });
    }),

  deleteServicePart: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      return await deleteServicePart(input.id);
    }),
});
