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
