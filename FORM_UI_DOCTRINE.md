# FORM. UI Doctrine

The FORM. interface is **operational infrastructure**, not a HUD. It reveals, breathes, responds, guides, unfolds. It does not shout, overload, or overreact.

## Reference category
Dune. Apple cinematic product films. Tron Legacy atmosphere. Arrival. Interstellar. Luxury automotive (Porsche / Aston Martin configurators).

**Not** Iron Man HUD. Not esports. Not hacking visuals. Not game UI.

## The interface DOES
- **Reveal** — content arrives. Veil lifts. Type fades up. Particles settle.
- **Breathe** — long, gentle motion arcs (multi-second drift, slow oscillation). Nothing twitches.
- **Respond** — interaction registers, but as environmental change, not a reactive jolt.
- **Guide** — typography is the lead actor. Chrome is set design.
- **Unfold** — atmosphere first, structure second, detail last. Negative space is the canvas.

## The interface DOES NOT
- React tightly to the cursor (no repulsion fields, no dot-locked attractors).
- Pulse, blink, or flicker at attention-grabbing rates (≤ 1 Hz feels right; faster reads as alarm).
- Outline every element. Borders are atmospheric (≤ 0.06 opacity) unless they carry navigational meaning.
- Glow brightly. Shadow blur is whisper-level (≤ 4px on incidental elements, ≤ 8px on focal points).
- Display HUD chrome (target reticles, threat readouts, command grids) at tactical intensity. They exist as quiet signal, not active warning.

## The five immediate adjustments (Task #26)
1. **Particles** — radii reduced ~60–70% across both canvases. Counts preserved. Glows and connection-line opacities dimmed proportionally. Motion slowed (~0.55× drift speed).
2. **Cursor decoupling** — particle systems no longer respond to mouse position; environmental drift only. Cursor ring follows with more lag (`.10 → .055`) at lower opacity (`.5 → .28`). Hover expansion softened (`56px → 44px`, dimmer glow).
3. **Hero parallax** — background offsets halved on `index.html`. Drift remains, cursor coupling damped.
4. **De-HUD** — Intelligence "Threat Detected" card pulses slowed from 1.8s to 5.5s and dimmed to atmospheric red. Executive command-grid HUD dots dropped to 3px at 0.55 opacity, flicker slowed to 7s. Scanlines slowed (6s → 18s) and dimmed.
5. **Atmosphere & negative space** — hero padding widened on `about.html`, `founder.html`. Eco-title typography larger and breathing. Soft depth gradients added behind hero atmosphere.

## Build contract

*Amended 2026-08-13. The previous version of this section was headed
"Performance contract (immutable)" and required every value to scale through
`PERF_CONFIG` / `[data-perf]` / `[data-tier-level]`. That contract described a
system that no longer runs: `performance-tier.js`, `performance-config.js` and
`perf-observer.js` are loaded by no page and excluded from deploy, nothing ever
sets `data-tier-level`, and the two CSS rules that consumed it could never
fire. They have been removed. A rule that cannot be enforced is not immutable,
it is decoration — and leaving it in place made the rest of this file harder to
trust.*

- **Motion stays static where the atmosphere is concerned.** The conic sweep and
  film grain do not animate, do not couple to the cursor, and do not pulse.
  Signature visual moments must read correctly in a screenshot.
- **Honour `prefers-reduced-motion`.** Enforced in `intel/tokens.css`.
- **A pattern used on three or more pages lives in `intel/components.css`.**
  A pattern unique to one page stays in that page's `<style>`. The old rule
  ("inline CSS preferred per page for isolation") produced five hand-rolled
  copies of one card and three of one numeral, which had already drifted apart.
  Isolation was never the goal; predictability was.
- **Contrast is tested, not eyeballed.** Every colour used for text clears
  WCAG AA against `--fi-black`; `tests/contrast.test.js` fails the build on a
  regression. New text colours need the same treatment.
- **Images ship in a modern format with correct intrinsic dimensions.** The
  declared `width`/`height` must match the real file so the browser reserves
  the right aspect box.
- Brand colours, logos, and page structure are fixed.
- No emojis, anywhere.
