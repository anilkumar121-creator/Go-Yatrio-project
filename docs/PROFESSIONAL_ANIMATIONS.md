# GoYatrio — Professional Animations System (Phase 19)

## 1. Architecture & Motion Philosophy

GoYatrio's animation architecture provides a modern, premium, travel-oriented user experience while maintaining strict performance, accessibility, and architectural standards:

- **Zero Business Logic Coupling**: Compliant with the Permanent Admin Editable Architecture Rule. Animations strictly operate on UI structural containers and wrap database-driven content.
- **Client/Server Boundary Preservation**: Data fetching pages remain React Server Components (RSC) with ISR and caching fully intact. Animation wrappers (`FadeIn`, `FadeUp`, `StaggerContainer`, `HeroContentMotion`) serve as lightweight client leaves.
- **GPU-First Transformations**: All animations prioritize `opacity` and GPU-accelerated 2D/3D transforms (`translateY`, `scale`, `transform: translateZ(0)`), completely avoiding layout shifts or heavy CPU recalculations.
- **Reduced-Motion by Default**: Built-in integration with `useReducedMotion()` from Framer Motion and `@media (prefers-reduced-motion: reduce)` in CSS ensures that users requesting reduced motion experience instant state changes and zero disorienting movement.

---

## 2. Motion Design Tokens & Easing Curves

Defined in `apps/web/components/animation/motion.tsx`:

- **Fast Duration (`DURATION_FAST`)**: `0.2s` (used for micro-interactions, buttons, icons).
- **Normal Duration (`DURATION_NORMAL`)**: `0.35s` (used for card reveals, modals, dropdowns).
- **Slow Duration (`DURATION_SLOW`)**: `0.5s` (used for section entrances, hero reveals).
- **Primary Ease Curve (`EASE_OUT`)**: `cubic-bezier(0.22, 1, 0.36, 1)` — delivers a responsive, natural decelerating spring-like feel.
- **Smooth Ease Curve (`EASE_SMOOTH`)**: `cubic-bezier(0.16, 1, 0.3, 1)` — provides ultra-smooth entry for large sections.

---

## 3. Reusable Motion Components

### `FadeIn`

Gently animates opacity from 0 to 1 as the element enters the viewport with `viewport={{ once: true, margin: "-40px" }}`.

### `FadeUp`

Subtle upward translation (`16px` -> `0px`) combined with opacity fade-in. When reduced motion is requested, vertical translation defaults to `0px`.

### `FadeDown`

Subtle downward entrance (`-16px` -> `0px`) with opacity fade.

### `ScaleIn`

Gently expands elements from `0.96` to `1.0` scale.

### `StaggerContainer` & `StaggerItem`

Orchestrates sequential child reveals across grids with a standard `0.08s` stagger interval. Only triggers once when entering the viewport.

### `AnimatedSection`

Wraps major page sections with a smooth `0.5s` upward reveal as users scroll down the page.

### `HoverLift`

Client wrapper applying GPU-accelerated `translateY(-4px)` on hover with instant reset on mouse leave.

---

## 4. Enhanced Application Surfaces

### Global Page Transitions (`apps/web/components/layout/page-transition.tsx`)

- Keyed to the Next.js `usePathname()`.
- Subtle non-blocking fade and 6px slide up (`duration: 0.22s`).
- Does not block route hydration or delay client navigation.

### Hero Section (`apps/web/components/sections/hero.tsx` & `hero-motion.tsx`)

- Orchestrated staggered entrance for:
  1. Eyebrow category badge
  2. Hero headline
  3. Subtitle description
  4. Action CTAs with subtle hover scale (`scale-[1.02]`)
- Background hero image features a smooth 700ms ease-out reveal.

### Mobile Navigation Drawer (`apps/web/components/layout/navbar.tsx`)

- Integrated `AnimatePresence` for smooth accordion-like slide-down and collapse.
- Staggered entrance for mobile navigation links (`idx * 0.04s`).
- Fully accessible with keyboard `Escape` dismiss and ARIA controls.

### Reusable Cards (`apps/web/components/cards/`)

- `PackageCard`, `DestinationCard`, `HotelCard`, `CabCard`, `BlogCard`:
  - Equipped with `.hover-lift` (`translateY(-4px)` with shadow elevation).
  - Internal `.image-zoom` with `scale(1.04)` on media container.
  - Interactive CTA arrow slide (`translate-x-1` on hover).

### Public Listing Pages

- `packages/page.tsx`, `destinations/page.tsx`, `itineraries/page.tsx`, `hotels/page.tsx`, `cabs/page.tsx`, `blogs/page.tsx`:
  - Grid containers wrapped in `StaggerContainer`.
  - Individual cards wrapped in `StaggerItem` for unified scroll-reveal entry.

---

## 5. Reduced-Motion Implementation

1. **JavaScript / Framer Motion**:
   Every motion component queries `useReducedMotion()`. If `true`, all movement (`x`, `y`, `scale`) is set to `0` / `1` and durations are collapsed to `0s`.
2. **CSS Level**:
   `apps/web/app/globals.css` declares global media overrides:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *,
     *::before,
     *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
   }
   ```

---

## 6. Performance & SEO Verification

- **Bundle Footprint**: Shared first-load JS remains at **102 kB** across all routes.
- **Tree-Shaking**: Framer Motion imports are isolated to lightweight client components and optimized via Next.js `optimizePackageImports`.
- **SEO & SSR Integrity**: HTML output contains complete semantic metadata, JSON-LD schemas, and SSR markup before client animation hydration.
