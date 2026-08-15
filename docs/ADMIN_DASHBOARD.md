# GoYatrio Platform — Admin Dashboard Documentation

This document describes the **Admin Dashboard** foundation (`Phase 6`) for the GoYatrio travel management platform.

---

## Overview

The Admin Dashboard provides a management console for travel agency administrators to oversee destinations, tour packages, itineraries, hotel partnerships, vehicle fleets, blogs, media assets, and customer inquiries.

---

## Access Control & Security

- **Authentication Guard:** Enforced via `AdminGuard` component (`apps/web/components/admin/admin-guard.tsx`).
- **Role Requirement:** Restricted exclusively to users with role `ADMIN`.
- **Access Policy:**
  - `ADMIN` role → Access Granted.
  - `CUSTOMER` role → Access Denied (Redirected to `/login?error=unauthorized`).
  - Unauthenticated users → Redirected to `/login?from=/admin/*`.
- **Edge Middleware:** Protected at the Next.js routing level in `apps/web/middleware.ts` for `/admin/*` path matchers.

---

## Admin Routes Overview

| Route | Purpose | Access Level |
| :--- | :--- | :--- |
| `/admin` | Redirects to `/admin/dashboard` | Admin Only |
| `/admin/dashboard` | Overview console with stats cards & recent inquiries | Admin Only |
| `/admin/destinations` | Location management, featured destinations & SEO tags | Admin Only |
| `/admin/packages` | Tour package creation, package types, durations & pricing | Admin Only |
| `/admin/itineraries` | Day-by-day itinerary schedules & meal plans | Admin Only |
| `/admin/hotels` | Hotel partnerships, categories & nightly rates | Admin Only |
| `/admin/cabs` | Vehicle fleet, seating capacities & daily rates | Admin Only |
| `/admin/blogs` | Travel blog article drafting, authoring & publishing | Admin Only |
| `/admin/media` | Cloudinary asset management & image library | Admin Only |
| `/admin/inquiries` | Customer lead management & booking inquiry tracking | Admin Only |
| `/admin/settings` | Agency profile, contact settings & security options | Admin Only |

---

## Reusable Admin Components

- **`AdminLayout`** (`apps/web/components/admin/admin-layout.tsx`): Wrapper providing responsive drawer navigation, top navbar, and admin guard protection.
- **`AdminSidebar`** (`apps/web/components/admin/admin-sidebar.tsx`): Desktop sidebar & mobile drawer with active route indicators and secure logout handler.
- **`AdminNavbar`** (`apps/web/components/admin/admin-navbar.tsx`): Header bar displaying agency console status and quick action links.
- **`StatsCard`** (`apps/web/components/admin/stats-card.tsx`): Metric display card featuring icons, counts, titles, and trend badges.
- **`PageHeader`** (`apps/web/components/admin/page-header.tsx`): Page title header with descriptions and primary CTA action slots.
- **`SearchBar`** (`apps/web/components/admin/search-bar.tsx`): Live search input for filtering table rows.
- **`FilterBar`** (`apps/web/components/admin/filter-bar.tsx`): Dropdown filters and clear filter action controls.
- **`DataTable`** (`apps/web/components/admin/data-table.tsx`): Reusable data table with status badges, custom cell formatters, and row actions.
- **`EmptyState`** (`apps/web/components/admin/empty-state.tsx`): Clean empty data state with call-to-action button.
- **`LoadingState`** (`apps/web/components/admin/loading-state.tsx`): Skeleton loading indicator during data fetches.
- **`ConfirmationModal`** (`apps/web/components/admin/confirmation-modal.tsx`): Modal dialog for confirming destructive operations (e.g., delete item).

---

## Future Phase Integration Points

1. **Phase 7 (Core Domain Data Connection):**
   - Connect `DataTable` components to REST API endpoints (`/api/destinations`, `/api/packages`, `/api/inquiries`, etc.).
2. **Phase 8 (Full CRUD Forms & Media Uploads):**
   - Wire create/edit modal forms to backend mutation endpoints and Cloudinary direct file upload widget.