# Folder Structure

```text
apps/
  web/                  Next.js 15 App Router application
  api/                  Express.js TypeScript API foundation
packages/
  ui/                   Shared UI tokens and future primitives
  types/                Shared TypeScript types
  config/               Shared brand and breakpoint config
  utils/                Shared utility functions
  database/             Prisma-ready database package without schema
docs/                   Project documentation
public/                 Reserved root-level public assets
scripts/                Project automation scripts
.github/workflows/      CI workflows
```

## Web App

`apps/web/app` contains the App Router layout, routes, loading state, error pages, metadata, robots, sitemap, and manifest.

`apps/web/components` contains empty reusable foundation components. These are safe starting points for future business features.

`apps/web/public/brand` contains the original GoYatrio logo assets.

## API App

`apps/api/src` contains the Express app factory, server entry, routes, and middleware. Only a health endpoint is included.

## Packages

Shared packages define clear future ownership boundaries without adding business logic before it is needed.
