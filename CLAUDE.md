# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Project rules live in @AGENTS.md and the design system in @docs/design-tokens.md — both are binding (no Tailwind, functional arrow-function components, mobile-first, read the tokens before styling anything, explain what you generate).

## Commands

- `npm run dev` — dev server (Next.js 16, http://localhost:3000)
- `npm run build` — production build (also the type check; there is no separate `tsc` script)
- `npm run lint` — ESLint 9 flat config (`eslint-config-next`)

There is no test suite.

## Architecture

Single-page marketing site (concept demo, fictional content). `app/page.tsx` composes full-width sections from `components/<section>/` in order: Navbar → Hero → StatStrip → Approach → TrainingExperiences → BookingSection → Footer. No API routes or backend — the booking form only toggles a local "submitted" state.

### Styling layers

1. **Tokens** — every CSS custom property is defined once in `app/globals.css` `:root`. CSS Modules consume `var(--token)` and must never redeclare token names.
2. **Global primitives** — `styles/primitives.css` is `@import`ed by `globals.css`, so its classes (`container`, `eyebrow`, `sectionHeader`, `sectionTitle`, `sectionLead`, `btn`, `card`, `badge`, …) are used as **plain global class strings**, often combined with module classes: ``className={`container ${styles.container}`}``.
3. **CSS Modules** — one `Component.module.css` beside each component for section-specific styles.

Fonts are loaded in `app/layout.tsx` via `next/font` and exposed as CSS variables (`--font-display`, `--font-inter`), which tokens alias to `--font-heading` / `--font-sans`.

### Scroll animation (GSAP + ScrollTrigger)

Hero, Approach and TrainingExperiences run pinned/scrubbed scroll timelines; these are the most intricate files. Shared conventions:

- Client components (`"use client"`) that register `ScrollTrigger` at module level and build animations inside `useEffect` with `gsap.context(...)` + `gsap.matchMedia()`, reverting the context on cleanup.
- Motion is gated by media queries that always include `prefers-reduced-motion: no-preference`; reduced-motion and short/narrow viewports get a static layout. CSS modules mirror the same breakpoints in `@media` blocks, so changing a breakpoint means updating **both** the TSX `mm.add` query and the module CSS.
- Layout-affecting async events (`document.fonts.ready`, video `loadedmetadata`, resize) call `ScrollTrigger.refresh()`.
- Tuning values are named constants at the top of each component (e.g. `ZOOM_START`, `CARD_GAP`, `COVER_SCALE`).
- `hooks/useHeaderReveal.ts` is the shared section-header fade-in (eyebrow / heading / lead refs). Its `MOTION_MEDIA` intentionally duplicates TrainingExperiences' gates — keep them in sync.

### Media

- Hero video is local: `public/videos/hero-barbell.mp4`.
- TrainingExperiences card videos and posters are Cloudinary URLs (constants at the top of the file; posters use the `so_0` frame transform).

### Hydration

Date-dependent UI (BookingSection's next 5 days, starting tomorrow) must not render on the server, to avoid a server/client mismatch. BookingSection gets an `isClient` flag from `useSyncExternalStore` (server snapshot `false`, client `true`) and derives the days with `useMemo` from it. Follow the same pattern for anything depending on the current time or `window`. Don't call `setState` synchronously in `useEffect`, because lint rejects it (`react-hooks/set-state-in-effect`).

`next.config.ts` enables the React Compiler (`reactCompiler: true`), so manual `useMemo`/`useCallback` is usually unnecessary.

Path alias: `@/*` → repo root (e.g. `@/components/hero/Hero`).

Do not add Co-Authored-By lines to commit messages.
