# Phase 10: Hotel Booking System Documentation

## Overview

The **GoYatrio Hotel Booking System** enables partners to list hotels, manage room categories, amenities, image galleries, and availability status. Customers can browse, search, filter, and view hotels, then submit inquiry-based booking requests.

---

## 1. Database Schema

### Models

- `Hotel` — Hotel profile with destination link, category, star rating, address, coordinates, featured flag, and status.
- `HotelImage` — Gallery images linked to hotels.
- `HotelAmenity` — Shared amenity catalog (Wi-Fi, Pool, Spa, etc.).
- `HotelRoomType` — Room categories per hotel with pricing, bed type, size, and guest capacity.
- `HotelInquiry` — Customer booking inquiries per hotel.

### Enums

- `HotelStatus`: `DRAFT`, `ACTIVE`, `INACTIVE`
- `HotelCategory`: `BUDGET`, `STANDARD`, `PREMIUM`, `LUXURY`
- `HotelInquiryStatus`: `NEW`, `CONTACTED`, `CLOSED`

---

## 2. APIs

### Public APIs
- `GET /api/hotels` — List hotels with search, filters, and pagination
- `GET /api/hotels/:slug` — Hotel detail by slug
- `GET /api/hotels/search` — Search hotels by query
- `GET /api/hotels/featured` — Featured hotels
- `GET /api/hotels/destination/:slug` — Hotels by destination
- `POST /api/hotels/:id/inquiry` — Submit a hotel inquiry

### Admin APIs
- `GET /api/admin/hotels` — List all hotels
- `POST /api/admin/hotels` — Create hotel
- `GET /api/admin/hotels/:id` — Get single hotel
- `PUT /api/admin/hotels/:id` — Update hotel
- `DELETE /api/admin/hotels/:id` — Delete hotel
- `PATCH /api/admin/hotels/:id/status` — Update hotel status

---

## 3. Admin Workflow

1. Navigate to `/admin/hotels`.
2. Use **Add New Hotel** to create a partner hotel.
3. Configure hotel name, destination, category, star rating, address, and descriptions.
4. Select amenities from the preset amenity list.
5. Add room categories with room name, bed type, max guests, room size, and starting price.
6. Provide gallery image URLs.
7. Toggle featured and status (Active / Draft / Inactive).

---

## 4. Inquiry Workflow

1. Customers open a hotel detail page (`/hotels/:slug`).
2. Fill in the **Check Availability** inquiry form (name, email, phone, check-in/out, guests, message).
3. Inquiry is stored via `POST /api/hotels/:id/inquiry`.
4. GoYatrio team contacts the customer with availability and exclusive rates.

---

## 5. Public Pages

- `/hotels` — Hotel listing page with search, filters (category, star rating, destination), sorting, and pagination.
- `/hotels/[slug]` — Hotel detail page with gallery, overview, amenities, room types, hotel information, inquiry form, and related hotels.
