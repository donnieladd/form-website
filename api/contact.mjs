/**
 * POST /api/contact — project inquiry handler.
 *
 * Replaces `<form action="mailto:...">`, which had no delivery guarantee: a
 * visitor with no OS mail handler (i.e. anyone on webmail) got no error, no
 * submission, and no record. Inquiries were being silently lost.
 *
 * Failure posture: this endpoint NEVER reports success it cannot back. If the
 * mail provider is unconfigured or errors, it returns a machine-readable code
 * and the client surfaces a direct-email fallback with the visitor's message
 * preserved. The lead is never dropped on the floor.
 *
 * .mjs is deliberate: it is unconditionally ESM on Vercel's Node runtime,
 * independent of package.json, which is excluded from the deploy upload.
 */

export const INQUIRY_TO = "hello@formintel.co";

/** Sender must be on a domain verified in Resend, not the visitor's address. */
const INQUIRY_FROM = process.env.CONTACT_FROM || "form. website <noreply@formintel.co>";

const LIMIT_MAX = 5;
const LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_FIELD = 200;
const MAX_MESSAGE = 2000;

/**
 * In-memory sliding window.
 *
 * LIMITATION, stated rather than implied: this is per-instance. Vercel may run
 * several instances, so the effective global limit is LIMIT_MAX x instances.
 * It raises the cost of casual abuse; it is not a distributed rate limiter. A
 * real one needs shared state (Upstash/Redis) — deliberately not added, because
 * this endpoint's blast radius is "sends an email to one inbox" and the
 * dependency would cost more than it protects.
 */
const hits = new Map();

export function rateLimit(key, now = Date.now()) {
  const window = (hits.get(key) || []).filter((t) => now - t < LIMIT_WINDOW_MS);
  window.push(now);
  hits.set(key, window);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < LIMIT_WINDOW_MS)) hits.delete(k);
  }
  return { allowed: window.length <= LIMIT_MAX, count: window.length };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Pure, so it is unit-testable without a request object. */
export function validate(body) {
  const errors = [];
  const clean = {};
  if (typeof body !== "object" || body === null) return { errors: ["Malformed request body."], clean };

  for (const field of ["name", "email", "organization", "message"]) {
    const v = typeof body[field] === "string" ? body[field].trim() : "";
    if (!v) errors.push(`${field} is required.`);
    clean[field] = v;
  }
  if (clean.email && !EMAIL.test(clean.email)) errors.push("email is not a valid address.");
  if (clean.message.length > MAX_MESSAGE) errors.push(`message exceeds ${MAX_MESSAGE} characters.`);
  for (const field of ["name", "email", "organization"]) {
    if (clean[field].length > MAX_FIELD) errors.push(`${field} exceeds ${MAX_FIELD} characters.`);
  }
  // Optional context fields, length-capped, never required.
  for (const field of ["role", "areas", "support", "orgType", "timeline", "budget", "stage", "referral"]) {
    const v = typeof body[field] === "string" ? body[field].trim().slice(0, MAX_FIELD) : "";
    if (v) clean[field] = v;
  }
  return { errors, clean };
}

/** HTML-escape every interpolated value — the email body is attacker-influenced. */
export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function renderEmail(c) {
  const row = (k, v) => (v ? `<tr><td style="padding:4px 12px 4px 0;color:#666">${esc(k)}</td><td>${esc(v)}</td></tr>` : "");
  return `<div style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.6">
<h2 style="margin:0 0 16px">New project inquiry</h2>
<table style="border-collapse:collapse;margin-bottom:20px">
${row("Name", c.name)}${row("Email", c.email)}${row("Organization", c.organization)}${row("Role", c.role)}
${row("Area", c.areas)}${row("Support", c.support)}${row("Org type", c.orgType)}
${row("Timeline", c.timeline)}${row("Budget", c.budget)}${row("Stage", c.stage)}${row("Heard via", c.referral)}
</table>
<div style="white-space:pre-wrap;border-left:3px solid #3367ff;padding-left:14px">${esc(c.message)}</div>
</div>`;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, code: "method_not_allowed" });
  }

  const body = typeof req.body === "string" ? safeParse(req.body) : req.body;

  // Honeypot: a field hidden from humans. Bots fill it. Return 200 so the bot
  // cannot distinguish rejection from success, but send nothing.
  if (body && typeof body.company_website === "string" && body.company_website.trim() !== "") {
    return res.status(200).json({ ok: true });
  }

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  const { allowed } = rateLimit(ip);
  if (!allowed) {
    res.setHeader("Retry-After", "600");
    return res.status(429).json({ ok: false, code: "rate_limited",
      error: "Too many inquiries from this connection. Try again shortly, or email us directly." });
  }

  const { errors, clean } = validate(body);
  if (errors.length) return res.status(400).json({ ok: false, code: "invalid", errors });

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // Fail closed and say so. Never report a success we cannot back.
    console.error("[contact] RESEND_API_KEY is not set — inquiry NOT delivered", {
      from: clean.email, org: clean.organization, at: new Date().toISOString(),
    });
    return res.status(503).json({ ok: false, code: "mail_unconfigured",
      error: "Our form is temporarily unavailable.", fallbackEmail: INQUIRY_TO });
  }

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: INQUIRY_FROM,
        to: [INQUIRY_TO],
        reply_to: clean.email,
        subject: `Inquiry — ${clean.organization} (${clean.name})`,
        html: renderEmail(clean),
      }),
    });
    if (!r.ok) {
      const detail = await r.text();
      console.error("[contact] provider rejected send", r.status, detail.slice(0, 400));
      return res.status(502).json({ ok: false, code: "mail_failed",
        error: "We could not send that just now.", fallbackEmail: INQUIRY_TO });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[contact] send threw", err && err.message);
    return res.status(502).json({ ok: false, code: "mail_failed",
      error: "We could not send that just now.", fallbackEmail: INQUIRY_TO });
  }
}

function safeParse(s) { try { return JSON.parse(s); } catch { return null; } }
