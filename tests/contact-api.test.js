/**
 * Unit tests for the inquiry handler's pure logic.
 *
 * Regression cover for the mechanism this endpoint replaced: the mailto form
 * had no validation, no spam control, no rate limit, and no delivery guarantee.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { validate, rateLimit, esc, renderEmail, INQUIRY_TO } from "../api/contact.mjs";

test("inquiries are delivered to hello@formintel.co", () => {
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
