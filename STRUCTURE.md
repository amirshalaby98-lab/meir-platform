# Project Architecture

This document describes the actual, current structure of the project — not an aspirational target. It follows a **Modular Monolith** on the backend. The frontend does not use Feature-Sliced Design; pages and components are organized as a flat, conventional React app.

## Directory Structure

```
/
├── server/                    # Backend
│   ├── _core/                 # Core infrastructure (Express, tRPC, auth, env)
│   │   ├── index.ts           # Server entry point
│   │   ├── trpc.ts            # tRPC router & procedures
│   │   ├── context.ts         # Request context
│   │   ├── sdk.ts             # Auth SDK
│   │   ├── env.ts             # Environment variables
│   │   ├── logger.ts          # Structured logging
│   │   ├── audit.ts           # Audit logging
│   │   ├── notification.ts    # Push notifications
│   │   └── vite.ts            # Vite dev middleware
│   ├── modules/               # Business domain modules (repository.ts + router.ts + index.ts)
│   │   ├── booking/
│   │   ├── technicians/
│   │   ├── reviews/
│   │   ├── users/
│   │   ├── contacts/
│   │   ├── pricing/           # Car brands, models, parts (carData router)
│   │   ├── analytics/
│   │   ├── gamification/
│   │   ├── admin/
│   │   ├── loyalty/
│   │   ├── stats/
│   │   ├── tracking/
│   │   ├── diagnostics/, consultations/, workshops/, parts-market/, fleet/,
│   │   │   service-orders/, vehicles/, obd-reports/
│   │   └── (migration in progress — see below)
│   ├── shared/                 # Shared server infra
│   │   └── database.ts         # Database connection singleton
│   ├── routes/                 # REST API routes (badges, saved-filters, technician)
│   ├── routers.ts              # tRPC root router (mounts all module + standalone routers)
│   ├── db.ts                   # Facade re-exporting module repository functions
│   ├── pricing.ts, chat.ts, vendors.ts, analytics.ts, adminDashboard.ts,
│   │   reports.ts, advancedPricing.ts, loyalty.ts, sms.ts, courses.ts,
│   │   lessons.ts, promotions.ts, notifications.ts, websocket.ts, storage.ts
│   │                            # Standalone routers not yet migrated into server/modules/
│   │                            # (tracked as ongoing work — see MEIR_TECHNICAL_REVIEW.md)
│   └── ...
├── client/                     # Frontend (plain React + Vite, no FSD layer)
│   └── src/
│       ├── pages/               # Route-level page components (real structure)
│       │   └── Admin/           # Admin sub-pages (capital A — see note below)
│       ├── components/          # Reusable UI components
│       │   └── ui/              # shadcn/ui primitives
│       ├── hooks/                # Custom hooks
│       ├── lib/                  # Utilities (trpc client, cn, OBD/DTC libraries)
│       ├── services/             # Service layer
│       ├── contexts/             # React contexts
│       ├── _core/                # Auth hook
│       └── App.tsx               # App shell with routing (wouter) and lazy page loading
├── shared/                     # Shared between client & server
│   ├── types.ts                # Re-exports Drizzle schema types + error classes
│   └── const.ts                # Shared constants
├── drizzle/                    # Database schema & migrations
│   ├── schema.ts                # Table definitions
│   └── relations.ts             # Table relations
└── ...
```

## Path Aliases

| Alias | Resolves To | Usage |
|-------|-------------|-------|
| `@/*` | `./client/src/*` | Frontend imports |
| `@shared/*` | `./shared/*` | Types/constants shared between client and server |
| `@modules/*` | `./server/modules/*` | Backend domain modules |

## Architecture Principles

### Backend (Modular Monolith)

Each module in `server/modules/` encapsulates a business domain with:
- **repository.ts** — Data access layer (Drizzle queries)
- **router.ts** — tRPC procedures
- **index.ts** — Public API (barrel export)

`server/db.ts` is a facade re-exporting repository functions from already-migrated modules, kept for backward compatibility with older call sites. A number of large routers (`pricing.ts`, `chat.ts`, `vendors.ts`, etc.) still live flat at `server/` and have not yet been moved into `server/modules/`; `server/routers.ts` mounts both migrated modules and these standalone routers under the same `appRouter`, so no client-facing tRPC endpoint path differs based on which side of the migration a router is on.

### Frontend (conventional React app)

There is no Feature-Sliced Design layer in this codebase. All real page and component code lives directly under `client/src/pages/` and `client/src/components/`, and `App.tsx` wires routes straight to `pages/...` via `React.lazy()`. An earlier attempt at an FSD layer (`features/`, `entities/`, `client/src/shared/`) was scaffolded but never wired into the app (zero real imports) and has been removed — do not reintroduce it without actually migrating real logic into it.

**Note:** `client/src/pages/Admin.tsx` (a small redirect stub to `/admin/dashboard`) and `client/src/pages/Admin/` (a directory of ~20 real admin sub-pages) intentionally coexist — different roles, not a duplicate. Import paths into `pages/Admin/` must match its capitalization exactly; the filesystem is case-sensitive.

## Key Design Decisions

- **No breaking changes**: tRPC endpoint paths are stable regardless of a router's physical location.
- **Facade during migration**: `server/db.ts` lets old and new module code coexist without forcing a big-bang rewrite.
- **Type safety**: Path aliases configured consistently in both `tsconfig.json` and `vite.config.ts`.
