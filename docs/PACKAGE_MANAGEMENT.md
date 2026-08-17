# GoYatrio â€” Package Management Documentation

This document describes the **Package Management System** (`Phase 8`) for the GoYatrio travel platform.

---

## Overview

The Package Management System enables administrators to manage tour packages, duration, pricing, inclusions, exclusions, and day-by-day itineraries, while offering a public browsing experience with direct booking inquiry integration.

---

## Database Structure

### Prisma Model â€” `TourPackage`

| Field | Type | Notes |
| :--- | :--- | :--- |
| `id` | String (cuid) | Primary key |
| `title` | String | Package title |
| `slug` | String (unique) | Auto-generated URL slug |
| `shortDescription` | String | Card summary |
| `description` | String | Detailed overview |
| `destinationId` | String | Foreign key to `Destination` |
| `durationDays` | Int | Total travel days |
| `durationNights` | Int | Total travel nights |
| `priceFrom` | Decimal | Starting price per person |
| `currency` | String | Defaults to `INR` |
| `packageType` | PackageType | Enum: `DOMESTIC`, `INTERNATIONAL`, `LUXURY`, `ADVENTURE`, `PILGRIMAGE` |
| `inclusions` | String[] | Bullet inclusions list |
| `exclusions` | String[] | Bullet exclusions list |
| `featuredImage` | String? | Hero banner image URL |
| `galleryImages` | String[] | Photo gallery URLs |
| `featured` | Boolean | Featured package flag |
| `status` | PackageStatus | Enum: `DRAFT`, `PUBLISHED` |
| `metaTitle` | String? | SEO title |
| `metaDescription` | String? | SEO description |
| `isActive` | Boolean | Soft-delete flag |
| `createdAt` / `updatedAt` | DateTime | Timestamps |

---

## API Endpoints

### Public Endpoints

| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/api/packages` | List published packages (supports `search`, `packageType`, `destinationId`, `sort`, `take`, `skip`) |
| `GET` | `/api/packages/:slug` | Get published package by slug with destination & itineraries |

### Admin Endpoints (JWT + ADMIN Role required)

| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/packages` | List all packages for admin console |
| `POST` | `/api/admin/packages` | Create a new tour package |
| `PUT` | `/api/admin/packages/:id` | Update package details |
| `DELETE` | `/api/admin/packages/:id` | Soft-delete tour package |
| `PATCH` | `/api/admin/packages/:id/status` | Toggle `DRAFT` / `PUBLISHED` status |
| `PATCH` | `/api/admin/packages/:id/featured` | Toggle featured flag |

---

## Public Website & Inquiry Integration

- **`/packages`** â€” Public package listing page displaying package cards with duration, starting price, and destination details.
- **`/packages/[slug]`** â€” Package detail page featuring:
  - Hero banner with price per person, category, and destination.
  - Inclusions and Exclusions checklist cards.
  - Day-by-day itinerary timeline with accommodation & meal details.
  - Gallery grid.
  - Sticky **Package Inquiry CTA Form**:
    - Submits directly to `/api/inquiries`.
    - Automatically attaches `packageId`, `packageTitle`, `destinationName`, and `serviceType`.

---

## SEO Implementation

- Dynamic `generateMetadata` per package using `metaTitle` and `metaDescription`.
- OpenGraph tags (`title`, `description`, `type`, `locale`, `url`, `images`).
- Canonical URL pointing to `/packages/[slug]`.
---

## Phase 13 â€” Package Pricing & Availability

### Models Added
- `PackageSeasonalPrice` â€” seasonal rate entries (`label`, `priceFrom`, `discountedPrice`, `displayOrder`, `startDate`, `endDate`, `active`).
- `PackageOffer` â€” promotional offers (`label`, `badge`, `discountedPrice`, `priority`, `startDate`, `endDate`, `featured`, `active`).

### TourPackage Additions
- `discountedPrice` â€” base discount price.
- `availability` â€” `AVAILABLE | LIMITED_SEATS | SOLD_OUT | UPCOMING`.
- `availableSeats` â€” seat count for limited seats.
- `priceValidFrom` / `priceValidTo` â€” booking/price validity window.

### Effective Price Priority
1. Active `PackageOffer` (highest `priority`)
2. Active `PackageSeasonalPrice`
3. `TourPackage.discountedPrice`
4. `TourPackage.priceFrom`

### APIs
- `PATCH /api/admin/packages/:id/availability` â€” set availability + seats.
- `POST /api/admin/packages/:id/seasonal-prices`, `PUT/DELETE /api/admin/packages/seasonal-prices/:id`.
- `POST /api/admin/packages/:id/offers`, `PUT/DELETE /api/admin/packages/offers/:id`.
- Public `GET /api/packages` supports `availability` filter; responses include `effectivePrice`, `originalPrice`, `priceBadge`.

### Admin
- Package form now manages base/discount price, availability, seats, validity dates, seasonal price repeater, and offers repeater (badge, price, priority, validity, featured/active toggles).

### Public
- Cards show effective price, strike-through original, offer badge, and availability status.
- Detail page shows badge, discount, seasonal label, and replaces the booking CTA with Sold Out / Upcoming messaging.
