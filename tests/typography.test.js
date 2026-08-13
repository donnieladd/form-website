/**
 * Brand typography rules, locked 2026-08-13 when the owner adopted League
 * Spartan as the label voice after a live trial.
 *
 * The two rules, in the owner's words:
 *   1. "When we use League Spartan, it needs to be in all caps." — every
 *      CSS block that sets the label font must also set
 *      `text-transform: uppercase`, in shared stylesheets and page-local
 *      <style> blocks alike.
 *   2. "The only place I wanna keep the IBM Plex Mono is on the 'vision
 *      needs structure'" — the slogan tag (.fi-footer-tag) is the ONLY
 *      surface allowed to use --fi-mono. A second usage fails the build.
 *
 * Both fonts load from one Google Fonts stylesheet in every head; a page
 * that drops either family silently falls back and the rule erodes, so the
 * link is asserted per page.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { read, sitePages } from "./lib.js";

const CSS_FILES = readdirSync("intel", { withFileTypes: true })
  .filter((d) => d.isFile() && d.name.endsWith(".css"))
  .map((d) => `intel/${d.name}`);

/** Every {...} block's text, keyed by an approximate selector label. */
function blocks(css, source) {
  const out = [];
  // Flat split on "}": each chunk runs from the previous close brace to the
  // next one, so it carries the selector line and its declarations together.
  for (const chunk of css.split("}")) {
    const open = chunk.lastIndexOf("{");
    if (open === -1) continue;
    out.push({
      source,
      selector: chunk.slice(0, open).trim().split("\n").pop().trim(),
      body: chunk.slice(open + 1),
    });
  }
  return out;
}

function allBlocks() {
  const all = [];
  for (const f of CSS_FILES) all.push(...blocks(read(f), f));
  for (const page of sitePages()) {
    for (const m of read(page).matchAll(/<style>([\s\S]*?)<\/style>/g)) {
      all.push(...blocks(m[1], page));
    }
  }
  return all;
}

test("every block using the label font (League Spartan) is all-caps", () => {
  const offenders = allBlocks()
    .filter((b) => b.body.includes("var(--fi-label)"))
    .filter((b) => !b.body.includes("text-transform: uppercase"))
    .map((b) => `${b.source} -> ${b.selector}`);
  assert.deepEqual(
    offenders,
    [],
    `League Spartan is all caps, always (owner, 2026-08-13). Add text-transform: uppercase to:\n  ${offenders.join("\n  ")}`
  );
});

test("IBM Plex Mono is used by exactly one surface: the slogan tag", () => {
  const users = allBlocks()
    .filter((b) => b.body.includes("var(--fi-mono)"))
    .map((b) => `${b.source} -> ${b.selector}`);
  assert.deepEqual(
    users,
    ["intel/nav-footer.css -> .fi-footer-tag"],
    "only .fi-footer-tag ('vision needs structure.') may use --fi-mono — everything else is League Spartan via --fi-label"
  );
});

test("every page loads both label families from Google Fonts", () => {
  const missing = sitePages().filter((page) => {
    const html = read(page);
    return !(html.includes("family=IBM+Plex+Mono") && html.includes("family=League+Spartan"));
  });
  assert.deepEqual(missing, [], `pages missing a label font family in the head:\n  ${missing.join("\n  ")}`);
});
