# GoYatrio — Media Library & Cloudinary Integration Documentation

## 1. Architecture

The Media Library is the single source of truth for all reusable assets (images, videos, documents). Business modules (Destinations, Packages, Hotels, Cabs, Blogs, Homepage) reference assets through the `MediaLink` junction table instead of hardcoding Cloudinary URLs.

Asset files live in **Cloudinary**; metadata (public_id, URLs, dimensions, size, tags, folder, usage) lives in **PostgreSQL**.

**Priority (resolver):**
1. `MediaLink ? Media` records
2. Legacy URL fields (`featuredImage`, `galleryImages`, `image`, `HotelImage.imageUrl`)

## 2. Media Model

| Field | Type | Notes |
| --- | --- | --- |
| `id` | cuid | PK |
| `publicId` | unique | Cloudinary public_id |
| `url` / `secureUrl` | String | Delivery URLs |
| `resourceType` | Enum `IMAGE | VIDEO | RAW` | |
| `mimeType` | String? | MIME validation record |
| `format` | String? | jpg / png / mp4 / pdf… |
| `folder` | String? | `goyatrio/<module>/<yyyy>/<mm>` |
| `fileName` | String? | Original file name |
| `width` / `height` | Int? | Image dimensions |
| `size` | BigInt? | Bytes |
| `durationSeconds` | Float? | Videos |
| `altText` / `caption` | String? | Accessibility + caption |
| `tags` | String[] | Search/filter tags |
| `metadata` | Json? | Cloudinary derived info |
| `createdBy` | String? | Admin user id |
| `status` | Enum `ACTIVE | ARCHIVED` | |
| `usageCount` | Int | Active link count |
| `deletedAt` | DateTime? | Soft delete |

## 3. MediaLink Model

```prisma
model MediaLink {
  id        String          @id @default(cuid())
  mediaId   String
  module    MediaModule     // DESTINATION | PACKAGE | HOTEL | CAB | BLOG | HOMEPAGE
  moduleId  String
  role      MediaLinkRole   // FEATURED | GALLERY | VIDEO | DOCUMENT
  sortOrder Int             @default(0)
  media     Media           @relation(...)
}
```

Unique per `(mediaId, module, moduleId, role)`; indexed by `(module, moduleId)` and `(mediaId)`.

## 4. Upload Flow

1. Admin picks file (drag & drop or browse) in the Media Library.
2. Client sends `{ fileName, mimeType, dataUri, folder }` to `POST /api/admin/media/upload`.
3. Server validates MIME + size, uploads via Cloudinary `upload_stream`.
4. Creates a `Media` row; returns the record.

## 5. Replace Flow

`PUT /api/admin/media/:id/replace` re-uploads to the same `publicId` (overwrite) and updates `url`, `secureUrl`, `format`, `width`, `height`, `size`, `durationSeconds`.

## 6. Delete Flow

`DELETE /api/admin/media/:id` calls Cloudinary `destroy` (with correct `resource_type`) then soft-deletes the row (`deletedAt`, `status = ARCHIVED`).

## 7. MediaPicker

`apps/web/components/media/media-picker.tsx` — modal with search, resource-type filter, role select, thumbnail grid; returns `{ mediaId, role, sortOrder }`.
`apps/web/components/media/media-link-panel.tsx` — reusable attach/detach panel used in Destination, Package, Hotel, Cab, and Blog admin forms.

## 8. Resolver Priority

- `getMediaForModule(module, moduleId)` ? `{ featuredMedia, galleryMedia }`
- `getFeaturedMedia(module, moduleId)` ? featured asset
- `getGalleryMedia(module, moduleId)` ? ordered gallery assets
- `attachMediaToItems(module, items)` ? batch attach for list endpoints
- Missing/deleted/archived links are skipped; empty results return `null`/`[]` (never throws).

## 9. Cloudinary Integration

- Server-side SDK (`apps/api/src/utils/cloudinary.ts`) — upload, destroy, replace, signature.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` required in production (no placeholders).
- Signed uploads; secrets never exposed client-side.
- Transformation/URL building centralized (blog renderer + resolver).

## 10. Public API Usage

Every public list/detail endpoint returns `featuredMedia` + `galleryMedia` while preserving legacy `featuredImage`/`galleryImages`:

- `GET /api/destinations`, `/api/packages`, `/api/hotels`, `/api/cabs`, `/api/blogs` (+ detail variants)

## 11. Admin Workflow

1. `/admin/media` — upload, search, filter, preview, copy URL, replace, delete.
2. `/admin/<module>` forms — attach assets via the Media Library picker (role + sort order).
3. Attach/detach updates `usageCount` automatically (recalculation helper).
