/**
 * Unit tests for the inquiry handler's pure logic.
 *
 * Regression cover for the mechanism this endpoint replaced: the mailto form
 * had no validation, no spam control, no rate limit, and no delivery guarantee.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { validate, rateLimit, esc, renderEmail, routeFor, INQUIRY_TO } from "../api/contact.mjs";

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
   The routing table maps the contact form's `practice` option strings to
   practice inboxes. These tests pin the mapping AND the invariant that makes
   routing safe to turn on: the house inbox sees everything, always. */

test("routeFor maps each practice option to its owning inbox", () => {
  const cases = [
    ["Something has to change — advisory & transformation", "advisory@formintel.co", "Advisory"],
    ["We need a system built — solutions & intelligence", "solutions@formintel.co", "Solutions"],
    ["AI — enablement, strategy, or a build", "solutions@formintel.co", "AI"],
    ["Brand, marketing or experience — creative & experience", "creative@formintel.co", "Creative"],
    ["Keep it running — managed services / Continuum", "managed@formintel.co", "Managed"],
    ["form. digital — website, app or platform", "solutions@formintel.co", "Digital"],
    ["form. creative & marketing — agency engagement", "creative@formintel.co", "Agency"],
    ["messages by form. — message infrastructure", "creative@formintel.co", "Messages"],
    ["form. experience — live production or placement", "creative@formintel.co", "Experience"],
    ["A labs product — processes, people or ledger", "solutions@formintel.co", "Labs"],
    ["form. learning — curriculum or credentialing", "solutions@formintel.co", "Learning"],
    ["Ministry — not sure which part", "ministry@formintel.co", "Ministry"],
  ];
  for (const [practice, to, tag] of cases) {
    const r = routeFor({ practice });
    assert.equal(r.to, to, `"${practice}" should route to ${to}, got ${r.to}`);
    assert.equal(r.tag, tag, `"${practice}" should tag [${tag}], got [${r.tag}]`);
  }
});

test("routeFor: orgType Ministry / Church overrides the practice route", () => {
  const r = routeFor({ practice: "form. digital — website, app or platform", orgType: "Ministry / Church" });
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
    { practice: "AI — enablement, strategy, or a build" },
    { practice: "Ministry — not sure which part" },
    { practice: "Keep it running — managed services / Continuum", orgType: "Business" },
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
  const on = renderEmail(clean, routeFor({ practice: "Ministry — not sure which part" }));
  assert.ok(on.includes("ministry@formintel.co"), "with routing on the audit row carries the destination");
});
