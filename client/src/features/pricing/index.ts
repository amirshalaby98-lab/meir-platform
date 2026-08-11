/**
 * Pricing Feature Module
 * 
 * Provides lazy-loadable page factories for the pricing feature.
 */

export const pricingPages = {
  PriceCalculator: () => import("@/pages/PriceCalculator"),
  Payment: () => import("@/pages/Payment"),
};
