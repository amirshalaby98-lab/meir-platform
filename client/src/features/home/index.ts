/**
 * Home Feature Module
 * 
 * Provides lazy-loadable page factories for the home/public feature.
 */

export const homePages = {
  Home: () => import("@/pages/Home"),
  HowItWorks: () => import("@/pages/HowItWorks"),
  NotFound: () => import("@/pages/NotFound"),
  TermsOfService: () => import("@/pages/TermsOfService"),
};
