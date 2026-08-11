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
│   ├── modules/                # Every business domain (repository.ts + router.ts + index.ts)
│   │   ├── booking/, technicians/, reviews/, users/, contacts/, gamification/,
│   │   │   loyalty/, stats/, tracking/, sms/, courses/ (+ lessons.router.ts),
│   │   │   vendors/, chat/ (+ websocket.ts infra), promotions/, notifications/,
│   │   │   analytics/, reports/
│   │   ├── admin/               # router.ts (admin CRUD) + dashboard.router.ts (platform stats)
│   │   ├── pricing/             # router.ts (carData), calculator.router.ts (pricing.ts),
│   │   │                        # advanced.router.ts (advancedPricing.ts) - one module, 3 routers
│   │   └── diagnostics/, consultations/, workshops/, parts-market/, fleet/,
│   │       service-orders/, vehicles/, obd-reports/
│   ├── shared/                  # Cross-cutting server infra (not a business domain)
│   │   ├── database.ts          # Database connection singleton
│   │   └── storage.ts           # S3-style blob storage proxy
│   ├── routes/                  # REST API routes (badges, saved-filters, technician)
│   ├── routers.ts               # tRPC root router - mounts every module router
│   └── db.ts                    # Facade re-exporting repository functions (see below)
├── client/                     # Frontend (plain React + Vite, no FSD layer)
│   └── src/
│       ├── pages/                # Route-level page components (real structure)
│       │   └── Admin/            # Admin sub-pages (capital A — see note below)
│       ├── components/           # Reusable UI components
│       │   └── ui/               # shadcn/ui primitives
│       ├── hooks/                 # Custom hooks
│       ├── lib/                   # Utilities (trpc client, cn, OBD/DTC libraries)
│       ├── services/              # Service layer
│       ├── contexts/              # React contexts
│       ├── _core/                 # Auth hook
│       └── App.tsx                # App shell with routing (wouter) and lazy page loading
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

Every business-domain router now lives under `server/modules/<domain>/`, following:
- **repository.ts** — Data access layer (Drizzle queries)
- **router.ts** — tRPC procedures (some modules have a second router file where a related-but-distinct concern shares the same domain, e.g. `modules/pricing/calculator.router.ts` and `modules/admin/dashboard.router.ts` — see the directory tree above)
- **index.ts** — Public API (barrel export)

`server/db.ts` is a thin facade re-exporting repository functions for the handful of call sites that still go through it (mainly other module routers reaching into a sibling module, e.g. `modules/admin` calling `getAllBookings` from `modules/booking`). New code should import directly from the target module's barrel (`./modules/<domain>`) rather than adding new facade dependencies.

There are no more flat/standalone router files at the top of `server/` — every tRPC router is a module. `server/routers.ts` only wires module routers into `appRouter`; there is no "backward-compatible flat endpoints" section anymore (removed once every client call site was confirmed migrated to its modular equivalent, e.g. `carData.getCarBrands` instead of a top-level `getCarBrands`).

### Frontend (conventional React app)

There is no Feature-Sliced Design layer in this codebase. All real page and component code lives directly under `client/src/pages/` and `client/src/components/`, and `App.tsx` wires routes straight to `pages/...` via `React.lazy()`. An earlier attempt at an FSD layer (`features/`, `entities/`, `client/src/shared/`) was scaffolded but never wired into the app (zero real imports) and has been removed — do not reintroduce it without actually migrating real logic into it.

**Note:** `client/src/pages/Admin.tsx` (a small redirect stub to `/admin/dashboard`) and `client/src/pages/Admin/` (a directory of ~20 real admin sub-pages) intentionally coexist — different roles, not a duplicate. Import paths into `pages/Admin/` must match its capitalization exactly; the filesystem is case-sensitive.

## Key Design Decisions

- **No breaking changes during the migration**: tRPC endpoint paths (the keys under `appRouter`, e.g. `pricing`, `carData`, `admin`) stayed stable throughout — only the physical file location and internal import paths changed.
- **One implementation per concern**: where the same data access existed in two places (e.g. user role updates duplicated between the flat endpoint, `modules/users`, and a raw-Drizzle reimplementation inside `modules/admin`), the duplicate was removed in favor of a single shared repository function.
- **Type safety**: Path aliases configured consistently in both `tsconfig.json` and `vite.config.ts`.
