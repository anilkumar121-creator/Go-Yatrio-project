# Cab Booking Foundation Architecture

This document describes the final architecture and pricing rules for the GoYatrio Cab Booking system (Phase 11 Foundation).

## 1. Pricing Authority

The server holds absolute pricing authority. Client-provided fare components (`calculatedFare`, `advanceAmount`, `remainingAmount`) are completely ignored during the booking creation process. Fares are derived exclusively using a strict pricing hierarchy.

### Pricing Hierarchy

1. **Hierarchy A: Exact Route Pricing (Authoritative)**
   The system first attempts to find an exact, active `RoutePricing` match for the given `origin`, `destination`, and `categoryId`. If found, this pricing is applied.
2. **Hierarchy B: Distance-Based Fallback**
   If no exact route exists, the system relies on distance-based pricing derived from the assigned `Vehicle`'s `baseFare` and `extraKmCharge`. The `distanceKm` property must be provided to the booking request for this fallback to execute.

## 2. Server-Side Fare Calculation

Fare estimation uses the same pricing hierarchy described above. The `POST /api/cabs/calculate-fare` endpoint securely validates inputs (origin, destination, distanceKm, categoryId, tripTypeId, passengers) via Zod (`fareCalculateRequestSchema`). It returns the exact server-computed fare, preventing any client-side fare spoofing.

## 3. Payment Configuration

Advance payment percentages are NOT hard-coded. They are fetched dynamically from the `PaymentConfiguration` table (where `module="CABS"`). The active, default configuration dictates the advance percentage.

- The **advance amount** and **remaining amount** are calculated exclusively on the server (`totalFare * (advancePercent / 100)`).
- This ensures financial integrity and allows administrators to adjust payment rules instantly without code redeployment.

## 4. Booking Price Snapshot

To maintain historical accuracy, each `CabBooking` stores an immutable snapshot of pricing data at the time of creation. This is stored in the `pricingSnapshot` JSON field.
This snapshot includes:

- Original client-submitted data
- `appliedRoutePricingId` (if Hierarchy A was used)
- Vehicle's base fare and per-km charge at booking time
- Advance percentage applied

Subsequent changes to `RoutePricing` or `PaymentConfiguration` do not affect past bookings.

## 5. Lookup Architecture Integration

Business data such as "Vehicle Types" and "Trip Types" are dynamic and strictly managed by the GoYatrio `LookupGroup` and `LookupItem` system.

- `VEHICLE_TYPE`
- `CAB_TRIP_TYPE`
  These lookup groups populate both the Public Frontend Cab Search UI and the Cab Inquiry Form dynamically via the `/api/lookups` endpoints, adhering to the Permanent Admin Editable Architecture Rule. No arrays are hard-coded in React components.
