# Architecture Migration Plan: Monorepo Split

To address the security concerns of hosting the Admin Portal and Public Storefront on the same server, we will migrate the current codebase into a **Turborepo Monorepo**. This will physically isolate the two systems while allowing them to share the database and UI components.

## Target Directory Structure
```text
event-ticket-booking/
├── apps/
│   ├── web/               # Public Storefront (Users) -> wyldcardstat.com
│   └── admin/             # Admin Dashboard -> admin.wyldcardstat.com
├── packages/
│   ├── database/          # Shared Mongoose Models & DB Connection
│   ├── ui/                # Shared Tailwind/Shadcn Components
│   ├── lib/               # Shared Utilities (Cloudinary, PDF, Email)
│   ├── typescript-config/ # Shared tsconfig
│   └── eslint-config/     # Shared linting rules
├── package.json           # Root workspace config
└── turbo.json             # Turborepo configuration
```

## Phase 1: Workspace Initialization
1. Initialize `npm workspaces` in the root `package.json`.
2. Install `turbo` (Turborepo) globally and as a dev dependency.
3. Create the `packages/` directory and configure shared tooling (`typescript-config`, `eslint-config`).

## Phase 2: Extracting Shared Packages
1. **Database Package (`packages/database`):** Move all Mongoose models (`src/models/*`) and the database connection logic (`src/lib/db.ts`) into a standalone internal NPM package.
2. **UI Package (`packages/ui`):** Move Tailwind configuration, `globals.css`, and all `shadcn/ui` components (`src/components/ui/*`) into a shared package.
3. **Library Package (`packages/lib`):** Move shared utilities like PayU integration, PDF generation, and Email services.

## Phase 3: Splitting the Applications
1. **Admin App (`apps/admin`):** 
   - Move `src/app/admin/*` and `src/app/venue-manager/*`.
   - Restrict NextAuth strictly to `SUPER_ADMIN` and `VENUE_MANAGER` roles.
   - Deploy as a standalone Vercel/Node instance on an admin subdomain.
2. **Web App (`apps/web`):**
   - Move public routing (`src/app/events/*`, `src/app/checkout/*`, `src/app/user/*`).
   - Remove all admin-related APIs and code.
   - Deploy as the primary public-facing application.

## Phase 4: CI/CD & Deployment Updates
1. Update deployment scripts to handle Monorepo builds.
2. Configure environment variables for two separate environments (Web vs Admin).

> [!WARNING]
> **Downtime Notice:** Development of new features (like Waitlists) will be paused while the files are restructured. 
> Ensure all pending work is committed before we begin executing Phase 1.
