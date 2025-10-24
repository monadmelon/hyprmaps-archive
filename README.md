# HyprMaps

Welcome to the HyprMaps. This project contains the frontend, backend, and shared packages for the HyprMaps application.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, TanStack Query, PWA
- **Backend:** Node.js, Fastify, Prisma, Neon PostgreSQL, Lucia Auth
- **Maps:** MapLibre, OpenStreetMap, OpenRouteService, PostGIS
- **Deployment:** Cloudflare Pages, Render, Upstash Redis

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20.x or later)
- [pnpm](https://pnpm.io/installation) (v8.x or later)


    ```

**Components & Data Flow:**

1.  **User/Client (Browser):**

    - The user interacts with the **Frontend**, a React-based Single Page Application (PWA).
    - The frontend is built with Vite and styled with Tailwind CSS.
    - It handles all UI rendering, state management, and user input.
    - For data fetching and caching from the backend, it uses **TanStack Query**.

2.  **Frontend -> Backend Communication:**

    - All communication happens via a RESTful or GraphQL API exposed by the backend.
    - Requests are sent to the **Backend API** (e.g., `api.hyprmaps.com`).
    - Authentication is handled via tokens (managed by **Lucia Auth**).

3.  **Backend (Node.js Server):**

    - Built with **Fastify** (or Express) for high performance.
    - It serves as the core business logic layer.
    - **Prisma ORM** is used to interact with the database, providing a type-safe data access layer.
    - **Lucia Auth** manages user sessions, authentication, and authorization.

4.  **Data & Services:**

    - **Neon PostgreSQL:** Our primary database. It stores all application data like users, map points, and reviews. The **PostGIS** extension will be enabled for geospatial queries.
    - **Upstash Redis:** Used for caching, session storage, and potentially as a message broker for background jobs.
    - **OpenStreetMap (OSM):** Provides the base map tiles and raw geospatial data.
    - **OpenRouteService:** An external API used for routing, directions, and isochrone calculations based on OSM data.

5.  **Deployment & Infrastructure:**
    - **Frontend:** Deployed as a static site on **Cloudflare Pages** for global distribution and performance.
    - **Backend:** Deployed as a containerized application on **Render** or **Railway**.
    - **CI/CD:** A GitHub Actions pipeline will be triggered on every push to `main` to run linting, tests, and builds, followed by deployment.
