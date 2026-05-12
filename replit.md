# FORM. — Operational Intelligence

## Project Overview
A multi-page cinematic website for FORM., an AI-augmented operational intelligence company. Built with vanilla HTML/CSS/JS using atmospheric backgrounds, SVG logos, restrained motion systems, and a film-grain overlay system.

The site is not a traditional marketing website. It is a cinematic operational ecosystem. The experience must feel intentional, restrained, architectural, human, intelligent, emotionally mature, and structurally precise. The core emotional objective is **confidence through restraint**.

Every page must feel emotionally distinct but share the same ecosystem DNA. Avoid identical hero layouts, atmospheric systems, section structures, pacing, panel systems, compositions, grid behavior, or motion patterns across pages.

## Locked Doctrine (DO NOT VIOLATE)

### Naming System (LOCKED)
- All public-facing ecosystem entities use the `form. {name}` lowercase prefix with trailing period.
- The ten canonical ecosystem entities are organized into three operational tiers:
  - **Disciplines** (column 1): `form. strategy`, `form. digital`, `form. creative`, `form. sound`, `form. experience`, `form. ai`
  - **Labs + sub-products** (column 2): `form. labs` (parent) → `RELAY`, `FRAME`, `AXIS` (uppercase, no `form.` prefix)
  - **Connective layers** (column 3): `form. continuum`, `form. messages`, `form. support`
- `RELAY`, `FRAME`, and `AXIS` always render uppercase, no descriptions, mono tracking. They are sub-products of `form. labs`, not standalone entities.
- Deprecated transitional terminology (do **not** use in any new public-facing copy): `business systems`, `ministry systems`, `creative systems`, `executive systems`, `intelligence systems`, `experience systems`. Treat these as internal-only legacy language.

### Typography (LOCKED)
- **Primary typeface — Satoshi**: headers, body, UI, navigation, ecosystem labels, operational language.
- **Editorial typeface — Cormorant Garamond italic** (Canela substitute): used very sparingly (5–10% max of visible typography) for emotional punctuation only. Examples: `form.`, `humanity`, `the future needs form.`, `what's next.`. Never paragraph copy.
- **Mono — IBM Plex Mono**: metadata, indices, system labels, infrastructure annotations, micro-labels.
- **Casing**: lowercase typography for headers, navigation, section titles, product names, ecosystem labels, footer categories, operational labels. Uppercase ONLY for metadata, micro-labels, indexing systems (`[ 01 ]`, `OPERATIONAL SYSTEMS`). Uppercase must remain minimal with increased tracking and never dominate layouts.

### Layout & Spacing (LOCKED)
- Default alignment: **left aligned**. Centered alignment only for intentional emotional hero moments.
- Generous vertical rhythm, intentional whitespace, cinematic pacing, controlled density. Never cramped, never startup-style UI clutter.

### Color (LOCKED)
- Background: deep atmospheric near-black, never flat black. Subtle Infrastructure Blue diffusion, Cognitive Violet atmosphere, soft signal gradients.
- Primary text: soft white (`#F2F2F0`), never pure white. Secondary text: muted gray.
- Accent: **Signal Green `#39FF14` only**. No random greens, no neon lime, no trendy gradients. Signal Green is identity infrastructure — use intentionally.
- Color tokens defined in `tokens/colors.css`: `--ac` (Signal Green), `--ib` (Infrastructure Blue `#2962FF`), `--cv` (Cognitive Violet `#8B5CF6`), `--rose` (`#9B4DFF`), `--amber` (`#FF8A00`), `--stone` (`#F2F2F0`), `--onyx` (`#050608`).

### Motion (LOCKED)
- Slow, calm, intentional, cinematic, premium. No aggressive transitions, no excessive parallax, no flashy animations, no startup-style interaction patterns.

### Atmosphere (LOCKED)
- Subtle topology systems, atmospheric gradients, signal particles, orbital structures, cinematic grain, volumetric diffusion. Always secondary to typography and clarity. Never overwhelm readability.

### Navigation (LOCKED)
Final top-nav structure across every page:
```
home   vision   standards   founder   ecosystem   contact   ● start the conversation
```
- All navigation labels are lowercase **without** trailing periods. Trailing periods are reserved for editorial copy and the `form.` brand mark itself.
- `ecosystem` is the only nav item with a dropdown — a three-column glass panel (disciplines / labs+products / connective layers) per the Naming System.

### CTA (LOCKED)
- **Site-wide CTA**: All CTAs use the exact phrase **`start the conversation`** prefixed with a small Signal Green dot (`●`). Typography: Satoshi Medium, lowercase, minimal styling, architectural restraint.
- **Homepage hero exception**: The cinematic homepage hero uses **`ENTER FORM →`** as its single CTA — IBM Plex Mono uppercase, signal-green outline rectangle. This is the only page that uses this CTA. The top-nav CTA on the homepage stays `● start the conversation`.
- Never use: `strategy call`, `consultation`, `book a call`, `schedule a consultation`.

### Per-Page Emotional Architecture
- `vision.` — philosophical, immersive, future-facing, vast, cinematic. Large atmospheric environments, deep negative space, slow topology movement.
- `standards.` — structured, disciplined, architectural, operational, human. Less atmosphere, more grid systems, more line systems, more operational rhythm. Combines former core values + core principles.
- `founder.` — human, reflective, warm, cinematic, intimate. Less infrastructure-heavy, more texture and emotional pacing. Not a résumé.
- `ecosystem.` — connected, modular, adaptive, alive, systemic. Each of the nine `form. {entity}` layers should feel visually distinct with its own atmosphere, motion behavior, and pacing.

### Future: Rev. Intelligence Layer
Planned integrated AI layer named `rev.` — operational intelligence, not a chatbot. Calm, clear, infrastructural. Avoid floating chat bubbles, customer-support aesthetics, neon AI gimmicks. Possible patterns: intelligence dock, signal interface, command palette, adaptive sidebar, ambient prompt layer.

## Production Pages
- `index.html` — Cinematic single-viewport hero (no scroll content). `form` wordmark + signal-green square dot, two-line tagline, `ENTER FORM →` CTA leading to `vision.html`.
- `vision.html` — Cinematic 7-section operational doctrine (philosophical entry point)
- `standards.html` — Combined values + principles operational standards page
- `founder.html` — Human reflective founder narrative
- `ecosystem.html` — Connected ecosystem map (10 entities + 3 labs sub-products)
- `contact.html` — `start the conversation` intake page

## Environmental Continuity System
- `field.css` + `field.js` — shared environmental engine (oceanic ribbons + sparse drifting particle layer + slow breathing background). One continuous cinematic world inherited by every page.
- Density tuning per page via `body[data-field-density="..."]`: `open` (home), `concentrated` (vision), `structured` (standards), `intimate` (founder), `expanded` (ecosystem), `calm` (contact). Same DNA, different emotional state.
- Site uses **page-to-page navigation** (not single-scroll). Each page is its own load with cinematic transition overlay handled by `nav-footer.js`.

### Deprecated / Pending Removal
The five legacy `*-systems.html` pages (`business-systems`, `intelligence-systems`, `creative-systems`, `executive-systems`, `ministry-systems`) are deprecated and slated for deletion once `ecosystem.html` is rebuilt around the nine `form.` entities. Do not link to them from any new public-facing nav, footer, or copy.

## Key Assets
- `home-bg.avif` — Cinematic environmental field for the homepage (oceanic neural ribbons over deep dark space). Static base layer beneath `field.js` particle drift.
- `bg.avif` — Legacy atmospheric background still used by interior pages (vision, standards, founder, ecosystem, contact) until each is migrated to the shared `env-field` system.
- `grain.svg` — Shared film-grain overlay loaded by all production pages via `<img src="/grain.svg">`
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
- All locked doctrine sections above must be obeyed in every new page, edit, and component
