/**
 * Regression test for the contrast audit (2026-08-02).
 *
 * Mechanism of the original bug: several design tokens were used for body-size
 * text but had never been checked against their backdrop.
 *   --fi-ink-ghost  rgba(255,255,255,.34) = 2.91:1  (used for hero meta, footer bar)
 *   --fi-blue-soft  rgba(51,102,255,.82)  = 3.29:1  (used for every eyebrow label)
 *   --fi-blue       #3366ff               = 4.49:1  (used for inline links)
 *   gradient start  #007aff               = 4.02:1  against the white button label
 * All four failed WCAG AA (4.5:1). This test fails the build if any regress.
 *
 * Note: contrast is computed from the SPECIFIED colour composited on its
 * backdrop, which is how WCAG defines it — not from sampled screenshot pixels,
 * which include antialiasing and understate the real ratio.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { read, contrast, over, parseColour, token } from "./lib.js";

const css = read("intel/tokens.css");
const BLACK = [0, 0, 0];
const WHITE = [255, 255, 255];
const AA = 4.5;

/** Tokens rendered as text on the page background. */
const TEXT_TOKENS = [
  "--fi-ink",
  "--fi-ink-soft",
  "--fi-ink-muted",
  "--fi-ink-ghost",
  "--fi-blue",
  "--fi-blue-bright",
  "--fi-blue-soft",
];

for (const name of TEXT_TOKENS) {
  test(`${name} clears WCAG AA on --fi-black`, () => {
    const raw = token(css, name);
    assert.ok(raw, `${name} is not declared in intel/tokens.css`);
    const parsed = parseColour(raw);
    assert.ok(parsed, `${name} value "${raw}" could not be parsed`);
    const [rgb, alpha] = parsed;
    const ratio = contrast(over(rgb, alpha, BLACK), BLACK);
    assert.ok(
      ratio >= AA,
      `${name} (${raw}) is ${ratio.toFixed(2)}:1 on #000 — needs ${AA}:1`
    );
  });
}

test("white button label clears AA on both ends of --fi-gradient", () => {
  const raw = token(css, "--fi-gradient");
  assert.ok(raw, "--fi-gradient is not declared");
  const stops = raw.match(/#[0-9a-f]{3,6}/gi) || [];
  assert.ok(stops.length >= 2, `expected >=2 colour stops, found ${stops.length}`);
  for (const stop of stops) {
    const ratio = contrast(WHITE, parseColour(stop)[0]);
    assert.ok(
      ratio >= AA,
      `white on gradient stop ${stop} is ${ratio.toFixed(2)}:1 — needs ${AA}:1`
    );
  }
});

/**
 * Text over the .fi-layer gradient bleed (added 2026-08-13).
 *
 * The tests above measure every token against #000, which is correct for the
 * rest of the site. The Solutions Architecture layer stack is the first place
 * that puts body text over a *lighter* backdrop: each row carries a blue-violet
 * bleed whose opacity scales with --fi-layer-depth, so the bottom row is the
 * worst case. Measured at 4.87:1 when it shipped — above AA, but with only
 * 0.37 of headroom, and nothing was guarding it. Raising the bleed would have
 * dropped body text under AA silently.
 *
 * The backdrop is derived from the CSS rather than hardcoded, so this fails if
 * someone strengthens the gradient without re-checking contrast.
 */
test("text over the .fi-layer bleed clears WCAG AA at maximum depth", () => {
  const comp = read("intel/components.css");

  const rule = comp.match(/\.fi-layer::before\s*\{[\s\S]*?\}/);
  assert.ok(rule, ".fi-layer::before rule not found in intel/components.css");

  const firstStop = rule[0].match(/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/);
  assert.ok(firstStop, "could not read the first gradient stop of .fi-layer::before");
  const [stopRgb, stopAlpha] = parseColour(firstStop[0]);

  // opacity: calc(BASE + var(--fi-layer-depth, 0) * RANGE) — depth maxes at 1.
  const op = rule[0].match(/opacity:\s*calc\(\s*([\d.]+)\s*\+\s*var\([^)]*\)\s*\*\s*([\d.]+)\s*\)/);
  assert.ok(op, "could not read the depth-scaled opacity of .fi-layer::before");
  const maxOpacity = parseFloat(op[1]) + parseFloat(op[2]);
  assert.ok(maxOpacity <= 1, `computed max opacity ${maxOpacity} exceeds 1`);

  const backdrop = over(stopRgb, stopAlpha * maxOpacity, BLACK);

  // Every token the layer stack renders text in.
  for (const name of ["--fi-ink", "--fi-ink-muted", "--fi-ink-ghost"]) {
    const [rgb, alpha] = parseColour(token(css, name));
    const ratio = contrast(over(rgb, alpha, backdrop), backdrop);
    assert.ok(
      ratio >= AA,
      `${name} over the .fi-layer bleed rgb(${backdrop}) is ${ratio.toFixed(2)}:1 — needs ${AA}:1`
    );
  }
});

/**
 * .fi-btn-light's label must actually be readable (added 2026-08-13).
 *
 * Mechanism: `.fi-body a { color: inherit }` scores (0,1,1) and out-specified
 * `.fi-btn-light` at (0,1,0), so the button's declared `color: #000` lost to
 * the inherited white. White label on a white fill — 1:1 contrast, completely
 * invisible — shipped on the homepage and continuum.html. The token tests
 * above could not see it, because every individual token was fine; the defect
 * was in the cascade between two correct rules.
 *
 * Two assertions: the declared colours are readable, and the anchor rule still
 * excludes buttons so nothing re-overrides them.
 */
test(".fi-btn-light's label clears WCAG AA on its own fill", () => {
  const rule = css.match(/\.fi-btn-light\s*\{([\s\S]*?)\}/);
  assert.ok(rule, ".fi-btn-light is not declared in intel/tokens.css");

  const bg = rule[1].match(/background:\s*([^;]+);/);
  const fg = rule[1].match(/(?:^|[^-])color:\s*([^;]+);/);
  assert.ok(bg && fg, ".fi-btn-light must declare both a background and a color");

  const ratio = contrast(parseColour(fg[1].trim())[0], parseColour(bg[1].trim())[0]);
  assert.ok(
    ratio >= AA,
    `.fi-btn-light label ${fg[1].trim()} on ${bg[1].trim()} is ${ratio.toFixed(2)}:1 — needs ${AA}:1`
  );
});

test("the global anchor colour rule does not capture buttons", () => {
  const anchorRule = css.match(/^\.fi-body a(?:[^{,\n]*)\{[\s\S]*?\}/m);
  assert.ok(anchorRule, "expected a `.fi-body a...` rule in intel/tokens.css");
  const selector = anchorRule[0].split("{")[0].trim();
  assert.match(
    selector,
    /:not\(\s*\.fi-btn\s*\)/,
    `"${selector}" sets colour on every anchor, which out-specifies .fi-btn-* ` +
      `and silently overrides button label colours. Exclude .fi-btn.`
  );
});
