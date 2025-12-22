## Project Summary

HyprMaps is a full-stack web application designed around interactive, open-source mapping. The core features involve user authentication, interactive map rendering, geospatial data querying, and routing. The MVP focuses on verified "Stays" data to drive user actions (Call, WhatsApp, Navigate).

## Tech Stack (Current & Final)

- **Monorepo:** pnpm workspaces
- **Frontend:** **React, Vite, styled-components, React Router, TanStack Query, Vite PWA**
- **Backend:** **Node.js, Fastify, Prisma (v5), Neon PostgreSQL, Lucia Auth (v3), oslo (for hashing)**
- **Maps:** **MapLibre** (using MapTiler base maps), OpenStreetMap, OpenRouteService, PostGIS
- **Deployment:** Cloudflare Pages, Render, Upstash Redis

---

## Setup & Progress Log

### 1. Monorepo Foundation & Frontend Styling

* **Foundation:** Created a pnpm workspace monorepo with `apps/frontend` (React + Vite) and `apps/backend` (Node.js + Fastify) projects.
* **Styling Pivot:** Abandoned Tailwind CSS due to conflicts and successfully implemented **styled-components** as the primary styling solution.

### 2. Backend, Database & Core Auth

* **Database:** Connected Fastify to a **Neon PostgreSQL** instance via an `.env` file.
* **Prisma Downgrade:** Resolved a major version conflict by downgrading **Prisma from v6 to v5**, enabling compatibility with the stable **Lucia Auth v3** and its adapter.
* **Database Schema:** Applied a large migration to create a comprehensive `Stay` model, including all **Location Tags**, **Amenities**, **Quality Fields**, and **Google Review** data.
* **Login & Security:**
    * Seeded a default admin user (`admin`/`password`) using `oslo/password`.
    * Implemented **POST /auth/login** endpoint to handle authentication and issue secure session cookies via Lucia.
    * Created and applied an **authentication middleware hook** (`authHook.ts`) to protect admin routes.

### 3. Frontend UI and API Integration

* **API Connection:** Successfully fetched mock data from the backend's **GET /stays** endpoint using **TanStack Query**, resolving cross-origin security issues via the `@fastify/cors` plugin.
* **Map Interaction:** Implemented **MapLibre** to render interactive markers on a map, which update dynamically based on data from the backend.
* **Main UI:** Built the main screen UI, including:
    * **Zomato-Style Filters:** A working horizontal filter bar for **Location Tags**.
    * **Google Maps-Style Card:** A slide-up component shown on marker click, displaying basic stay info and action buttons.
    * **Action Buttons:** Implemented **Call**, **WhatsApp**, and **Navigate** buttons with working `tel:`, `whatsapp://`, and `maps.google.com` links.
* **Detail View:** Implemented **React Router** for navigation and created the **Stay Detail Page** (`/stay/:id`), which:
    * Fetches full data via the **GET /stays/:id** endpoint.
    * Displays **Pricing** and a complete **Amenities Checklist**.

### **Current Status: Core Application Built and Protected**

The project is fully operational. Both the public-facing API and the protected admin API endpoints are ready. The main user flow (Map -> Filter -> Card -> Detail Page) is complete and functional.

**Auth UI:** Built the frontend form for **POST /auth/login** to securely get a session cookie and redirect to the admin page.
