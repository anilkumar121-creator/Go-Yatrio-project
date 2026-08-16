# Phase 11: Cab Booking System Documentation

## Overview

The **GoYatrio Cab Booking System** lets partners manage a fleet of vehicles (hatchbacks, sedans, SUVs, luxury SUVs, tempo travellers, and mini buses) with full pricing, trip types, features, and availability. Customers can browse, search, filter, and view cabs, then submit inquiry-based booking requests.

---

## 1. Database Schema

### Models
- `Vehicle` — Cab/vehicle profile with type, seating/luggage capacity, AC, fuel type, driver allowance, base fare, extra KM charge, night charge, destination link, featured flag, and status.
- `CabAmenity` — Shared vehicle feature catalog (AC, music system, USB ports, etc.).
- `CabInquiry` — Customer cab booking inquiries.

### Relations
- `Destination 1—N Vehicle` (via optional `destinationId`, `onDelete: SetNull`)
- `TourPackage M—N Vehicle` (implicit `_TourPackageToVehicle`)
- `Vehicle M—N CabAmenity` (implicit `_CabAmenityToVehicle`)
- `Vehicle 1—N CabInquiry`

### Enums
- `VehicleType`: `HATCHBACK`, `SEDAN`, `SUV`, `TEMPO_TRAVELLER`, `BUS`, `LUXURY`, `LUXURY_SUV`, `MINI_BUS`
- `CabTripType`: `LOCAL`, `AIRPORT_TRANSFER`, `RAILWAY_TRANSFER`, `OUTSTATION`, `ONE_WAY`, `ROUND_TRIP`, `MULTI_DAY`
- `CabFuelType`: `PETROL`, `DIESEL`, `CNG`, `ELECTRIC`
- `CabStatus`: `DRAFT`, `ACTIVE`, `INACTIVE`
- `CabInquiryStatus`: `NEW`, `CONTACTED`, `CLOSED`

---

## 2. APIs

### Public APIs
- `GET /api/cabs` — List cabs with search, filters, and pagination
- `GET /api/cabs/:slug` — Cab detail by slug
- `GET /api/cabs/search` — Search cabs by query
- `GET /api/cabs/featured` — Featured cabs
- `GET /api/cabs/destination/:slug` — Cabs by destination
- `POST /api/cabs/:id/inquiry` — Submit a cab inquiry

### Admin APIs
- `GET /api/admin/cabs` — List all cabs
- `POST /api/admin/cabs` — Create cab
- `GET /api/admin/cabs/:id` — Get single cab
- `PUT /api/admin/cabs/:id` — Update cab
- `DELETE /api/admin/cabs/:id` — Delete (soft deactivate) cab
- `PATCH /api/admin/cabs/:id/status` — Update cab status
- `PATCH /api/admin/cabs/:id/featured` — Toggle featured flag
- `GET /api/admin/cabs/amenities` — List active amenities

---

## 3. Admin Workflow

1. Navigate to `/admin/cabs`.
2. Use **Add New Cab** to create a vehicle.
3. Configure vehicle name, type, destination, fuel type, seating/luggage capacity, and AC.
4. Set pricing: base fare, extra KM charge, night charge, driver allowance, and starting price.
5. Select available trip types (local, airport, outstation, one-way, round trip, multi-day).
6. Select vehicle features/amenities and provide gallery image URLs.
7. Toggle featured and status (Active / Draft / Inactive).

---

## 4. Inquiry Workflow

1. Customers open a cab detail page (`/cabs/:slug`).
2. Fill in the **Get Instant Quote** form (trip type, name, email, phone, pickup/drop, travel dates, passengers, message).
3. Inquiry is stored via `POST /api/cabs/:id/inquiry`.
4. GoYatrio team contacts the customer with availability and exclusive rates.
5. Inquiry status flow: `NEW ? CONTACTED ? CLOSED`.

No payment gateway. No online booking engine.

---

## 5. Public Pages

- `/cabs` — Cab listing page with search, filters (vehicle type, trip type, destination), sorting, and pagination.
- `/cabs/[slug]` — Cab detail page with gallery, specs, pricing, trip types, features, destination/package links, inquiry form, and related cabs.
