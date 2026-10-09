# Design Tokens

## Colors — Bone + copper

Light zone (site canvas between header/hero and footer):

--bg-deep: #EEEAE3   (site canvas, section backgrounds, first stacked card)
--bg: #EEEAE3        (alias of canvas; do not use for text on accent — use --on-accent)
--bg-soft: #DCD4C7   (second stacked card / muted sand fills)
--surface: #F9F7F3   (raised panels: Approach cards, booking panels, inputs, chips)
--bg-elev: #F9F7F3   (legacy alias of --surface)
--ink: #1B1815
--ink-muted: #5F574D
--ink-faint: #7A7166 (decorative labels only, never essential text)
--line: rgba(27, 24, 21, 0.14)
--accent: #E0803C    (fills only: buttons, selected chips, badges, footer square, icon rings)
--accent-hover: #D0722F
--on-accent: #1B1815 (text/icons on accent fills)
--accent-ink: #A3501A (accent-colored text or thin icon strokes on light backgrounds)

Dark zone (header, hero overlay, footer only):

--dark-bg: #1B1815
--dark-ink: #EEEAE3
--dark-muted: #A79F94
--dark-line: rgba(238, 234, 227, 0.14)
--dark-surface-2: #3A3631   (disabled controls on dark panels)
--accent-on-dark: #F0A56B    (copper text/tags on dark surfaces)

Legacy aliases (retinted; keep names for existing consumers):

--accent-soft: rgba(224, 128, 60, 0.14)
--accent-text: #A3501A   (alias of --accent-ink)
--accent-glow: rgba(224, 128, 60, 0.09)
--accent-glow-soft: rgba(224, 128, 60, 0.12)
--sage: #7c9686
--surface-hover: color-mix(in srgb, var(--ink) 4%, var(--surface))

Rules:
- Accent is a fill color only. Text on accent uses --on-accent.
- Never use --accent as small text on light backgrounds; use --accent-ink.
- Shadows use rgba(27, 24, 21, …), not pure black.
- `color-scheme: light` on the document; theme-color meta is #1B1815.

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
