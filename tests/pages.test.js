/**
 * Structural invariants for every shipped page.
 *
 * These encode defects found and fixed during the 2026-08 build:
 *   - continuum.html shipped with no canonical and no og: tags at all, so it
 *     shared as a bare link with no title or description
 *   - every page shipped with no favicon and no og:image, so any link pasted
 *     into iMessage/Slack/LinkedIn rendered as a bare text preview
 *   - pages were linked to entities that had been deleted (ecosystem.html,
 *     login.html), producing 404s from the primary nav
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { ROOT, read, sitePages } from "./lib.js";

const pages = sitePages();
/** Pages intentionally excluded from search indexes carry their own rules. */
const NOINDEX = new Set(["404.html", "privacy.html", "terms.html"]);

/**
 * The exact shipped page set, locked 2026-08-13 at the end of the rebuild.
 *
 * During the 17 -> 31 build-out this was a floor (`pages.length >= 17`) so
 * additions were free while deletions failed loudly. With the IA settled, a
 * floor is the wrong shape: an accidental addition (a stray scratch page at
 * root ships and gets indexed) passes silently, and an accidental deletion
 * only fails if it dips below an arbitrary number. deepEqual makes both loud.
 *
 * Adding or retiring a page is supposed to touch this list — that is the
 * point. The diff becomes a visible, reviewable statement of intent.
 */
const EXPECTED_PAGES = [
  "404.html", "about.html", "advisory-transformation.html", "ai-enablement.html",
  "businesses.html", "contact.html", "continuum.html", "creative-experience.html",
  "creative-marketing.html", "digital.html", "experience.html", "founder.html",
  "index.html", "industries.html", "insights.html", "intellect.html",
  "labs.html", "learning.html", "ledger.html", "managed-services.html",
  "messages.html", "ministries.html", "people.html", "privacy.html",
  "processes.html", "services.html", "solutions-architecture.html",
  "solutions-intelligence.html", "support.html", "terms.html", "work.html",
];

test("the shipped page set matches the manifest exactly", () => {
  assert.deepEqual(
    [...pages].sort(),
    EXPECTED_PAGES,
    "page set drifted from the manifest — if this change is intentional, update EXPECTED_PAGES in the same commit"
  );
});

for (const page of pages) {
  test(`${page} — structure and social metadata`, () => {
    const html = read(page);

    const title = html.match(/<title>([^<]*)<\/title>/);
    assert.ok(title && title[1].trim(), "missing or empty <title>");

    const h1s = html.match(/<h1[\s>]/g) || [];
    assert.equal(h1s.length, 1, `expected exactly one <h1>, found ${h1s.length}`);

    assert.match(html, /<meta name="description" content="[^"]+"/, "missing meta description");
    assert.match(html, /rel="icon"/, "missing favicon");
    assert.match(html, /<html lang="/, "missing lang attribute");
    assert.match(html, /id="fi-nav-mount"/, "missing nav mount");
    assert.match(html, /id="fi-footer-mount"/, "missing footer mount");
    assert.match(html, /intel\/nav-footer\.js/, "missing nav-footer.js (also injects the atmosphere layer)");
    assert.match(html, /intel\/components\.css/, "missing components.css");

    if (!NOINDEX.has(page)) {
      assert.match(html, /rel="canonical"/, "missing canonical");
      assert.match(html, /property="og:image"/, "missing og:image");
      assert.match(html, /property="og:title"/, "missing og:title");
      assert.match(html, /name="twitter:card"/, "missing twitter:card");
    }
  });
}

test("no internal link points at a page that does not exist", () => {
  const broken = [];
  const sources = [...pages, "intel/nav-footer.js"];
  for (const src of sources) {
    for (const m of read(src).matchAll(/["'](\/[a-zA-Z0-9._-]*\.html)/g)) {
      const target = m[1].replace(/^\//, "");
      if (!existsSync(join(ROOT, target))) broken.push(`${src} -> ${m[1]}`);
    }
  }
  assert.deepEqual(broken, [], `dangling internal links:\n  ${broken.join("\n  ")}`);
});

test("every canonical URL resolves to a real page", () => {
  // cleanUrls is false in vercel.json, so canonicals must carry the .html
  // extension. contact.html shipped pointing at /contact, which 404s.
  const bad = [];
  for (const page of pages) {
    const m = read(page).match(/rel="canonical" href="([^"]+)"/);
    if (!m) continue;
    const path = m[1].replace("https://formintel.co/", "");
    const file = path === "" ? "index.html" : path;
    if (!existsSync(join(ROOT, file))) bad.push(`${page} -> ${m[1]}`);
  }
  assert.deepEqual(bad, [], `canonical points at a URL that does not exist:\n  ${bad.join("\n  ")}`);
});

test("sitemap lists only pages that exist and are indexable", () => {
  const sitemap = read("sitemap.xml");
  const locs = [...sitemap.matchAll(/<loc>https:\/\/formintel\.co\/([^<]*)<\/loc>/g)].map((m) => m[1]);
  for (const loc of locs) {
    const file = loc === "" ? "index.html" : loc;
    assert.ok(existsSync(join(ROOT, file)), `sitemap lists ${loc} which does not exist`);
    assert.ok(!NOINDEX.has(file), `sitemap lists ${file}, which is marked noindex`);
  }
});
