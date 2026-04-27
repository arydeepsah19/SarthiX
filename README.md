# 🚛 Sarthix — Logistics Bidding Platform

<div align="center">

![Sarthix Banner](https://img.shields.io/badge/Sarthix-Logistics%20Platform-f97316?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTIwIDhIMTdWNkgzQzEuOSA2IDEgNi45IDEgOFYxN0gzQTMgMyAwIDAgMCA5IDE3SDEzQTMgMyAwIDAgMCAxOSAxN0gyMVY4SDIwWiIvPjwvc3ZnPg==)

**A full-stack freight logistics marketplace connecting drivers and shippers through transparent bidding, live GPS tracking, and automated permit compliance.**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs)](https://nodejs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?logo=clerk)](https://clerk.com)

</div>

---
## 🎓 Team Information
* **Project Title:** SarthiX — Logistics Bidding Platform
* **Project Type:** Copyright
* **Submission Status:** Final Submission (Viva Ready)
* **Supervisor:** Ajay Kumar (akumar@chitkara.edu.in)

| Name | Roll Number | Role |
| :--- | :--- | :--- |
| **Arydeep Sah** | [2210991395] | Full-Stack Lead (System Architecture & Logic) |
| **Ashish Kumar** | [2210991401] | Full-Stack Lead (API, DB & Integration) |
| **Gaurav Anand** | [2210991570] | Frontend Developer (UI Components) |
| **Harshvardhan Singh** | [2210991647] | Frontend Developer (UI Design) |

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Role-Based Access](#-role-based-access)
- [Live Tracking](#-live-tracking)

---

## 🌟 Overview

Sarthix is a B2B logistics platform built for the Indian freight market. It enables **shippers** to post loads and receive competitive bids from **drivers**, with real-time GPS tracking, permit compliance monitoring, and a transparent rating system.

```
Shipper posts shipment → Drivers place bids → Shipper accepts best bid
→ Material loaded notification → Driver starts transit (GPS tracking begins)
→ Driver uploads proof-of-delivery → Shipment marked delivered → Rating
```

---

## ✨ Features

### For Shippers (Companies)
| Feature | Description |
|---|---|
| 📦 Post Shipments | Create shipments with route, weight, load type, base price and bid deadline |
| 🧮 Price Calculator | Calculate base price from distance, fuel, weight and margin |
| 📸 Shipment Images | Upload up to 4 photos per shipment |
| 🏷️ Bid Management | View all bids per shipment with driver ratings, trips, ETA and price |
| ✅ Accept Bids | One-click bid acceptance that assigns driver and closes bidding |
| 🔔 Material Loaded | Notify driver when cargo is ready for pickup |
| 🗺️ Live Tracking | Real-time GPS map showing driver location (updates every 10s) |
| 🏪 Marketplace | View all open shipments from all shippers on the platform |
| 📊 Dashboard | Stats on total, active, delivered and cancelled shipments |

### For Drivers
| Feature | Description |
|---|---|
| 🔍 Browse Shipments | Search and filter all open shipments with pagination |
| 💰 Place Bids | Bid with custom price and ETA on any open shipment |
| 🚛 Active Shipments | Dashboard showing all assigned and in-transit shipments |
| 📍 Start Transit | One-tap to start journey — triggers automatic GPS broadcasting |
| 📸 Proof of Delivery | Upload delivery photos when marking shipment as delivered |
| 🚗 Vehicle Management | Add vehicles with registration, type, capacity and document upload |
| 📄 Permit Tracking | Track permit validity with expiry alerts |
| ⭐ Ratings | Build reputation through shipper ratings after each delivery |
| 📢 Notifications | Real-time alerts for bid status, assignments and permit warnings |

---

## 🛠 Tech Stack

### Frontend
```
React 18 + Vite          — UI framework and build tool
TanStack Query v5         — Server state management with optimistic updates
Clerk                     — Authentication, session management, role-based routing
Axios                     — HTTP client with JWT interceptor
Leaflet + OpenStreetMap   — Live GPS tracking maps (CartoDB Dark tiles)
Supabase JS               — Direct storage uploads + Realtime subscriptions
```

### Backend
```
Node.js + Express         — REST API server
Clerk SDK                 — JWT verification middleware
Supabase (PostgreSQL)     — Primary database
Supabase Storage          — Image and document storage
```

---

## 📁 Project Structure

```
sarthix/
├── frontend/
│   └── src/
│       ├── lib/
│       │   ├── axios.js              # useAxios() hook — attaches Clerk Bearer token
│       │   └── queryClient.js        # TanStack QueryClient (staleTime 1min, retry 1)
│       │
│       ├── hooks/
│       │   ├── useShipments.js       # useShipments, useCompanyShipments, usePostShipment
│       │   ├── useBids.js            # useBidsForShipment, useAcceptBid, usePlaceBid
│       │   ├── useDriverDashboard.js # useDriverDashboard, useDriverActiveShipments
│       │   ├── useVehicles.js        # CRUD + uploadVehicleDocument
│       │   ├── useNotifications.js   # useNotifications, useMarkNotificationRead
│       │   ├── useShipmentImages.js  # useUploadShipmentImage, useDeleteShipmentImage
│       │   └── useTracking.js        # useLocationBroadcast (driver), useLiveLocation (shipper)
│       │
│       ├── components/
│       │   ├── ui/
│       │   │   ├── LiveMap.jsx       # Leaflet map with dark tiles, truck marker, LIVE badge
│       │   │   ├── TruckAvatar.jsx   # Unique truck doodle per driver seed
│       │   │   ├── Badge.jsx         # Status badges with colour map
│       │   │   ├── StatCard.jsx      # Dashboard metric cards
│       │   │   ├── Card.jsx          # Base card wrapper
│       │   │   └── tokens.js         # COLORS, FONTS, STATUS_MAP design tokens
│       │   └── layout/
│       │       ├── Sidebar.jsx       # Responsive sidebar with mobile slide-in
│       │       └── Topbar.jsx        # Fixed topbar with hamburger + initials avatar
│       │
│       ├── driver/
│       │   └── pages/
│       │       ├── DriverDashboard.jsx   # Active shipments, proof-of-delivery modal
│       │       ├── OpenShipments.jsx     # Browse + bid on all open shipments
│       │       ├── DriverBids.jsx        # My bids history
│       │       ├── DriverVehicles.jsx    # Vehicle + document management
│       │       ├── DriverPermits.jsx     # Permit compliance tracker
│       │       ├── DriverTrips.jsx       # Completed trips history
│       │       └── DriverNotifications.jsx
│       │
│       └── company/
│           └── pages/
│               ├── CompanyDashboard.jsx  # Stats, recent shipments, bid inbox
│               ├── CompanyShipments.jsx  # Card grid with image slider, bids dialog, tracking
│               ├── AllShipments.jsx      # Marketplace — all open shipments from all shippers
│               ├── TrackShipment.jsx     # Live GPS tracking with HUD interface
│               ├── CompanyBids.jsx       # Bid management per shipment
│               └── CompanyNotifications.jsx
│
└── backend/
    └── src/
        ├── config/
        │   ├── clerk.js              # requireAuth middleware
        │   └── supabaseClient.js
        ├── users/                    # Auth sync, role management, phone update
        ├── shipments/                # CRUD, status transitions, location updates, notifications
        ├── bids/                     # Place bid, accept bid, list bids with driver info
        ├── driver/                   # Dashboard stats, active shipments, trips, permits
        ├── notifications/            # Fetch, create, mark-as-read
        └── vehicles/                 # Vehicle CRUD with document_url
```

---

## 🚀 Getting Started

<div align="center">

![Sarthix Banner](https://img.shields.io/badge/Sarthix-Logistics%20Platform-f97316?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTIwIDhIMTdWNkgzQzEuOSA2IDEgNi45IDEgOFYxN0gzQTMgMyAwIDAgMCA5IDE3SDEzQTMgMyAwIDAgMCAxOSAxN0gyMVY4SDIwWiIvPjwvc3ZnPg==)

### 🚀 [Explore the Live App](https://sarthi-x-eight.vercel.app/)

</div>

### Prerequisites
- Node.js ≥ 18
- A [Supabase](https://supabase.com) project
- A [Clerk](https://clerk.com) application

### 1. Clone the repository

```bash
git clone https://github.com/your-username/sarthix.git
cd sarthix
```

### 2. Install dependencies

```bash
# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install
```

### 3. Set up environment variables

See [Environment Variables](#-environment-variables) below.

### 4. Run the database migrations

Run these SQL scripts in your Supabase SQL Editor in order:

```bash
# Core schema (users, shipments, bids, trips, permits, notifications)
supabase/migrations/001_core_schema.sql

# Shipment images
supabase/migrations/002_shipment_images.sql

# Vehicle documents
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS document_url text;

# Live tracking
supabase/migrations/003_tracking.sql
```

### 5. Create Supabase Storage buckets

| Bucket | Public | Purpose |
|---|---|---|
| `shipment-images` | ✅ | Shipment photos uploaded by shippers |
| `vehicle-documents` | ✅ | Vehicle registration documents |

### 6. Start development servers

```bash
# Backend (port 5000)
cd backend && npm run dev

# Frontend (port 5173)
cd frontend && npm run dev
```

---

## 🔑 Environment Variables

### Frontend `.env`
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Backend `.env`
```env
PORT=5000
CLERK_SECRET_KEY=sk_test_...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
FRONTEND_URL=http://localhost:5173
```

---


### Shipment Status Flow
```
open → assigned → in_transit → delivered
                ↘ cancelled
```

---



## 👥 Role-Based Access

```
New user → RoleSelect screen → chooses Driver or Company
                                        ↓
                          ┌─────────────┴──────────────┐
                      DriverApp                   CompanyApp
                    (role: driver)              (role: company)
```

Role is set once and cannot be changed. `AuthGate` reads `dbUser.role` from `GET /api/users/me` and routes accordingly.

---

## 📍 Live Tracking

```
Driver (in_transit)
  → navigator.geolocation.watchPosition()
  → PATCH /api/shipments/:id/location  (every 10 seconds)
  → Supabase: shipment_locations table (UPSERT on shipment_id)
  → Supabase Realtime broadcast

Shipper (Track page / dialog)
  → Supabase Realtime subscription on shipment_locations
  → React Query setQueryData on each payload
  → Leaflet map panTo() with smooth animation
  → CartoDB Dark Matter tiles
```

Multiple in-transit shipments are supported — a single GPS watcher pushes to all shipment IDs simultaneously via `Promise.allSettled`.

---

## 🏗 Key Decisions

- **Optimistic updates** on notifications, vehicle delete — immediate UI feedback with rollback on error
- **Separate endpoints** for driver shipments (`GET /shipments` = all open) vs company shipments (`GET /shipments/myshipments` = own only)
- **No `refetchInterval`** on notifications — background polling was reverting optimistic mark-read updates
- **Leaflet dynamic import** — loaded only when map mounts, with `invalidateSize()` after 250ms to fix black screen
- **CartoDB Dark tiles** instead of OSM — matches the dark dashboard theme
- **`useDriverActiveShipments`** — dedicated hook for `assigned` + `in_transit` shipments since `GET /shipments` only returns `open` ones

---

## 📝 License

MIT © 2026 Sarthix Team

---

<div align="center">
Made with ❤️ by the Sarthix Team
</div>
