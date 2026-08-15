# GoYatrio — Package Management Documentation

This document describes the **Package Management System** (`Phase 8`) for the GoYatrio travel platform.

---

## Overview

The Package Management System enables administrators to manage tour packages, duration, pricing, inclusions, exclusions, and day-by-day itineraries, while offering a public browsing experience with direct booking inquiry integration.

---

## Database Structure

### Prisma Model — `TourPackage`

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

- **`/packages`** — Public package listing page displaying package cards with duration, starting price, and destination details.
- **`/packages/[slug]`** — Package detail page featuring:
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