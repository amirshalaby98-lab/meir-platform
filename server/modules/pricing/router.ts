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
    .input(z.object({ name: z.string(), nameAr: z.string() }))
    .mutation(async ({ input }) => {
      return await createCarBrand(input);
    }),

  updateCarBrand: adminProcedure
    .input(z.object({ id: z.number(), name: z.string().optional(), nameAr: z.string().optional() }))
    .mutation(async ({ input }) => {
      return await updateCarBrand(input.id, { name: input.name, nameAr: input.nameAr });
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
    .input(z.object({ brandId: z.number(), name: z.string(), nameAr: z.string(), year: z.number().optional() }))
    .mutation(async ({ input }) => {
      return await createCarModel(input);
    }),

  updateCarModel: adminProcedure
    .input(z.object({ id: z.number(), name: z.string().optional(), nameAr: z.string().optional(), yearFrom: z.number().optional(), yearTo: z.number().optional() }))
    .mutation(async ({ input }) => {
      return await updateCarModel(input.id, { name: input.name, nameAr: input.nameAr, yearFrom: input.yearFrom, yearTo: input.yearTo });
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
    .input(z.object({ name: z.string(), nameAr: z.string(), category: z.string().optional() }))
    .mutation(async ({ input }) => {
      return await createServicePart(input);
    }),

  updateServicePart: adminProcedure
    .input(z.object({ id: z.number(), name: z.string().optional(), nameAr: z.string().optional(), description: z.string().optional() }))
    .mutation(async ({ input }) => {
      return await updateServicePart(input.id, { name: input.name, nameAr: input.nameAr, description: input.description });
    }),

  deleteServicePart: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await deleteServicePart(input.id);
    }),
});
