// Shared helpers. No dependencies — Node built-ins only.
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Pages that are actually deployed. Excludes archives and build sources. */
export function sitePages() {
  return readdirSync(ROOT)
    .filter((f) => f.endsWith(".html"))
    .sort();
}

export const read = (rel) => readFileSync(join(ROOT, rel), "utf8");

/** WCAG relative luminance for an sRGB triplet. */
export function luminance([r, g, b]) {
  const lin = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Composite an rgba colour over an opaque backdrop. */
export const over = (fg, alpha, bg) =>
  fg.map((c, i) => Math.round(c * alpha + bg[i] * (1 - alpha)));

/** Parse `#rgb`, `#rrggbb` or `rgba(r,g,b,a)` into [[r,g,b], alpha]. */
export function parseColour(value) {
  const v = value.trim();
  const rgba = v.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,/\s]+([\d.]+))?\s*\)/);
  if (rgba) {
    return [[+rgba[1], +rgba[2], +rgba[3]], rgba[4] === undefined ? 1 : +rgba[4]];
  }
  const hex = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    return [[0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)), 1];
  }
  return null;
}

/** Read a custom property's declared value out of a CSS file. */
export function token(css, name) {
  const m = css.match(new RegExp(`${name}\\s*:\\s*([^;]+);`));
  return m ? m[1].trim() : null;
}
