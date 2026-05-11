# FORM. — Operational Intelligence

## Project Overview
A multi-page cinematic website for FORM., an AI-augmented operational intelligence company. Built with vanilla HTML/CSS/JS using atmospheric AVIF backgrounds, SVG logos, canvas-based neural network animations, and a film-grain overlay system.

## Production Pages
- `index.html` — Hero landing page with ecosystem canvas
- `about.html` — About FORM.
- `ecosystem.html` — Five-system ecosystem overview
- `business-systems.html` — Business Systems product page
- `executive-systems.html` — Executive & Operations Systems
- `intelligence-systems.html` — Intelligence Systems
- `creative-systems.html` — Creative Systems
- `ministry-systems.html` — Ministry Systems

## Key Assets
- `bg.avif` — Primary atmospheric background (73KB, 2528×1696, re-encoded at CRF 35)
- `grain.svg` — Shared film-grain overlay loaded by all 8 production pages via `<img src="/grain.svg">`
- `logo-editorial-2.svg` — Primary nav/sidebar logo
- `logo-core-final-2.svg` — Hero ecosystem identity mark
- `logo-lockup-black.svg`, `tagline-black.svg` — Brand lockup assets

## attached_assets/ — Source-Only Folder
All files inside `attached_assets/` are **source/reference assets only** — uploaded images, doctrine docs, and reference media used during design and development. **None of these files are referenced in any production HTML.** They should not be served in production and can be excluded from deployment bundles.

## User Preferences
- Cinematic visual quality is paramount — never degrade opacity, color grading, or blend modes
- No emojis in code or UI
- Inline CSS preferred for per-page style isolation
- All canvas, grain, glow, and orbital systems are JS/CSS-only (no external file weight)
