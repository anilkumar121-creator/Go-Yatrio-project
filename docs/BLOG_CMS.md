# Phase 12: Blog CMS Documentation

## Overview

The **GoYatrio Blog CMS** powers travel content marketing with first-class SEO, structured data, multi-author support, destination/package integration, lead generation, and future AI-generated content.

---

## 1. Database Schema

### Models
- `Blog` — Article record with title, slug, excerpt, content, block-based content (`contentBlocks` JSON), FAQ JSON, featured image, status, featured flag, view count, reading time, and SEO fields.
- `BlogAuthor` — Author profile (name, slug, bio, avatar, role, email).
- `BlogCategory` — Content categories (destination guides, travel tips, packages, experiences).
- `BlogTag` — Lightweight article tags.

### Enums
- `BlogStatus`: `DRAFT`, `PUBLISHED`, `ARCHIVED`
- `BlogContentFormat`: `PLAIN_TEXT`, `MARKDOWN`, `HTML`, `JSON_BLOCKS`

### Relations
- `BlogAuthor 1—N Blog` (optional `authorId`)
- `Blog M—N BlogCategory` (`_BlogToBlogCategory`)
- `Blog M—N BlogTag` (`_BlogToBlogTag`)
- `Blog M—N Destination` (`_BlogToDestination`)
- `Blog M—N TourPackage` (`_BlogToTourPackage`)

### Content & Future Editors
- `contentBlocks` stores a JSON array of editor-agnostic blocks (paragraph, heading, image, gallery, list, quote, code, embed, divider, CTA, callout, accordion, linkCard).
- Images support `url` or Cloudinary `publicId` (resolved at render via `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`).
- TipTap / EditorJS / Lexical can be adopted later via pure adapter functions — no schema changes required.
- Unknown block types are preserved and skipped gracefully at render.

---

## 2. APIs

### Public
- `GET /api/blogs` — List published blogs (search, category, tag, destination, package filters, sort, pagination)
- `GET /api/blogs/featured` — Featured blogs
- `GET /api/blogs/categories` — Blog categories
- `GET /api/blogs/tags` — Blog tags
- `GET /api/blogs/authors` — Blog authors
- `GET /api/blogs/:slug` — Published blog detail
- `GET /api/blogs/:slug/related` — Related published blogs
- `POST /api/blogs/:slug/view` — Increment view count

### Admin
- `GET/POST /api/admin/blogs`, `GET/PUT/DELETE /api/admin/blogs/:id`
- `PATCH /api/admin/blogs/:id/status`, `PATCH /api/admin/blogs/:id/featured`
- `POST/PUT/DELETE /api/admin/blogs/categories[/:id]`
- `POST/PUT/DELETE /api/admin/blogs/tags[/:id]`
- `POST/PUT/DELETE /api/admin/blogs/authors[/:id]`

---

## 3. Admin Workflow

1. Navigate to `/admin/blogs`.
2. Use **Write New Blog** to create an article.
3. Set title, slug, author, status, publish date, excerpt, body, and optional JSON content blocks.
4. Link categories, tags, destinations, and tour packages.
5. Configure SEO metadata (title, description, canonical, OpenGraph image).
6. Toggle featured; publish/draft/archive via status.

---

## 4. SEO & Structured Data

- Server-rendered `generateMetadata`: title, description, canonical, OpenGraph (`article`).
- `Article` JSON-LD schema.
- `FAQPage` JSON-LD schema from the `faq` field.
- `BreadcrumbList` JSON-LD schema.
- Dynamic sitemap includes `/blogs` and every published blog URL.

---

## 5. Lead Generation

Blog detail pages render a CTA block linking to:
- Enquire Now (`/inquiry`)
- Book Hotel (`/hotels?destination=slug`)
- Book Cab (`/cabs?destination=slug`)
- View Packages (`/packages?destination=slug`)

---

## 6. Analytics

- `viewCount` incremented on every public view.
- `readingTimeMinutes` estimated from content length.
- `featured` flag supports editorial curation.

---

## 7. Migration & Seeding

- Non-destructive migration `20260816000003_phase12_blog_cms` extends the existing `blogs` table and creates the new author/category/tag tables plus join tables.
- Seed creates authors, categories, tags, 7 published + 1 draft article, linked to destinations and packages.
