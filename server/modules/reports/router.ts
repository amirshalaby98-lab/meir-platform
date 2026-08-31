import { z } from "zod";
import { publicProcedure, router } from "../../_core/trpc";
import { getPriceCalculationsByDateRange } from "../pricing";

export const reportsRouter = router({
  // الحصول على بيانات الإيرادات
  getRevenue: publicProcedure
    .input(z.object({
      period: z.enum(['today', 'week', 'month', 'year']),
    }))
    .query(async ({ input }) => {
      const { period } = input;
      
      // حساب تاريخ البداية حسب الفترة
      const now = new Date();
      let startDate = new Date();
      
      switch (period) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // جلب بيانات الأسعار من قاعدة البيانات
      const calculations = await getPriceCalculationsByDateRange(startDate, now);
      
      // تجميع البيانات حسب التاريخ
      const revenueByDate: { [key: string]: number } = {};
      
      calculations.forEach((calc) => {
        const date = new Date(calc.createdAt);
        let dateKey = '';
        
        if (period === 'today') {
          dateKey = `${date.getHours()}:00`;
        } else if (period === 'week') {
          const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
          dateKey = days[date.getDay()];
        } else if (period === 'month') {
          dateKey = `${date.getDate()}/${date.getMonth() + 1}`;
        } else {
          const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                         'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
          dateKey = months[date.getMonth()];
        }
        
        if (!revenueByDate[dateKey]) {
          revenueByDate[dateKey] = 0;
        }
        revenueByDate[dateKey] += calc.totalCost;
      });

      return {
        labels: Object.keys(revenueByDate),
        values: Object.values(revenueByDate),
      };
    }),

  // الحصول على القطع الأكثر طلباً
  getTopParts: publicProcedure
    .input(z.object({
      period: z.enum(['today', 'week', 'month', 'year']),
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      const { period, limit } = input;
      
      // حساب تاريخ البداية
      const now = new Date();
      let startDate = new Date();
      
      switch (period) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const calculations = await getPriceCalculationsByDateRange(startDate, now);
      
      // تجميع القطع
      const partCount: { [key: string]: number } = {};
      
      calculations.forEach((calc) => {
        const partName = calc.partName;
        if (!partCount[partName]) {
          partCount[partName] = 0;
        }
        partCount[partName]++;
      });

      // ترتيب وتحديد العدد
      const sorted = Object.entries(partCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([partName, count]) => ({ partName, count }));

      return sorted;
    }),

  // الحصول على الماركات الأكثر طلباً
  getTopBrands: publicProcedure
    .input(z.object({
      period: z.enum(['today', 'week', 'month', 'year']),
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      const { period, limit } = input;
      
      // حساب تاريخ البداية
      const now = new Date();
      let startDate = new Date();
      
      switch (period) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const calculations = await getPriceCalculationsByDateRange(startDate, now);
      
      // تجميع الماركات
      const brandCount: { [key: string]: number } = {};
      
      calculations.forEach((calc) => {
        const brandName = calc.brandName;
        if (!brandCount[brandName]) {
          brandCount[brandName] = 0;
        }
        brandCount[brandName]++;
      });

      // ترتيب وتحديد العدد
      const sorted = Object.entries(brandCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([brandName, count]) => ({ brandName, count }));

      return sorted;
    }),

  // الحصول على الإحصائيات العامة
  getStats: publicProcedure
    .input(z.object({
      period: z.enum(['today', 'week', 'month', 'year']),
    }))
    .query(async ({ input }) => {
      const { period } = input;
      
      // حساب تاريخ البداية
      const now = new Date();
      let startDate = new Date();
      let previousStartDate = new Date();
      
      switch (period) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          previousStartDate.setDate(now.getDate() - 1);
          previousStartDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          previousStartDate.setDate(now.getDate() - 14);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          previousStartDate.setMonth(now.getMonth() - 2);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          previousStartDate.setFullYear(now.getFullYear() - 2);
          break;
      }

      // جلب البيانات للفترة الحالية
      const currentCalculations = await getPriceCalculationsByDateRange(startDate, now);

      // جلب البيانات للفترة السابقة
      const previousCalculations = await getPriceCalculationsByDateRange(previousStartDate, startDate);

      // حساب الإحصائيات
      const totalRevenue = currentCalculations.reduce((sum: number, calc: any) => sum + calc.totalCost, 0);
      const previousRevenue = previousCalculations.reduce((sum: number, calc: any) => sum + calc.totalCost, 0);
      const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

      return {
        totalRevenue,
        revenueGrowth,
      };
    }),
});
