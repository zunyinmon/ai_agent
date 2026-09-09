# Property Portal — Build Plan

## Top-Level Overview

Build a full-stack property portal supporting **Buy / Sell / Rent** listings across multiple
Myanmar locations (Yangon, Mandalay) and categories (Land, Apartment, House).

**Stack:**
- **Monorepo** — shared TypeScript types, API clients, and utilities
- **Backend** — Express.js + TypeScript REST API, SQLite (via `better-sqlite3`), local filesystem for images
- **Web** — React + TypeScript (Vite), web-first priority
- **Mobile** — React Native + Expo (built after web is stable)

**Roles:**
- `admin` — full CRUD over all data, user management
- `agent` — create/edit/delete their own listings
- `buyer_renter` — browse and search listings (read-only)

**Core Features:**
- Property listings with multiple images
- Filter by location, category, listing type, and price range (price stored and displayed in MMK)
- JWT-based authentication
- Role-based access control (RBAC)
- Contact / enquiry form on each property listing
- Interactive map view (Leaflet) on property detail and listing pages
- Favourites / saved listings for authenticated users

---

## Sub-Task 1 — Monorepo Scaffold

**Intent:**  
Set up the monorepo workspace so all packages share TypeScript types, ESLint config, and
build tooling from day one. This prevents type drift between backend, web, and mobile later.

**Expected Outcomes:**
- Root `package.json` with workspaces configured (`packages/shared`, `packages/api`, `packages/web`, `packages/mobile`)
- `packages/shared` exports all domain TypeScript types/interfaces and shared validation schemas (Zod)
- Each package has its own `tsconfig.json` extending a root base config
- ESLint + Prettier configured at root, inherited by all packages

**Todo List:**
1. Initialise root `package.json` with `"workspaces": ["packages/*"]`
2. Create `packages/shared` — export domain types: `User`, `Property`, `Image`, `ListingType`, `Category`, `Location`, `Enquiry`, `Favourite`
3. Create `packages/api` skeleton (Express + TypeScript + `ts-node-dev`)
4. Create `packages/web` skeleton (Vite + React + TypeScript)
5. Create `packages/mobile` skeleton (Expo + React Native + TypeScript)
6. Add root `tsconfig.base.json`; each package extends it
7. Add root `.eslintrc` and `.prettierrc`; add `lint` and `format` scripts at root

**Relevant Context:**
- All domain types live exclusively in `packages/shared/src/types/`
- Zod schemas in `packages/shared/src/schemas/` are imported by both API (validation) and web (form validation)
- Mobile is scaffolded now but left empty until Sub-Task 7

**Status:** `[x] done`

---

## Sub-Task 2 — Database Schema & SQLite Setup

**Intent:**  
Define the full relational schema and set up SQLite with migration scripts so every other
sub-task has a stable data layer to build against.

**Expected Outcomes:**
- SQLite database file at `packages/api/data/portal.db`
- Migration runner (`better-sqlite3` or `db-migrate`) with numbered migration files
- Tables: `users`, `properties`, `property_images`, `locations`, `categories`, `enquiries`, `favourites`
- Seed script populating: 2 locations (Yangon, Mandalay), 3 categories (Land, Apartment, House), 1 admin user

**Todo List:**
1. Install `better-sqlite3` and `@types/better-sqlite3` in `packages/api`
2. Create `packages/api/src/db/client.ts` — opens/creates the SQLite file
3. Write migration `001_initial_schema.sql`:
   - `users (id, email, password_hash, role, created_at)`
   - `locations (id, name, latitude, longitude)` — lat/lng used for map centering
   - `categories (id, name)`
   - `properties (id, title, description, price_mmk, listing_type, status, latitude, longitude, location_id, category_id, agent_id, created_at, updated_at)`
   - `property_images (id, property_id, filename, sort_order)`
   - `enquiries (id, property_id, sender_name, sender_email, sender_phone, message, created_at)`
   - `favourites (id, user_id, property_id, created_at)` — unique on (user_id, property_id)
4. Write migration runner in `packages/api/src/db/migrate.ts`
5. Write seed script `packages/api/src/db/seed.ts`
6. Add `db:migrate` and `db:seed` npm scripts

**Relevant Context:**
- `listing_type` column: enum `'buy' | 'sell' | 'rent'`
- `status` column: enum `'active' | 'inactive' | 'sold' | 'rented'`
- `role` column: enum `'admin' | 'agent' | 'buyer_renter'`
- `price_mmk` is stored as an INTEGER (kyats, no decimals needed for MVP)
- `latitude` / `longitude` on `properties` allow individual pin placement on map
- `latitude` / `longitude` on `locations` provide default map center per city
- Image filenames reference files stored under `packages/api/uploads/`

**Status:** `[x] done`

---

## Sub-Task 3 — Authentication & RBAC (API)

**Intent:**  
Implement JWT-based auth and role-based middleware so every subsequent API endpoint can
be secured with a single guard decorator/middleware call.

**Expected Outcomes:**
- `POST /api/auth/register` and `POST /api/auth/login` endpoints
- JWT access token returned on login (short-lived, e.g. 7 days for MVP)
- `authenticate` middleware — validates JWT, attaches `req.user`
- `authorize(...roles)` middleware — rejects requests from wrong roles
- Passwords hashed with `bcrypt`

**Todo List:**
1. Install `jsonwebtoken`, `bcrypt`, and their `@types` packages
2. Create `packages/api/src/middleware/authenticate.ts`
3. Create `packages/api/src/middleware/authorize.ts`
4. Create `packages/api/src/routes/auth.ts` with register + login handlers
5. Validate request bodies using Zod schemas from `packages/shared`
6. Write unit tests for auth logic (`vitest` or `jest`)

**Relevant Context:**
- `JWT_SECRET` loaded from `.env` via `dotenv`
- Shared Zod schemas: `LoginSchema`, `RegisterSchema` in `packages/shared/src/schemas/auth.ts`
- Role type imported from `packages/shared/src/types/user.ts`

**Status:** `[x] done`

---

## Sub-Task 4 — Property Listings API

**Intent:**  
Build the full CRUD REST API for property listings, including image upload, and all filter
query parameters needed by the web frontend.

**Expected Outcomes:**
- `GET    /api/properties` — list with filters: `location`, `category`, `listing_type`, `min_price_mmk`, `max_price_mmk`, pagination
- `GET    /api/properties/:id` — single property with images
- `POST   /api/properties` — create (agent or admin only)
- `PUT    /api/properties/:id` — update (owner agent or admin only)
- `DELETE /api/properties/:id` — delete (owner agent or admin only)
- `POST   /api/properties/:id/images` — upload images (multipart, `multer`)
- `DELETE /api/properties/:id/images/:imageId` — remove image
- `POST   /api/properties/:id/enquiries` — submit enquiry (public, no auth required)
- `GET    /api/properties/:id/enquiries` — list enquiries (agent/admin only)
- `GET    /api/favourites` — current user's saved listings (auth required)
- `POST   /api/favourites/:propertyId` — save a listing (auth required)
- `DELETE /api/favourites/:propertyId` — unsave a listing (auth required)
- Images served statically from `/uploads/`

**Todo List:**
1. Install `multer` and `@types/multer`
2. Configure `multer` storage to save files under `packages/api/uploads/`
3. Create `packages/api/src/routes/properties.ts` with all property + image routes
4. Implement ownership check helper: agents can only modify their own listings
5. Add `express.static` middleware pointing to `uploads/` directory
6. Add query-builder helper in `packages/api/src/db/queries/properties.ts` for filter + pagination logic (price filter uses `price_mmk`)
7. Create `packages/api/src/routes/enquiries.ts` — POST (public) + GET (agent/admin guarded)
8. Create `packages/api/src/routes/favourites.ts` — GET / POST / DELETE (auth required)
9. Wire all routes into the main Express app

**Relevant Context:**
- All request/response shapes typed using `packages/shared` types
- Images returned as `{ id, url: '/uploads/<filename>', sort_order }`
- Max 10 images per property (enforce at API level)
- Price always stored and returned as `price_mmk` (integer, Myanmar Kyat)
- Enquiry submission requires no authentication — name, email, phone, message fields
- Favourites are user-scoped; `GET /api/favourites` returns full property objects for the current user

**Status:** `[x] done`

---

## Sub-Task 5 — Reference Data API

**Intent:**  
Expose lightweight endpoints for locations and categories so the web/mobile UI can
populate dropdowns dynamically rather than hardcoding values.

**Expected Outcomes:**
- `GET /api/locations` — returns all locations
- `GET /api/categories` — returns all categories
- `GET /api/users` — admin only, returns paginated user list
- `PUT /api/users/:id/role` — admin only, change a user's role

**Todo List:**
1. Create `packages/api/src/routes/locations.ts`
2. Create `packages/api/src/routes/categories.ts`
3. Create `packages/api/src/routes/users.ts` (admin-guarded)
4. Wire all routes into main app under `/api/`

**Relevant Context:**
- Locations and categories are seeded in Sub-Task 2 and rarely change
- Admin user management is minimal MVP scope (no invite flow needed)

**Status:** `[x] done`

---

## Sub-Task 6 — Web Frontend (React)

**Intent:**  
Build the complete React web application — public browsing, agent dashboard, and admin
panel — using the API built in previous sub-tasks.

**Expected Outcomes:**
- Public pages: Home, Property List (with filter sidebar), Property Detail
- Auth pages: Login, Register
- Agent dashboard: My Listings (list), Create Listing, Edit Listing, Image Upload UI
- Admin panel: User Management, All Listings management, Enquiry inbox per listing
- React Router v6 for routing
- Role-aware navigation (show/hide links based on JWT role)
- API calls via a typed `apiClient` (Axios or `fetch` wrapper) imported from `packages/shared`
- Responsive layout (Tailwind CSS)
- Price displayed with MMK formatting (e.g. "150,000,000 MMK") throughout all listing UI
- `EnquiryForm` component on Property Detail page (public)
- `MapView` component (Leaflet + `react-leaflet`) showing property pin on detail page
- `ListingsMapView` component on Property List page showing all result pins
- Favourites: heart icon toggle on listing cards and detail page (auth required, prompt login if not)
- `SavedListingsPage` — authenticated users can view all saved listings

**Todo List:**
1. Install React Router v6, Axios, React Hook Form + Zod resolver, `react-leaflet` + `leaflet`, `@types/leaflet`
2. Create `packages/web/src/lib/apiClient.ts` — base Axios instance with JWT header injection
3. Create `packages/web/src/lib/formatMMK.ts` — utility: `formatMMK(amount: number): string` (e.g. "150,000,000 MMK")
4. Create auth context (`AuthContext`) — stores user, token; persists to `localStorage`
5. Build layout components: `Navbar`, `Sidebar`, `Footer`
6. Build public pages: `HomePage`, `PropertyListPage`, `PropertyDetailPage`
7. Build filter components: `LocationFilter`, `CategoryFilter`, `ListingTypeFilter`, `PriceRangeFilter` (MMK slider/inputs)
8. Build `MapView` component (single pin, used on `PropertyDetailPage`)
9. Build `ListingsMapView` component (multi-pin cluster, used on `PropertyListPage`)
10. Build `EnquiryForm` component — renders on `PropertyDetailPage`, public submission
11. Build `FavouriteButton` component — heart toggle; calls favourites API; redirects to login if unauthenticated
12. Build `CreateListingPage` and `EditListingPage` (agent/admin only) with image upload and lat/lng coordinate inputs
13. Build `AgentDashboardPage` — agent's own listings with enquiry count badge
14. Build `AgentEnquiriesPage` — list of enquiries for a specific property
15. Build `AdminUsersPage` and `AdminListingsPage`
16. Build `SavedListingsPage` — authenticated user's saved/favourited properties
17. Add protected route wrapper `<PrivateRoute roles={[...]}>`
18. Style with Tailwind CSS (install and configure in `packages/web`)

**Relevant Context:**
- All TypeScript types imported from `packages/shared`
- Image previews shown immediately on upload (optimistic UI)
- Pagination implemented with `page` + `limit` query params
- `formatMMK` is used everywhere a price is rendered — never format inline
- Leaflet requires a CSS import (`leaflet/dist/leaflet.css`) in the app entry point
- Map default center falls back to location's lat/lng if property has no coordinates
- Enquiry form is visible to all users (no login required); success toast shown after submit
- Favourite toggle is visible to all; unauthenticated click redirects to `/login` with `?redirect` param

**Status:** `[x] done`

---

## Sub-Task 7 — Mobile App (React Native + Expo)

**Intent:**  
Build the Expo mobile app reusing shared types and the API client, targeting the public
browsing experience (listing + detail views) and agent listing creation as the MVP scope.

**Expected Outcomes:**
- Expo app bootstrapped with TypeScript template
- Bottom tab navigation: Home, Search, Saved (auth), My Listings (agent), Profile
- Property list screen with filter modal (location, category, listing type, price in MMK)
- Property detail screen with image carousel, MMK price display, enquiry form sheet, map view, favourite toggle
- Login / Register screens
- Agent: Create Listing screen with camera/gallery image picker
- API calls via the same shared `apiClient` (configured for mobile base URL)

**Todo List:**
1. Confirm `packages/mobile` Expo scaffold is complete (from Sub-Task 1)
2. Install `expo-router`, `@react-navigation/bottom-tabs`, `expo-image-picker`, `expo-location`, `react-native-maps`
3. Create `packages/mobile/src/lib/apiClient.ts` extending shared base config
4. Create `packages/mobile/src/lib/formatMMK.ts` — same MMK formatting utility as web
5. Build `AuthContext` for mobile (reuse logic from web, React Native `SecureStore` for token)
6. Build `HomeScreen`, `PropertyListScreen`, `PropertyDetailScreen`
7. Build `FilterModal` component (price inputs in MMK)
8. Build image carousel component for detail screen
9. Build `MapView` component using `react-native-maps` for property pin on detail screen
10. Build `EnquiryFormSheet` — bottom sheet enquiry form on detail screen
11. Build `FavouriteButton` component — heart toggle on listing cards and detail screen
12. Build `SavedListingsScreen` — authenticated user's saved properties (tab: Saved)
13. Build `LoginScreen`, `RegisterScreen`
14. Build `CreateListingScreen` with `expo-image-picker` integration
15. Build `ProfileScreen` with logout

**Relevant Context:**
- Mobile targets the same REST API as the web app
- `packages/shared` types and Zod schemas are imported directly
- Admin panel is web-only; mobile scope is browse + agent create/edit
- `formatMMK` must be used for all price displays, not inline formatting
- Map uses `react-native-maps`; default region from location lat/lng if property has no coordinates
- Enquiry form is a bottom sheet (no auth required); favourite requires auth (redirect to login)

**Status:** `[ ] pending`

---

## Architecture Overview

```
monorepo/
├── packages/
│   ├── shared/          # TypeScript types, Zod schemas, API client base
│   ├── api/             # Express REST API + SQLite
│   ├── web/             # React + Vite web app
│   └── mobile/          # React Native + Expo mobile app
├── package.json         # root workspace
├── tsconfig.base.json
├── .eslintrc
└── .prettierrc
```

**API Base URL convention:**
- Development web: `http://localhost:3001`
- Development mobile (Expo): `http://<local-ip>:3001`
- Both configured via `.env` / `app.config.ts`

---

## Prompt for Coding Agent

Use the prompt below verbatim when handing this plan to a coding agent.

---

> You are building a **Property Portal** — a full-stack web + mobile application for
> buying, selling, and renting properties in Myanmar (locations: Yangon, Mandalay;
> categories: Land, Apartment, House).
>
> **Read this file completely before starting any work.**
>
> Follow the sub-tasks in this plan (`property-portal-plan.md`) in order.
> Process **one sub-task at a time**. After completing each sub-task:
> 1. Mark it `[x] done` in this plan file.
> 2. Confirm all expected outcomes are met.
> 3. Wait for approval before proceeding to the next sub-task.
>
> **Stack:**
> - Monorepo (npm workspaces)
> - Backend: Express.js + TypeScript, SQLite (`better-sqlite3`), local image storage
> - Web: React + TypeScript + Vite + Tailwind CSS + React Router v6 + react-leaflet
> - Mobile: React Native + Expo + TypeScript + react-native-maps (Sub-Task 7 only)
> - Shared: TypeScript types + Zod schemas in `packages/shared`
>
> **Non-negotiable rules:**
> - Never hardcode location or category values in the frontend — always fetch from API.
> - All TypeScript types must originate from `packages/shared`.
> - Every protected API route must use the `authenticate` + `authorize` middleware.
> - No placeholder or stub implementations — each sub-task must be fully functional before marking done.
> - Follow the file structure and naming conventions defined in each sub-task.
> - All prices are stored as integers in Myanmar Kyat (MMK). Never use float for price. Always display using the `formatMMK` utility.
> - Enquiry form submission requires no authentication.
> - Favourites require authentication; unauthenticated users are redirected to login.
> - Map coordinates (lat/lng) are stored on both `properties` and `locations` tables.
>
> Start with **Sub-Task 1 — Monorepo Scaffold**.
