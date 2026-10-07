import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, read } from "./lib.js";

const base = "docs/brand/form-intel-icon";
const assets = "intel/assets";
const ignored = read(".vercelignore").split("\n").filter((s) => s.startsWith("/")).map((s) => s.replace(/^\/|\/$/g, ""));
const pages = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard", "--", "*.html"], { cwd: ROOT })
  .toString().split("\0").filter((p) => p && !ignored.some((i) => p === i || p.startsWith(i + "/")));
const links = [
  '<link rel="icon" href="/intel/assets/favicon.svg" type="image/svg+xml">',
  '<link rel="icon" href="/intel/assets/favicon-32.png" type="image/png" sizes="32x32">',
  '<link rel="apple-touch-icon" href="/intel/assets/apple-touch-icon.png" sizes="180x180">',
];

test("every shipped HTML page has exactly the canonical favicon links, never a data URI", () => {
  assert.ok(pages.includes("index.html") && pages.includes("the-friday-drop/sept-4-26/thanks.html"));
  for (const page of pages) {
    const icons = read(page).match(/<link\b[^>]*\brel="(?:icon|shortcut icon|apple-touch-icon)"[^>]*>/g) || [];
    assert.deepEqual(icons, links, `${page}: missing, duplicate or obsolete favicon`);
    assert.doesNotMatch(icons.join(""), /data:/i, page);
  }
});

test("public identity assets preserve the approved favicon bytes and lockup geometry", () => {
  for (const name of ["favicon.svg", "favicon-32.png", "apple-touch-icon.png"]) {
    assert.deepEqual(readFileSync(join(ROOT, assets, name)), readFileSync(join(ROOT, base, "favicon", name)), name);
  }
  const name = "form-intel-horizontal-paper.svg";
  assert.equal(read(`${assets}/${name}`), read(`${base}/svg/lockup/${name}`).replace(/<rect\b[^>]*\/>\n/, ""));
});

test("both site systems use one canonical accessible lockup name and keep brand destinations", () => {
  const home = read("index.html");
  assert.equal((home.match(/class="form-lockup[^\"]*" href="#top" aria-label="form\.intel"/g) || []).length, 2);
  assert.equal((home.match(/src="\/intel\/assets\/form-intel-horizontal-paper\.svg" alt=""/g) || []).length, 2);
  const shared = read("intel/nav-footer.js");
  assert.match(shared, /href="\/" class="fi-brand" aria-label="form\.intel"/);
  assert.match(shared, /<img[^>]*src="\/intel\/assets\/form-intel-horizontal-paper\.svg"[^>]*alt="form\.intel"/);
  assert.doesNotMatch(shared, /fi-brand-dot/);
});
