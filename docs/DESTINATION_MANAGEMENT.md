# GoYatrio — Destination Management Documentation

This document describes the **Destination Management System** (`Phase 7`) for the GoYatrio travel platform.

---

## Overview

The Destination Management System enables administrators to create, edit, publish, and feature travel destinations, while offering a rich public experience for travelers browsing destinations across India.

---

## Database Structure

### Prisma Model — `Destination`

| Field | Type | Notes |
| :--- | :--- | :--- |
| `id` | String (cuid) | Primary key |
| `name` | String | Destination display name |
| `slug` | String (unique) | Auto-generated, unique URL slug |
| `shortDescription` | String | Card summary |
| `description` | String | Full overview |
| `state` | String? | State or region |
| `country` | String | Defaults to `India` |
| `featuredImage` | String? | Main hero image URL |
| `galleryImages` | String[] | Gallery image URLs |
| `featured` | Boolean | Featured destination toggle |
| `status` | DestinationStatus | `DRAFT` or `PUBLISHED` |
| `metaTitle` | String? | SEO title |
| `metaDescription` | String? | SEO description |
| `isActive` | Boolean | Soft delete flag |
| `createdAt` / `updatedAt` | DateTime | Timestamps |

### Status Enum — `DestinationStatus`

```
DRAFT
PUBLISHED
```

### Migration

```bash
pnpm db:migrate
```

Run `pnpm db:generate` after schema changes to regenerate the Prisma client:

```bash
pnpm db:generate
```

---

## API Endpoints

### Public

| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/api/destinations` | List published destinations (supports `take`, `skip`, `search`, `featured`) |
| `GET` | `/api/destinations/:slug` | Fetch a published destination by slug |

### Admin (JWT + ADMIN role required)

| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/destinations` | List all destinations (supports `take`, `skip`, `search`, `status`, `country`) |
| `POST` | `/api/admin/destinations` | Create a destination |
| `PUT` | `/api/admin/destinations/:id` | Update a destination |
| `DELETE` | `/api/admin/destinations/:id` | Soft-delete a destination |
| `PATCH` | `/api/admin/destinations/:id/status` | Toggle status (`DRAFT` / `PUBLISHED`) |
| `PATCH` | `/api/admin/destinations/:id/featured` | Toggle featured flag |

All admin endpoints require:

```http
Authorization: Bearer <jwt>
```

and the JWT must belong to a user with role `ADMIN`.

---

## Admin Workflow

1. Navigate to `/admin/destinations`.
2. Click **Add Destination** to open the create form.
3. Fill in name, state, country, descriptions, image URLs, gallery URLs, status, featured toggle, and SEO metadata.
4. Slug is auto-generated from the name and enforced unique by the API.
5. Use **Edit** to update details, **Delete** to soft-remove, the status toggle to publish/draft, and the featured switch to promote a destination.
6. Use **Search**, **Status Filter**, and **Country Filter** with pagination to navigate the list.

---

## Public Pages

- `/destinations` — Destination listing page with destination cards (image, name, country, short description, view details button).
- `/destinations/[slug]` — Destination detail page with hero banner, overview, highlights sidebar, related tour packages, and gallery.

---

## SEO Implementation

- Dynamic `generateMetadata` per destination using `metaTitle` and `metaDescription`.
- OpenGraph tags (`title`, `description`, `type`, `locale`, `url`, `images`).
- Canonical URL pointing to the destination detail page.
- Fallback metadata generated from destination name when custom SEO fields are empty.

---

## Future Cloudinary Integration Notes

- `featuredImage` and `galleryImages` currently store plain URLs.
- Future integration will store Cloudinary `publicId` / `secureUrl` pairs via the existing `Media` model.
- A Cloudinary upload widget can be wired into the destination form to generate image URLs on upload.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` placeholders already exist in the environment template.