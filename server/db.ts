/**
 * Database Facade - Re-exports from modular repositories
 * 
 * This file maintains backward compatibility with existing imports.
 * New code should import directly from server/modules/{module}
 */

// Shared database connection
export { getDb } from "./shared/database";

// Users Module
export { upsertUser, getUserByOpenId, getAllUsers, getUserById, updateUserRole, setUserType, toggleUserActive } from "./modules/users";

// Reviews Module
export { createReview, getAllReviews, getApprovedReviews, updateReviewApproval, submitReview, getReviewsByTechnician, getReviewsByDateRange, updateVendorRatingSummary, markReviewHelpful, markReviewUnhelpful, getTechniciansByRatingRange } from "./modules/reviews";

// Contacts Module
export { createContactMessage, getAllContactMessages } from "./modules/contacts";

// Pricing Module
export { getAllCarBrands, getCarBrandById, createCarBrand, updateCarBrand, deleteCarBrand, getAllCarModels, getCarModelsByBrand, getCarModelById, createCarModel, updateCarModel, deleteCarModel, getAllServiceParts, getServicePartById, createServicePart, updateServicePart, deleteServicePart, getPriceCalculationsByDateRange } from "./modules/pricing";

// Analytics Module
export { getFilteredTechnicianStats, getAnalyticsReport, saveTechnicianFilter, getSavedFilters, getSavedFilterById, updateSavedFilter, deleteSavedFilter, updateFilterUsageCount, setDefaultFilter, getDefaultFilter } from "./modules/analytics";
