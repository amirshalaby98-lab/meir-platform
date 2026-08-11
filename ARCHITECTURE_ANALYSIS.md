# Architecture Analysis Report

## Current State

### File Count: 239 TypeScript/TSX files
### TypeScript Errors: 56 errors across 17 files

## Critical Issues Found

### 1. server/analytics.ts (9 errors)
- `db` possibly null (4 instances) - missing null checks
- `.where()` chaining error on revenueTracking query (2 instances) - incorrect drizzle query builder usage
- `reviews.technicianId` doesn't exist - field is `reviews.vendorId`
- `parseFloat` receiving `{}` instead of string (2 instances)

### 2. client/src/pages/Admin.tsx (7 errors)
- `review.comment` doesn't exist - should be `review.content`
- `review.location` doesn't exist
- Boolean/number comparison issue

### 3. client/src/pages/Chat.tsx (6 errors)
- `PriceOffer.laborHours` doesn't exist
- Array type mismatch
- Type conversion issues

### 4. client/src/pages/TechnicianDashboard.tsx (4 errors)
- `getDashboardStats` doesn't exist on router
- Type conversion issues
- Missing `Trophy` import

### 5. client/src/components/TestimonialsSection.tsx (4 errors)
- Type issues with testimonials data

### 6. client/src/pages/PriceCalculator.tsx (3 errors)
- Unknown type issues with result

### 7. drizzle/schema.ts (2 errors)
- Number passed where string|SQL expected (default values)

### 8. Database Runtime Error
- `Unknown column 'ratingid' in 'field list'` - schema has `ratingId` but DB column name mapping issue

## Architecture Overview

### Backend (server/)
- `_core/` - Framework core (Express, tRPC, OAuth, etc.)
- `routes/` - Express routes (badges, saved-filters, technician)
- `routers.ts` - tRPC router definitions
- `db.ts` - Database functions (very large file)
- `analytics.ts` - Analytics tRPC router
- `chat.ts`, `courses.ts`, `loyalty.ts`, etc. - Feature modules

### Frontend (client/src/)
- `pages/` - Page components
- `components/` - Reusable components (60+ files)
- `hooks/` - Custom hooks
- `contexts/` - React contexts
- `_core/` - Auth hooks

### Database (drizzle/)
- `schema.ts` - All table definitions
- Multiple tables: bookings, reviews, vendors, etc.
