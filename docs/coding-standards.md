# Coding Standards

## TypeScript

- Use strict TypeScript.
- Prefer explicit public types for shared package exports.
- Keep business-specific types out of shared packages until the feature exists.

## React

- Use server components by default in the Next.js app.
- Mark client components with `"use client"` only when interactivity is required.
- Keep reusable components accessible and keyboard friendly.

## Styling

- Use the global design tokens in `apps/web/app/globals.css`.
- Follow the 8px spacing grid.
- Use a maximum card radius of `8px` unless a future design system changes it.
- Use Lucide icons for icon buttons.

## Accessibility

- Provide semantic landmarks.
- Preserve visible focus states.
- Use ARIA labels for icon-only controls.
- Keep loading states screen-reader friendly.

## Scope Discipline

This phase must not add booking logic, packages, destinations, hotels, cabs, authentication, database schema, or admin workflows.
