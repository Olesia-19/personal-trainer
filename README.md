# ELITE — Personal Training

A premium one-page landing site for a personal trainer, built with Next.js and scroll-driven GSAP animation.

> **Concept demo.** ELITE is not a real trainer or business, and all content is fictional.
> The booking form is client-side only: it updates local UI state and does not send data anywhere.

**Live demo:** https://personal-trainer-jet-omega.vercel.app

## Tech stack

| Tool | Version |
| --- | --- |
| [Next.js](https://nextjs.org) (App Router) | 16.2.4 |
| React / React DOM | 19.2.4 |
| TypeScript | ^5 |
| CSS Modules + global CSS custom properties | — |
| [GSAP](https://gsap.com) + ScrollTrigger | ^3.15.0 |
| React Compiler (`babel-plugin-react-compiler`, `reactCompiler: true`) | 1.0.0 |
| ESLint (`eslint-config-next`) | ^9 / 16.2.4 |

Fonts (Instrument Sans and Inter) are loaded with `next/font/google`.

## Getting started

Requires Node.js and npm.

```bash
npm install       # install dependencies
npm run dev       # dev server at http://localhost:3000
npm run build     # production build (also runs the type check)
npm run start     # serve the production build
npm run lint      # ESLint
```

## Project structure

```
app/         Root layout (fonts, metadata), the page, global tokens (globals.css)
components/  One folder per section: navbar, hero, stat-strip, approach,
             training-experiences, booking-section, footer
             (each with Component.tsx + Component.module.css)
hooks/       Shared hooks: useHeaderReveal (section header fade-in),
             useFocusTrap (menu / modal focus handling)
styles/      primitives.css: global classes (container, eyebrow, btn, card, badge…)
docs/        design-tokens.md: the design system reference
public/      Favicons and the hero video (public/videos/hero-barbell.mp4)
```

The page renders the sections in order: Navbar → Hero → StatStrip → Approach → TrainingExperiences → BookingSection → Footer.

## Design system

Colors, typography, spacing, radius and motion rules are documented in [`docs/design-tokens.md`](docs/design-tokens.md). Tokens are defined once in `app/globals.css` under `:root` and consumed in CSS Modules through `var(--token)`. No Tailwind.

## Notes

- **Media:** the hero video is served locally from `public/videos`. The Training Experiences card videos and their poster frames are hosted on Cloudinary.
- **Animation:** Hero, Approach and Training Experiences use pinned, scrubbed GSAP ScrollTrigger timelines, enabled only on suitable viewports.
- **Accessibility:**
  - `prefers-reduced-motion: reduce` disables the scroll animations and falls back to a static layout; CSS transitions are reduced as well.
  - The mobile menu and the booking modal trap focus, close on Escape, and move focus back into the page when closed. After a booking submit, focus moves to the success message.
  - Visible `:focus-visible` styles on interactive elements; semantic sections labelled by their headings; decorative elements hidden from assistive technology.
