# Phase 9: Dynamic Itinerary Builder Documentation

## Overview

The **Dynamic Itinerary Builder** enables GoYatrio administrators to build, customize, and manage multi-day tour itineraries linked to tour packages. Each itinerary supports day-by-day scheduling, activity management, hotel accommodation details, meal inclusions, transfer info, and custom day notes.

---

## 1. Database Schema

Phase 9 introduces three interconnected Prisma models:

```prisma
model Itinerary {
  id          String         @id @default(cuid())
  packageId   String
  title       String
  slug        String         @unique
  description String?
  isDefault   Boolean        @default(true)
  isActive    Boolean        @default(true)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  package     TourPackage    @relation(fields: [packageId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  days        ItineraryDay[]

  @@index([packageId])
  @@map("itineraries")
}

model ItineraryDay {
  id          String        @id @default(cuid())
  itineraryId String
  dayNumber   Int
  sortOrder   Int           @default(0)
  title       String
  description String
  city        String?
  hotel       String?
  meals       String?
  transfers   String?
  notes       String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  itinerary   Itinerary     @relation(fields: [itineraryId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  activities  DayActivity[]

  @@unique([itineraryId, dayNumber])
  @@index([itineraryId])
  @@map("itinerary_days")
}

model DayActivity {
  id          String       @id @default(cuid())
  dayId       String
  title       String
  description String?
  location    String?
  timing      String?
  sortOrder   Int          @default(0)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  day         ItineraryDay @relation(fields: [dayId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  @@index([dayId])
  @@map("day_activities")
}
```

---

## 2. API Routes

### Public Routes
- `GET /api/itineraries` — List published itineraries (supports optional `packageId`, `take`, `skip` query params)
- `GET /api/itineraries/:id` — Retrieve single itinerary by `id` or `slug` with full day timeline and activities

### Admin Routes (Protected - Require Admin Role)
- `GET /api/admin/itineraries` — List all itineraries with admin metadata
- `GET /api/admin/itineraries/:id` — Retrieve single itinerary by ID or slug
- `POST /api/admin/itineraries` — Create new itinerary with nested days and activities
- `PUT /api/admin/itineraries/:id` — Update existing itinerary header
- `DELETE /api/admin/itineraries/:id` — Delete itinerary and associated days/activities

### Day & Activity Management Sub-routes
- `POST /api/admin/itineraries/:id/days` — Add day to itinerary
- `PUT /api/admin/itineraries/days/:dayId` — Update day details
- `DELETE /api/admin/itineraries/days/:dayId` — Remove day from itinerary
- `PATCH /api/admin/itineraries/:id/reorder-days` — Reorder itinerary days
- `POST /api/admin/itineraries/days/:dayId/activities` — Add activity to a day
- `PUT /api/admin/itineraries/activities/:activityId` — Update activity
- `DELETE /api/admin/itineraries/activities/:activityId` — Remove activity

---

## 3. Admin Workflow

1. **Access Management:** Navigate to `/admin/itineraries`.
2. **Create Itinerary:** Click "Build New Itinerary" to launch the modal builder.
3. **Select Package:** Link the schedule to any existing Tour Package.
4. **Day-by-Day Configuration:**
   - Add/Remove days dynamically.
   - Reorder days up/down with automatic day number recalculation.
   - Configure title, overview description, city, hotel/stay, meals plan, transfer info, and special notes.
5. **Activity Builder:** Add multiple scheduled activities per day with timing and location tags.
6. **Save & Publish:** Set `isDefault` to true to make it the primary display schedule for the package.

---

## 4. Frontend Public Workflow

1. **Package Details Integration:** `/packages/[slug]` automatically fetches and displays the package's default itinerary with day cards, hotel stays, meal plans, vehicle transfers, and activity badges.
2. **Itineraries Listing:** `/itineraries` lists all available multi-day schedules with filters and quick highlights.
3. **Dedicated Itinerary Page:** `/itineraries/[slug]` displays a standalone full-screen day-by-day timeline view with complete details and a direct booking CTA to the parent tour package.
