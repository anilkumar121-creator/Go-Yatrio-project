# GoYatrio — Lookup Tables / Admin Configuration Documentation

## Overview

Lookup Tables replace hardcoded option lists with database-driven, admin-managed values. Administrators can create, edit, enable/disable, reorder, and delete configurable values without code changes.

## Models

- `LookupGroup` — `id`, `key` (unique), `name`, `description`, `createdAt`, `updatedAt`
- `LookupItem` — `id`, `groupId`, `label`, `value`, `description`, `icon`, `color`, `sortOrder`, `isActive`, timestamps; unique `(groupId, value)`; index `(groupId, isActive)`

## APIs

Public:

- `GET /api/lookups` (optional `groupKey=a,b`)
- `GET /api/lookups/:groupKey`

Admin (auth + admin):

- `GET/POST /api/admin/lookups/groups`, `PUT/DELETE /api/admin/lookups/groups/:id`
- `GET/POST /api/admin/lookups/items`, `PUT/DELETE /api/admin/lookups/items/:id`
- `PATCH /api/admin/lookups/items/:id/status`, `PATCH /api/admin/lookups/items/:id/order`

## Admin UI

`/admin/settings/lookups` — Groups and Items tabs with search, filters, pagination, create/edit/delete dialogs, active toggle, and up/down sort controls. Navigation: Admin sidebar ? Lookup Tables.

## Integration

Admin forms load options dynamically via `useLookups(groupKeys, fallback)`:

- Packages ? `PACKAGE_TYPE`
- Hotels ? `HOTEL_CATEGORY`
- Cabs ? `VEHICLE_TYPE`, `FUEL_TYPE`

Fallback constants are used if the lookup API is unavailable (never crashes); empty lookup data renders as an empty state.

## Seed Data

Seeded groups: DESTINATION_TYPE, PACKAGE_TYPE, HOTEL_AMENITY, HOTEL_CATEGORY, VEHICLE_TYPE, FUEL_TYPE, BLOG_CATEGORY, LEAD_SOURCE, INQUIRY_SOURCE, CONTACT_REASON, PROPERTY_TYPE, ROOM_TYPE, TRANSPORT_TYPE, MEAL_PLAN, DIFFICULTY_LEVEL, TESTIMONIAL_CATEGORY.
