# Technology Documentation

## Frontend

The frontend uses Next.js 15 App Router with React 19 and TypeScript. Styling is configured through Tailwind CSS 4 and CSS design tokens in `apps/web/app/globals.css`.

Shadcn UI conventions are prepared through `apps/web/components.json`. Components are intentionally lightweight foundation components, ready to be replaced or expanded through Shadcn patterns.

Framer Motion is used only for subtle page transition foundations. Lucide React is configured for interface icons.

## Backend

The backend uses Express.js with TypeScript, Helmet, CORS, and JSON parsing. It exposes only a health route.

## Database

`packages/database` is Prisma-ready for a future Supabase PostgreSQL schema. No Prisma schema or data model is included in this foundation phase.

## Storage

Cloudinary environment variables are reserved in `.env.example`; no storage implementation is included yet.

## Authentication

Supabase Auth is planned for a later phase. No auth implementation exists in this foundation.
