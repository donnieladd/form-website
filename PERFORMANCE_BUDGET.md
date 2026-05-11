# PERFORMANCE_BUDGET.md
## FORM. — Operational Intelligence: Performance Budgets

This document is the living performance contract for the FORM. cinematic rendering stack.
All numeric thresholds are exported from `performance-config.js` so runtime guards and
future tooling can reference a single source of truth.

**Review cadence:** Revisit any section when (a) adding a new domain environment,
(b) upgrading the particle/canvas system, (c) introducing a new backdrop-filter layer,
or (d) adding any new rAF-driven animation loop.

---

## 1. Frame Timing

| Metric | Budget | Rationale |
|---|---|---|
| Target frame time | **16.67 ms** | 60 fps — the baseline cinematic experience goal |
| Soft floor frame time | **20 ms** | ~50 fps; triggers degradation response (reduce particles, skip pulses) |
| Max JS execution per frame | **8 ms** | Leaves the remaining half-frame for GPU compositing and rasterization |

The rAF loop logs a `console.warn` (dev builds only, gated on `DEBUG_PERF = true`) when
a frame exceeds the soft floor. This never fires in production.

---

## 2. Asset & Bundle Budgets

| Asset | Budget | Rationale |
|---|---|---|
| Total page weight (HTML + inline JS + CSS) | **200 KB** | Inline-style architecture; no external JS bundles |
| AVIF background (`bg.avif`) | **150 KB** | Re-encoded at CRF 35; further compression risks visible banding |
| SVG assets per file (`grain.svg`, logos) | **40 KB** | SVGs are inline-rendered; oversized files stall the main thread |
| Web font budget (combined FOUT window) | **80 KB** | Satoshi + IBM Plex Mono subset; covers Latin glyphs only |

---

## 3. Canvas / Particle System

| Parameter | Budget | Rationale |
|---|---|---|
| Max active node count | **130** | Baseline tuned for 1440×900 viewport at ~60 fps on mid-range GPU |
| Connection radius | **160 px** | Controls O(N²) pair-check cost; wider radius degrades frame time non-linearly |
| Min speed | **0.08 px/frame** | Below this particles look frozen |
| Max speed | **0.22 px/frame** | Above this, atmospheric drift looks mechanical |
| Speed cap (absolute) | **0.38 px/frame** | Hard clamp after interaction forces |
| Max signal propagation depth | **6** | 7+ hops create long setTimeout chains that stack up |
| Max concurrent signal chains | **3** | Hard cap on simultaneously active propagation paths; prevents setTimeout accumulation under rapid interaction |
| Signal minimum interval | **4800 ms** | Prevents signal storm; firing more often stacks GPU draw calls |
| Signal check polling interval | **200 ms** | `setInterval` overhead is negligible; keeps signal system responsive |
| Max concurrent env pulses | **12** | Above this, per-frame arc draws accumulate measurably |

**Particle count clamp:** The canvas init always clamps `N` against `PERF_CONFIG.MAX_NODES`
so that increasing the constant in config is the only change needed to scale up or down.

---

## 4. GPU & Compositor Layer Budgets

| Metric | Budget | Rationale |
|---|---|---|
| Max promoted compositor layers (`will-change` / `translate3d`) | **8** | Current usage: 1 (`#bg`); each additional layer costs ~1–4 MB GPU texture |
| Max backdrop-filter blur radius | **12 px** | Higher values trigger full sub-tree repaint on WebKit |
| Max texture memory target | **64 MB** | Conservative limit for integrated GPU laptops at 1440p |

**Audit result (current):** One `will-change: transform` on `#bg`. All other animated
elements use CSS keyframes without layer promotion. Within budget.

---

## 5. Per-Domain Rendering Limits

Each domain environment may vary in atmospheric intensity. Density multipliers are applied
to `MAX_NODES` when a domain environment is active. Filter complexity tiers constrain
CSS filter chains (tier 1 = single hue-rotate; tier 2 = hue-rotate + saturate).

| Domain | Particle Density Multiplier | CSS Filter Tier |
|---|---|---|
| Intelligence | 1.00 (baseline) | 2 |
| Execution | 1.00 (baseline) | 2 |
| Creativity | 0.90 | 1 |
| Experience | 0.85 | 1 |
| Ministry | 0.80 | 1 |
| Humanity | 0.80 | 1 |

Tier definitions:
- **Tier 1** — single `hue-rotate()` only
- **Tier 2** — `hue-rotate()` + `saturate()` (max two functions)

---

## 6. Motion & Accessibility

- `prefers-reduced-motion: reduce` **must halt all rAF loops and canvas drawing entirely**
  — not just slow them down. This is enforced in JS (see `index.html` canvas block and
  cursor/parallax blocks).
- The CSS rule `animation-duration: .01ms` handles declarative animations.
- The canvas element receives no draw calls under reduced motion; the rAF is never queued.

---

## 7. Review Triggers

| Trigger | Sections to revisit |
|---|---|
| New domain environment added | §3 (particle count), §5 (per-domain limits) |
| Particle system redesign | §3 entirely |
| New backdrop-filter layer | §4 (layer budget) |
| New rAF animation loop added | §1 (frame timing), §6 (motion/accessibility) |
| New web font added | §2 (font budget) |
| AVIF re-encoded or replaced | §2 (asset budgets) |
