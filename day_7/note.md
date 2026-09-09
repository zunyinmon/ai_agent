
 <!-- npm i express
 npm i -D tsx @types/node @types/express -->
## Ideas
- Meetup Management System

- Job portal (features, domain knowledge)
    employee
    employer
    - salary, responsible
        profolio set up

- Property portal (Rent,Buy/Sell) + Property Agents / Owners
    - Land, Apartment, 

- Automobile MarketPlace (Model , Kind Price, Email, Contact, Option (Max Sell))    

- FreeLance Platform + Service MarketPlace (aircon, car workshop, software)
    Client - submit job (Market Campaige)
    FreeLancer
    Contract, Payment

- Scholarship Platform

- Secondhand MarketPlace (Free/Discount)

- Loss & Found (Submit)

- Equiptment Rental

- Co-Working Space Management

- Teaching (Global Tutorial)

- Dating App

- Phnone number 


## Plan Mode
## prompt (AI Agent)
I want to build property portal which should include buy/sell/rent. 
Multiple location (Yangon, Mandalay). 
Multiple categories (land, apartment, house). 
Give me a prompt to instruct coding agent to build this system. 
Should use 
    TypeScript, 
    React, 
    React Native + Expo,
    Sqlite.

    Act as a Senior Full-Stack Software Engineer. Build a cross-platform property portal system (Web + Mobile + Shared Backend/Database) supporting multi-location property listings for Myanmar (e.g., Yangon, Mandalay).

## Gemini 
### 1. Tech Stack Requirements
- Language: TypeScript (Strict mode enabled across all packages)
- Web Frontend: React (Vite or Next.js App Router)
- Mobile App: React Native with Expo (Expo Router for navigation)
- Database & ORM: SQLite (using Drizzle ORM or Prisma with SQLite provider)
- Shared Architecture: Monorepo layout (TurboRepo or Nx) sharing core types, validation schemas (Zod), and API client definitions.

### 2. Core Functional Requirements

#### A. Listings Management
- Listing Types: Buy, Sell, Rent.
- Categories: Land, Apartment, House, Commercial, Condo.
- Multi-Location Support: Regions/Cities (Yangon, Mandalay), Townships (e.g., Kamayut, Bahan, Chanayethazan), and street-level details.
- Currency & Pricing: Support Myanmar Kyat (Lakhs / MMK) and USD conversions/formatting.
- Property Details: Price, area size (sq ft / acres), bedrooms, bathrooms, amenities list, floor level, furnished status, and media gallery (image URLs).

#### B. Search & Filtering
- Full-text search by title/keyword.
- Multi-faceted filters: Location (City + Township), Listing Type (Buy/Rent), Category, Price Range, and Bedrooms/Bathrooms.
- Sorting: Newest, Price High-to-Low, Price Low-to-High.

#### C. User Roles & Features
- Roles: Buyer/Tenant, Property Owner, Agent/Broker, Admin.
- User Features: Save/Bookmark properties, post new listings (with image upload flow), and direct contact actions (Call, WhatsApp, Viber links).
- Admin Features: Approve/Reject listings, manage townships/locations, and manage users.

### 3. Database Schema (SQLite)
Design a clear SQLite schema using your preferred ORM. Include tables for:
1. `users` (id, name, email, phone, role, created_at)
2. `locations` (id, city, township, region)
3. `properties` (id, user_id, title, description, listing_type, category_id, location_id, price, size_sqft, bedrooms, bathrooms, status, created_at)
4. `property_images` (id, property_id, image_url, display_order)
5. `bookmarks` (id, user_id, property_id, created_at)

### 4. Implementation Steps Needed
1. Project Scaffold: Setup monorepo structure (`/apps/web`, `/apps/mobile`, `/packages/db`, `/packages/shared`).
2. Shared Package: Define Zod schemas and TypeScript interfaces for Property, User, and Location entities.
3. Database Setup: Implement SQLite migrations and seed script pre-populated with Yangon & Mandalay townships.
4. API Layer: Simple TypeSafe API handlers/trpc/express setup connecting SQLite to both React and Expo apps.
5. UI Components: Shared responsive UI components (PropertyCard, SearchBar, FilterBar, LocationPicker).

Start by generating the monorepo file structure, SQLite database schema definitions, and the shared Zod types.


## saya 's prompt
I want to build property portal which should include buy/sell/rent. multiple locations (Yangon, Mandalay). Multiple categories (land, apartment, house). Give me a promot to instruct coding agent to build this system. Should use TypeScript, React, React Native + Expo, Sqlite.

Act as a Senior Full-Stack Engineer. Scaffold and implement a cross-platform property portal system supporting property buying, selling, and renting across multiple locations in Myanmar (e.g., Yangon, Mandalay). 

### Tech Stack Specifications
- Language: TypeScript (strict type-checking)
- Architecture: Monorepo (TurboRepo or Nx)
  - /apps/web: React (Vite or Next.js App Router)
  - /apps/mobile: React Native with Expo (Expo Router)
  - /packages/db: SQLite with Drizzle ORM (or Prisma)
  - /packages/shared: Shared Zod validation schemas, TypeScript interfaces, utilities, and API client definitions
- Database: SQLite

### Core Functionality & Requirements

1. Data Models & Categories
   - Listing Types: Buy, Sell, Rent
   - Property Categories: Land, Apartment, House, Condo, Commercial
   - Locations: Regions/Cities (e.g., Yangon, Mandalay), Townships (e.g., Kamayut, Bahan, Chanayethazan), and detailed street addresses.
   - Pricing: Support local currency formatting (MMK / Lakhs) alongside USD.

2. Database Schema (SQLite)
   - `users`: id, name, email, phone, role (buyer, owner, agent, admin), created_at
   - `locations`: id, city, township, region
   - `properties`: id, user_id, title, description, listing_type (buy/sell/rent), category, location_id, price, size_sqft, bedrooms, bathrooms, status (active/pending/sold/rented), created_at
   - `property_images`: id, property_id, image_url, is_primary, display_order
   - `saved_properties`: user_id, property_id, created_at

3. Key Features
   - Search & Filter: Full-text search by title/description; filter by city, township, category, listing type, price range, bedrooms, and bathrooms; multi-column sorting (newest, price asc/desc).
   - Listing Management: Form to create/edit listings with validation (Zod schema) and image gallery management.
   - Contact / Actions: Call, WhatsApp, Viber quick-action trigger buttons on detail view.

4. Deliverables
   - Monorepo folder and file structure set up.
   - Database schema definitions (ORM) + migrations script + seed data (pre-populating Yangon and Mandalay townships).
   - Shared Zod validation schemas for listing creation/update and search filtering.
   - Basic API layer / client layer shared between the React web app and Expo mobile app.
   - Core UI components: PropertyCard, FilterBar, LocationPicker, and PropertyDetail View.

Start by generating the monorepo workspace configuration, the SQLite schema definitions, and the shared Zod types.

## New saya's prompt
I want to build property portal which should include buy/sell/rent. multiple locations (Yangon, Mandalay). Multiple categories (land, apartment, house). Give me a promot to instruct coding agent to build this system. Should use TypeScript, React, React Native + Expo, Sqlite. web first, mobile later.

Act as a Senior Full-Stack Engineer. Scaffold and build a cross-platform property portal system for buying, selling, and renting properties in Myanmar (starting with Yangon and Mandalay). 

The system must be built with a "Web-First, Mobile-Later" strategy, using a monorepo so that business logic, data models, and API layers are shared seamlessly when the Expo app is added later.

### 1. Tech Stack
- Monorepo: Turborepo or Nx
- Language: TypeScript (Strict mode enabled)
- Web Frontend (Priority 1): React (Next.js App Router or Vite + React Router)
- Mobile Frontend (Priority 2 / Foundation): React Native + Expo (Expo Router setup in repository structure, ready for future UI work)
- Database & ORM: SQLite (using Drizzle ORM or Prisma)
- Validation & Types: Zod schemas shared in a `@repo/shared` package

### 2. Domain & Core Features

#### Locations & Categories
- Locations: Structured hierarchy for Myanmar -> City (Yangon, Mandalay) -> Townships (e.g., Kamayut, Bahan, Chanayethazan) -> Address details.
- Categories: Land, Apartment, House, Condo, Commercial.
- Listing Types: Buy, Sell, Rent.
- Pricing & Currency: Support Myanmar Kyat (Lakhs / MMK) with clear formatting helpers.

#### Key Features (Web)
1. Homepage & Discovery: Hero search bar, featured property carousel, category quick-links.
2. Search & Filtering: Filter listings by City, Township, Listing Type (Buy/Rent), Category, Price Range (Lakhs), Bedrooms, Bathrooms, and Sort order (Newest, Price Low/High).
3. Property Detail Page: Image gallery, key specs (area size sq ft/acre, beds, baths, floor level), interactive location summary, and quick contact buttons (Call, WhatsApp, Viber).
4. Listing Management: Multi-step form for users/agents to submit a property (validated via shared Zod schema) including image upload triggers.
5. SQLite Database: Pre-populated seed script with major townships for Yangon and Mandalay.

### 3. Architecture & Codebase Layout

Please organize the monorepo as follows:
- `/packages/db`: SQLite schema, migration setup, seed data for Yangon/Mandalay.
- `/packages/shared`: Shared TypeScript types, Zod schemas (Property, User, Location filters), and currency formatters.
- `/apps/web`: Web application (Primary deliverable).
- `/apps/mobile`: Expo React Native app shell referencing `@repo/shared` and `@repo/db` (Placeholder/scaffolded structure ready for UI implementation).

### 4. Step-by-Step Execution Plan

1. Monorepo Setup: Create the workspace configuration and package structures.
2. DB & Shared Package:
   - Define SQLite tables: `users`, `locations`, `properties`, `property_images`, `bookmarks`.
   - Write a seed script pre-populating Yangon (e.g., Kamayut, Bahan, Dagon) and Mandalay (e.g., Chanayethazan, Mahar Aung Myay) townships.
   - Write shared Zod schemas for Property creation and Search filter queries.
3. Web App Implementation:
   - Build layout (Header, Navigation, Footer).
   - Build property search filter UI and Property Card components.
   - Build Property Detail View with media viewer and Viber/WhatsApp/Call buttons.
   - Build "Post New Property" form with validation.

Start by setting up the workspace directory structure, shared Zod schemas, and SQLite database schema definitions.


## New add in prompt
Simple listing should have proper images


## New saya's prompt
I want to build property portal which should include buy/sell/rent. multiple locations (Yangon, Mandalay with future expension). Multiple categories (land, apartment, house, etc...). Should use TypeScript, React, React Native + Expo, Express, Sqlite + Prisma 7, shadcnui (--preset b7ClNFsdU). Web first, mobile later. Should have many sample data. Multi role with owner, agent, buyer/renter, admin/staff. project structure whould be three seperated sibling projects: api, app, mobile. each should be their own seperated repo. Create a project spec in SPEC.md without making implementation yet.

https://ui.shadcn.com/ => --preset b1PzeK


Spec-Driven Development


## to do
Ready for Sub-Task 7 — Mobile App (React Native + Expo). This is the final sub-task. Shall I proceed?

Progress Summary
#	Sub-Task	Status
1	Monorepo Scaffold	✅ Done
2	Database Schema & SQLite	✅ Done
3	Authentication & RBAC (API)	✅ Done
4	Property Listings API	✅ Done
5	Reference Data API	✅ Done
6	Web Frontend (React)	✅ Done
7	Mobile App (React Native + Expo)	⏸ Paused
The web app is fully functional. To run it locally:

# Terminal 1 — API
cd packages/api && npm run db:migrate && npm run db:seed && npm run dev

# Terminal 2 — Web
cd packages/web && npm run dev

When you're ready for the mobile app, just say "continue with Sub-Task 7" and I'll pick up right where we left off.


## Final prompt requirement
I want to build property portal which should include buy/sell/rent. multiple locations (Yangon, Mandalay with future expension). Multiple categories (land, apartment, house, etc...). Should use TypeScript, React, React Native + Expo, Express, Sqlite + Prisma 7, shadcnui (--preset b7ClNFsdU). Web first, mobile later. Should have many sample data. Multi role with owner, agent, buyer/renter, admin/staff. project structure whould be three seperated sibling projects: api, app, mobile. each should be their own seperated repo. Create a project spec in SPEC.md without making implementation yet.