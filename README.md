# GoYatrio

GoYatrio is a travel agency platform foundation for generating inquiries and future bookings across India.

This repository currently contains only the enterprise project foundation. It intentionally does not include a homepage, package listings, destination data, authentication, database schema, admin panel, or booking workflows.

## Stack

- Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, Shadcn UI conventions
- Express.js, Node.js, TypeScript
- Prisma-ready database package for future Supabase PostgreSQL work
- Framer Motion, Lucide Icons, React Hook Form, Zod
- pnpm workspaces

## Quick Start

```bash
pnpm install
pnpm dev
```

API development:

```bash
pnpm dev:api
```

Quality checks:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Branding

The provided original PNG logo assets are stored in:

- `apps/web/public/brand/goyatrio-logo.png`
- `apps/web/public/brand/goyatrio-mark.png`
- `apps/web/public/favicons/favicon.png`

Use these assets for navbar, footer, loading, admin shell, favicon, Open Graph, email templates, and light or dark mode contexts. Do not redesign the logo.

## Current Scope

Completed foundation areas:

- Monorepo structure
- Web app shell
- API app shell
- Shared package boundaries
- Global design tokens
- Global reusable components
- SEO metadata foundation
- ESLint, Prettier, EditorConfig, Husky, lint-staged, commitlint
- CI workflow
- Documentation

Deferred future work:

- Public homepage
- Travel package content
- Booking flows
- Authentication
- Database schema
- Admin panel
- Flight and visa modules
