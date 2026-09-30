# Design Tokens

## Colors
--bg: #0d0e10
--bg-elev: #1c1e22   (elevated panel — cards, surfaces above --bg)
--line: rgba(255,255,255,0.08)
--ink: #eef1f4          (cool off-white, was warm cream #f5f2ec)
--ink-muted: #9aa3ac    (cool grey, was warm grey #a3a09a)
--ink-faint: #6b747c    (cool grey, was warm grey #6b6863)
--accent: #6fa3c7        (cool steel blue — glows, icon strokes, large decorative use)
--accent-soft: rgba(111,163,199,0.14)
--accent-text: #a9bfcb   (desaturated cool silver-blue — for small/bold/caps
                          text: eyebrows, logo accent dot, small labels.
                          Deliberately less saturated than --accent so it
                          reads as premium/metallic rather than a bright
                          UI-blue badge color.)
--accent-glow: rgba(111,163,199,0.09)
--accent-glow-soft: rgba(111,163,199,0.12)
--sage: #7c9686

Defined once in `app/globals.css` under `:root`. Components must consume
`var(--token)` only — never redeclare these names in CSS Modules.

## Typography
Headings: 'Fraunces' (Google Fonts, weights 300–900), tight letter-spacing
Body: 'Inter', weights 400/500/600

## Radius
--radius-s: 4px · --radius-m: 10px · --radius-l: 22px (portrait/media blocks)

## Motion
- Prefer one deliberate motion per section, not scattered hover effects everywhere
- Respect prefers-reduced-motion: freeze all animation/transition durations
- Buttons: subtle magnetic cursor-follow on primary hero CTA only
