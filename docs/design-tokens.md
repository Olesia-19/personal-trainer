# Design Tokens

## Colors
--bg: #0d0e10
--bg-soft: #16181d   (mid surface — slightly lifted section beds between --bg and --bg-elev)
--bg-deep: #07080c   (deepest surface — dark section beds below --bg)
--bg-elev: #1c1e22   (elevated panel — cards, surfaces above --bg)
--line: rgba(255,255,255,0.08)
--ink: #eef1f4          (cool off-white)
--ink-muted: #9aa3ac    (cool grey)
--ink-faint: #6b747c    (cool grey)
--accent: #6fa3c7        (cool steel blue — glows, icon strokes, large decorative use)
--accent-soft: rgba(111,163,199,0.14)
--accent-text: #a9bfcb   (desaturated cool silver-blue — for small/bold/caps
                          text: logo accent dot, small labels.
                          Deliberately less saturated than --accent so it
                          reads as premium/metallic rather than a bright
                          UI-blue badge color.)
--accent-glow: rgba(111,163,199,0.09)
--accent-glow-soft: rgba(111,163,199,0.12)
--sage: #7c9686
--surface: rgba(255,255,255,0.03)
--surface-hover: rgba(255,255,255,0.06)

Defined once in `app/globals.css` under `:root`. Components must consume
`var(--token)` only — never redeclare these names in CSS Modules.

## Typography
Loaded once in `app/layout.tsx` via next/font/google:
- Headings: Instrument Sans → `--font-display` / `--font-heading`
- Body / UI: Inter → `--font-inter` / `--font-sans`

Type scale:
- --fs-h1: clamp(2.1rem, 3.4vw, 3.3rem) · weight 400 · tracking -0.035em · lh 1.05
- --fs-h2: clamp(1.7rem, 2.6vw, 2.5rem) · weight 400 · tracking -0.035em · lh 1.05
- --fs-h3: clamp(1.15rem, 1.5vw, 1.4rem) · weight 500 · tracking -0.02em · lh 1.2
- --fs-body: 1rem · --fs-lead · --fs-small (0.88rem) · --fs-label (0.78rem)

## Layout & shape
--container: 1180px · --gutter: clamp(20px, 5vw, 56px)
--section-gap: clamp(88px, 10vw, 144px)
--section-pad-y: calc(var(--section-gap) / 2)
--radius-s: 4px · --radius-m: 10px · --radius-l: 22px
--radius-pill: 999px · --radius-card: 20px
--btn-h: 3.2rem · --btn-pad-x: 1.8rem · --btn-fs: 0.98rem

Shared primitives live in `styles/primitives.css`
(`.container`, `.eyebrow`, `.btn` / `.btn-primary` / `.btn-ghost`, `.badge`, `.card`).

## Motion
- Prefer one deliberate motion per section, not scattered hover effects everywhere
- Respect prefers-reduced-motion: freeze all animation/transition durations
- Buttons: subtle magnetic cursor-follow on primary hero CTA only
