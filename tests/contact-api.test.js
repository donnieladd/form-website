/**
 * Unit tests for the inquiry handler's pure logic.
 *
 * Regression cover for the mechanism this endpoint replaced: the mailto form
 * had no validation, no spam control, no rate limit, and no delivery guarantee.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { validate, rateLimit, esc, renderEmail, routeFor, INQUIRY_TO } from "../api/contact.mjs";
import { read } from "./lib.js";

test("hello@formintel.co is the inbox that sees every inquiry", () => {
  // Since routing landed (2026-08-13) this constant is no longer "the
  // recipient" — it is the default recipient AND the always-CC'd house inbox.
  // routeFor's invariant test below proves every route keeps it in to-or-cc,
  // which is a stronger guarantee than the single-recipient one this assertion
  // originally encoded: a misconfigured alias can delay a lead, never lose it.
  assert.equal(INQUIRY_TO, "hello@formintel.co");
});

test("validate rejects an empty submission with one error per required field", () => {
  const { errors } = validate({});
  assert.equal(errors.length, 4, `expected 4 required-field errors, got: ${errors.join(" | ")}`);
});

test("validate rejects a malformed email", () => {
  const { errors } = validate({ name: "A", email: "not-an-email", organization: "B", message: "C" });
  assert.ok(errors.some((e) => e.includes("valid address")), errors.join(" | "));
});

test("validate accepts a well-formed submission", () => {
  const { errors, clean } = validate({
    name: " Dontae ", email: "d@example.com", organization: "form.", message: "Hello",
  });
  assert.deepEqual(errors, []);
  assert.equal(clean.name, "Dontae", "fields should be trimmed");
});

test("validate caps an oversized message rather than passing it through", () => {
  const { errors } = validate({
    name: "A", email: "a@b.co", organization: "C", message: "x".repeat(2001),
  });
  assert.ok(errors.some((e) => e.includes("exceeds")), errors.join(" | "));
});

test("validate survives a null or non-object body", () => {
  for (const body of [null, undefined, "string", 42]) {
    const { errors } = validate(body);
    assert.ok(errors.length > 0, `expected errors for body ${JSON.stringify(body)}`);
  }
});

test("rateLimit allows 5 then blocks the 6th within the window", () => {
  const key = `test-${Math.random()}`;
  const t0 = 1_000_000;
  for (let i = 1; i <= 5; i++) {
    assert.equal(rateLimit(key, t0 + i).allowed, true, `request ${i} should be allowed`);
  }
  assert.equal(rateLimit(key, t0 + 6).allowed, false, "6th request should be blocked");
});

test("rateLimit lets the window expire", () => {
  const key = `test-${Math.random()}`;
  const t0 = 2_000_000;
  for (let i = 0; i < 5; i++) rateLimit(key, t0 + i);
  assert.equal(rateLimit(key, t0 + 5).allowed, false, "should be blocked inside the window");
  assert.equal(rateLimit(key, t0 + 11 * 60 * 1000).allowed, true, "should reset after the window");
});

test("rateLimit tracks callers independently", () => {
  const a = `a-${Math.random()}`, b = `b-${Math.random()}`;
  const t = 3_000_000;
  for (let i = 0; i < 6; i++) rateLimit(a, t + i);
  assert.equal(rateLimit(a, t + 7).allowed, false, "exhausted caller stays blocked");
  assert.equal(rateLimit(b, t + 7).allowed, true, "unrelated caller is unaffected");
});

test("esc neutralises HTML in attacker-controlled values", () => {
  assert.equal(esc('<script>alert(1)</script>'), "&lt;script&gt;alert(1)&lt;/script&gt;");
  assert.equal(esc(`" onload="x`), "&quot; onload=&quot;x");
});

test("renderEmail escapes injected markup rather than emitting it", () => {
  const html = renderEmail({
    name: '<img src=x onerror=alert(1)>', email: "a@b.co",
    organization: "Org", message: "<b>bold</b>",
  });
  assert.ok(!html.includes("<img src=x"), "raw img tag leaked into the email body");
  assert.ok(!html.includes("<b>bold</b>"), "raw markup leaked from the message field");
  assert.ok(html.includes("&lt;img"), "expected the value escaped");
});

test("renderEmail omits rows for absent optional fields", () => {
  const html = renderEmail({ name: "A", email: "a@b.co", organization: "C", message: "D" });
  assert.ok(!html.includes("Timeline"), "empty optional field should not render a row");
});

/* ── routeFor: deterministic inquiry routing (added 2026-08-13) ──────────
   The routing table maps the contact form's `practice` option strings to the
   canonical aliases. These tests pin the mapping AND the invariant that makes
   routing safe to turn on: the house inbox sees everything, always.

   Retaxonomised 2026-08-13 by the architecture directive: six capability
   doors plus Continuum and Ministry, tags are the CRM classification values.
   The option strings below are copied verbatim from contact.html — if a copy
   edit there is not mirrored here, the test fails, which is the point. */

test("routeFor maps each contact-form option to its owning inbox", () => {
  const cases = [
    ["Advisory & Transformation — something needs to change", "advisory@formintel.co", "ADVISORY"],
    ["Solutions & Intelligence — we need a system architected", "solutions@formintel.co", "SOLUTIONS"],
    ["Digital Services — we need the technology built", "digital@formintel.co", "DIGITAL"],
    ["Creative & Marketing — brand, campaigns, content or social", "creative@formintel.co", "CREATIVE"],
    ["Live Experience — production, worship or live systems", "experience@formintel.co", "EXPERIENCE"],
    ["Support — ongoing people, systems or operations", "support@formintel.co", "SUPPORT"],
    ["Continuum — an ongoing partnership with form.", "continuum@formintel.co", "CONTINUUM"],
    ["Ministry Solutions — for a church or ministry", "ministry@formintel.co", "MINISTRY"],
  ];
  for (const [practice, to, tag] of cases) {
    const r = routeFor({ practice });
    assert.equal(r.to, to, `"${practice}" should route to ${to}, got ${r.to}`);
    assert.equal(r.tag, tag, `"${practice}" should tag [${tag}], got [${r.tag}]`);
  }
});

/* The retired taxonomy still arrives from cached copies of contact.html —
   HTML pages ship with no explicit cache header. These pin that those
   inquiries stay classified rather than silently falling to "unclassified". */
test("routeFor still classifies the retired option strings", () => {
  const legacy = [
    ["Something has to change — advisory & transformation", "advisory@formintel.co", "ADVISORY"],
    ["We need a system built — solutions & intelligence", "solutions@formintel.co", "SOLUTIONS"],
    ["AI — enablement, strategy, or a build", "solutions@formintel.co", "SOLUTIONS"],
    ["Brand, marketing or experience — creative & experience", "creative@formintel.co", "CREATIVE"],
    ["Keep it running — managed services / Continuum", "support@formintel.co", "SUPPORT"],
    ["form. digital — website, app or platform", "digital@formintel.co", "DIGITAL"],
    ["form. creative & marketing — agency engagement", "creative@formintel.co", "CREATIVE"],
    ["messages by form. — message infrastructure", "creative@formintel.co", "CREATIVE"],
    ["form. experience — live production or placement", "experience@formintel.co", "EXPERIENCE"],
    ["A labs product — processes, people or ledger", "solutions@formintel.co", "SOLUTIONS"],
    ["form. learning — curriculum or credentialing", "solutions@formintel.co", "SOLUTIONS"],
    ["Ministry — not sure which part", "ministry@formintel.co", "MINISTRY"],
  ];
  for (const [practice, to, tag] of legacy) {
    const r = routeFor({ practice });
    assert.equal(r.to, to, `legacy "${practice}" should route to ${to}, got ${r.to}`);
    assert.equal(r.tag, tag, `legacy "${practice}" should tag [${tag}], got [${r.tag}]`);
  }
});

/* No inquiry may route to an alias outside the canonical set — a typo in the
   routing table would otherwise send leads to an address nobody reads. */
test("routeFor only ever routes to a canonical alias", () => {
  const CANONICAL = new Set([
    "hello@formintel.co", "advisory@formintel.co", "solutions@formintel.co",
    "digital@formintel.co", "creative@formintel.co", "experience@formintel.co",
    "support@formintel.co", "continuum@formintel.co", "ministry@formintel.co",
  ]);
  const options = [
    "Advisory & Transformation — something needs to change",
    "Solutions & Intelligence — we need a system architected",
    "Digital Services — we need the technology built",
    "Creative & Marketing — brand, campaigns, content or social",
    "Live Experience — production, worship or live systems",
    "Support — ongoing people, systems or operations",
    "Continuum — an ongoing partnership with form.",
    "Ministry Solutions — for a church or ministry",
    "Not sure yet",
    "something entirely unrecognised",
  ];
  for (const practice of options) {
    const r = routeFor({ practice });
    assert.ok(CANONICAL.has(r.to), `"${practice}" routed to non-canonical alias ${r.to}`);
    assert.ok(r.cc === null || CANONICAL.has(r.cc), `"${practice}" cc'd non-canonical alias ${r.cc}`);
  }
});

test("routeFor: orgType Ministry / Church overrides the practice route", () => {
  const r = routeFor({ practice: "Digital Services — we need the technology built", orgType: "Ministry / Church" });
  assert.equal(r.to, "ministry@formintel.co", "a church asking for a build still enters through the ministry door");
  assert.equal(r.cc, INQUIRY_TO);
});

test("routeFor: unknown, unsure or missing input falls back unclassified", () => {
  for (const clean of [
    {},
    { practice: "Not sure yet" },
    { practice: "Multiple areas" },
    { practice: "something entirely unrecognised" },
  ]) {
    const r = routeFor(clean);
    assert.equal(r.to, INQUIRY_TO, JSON.stringify(clean));
    assert.equal(r.reason, "unclassified");
  }
});

test("routeFor: the house inbox is always in to-or-cc — no lead can be lost", () => {
  // Property test over every shape of input, including garbage: whatever
  // routeFor returns, INQUIRY_TO must be reachable. This is the invariant
  // that makes a dead alias a delay instead of a dropped lead.
  const inputs = [
    null, undefined, 42, "string", {},
    { practice: "Digital Services — we need the technology built" },
    { practice: "Ministry Solutions — for a church or ministry" },
    { practice: "Support — ongoing people, systems or operations", orgType: "Business" },
    { orgType: "Ministry / Church" },
    { practice: "Not sure yet" },
  ];
  for (const input of inputs) {
    const r = routeFor(input);
    assert.ok(
      r.to === INQUIRY_TO || r.cc === INQUIRY_TO,
      `input ${JSON.stringify(input)} routed to ${r.to} with cc ${r.cc} — house inbox unreachable`
    );
  }
});

test("routeFor survives null and partial input without throwing", () => {
  for (const bad of [null, undefined, 0, "", [], { practice: null }, { practice: 42, orgType: {} }]) {
    const r = routeFor(bad);
    assert.equal(typeof r.to, "string");
    assert.ok(r.to.includes("@"));
  }
});

test("renderEmail records where the inquiry was routed, honestly", () => {
  const clean = { name: "A", email: "a@b.co", organization: "Org", message: "hi" };
  const off = renderEmail(clean, null);
  assert.ok(off.includes("default — routing disabled"), "with routing off the audit row must say so");
  const on = renderEmail(clean, routeFor({ practice: "Ministry Solutions — for a church or ministry" }));
  assert.ok(on.includes("ministry@formintel.co"), "with routing on the audit row carries the destination");
});

/* ── the form and the routing table cannot drift apart ───────────────────
   Every prior test in this file pins a hand-copied option string. That
   catches a change to the routing table, but not the opposite failure: an
   option added to (or reworded in) contact.html that no route recognises,
   which would silently fall to "unclassified" and land every one of those
   inquiries in the house inbox untagged. This reads the real select element
   and holds the two sides together. */
test("every option in contact.html classifies to a canonical alias", () => {
  const html = read("contact.html");
  const select = html.match(/<select id="practice"[\s\S]*?<\/select>/);
  assert.ok(select, "contact.html no longer has a #practice select — routing reads this element");

  const options = [...select[0].matchAll(/<option[^>]*>([\s\S]*?)<\/option>/g)]
    .map((m) => m[1].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim())
    .filter((o) => o && o !== "Select one");

  assert.ok(options.length >= 8, `expected the full taxonomy, found ${options.length} options`);

  const CANONICAL = new Set([
    "hello@formintel.co", "advisory@formintel.co", "solutions@formintel.co",
    "digital@formintel.co", "creative@formintel.co", "experience@formintel.co",
    "support@formintel.co", "continuum@formintel.co", "ministry@formintel.co",
  ]);

  const unclassified = [];
  for (const practice of options) {
    const r = routeFor({ practice });
    assert.ok(CANONICAL.has(r.to), `"${practice}" routed to non-canonical alias ${r.to}`);
    // "Not sure yet" is *designed* to be unclassified — an uncertain buyer is
    // not made to diagnose themselves. Every other option must classify.
    if (!/not sure yet/i.test(practice) && r.reason === "unclassified") unclassified.push(practice);
  }
  assert.deepEqual(
    unclassified, [],
    `these contact.html options match no route and would arrive untagged:\n  ${unclassified.join("\n  ")}`
  );
});
