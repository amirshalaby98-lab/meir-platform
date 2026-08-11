# Project Architecture

This document describes the modular architecture of the project, following **Modular Architecture** for the backend and **Feature-Sliced Design (FSD)** for the frontend.

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
│   ├── modules/               # Business domain modules
│   │   ├── booking/           # Booking management
│   │   │   ├── repository.ts  # Data access layer
│   │   │   └── index.ts       # Public API
│   │   ├── technicians/       # Technician management
│   │   ├── reviews/           # Review system
│   │   ├── users/             # User management
│   │   ├── contacts/          # Contact messages
│   │   ├── pricing/           # Car brands, models, parts, pricing
│   │   ├── analytics/         # Filters, reports, statistics
│   │   ├── gamification/      # Badges, rewards, leaderboard
│   │   └── index.ts           # Barrel export
│   ├── shared/                # Shared utilities
│   │   ├── database.ts        # Database connection singleton
│   │   └── index.ts           # Barrel export
│   ├── routes/                # REST API routes
│   ├── routers.ts             # tRPC router definitions
│   ├── db.ts                  # Facade (re-exports from modules)
│   ├── notifications.ts       # Notification router
│   ├── analytics.ts           # Analytics router
│   ├── reports.ts             # Reports router
│   ├── adminDashboard.ts      # Admin dashboard router
│   └── ...
├── client/                    # Frontend
│   └── src/
│       ├── features/          # Feature modules (FSD)
│       │   ├── admin/         # Admin feature
│       │   │   └── index.ts   # Lazy page factories
│       │   ├── vendor/        # Vendor feature
│       │   ├── technician/    # Technician feature
│       │   ├── courses/       # Courses/learning feature
│       │   ├── chat/          # Chat feature
│       │   ├── pricing/       # Pricing feature
│       │   ├── booking/       # Booking feature
│       │   ├── home/          # Public pages feature
│       │   └── index.ts       # Barrel export
│       ├── shared/            # Shared layer
│       │   └── index.ts       # Re-exports hooks, utils, services
│       ├── pages/             # Page components (original location)
│       ├── components/        # UI components (original location)
│       ├── hooks/             # Custom hooks
│       ├── lib/               # Utilities (trpc, cn)
│       ├── services/          # Service layer
│       ├── contexts/          # React contexts
│       ├── _core/             # Core (useAuth)
│       └── App.tsx            # App shell with routing
├── shared/                    # Shared between client & server
│   ├── types.ts               # Shared type definitions
│   └── const.ts               # Shared constants
├── drizzle/                   # Database schema & migrations
│   ├── schema.ts              # Table definitions
│   └── relations.ts           # Table relations
└── ...
```

## Path Aliases

| Alias | Resolves To | Usage |
|-------|-------------|-------|
| `@/*` | `./client/src/*` | Frontend imports |
| `@shared/*` | `./shared/*` | Shared types/constants |
| `@features/*` | `./client/src/features/*` | Feature modules |
| `@modules/*` | `./server/modules/*` | Backend modules |

## Architecture Principles

### Backend (Modular Architecture)

Each module in `server/modules/` encapsulates a business domain with:
- **repository.ts** - Data access layer (database queries)
- **index.ts** - Public API (barrel export)

The `server/db.ts` file acts as a **facade** that re-exports from all modules, maintaining backward compatibility with existing code while new code can import directly from modules.

### Frontend (Feature-Sliced Design)

Each feature in `client/src/features/` provides:
- **Lazy page factories** - Dynamic imports for code splitting
- **Feature-specific components** (to be migrated incrementally)

The `client/src/shared/` layer provides re-exports of common hooks, utilities, and services.

## Migration Strategy

This architecture was implemented using an **incremental migration** approach:

1. New modular structure created alongside existing code
2. `server/db.ts` converted to a facade (re-exports from modules)
3. Frontend features provide lazy page factories pointing to original locations
4. Existing imports continue to work unchanged
5. New code should use `@features/` and `@modules/` aliases

## Key Design Decisions

- **No breaking changes**: All existing imports continue to work
- **Gradual migration**: Files can be moved to feature directories incrementally
- **Code splitting**: React.lazy() applied to all pages via App.tsx
- **Type safety**: Path aliases configured in both tsconfig.json and vite.config.ts
