/**
 * Head invariants for every shipped page.
 *
 * This repo has no build step, no templating and no partials, so anything in
 * <head> is copy-pasted across every page by hand. That is fine for a handful
 * of pages and untenable at thirty: the failure mode is not a broken build, it
 * is one page silently missing a resource hint or carrying a stale tagline for
 * months.
 *
 * The fix is not a generator — a generator would become a second source of
 * truth and a de facto build step, in a repo whose stated contract is "files
 * are served as authored". The fix is to assert the invariants here, so
 * "did I remember all of them?" is a CI answer rather than a human worry.
 *
 * Encodes defects present before 2026-08-13:
 *   - all 17 pages loaded two render-blocking cross-origin font stylesheets
 *     with no preconnect, costing a full connection setup on the critical path
 *   - the hero shipped as a 1.7MB PNG named .jpg, 68% of total page weight,
 *     with no fetchpriority and with width/height that did not match the file
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { ROOT, read, sitePages } from "./lib.js";

const pages = sitePages();
const NOINDEX = new Set(["404.html", "privacy.html", "terms.html"]);

/**
 * Both origins per font provider. The `api.`/`googleapis` host serves the CSS;
 * the `cdn.`/`gstatic` host serves the woff2 the CSS then points at. Hinting
 * only the first still leaves a cold connection on the critical path.
 * The two font-serving hosts must carry `crossorigin` — fonts are fetched in
 * CORS mode, and a preconnect without it opens a connection that cannot be
 * reused, which is worse than none.
 */
const PRECONNECTS = [
  '<link rel="preconnect" href="https://api.fontshare.com">',
  '<link rel="preconnect" href="https://cdn.fontshare.com" crossorigin>',
  '<link rel="preconnect" href="https://fonts.googleapis.com">',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
];

/** tokens defines the custom properties the other two consume. Order matters. */
const STYLESHEETS = ["/intel/tokens.css", "/intel/nav-footer.css", "/intel/components.css"];

/**
 * One tagline, every page. Pinning it here is the point: when the reposition
 * changes it, a page that gets missed is a red build instead of a page that
 * shares with last quarter's positioning.
 */
const OG_IMAGE_ALT = "form. — the systems behind movement.";

for (const page of pages) {
  test(`${page} — head invariants`, () => {
    const html = read(page);

    for (const link of PRECONNECTS) {
      assert.ok(html.includes(link), `missing preconnect: ${link}`);
    }

    // A preconnect after the request it is meant to warm up does nothing.
    const lastPreconnect = Math.max(...PRECONNECTS.map((l) => html.indexOf(l)));
    const firstFontSheet = html.search(/<link href="https:\/\/(api\.fontshare|fonts\.googleapis)\.com/);
    assert.ok(firstFontSheet > -1, "no font stylesheet found");
    assert.ok(
      lastPreconnect < firstFontSheet,
      "preconnects must precede the font stylesheet links, or they are wasted",
    );

    const order = STYLESHEETS.map((href) => html.indexOf(href));
    for (const [i, at] of order.entries()) {
      assert.ok(at > -1, `missing stylesheet ${STYLESHEETS[i]}`);
    }
    assert.deepEqual(
      [...order].sort((a, b) => a - b),
      order,
      `stylesheets must load in order: ${STYLESHEETS.join(" -> ")}`,
    );

    if (!NOINDEX.has(page)) {
      const alt = html.match(/property="og:image:alt" content="([^"]*)"/);
      assert.ok(alt, "missing og:image:alt");
      assert.equal(alt[1], OG_IMAGE_ALT, "og:image:alt drifted from the shared tagline");
    }
  });
}

test("every local asset referenced by a srcset exists", () => {
  // deploy-manifest covers src=/href=; srcset is a comma-separated list with
  // width descriptors and slips past that pattern entirely.
  const missing = [];
  for (const page of pages) {
    for (const m of read(page).matchAll(/srcset="([^"]+)"/g)) {
      for (const candidate of m[1].split(",")) {
        const url = candidate.trim().split(/\s+/)[0];
        if (!url.startsWith("/")) continue;
        if (!existsSync(join(ROOT, url.slice(1)))) missing.push(`${page} -> ${url}`);
      }
    }
  }
  assert.deepEqual(missing, [], `srcset points at files that do not exist:\n  ${missing.join("\n  ")}`);
});

test("the hero is served as AVIF with a decoded-size hint and high priority", () => {
  const html = read("index.html");
  assert.match(html, /<source[^>]+type="image\/avif"/, "hero has no AVIF source");
  assert.match(html, /fetchpriority="high"/, "hero img is the LCP element and must be prioritised");

  const img = html.match(/<img src="\/intel\/assets\/hero-[^"]+"[^>]*>/s);
  assert.ok(img, "hero fallback img not found");
  assert.match(img[0], /width="1376"/, "declared width must match the real file (1376x768)");
  assert.match(img[0], /height="768"/, "declared height must match the real file (1376x768)");
});

test("no page carries an inline script — the invariant behind script-src 'self'", () => {
  // The CSP moved from report-only to enforcing on 2026-08-13, which was only
  // possible because contact.html's inline handler moved to /intel/contact.js.
  // With `script-src 'self'` enforced, an inline <script> is not a style
  // violation — it is a page whose behaviour silently died in production.
  // This keeps the door shut.
  const offenders = [];
  for (const page of pages) {
    for (const m of read(page).matchAll(/<script\b([^>]*)>/gi)) {
      if (!/\bsrc\s*=/.test(m[1])) offenders.push(`${page}: <script${m[1]}>`);
    }
  }
  assert.deepEqual(offenders, [], `inline scripts found (blocked by the enforced CSP):\n  ${offenders.join("\n  ")}`);
});

test("the CSP is enforcing, not report-only", () => {
  const vercel = read("vercel.json");
  assert.match(vercel, /"Content-Security-Policy"/, "the enforcing CSP header is missing from vercel.json");
  assert.ok(
    !vercel.includes("Content-Security-Policy-Report-Only"),
    "report-only header still present — it was a Phase 1 stepping stone, not a companion"
  );
});
