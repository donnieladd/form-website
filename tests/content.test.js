/**
 * Content policy, enforced mechanically rather than remembered.
 *
 * 1. NO PUBLISHED RATES. Decided 2026-08-02: form. does not publish pricing.
 *    Prior state: messages.html shipped $5,000 / $3,500 / $8,500 publicly while
 *    those figures were still unverified. This test makes reintroducing a public
 *    rate a build failure rather than a judgement call.
 *
 * 2. NO RETIRED ENTITY NAMES. The first-attempt site used a product taxonomy
 *    that no longer exists (Signal Flow/Growth, Access/Profile/Scope by form.,
 *    By Design, Bartending Masters, "Continuum OS"). Pages shipped referencing
 *    entities that had been deleted.
 *
 * 3. NO UNVERIFIABLE SCALE CLAIMS. The first-attempt messages page named
 *    Elevation, Life.Church and Hillsong as the tier form. positions above, and
 *    hardcoded a "3 founding spots remaining" scarcity counter with no mechanism
 *    to update it.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { read, sitePages } from "./lib.js";

const pages = sitePages();

test("no page publishes a rate", () => {
  // Matches $5,000 / $5000 / $5k / $25k-$75k etc. in shipped copy.
  const MONEY = /\$\s?\d[\d,]*\s?(k\b|\d{3}\b|\b)/gi;
  const offenders = [];
  for (const page of pages) {
    const html = read(page);
    for (const m of html.matchAll(MONEY)) {
      // The contact form's budget-range picker is a qualifying input, not a
      // published rate — the visitor states their budget, form. states nothing.
      const context = html.slice(Math.max(0, m.index - 120), m.index + 60);
      if (/<select[^>]*id="budget"|name="budget"|<option/.test(context)) continue;
      offenders.push(`${page}: "${m[0].trim()}"`);
    }
  }
  assert.deepEqual(offenders, [], `published rates found:\n  ${offenders.join("\n  ")}`);
});

test("no page states a statistic in visible copy", () => {
  // Added 2026-08-13. insights.html shipped a draft headline reading "Why AI
  // pilots stall at 40%" -- a specific, sourceless figure presented as fact.
  // The rate check above only looks for "$", so a bare percentage went straight
  // through the gate.
  //
  // Percentages are legitimate inside markup (width:40%, rgba alpha, viewport
  // units), so tags and attributes are stripped before matching and only the
  // text a visitor actually reads is checked. If a real, sourced figure is ever
  // published, cite the source next to it and add it to ALLOWED below.
  const ALLOWED = [];
  const offenders = [];
  for (const page of pages) {
    const visible = read(page)
      .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]*>/g, " ");
    for (const m of visible.matchAll(/\d[\d,.]*\s?%/g)) {
      const claim = m[0].trim();
      if (ALLOWED.includes(claim)) continue;
      const context = visible.slice(Math.max(0, m.index - 60), m.index + 30).replace(/\s+/g, " ").trim();
      offenders.push(`${page}: "${claim}" in "...${context}..."`);
    }
  }
  assert.deepEqual(offenders, [], `unsourced statistic in visible copy:\n  ${offenders.join("\n  ")}`);
});

const RETIRED = [
  "Signal Flow", "Signal Growth", "Signal Products",
  "Access by form", "Profile by form", "Scope by form",
  "Bartending Masters", "Continuum OS", "formstrategy.co",
  // 2026-08-13 repositioning: the "six disciplines / six systems" model is
  // replaced by four practices + businesses + products, and form. sound folded
  // into form. experience. The brand FORMS are banned, not the plain words --
  // "we have six systems that don't talk to each other" is a client speaking
  // ordinary English and must stay legal.
  "the six systems", "all six systems", "six systems. one architecture",
  "six disciplines", "one operation.",
  "form. sound", "sound.html",
  "ecosystem.html", "login.html",
];

test("no page references a retired entity or dead route", () => {
  const offenders = [];
  for (const page of [...pages, "intel/nav-footer.js"]) {
    const html = read(page);
    for (const name of RETIRED) {
      if (html.includes(name)) offenders.push(`${page}: "${name}"`);
    }
  }
  assert.deepEqual(offenders, [], `retired references:\n  ${offenders.join("\n  ")}`);
});

test("no page names a third party as a competitive tier", () => {
  const NAMED = ["Elevation", "Life.Church", "Hillsong", "Canva"];
  const offenders = [];
  for (const page of pages) {
    const html = read(page);
    for (const n of NAMED) if (html.includes(n)) offenders.push(`${page}: "${n}"`);
  }
  assert.deepEqual(offenders, [], `named third parties:\n  ${offenders.join("\n  ")}`);
});

test("no page hardcodes a scarcity counter", () => {
  const offenders = [];
  for (const page of pages) {
    const html = read(page);
    if (/spots?\s+remaining|seats?\s+remaining|only\s+\d+\s+left/i.test(html)) {
      offenders.push(page);
    }
  }
  assert.deepEqual(offenders, [], `hardcoded scarcity claims:\n  ${offenders.join("\n  ")}`);
});

test("no page leaks a localhost or preview URL", () => {
  const offenders = [];
  for (const page of pages) {
    const html = read(page);
    for (const m of html.matchAll(/https?:\/\/(localhost|127\.0\.0\.1|[a-z0-9-]+\.vercel\.app)[^"'\s]*/gi)) {
      offenders.push(`${page}: ${m[0]}`);
    }
  }
  assert.deepEqual(offenders, [], `non-production URLs in shipped HTML:\n  ${offenders.join("\n  ")}`);
});
