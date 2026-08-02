/**
 * Regression test for the .vercelignore anchoring bug (2026-08-01).
 *
 * Mechanism: .vercelignore uses gitignore semantics, where a pattern without a
 * leading slash matches at ANY depth. The file listed `nav-footer.css` and
 * `nav-footer.js` intending the stale copies at the repo root — but those
 * patterns also matched `intel/nav-footer.css` and `intel/nav-footer.js`, which
 * every page depends on for its nav and footer. Shipping that would have
 * deployed all 17 pages with no navigation and no footer.
 *
 * Caught by manual inspection, which is exactly the failure mode this suite
 * exists to remove. These tests assert the two properties that matter:
 *   1. every pattern is anchored, so it cannot match at an unintended depth
 *   2. the files the live site actually loads survive the ignore rules
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { ROOT, read, sitePages } from "./lib.js";

const patterns = read(".vercelignore")
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#"));

/** Files with no directory component are safe unanchored only if unique. */
const ALLOWED_UNANCHORED = new Set([".DS_Store"]);

test("every .vercelignore pattern is anchored to the repo root", () => {
  const unanchored = patterns.filter(
    (p) => !p.startsWith("/") && !ALLOWED_UNANCHORED.has(p)
  );
  assert.deepEqual(
    unanchored,
    [],
    `unanchored patterns match at any depth and can strip nested files:\n  ${unanchored.join("\n  ")}`
  );
});

test("no ignore pattern excludes a file the live site loads", () => {
  // Collect every local asset referenced by a shipped page.
  const referenced = new Set();
  for (const page of sitePages()) {
    const html = read(page);
    for (const m of html.matchAll(/(?:href|src)="(\/[^"]+)"/g)) {
      const path = m[1].split("#")[0].split("?")[0];
      if (!path.endsWith(".html")) referenced.add(path.replace(/^\//, ""));
    }
  }
  assert.ok(referenced.size > 0, "found no referenced assets — selector is wrong");

  const ignored = (rel) =>
    patterns.some((pat) => {
      const anchored = pat.startsWith("/");
      const p = pat.replace(/^\//, "").replace(/\/$/, "");
      return anchored
        ? rel === p || rel.startsWith(p + "/")
        : rel === p || rel.split("/").pop() === p;
    });

  const broken = [...referenced].filter((r) => existsSync(join(ROOT, r)) && ignored(r));
  assert.deepEqual(broken, [], `these are referenced by a page but excluded from deploy:\n  ${broken.join("\n  ")}`);
});

test("every referenced local asset exists on disk", () => {
  const missing = [];
  for (const page of sitePages()) {
    for (const m of read(page).matchAll(/(?:href|src)="(\/[^"]+)"/g)) {
      const path = m[1].split("#")[0].split("?")[0];
      if (!existsSync(join(ROOT, path.replace(/^\//, "")))) missing.push(`${page} -> ${path}`);
    }
  }
  assert.deepEqual(missing, [], `dangling asset references:\n  ${missing.join("\n  ")}`);
});
