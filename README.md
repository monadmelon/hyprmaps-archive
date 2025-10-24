# HyprMaps

Welcome to the HyprMaps project. This monorepo contains the entire application, including the frontend, backend, and shared packages.

## Project Summary

HyprMaps is a full-stack web application designed around interactive, open-source mapping. The core features involve user authentication, interactive map rendering, geospatial data querying, and routing.

## Tech Stack (Current & Final)

- **Monorepo:** pnpm workspaces
- **Frontend:** **React, Vite, styled-components**, TanStack Query, PWA
- **Backend:** **Node.js, Fastify, Prisma (v5), Neon PostgreSQL, Lucia Auth (v3)**
- **Maps:** **MapLibre** (using **MapTiler** base maps), OpenStreetMap, OpenRouteService, PostGIS
- **Deployment:** Cloudflare Pages, Render, Upstash Redis

---

## Setup & Progress Log

### 1. Project & Monorepo Foundation

The project was established as a **pnpm workspace monorepo**. This involved setting up the root `package.json`, `pnpm-workspace.yaml`, and `tsconfig.json`.

* **Application Scaffolding:**
    * **Frontend:** Created a **React + TypeScript** application in `apps/frontend` using Vite.
    * **Backend:** Created a **Node.js + Fastify** application in `apps/backend`.

### 2. Styling Solution Pivot (Frontend)

An initial plan to use Tailwind CSS was abandoned due to persistent CLI, PostCSS, and Vite configuration errors.

* **Decision:** All traces of Tailwind CSS were removed.
* **Success:** **`styled-components`** was successfully installed, configured, and tested as the primary styling solution for the frontend application.

### 3. Backend Core: Database & Authentication

The core backend services were built and integrated, requiring significant version conflict resolution.

* **Database:** A **Neon PostgreSQL** database was created and connected via the `DATABASE_URL` in the `.env` file.
* **Prisma Setup:** **Prisma** was installed and configured. A critical pathing error in the monorepo setup was resolved by installing `dotenv-cli` and creating a custom `db:migrate:dev` script.
* **Lucia Auth Integration (Version Downgrade):** A major conflict was discovered where the latest stable Lucia adapter was incompatible with **Prisma v6**. This was resolved by successfully **downgrading Prisma to v5**. This allowed for the stable installation of **`lucia@^3`** and its corresponding Prisma adapter.
* **Final Status:** All authentication services are fully configured and functional.

### 4. Frontend Features & Map Integration

The remaining core features for the frontend application were installed and configured.

* **Core Libraries:** **TanStack Query** was configured for data fetching, and **Vite PWA** was configured in `vite.config.ts` to enable application installation.
* **Map Integration:**
    * **MapTiler:** An API key was obtained from MapTiler for map tile services.
    * **MapLibre:** `maplibre-gl` and `openrouteservice-js` were installed.
    * The placeholder component was replaced with a new component that successfully renders a full-screen, interactive world map using the MapTiler key.

### **Current Status: Setup Complete**

The monorepo foundation is stable. Every single core technology required for the application's architecture is now installed, configured, and proven to be working. Development on application features can now begin.