import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { ROOT, read } from "./lib.js";

const base = "docs/brand/form-intel-icon";
const geometry = JSON.parse(read(`${base}/source/geometry.json`));
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
const elements = (svg, tag) => [...svg.matchAll(new RegExp(`<${tag}\\b[^>]*>`, "g"))].map((m) => attrs(m[0]));
const paths = (svg) => elements(svg, "path");
const palette = { ink: "#05070B", cobalt: "#3D6BFF", paper: "#FAFAFA" };
const source = paths(read("intel/assets/form-intel-lockup.svg"));

test("Intel masters and optical crops preserve five named parts and the exact palette", () => {
  assert.deepEqual(geometry.viewBox, [0, 0, 1024, 1024]);
  assert.deepEqual(geometry.palette, palette);
  assert.deepEqual(geometry.parts.map((p) => p.id), ["hook-top", "crossbar", "lower-left", "stem-foot", "signal-dot"]);
  assert.equal(geometry.seam, 16);
  for (const crop of ["symbol", "optical"]) {
    for (const style of ["ink", "cobalt", "paper", "currentcolor"]) {
      const svg = read(`${base}/svg/${crop}/form-intel-${style}.svg`);
      assert.equal(attrs(svg).viewBox, geometry[crop === "symbol" ? "viewBox" : "opticalViewBox"].join(" "));
      assert.deepEqual(paths(svg).map((p) => [p.id, p.d]), geometry.parts.filter((p) => p.path).map((p) => [p.id, p.path]));
      const shapes = [...paths(svg), ...elements(svg, "circle")];
      assert.equal(shapes.length, 5);
      for (const shape of shapes) {
        assert.equal(shape.fill, style === "currentcolor" ? "currentColor" : palette[style === "ink" && shape.id === "signal-dot" ? "cobalt" : style]);
        assert.equal(shape.stroke, undefined);
      }
      assert.deepEqual(elements(svg, "circle")[0], { id: "signal-dot", fill: shapes[4].fill, cx: "706", cy: "778", r: "94" });
      assert.doesNotMatch(svg, /<(image|text|script|foreignObject)\b/);
    }
  }
});

test("Intel lockups reuse every original glyph and preserve the period color rules", () => {
  assert.equal(source.length, 11);
  for (const layout of ["horizontal", "stacked"]) {
    for (const style of ["ink", "cobalt", "paper"]) {
      const svg = read(`${base}/svg/lockup/form-intel-${layout}-${style}.svg`);
      const glyphs = paths(svg).filter((p) => source.some((s) => s.id === p.id));
      assert.deepEqual(glyphs.map(({ id, d, transform }) => ({ id, d, transform })), source.map(({ id, d, transform }) => ({ id, d, transform })));
      for (const glyph of glyphs) {
        assert.equal(glyph.fill, palette[style === "ink" ? "ink" : style === "cobalt" && glyph.id === "form-4-period" ? "cobalt" : "paper"]);
      }
      assert.equal(elements(svg, "rect")[0].fill, palette[{ ink: "paper", cobalt: "ink", paper: "cobalt" }[style]]);
      assert.equal(elements(svg, "circle")[0].fill, palette[style === "paper" ? "paper" : "cobalt"]);
      assert.doesNotMatch(svg, /<(image|text|script|foreignObject)\b/);
    }
  }
});

test("Intel favicons have the requested sizes and isolate the small-size stroke from the dot", () => {
  for (const size of [16, 32, 64, 180]) {
    const name = size === 180 ? "apple-touch-icon" : `favicon-${size}`;
    const png = readFileSync(join(ROOT, base, `favicon/${name}.png`));
    assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    assert.equal(png.readUInt32BE(16), size);
    assert.equal(png.readUInt32BE(20), size);
  }
  const svg = read(`${base}/favicon/favicon.svg`);
  assert.equal(attrs(svg).viewBox, "132 132 760 760");
  assert.equal(elements(svg, "rect")[0].fill, palette.paper);
  for (const path of paths(svg)) {
    assert.equal(path.stroke, palette.ink);
    assert.equal(path["stroke-width"], String(geometry.smallIconStroke));
  }
  assert.equal(elements(svg, "circle")[0].stroke, undefined);
  assert.equal(elements(svg, "circle")[0].r, "94");
});

test("Intel review covers every export beside an unchanged reference, without runtime JS", () => {
  const exports = ["svg/symbol", "svg/optical", "svg/lockup", "favicon"].flatMap((dir) => readdirSync(join(ROOT, base, dir)).map((file) => `${dir}/${file}`));
  assert.equal(exports.length, 19);
  const review = read(`${base}/review.html`);
  const cards = review.match(/<article\b[\s\S]*?<\/article>/g);
  assert.equal(cards.length, exports.length);
  for (const file of exports) {
    assert.ok(cards.some((card) => card.includes(`href="${file}"`) && card.includes(`src="${file}"`) && card.includes('src="reference/08-FI-concept02-mark-crop.png"')));
  }
  assert.doesNotMatch(review, /<script\b|\son\w+=/i);
  assert.ok(elements(review, "img").every((img) => img.alt));
  for (const file of [...exports, "review.html", "README.md", "source/geometry.json", "source/build_assets.py", "source/check_render.py"].filter((f) => !f.endsWith(".png"))) {
    assert.doesNotMatch(read(`${base}/${file}`), /[\u2013\u2014]/);
    assert.doesNotMatch(read(`${base}/${file}`), /[\t ]+$/m);
  }
});
