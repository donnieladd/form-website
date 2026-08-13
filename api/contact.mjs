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
  // `practice` is the classification field as of 2026-08-13; `areas` is its
  // predecessor and stays accepted because HTML pages carry no explicit
  // cache header — a visitor on a cached contact page will still POST the
  // old field name for a while.
  for (const field of ["role", "practice", "areas", "support", "orgType", "timeline", "budget", "stage", "referral"]) {
    const v = typeof body[field] === "string" ? body[field].trim().slice(0, MAX_FIELD) : "";
    if (v) clean[field] = v;
  }
  return { errors, clean };
}

/**
 * Deterministic inquiry routing. No AI, no inference — a table lookup over the
 * `practice` select's option strings, matched by stable substrings so copy
 * edits to the visible labels don't silently break classification.
 *
 * The canonical aliases, per the 2026-08-13 architecture directive:
 *   advisory@ solutions@ digital@ creative@ experience@ support@ continuum@
 * plus ministry@ for the ministry classification workflow and hello@ as the
 * house inbox. `managed@` is retired — Managed Services became Support.
 *
 * Invariants, in order of importance:
 *   1. NO LEAD IS EVER LOST. INQUIRY_TO is either the recipient or always CC'd,
 *      so the house inbox sees 100% of inquiries even if an alias is dead.
 *   2. Unknown, missing, or ambiguous input falls back to INQUIRY_TO with
 *      reason "unclassified" — never a guess.
 *   3. orgType "Ministry / Church" overrides the practice route: the ministry
 *      hub is the buyer-facing doorway; fulfilment routes internally.
 *
 * The whole feature sits behind CONTACT_ROUTING === "on". Unset, delivery is
 * identical to the pre-routing behaviour (single recipient, no cc, untagged
 * subject); the email body gains only an audit row saying routing is off.
 * Kill switch: `vercel env rm CONTACT_ROUTING` — no code deploy.
 *
 * The aliases below must EXIST and be tested with a live send before the flag
 * is turned on. Creating them is a human step, deliberately outside this code.
 */
const ROUTES = [
  /* ── Current taxonomy (2026-08-13 architecture directive) ──────────────
     One route per capability door, plus Continuum and Ministry. Tags are the
     CRM classification values, not display labels, so a copy edit to an
     option string never changes what the CRM records.

     Ministry is matched FIRST: "Ministry Solutions" must not fall into the
     Solutions route on the way past. */
  { match: /ministry/i, to: "ministry@formintel.co", tag: "MINISTRY" },
  { match: /advisory\s*&(amp;)?\s*transformation|something needs to change|something has to change/i, to: "advisory@formintel.co", tag: "ADVISORY" },
  { match: /solutions\s*&(amp;)?\s*intelligence|system architected|system built/i, to: "solutions@formintel.co", tag: "SOLUTIONS" },
  { match: /digital services|form\.\s*digital|technology built/i, to: "digital@formintel.co", tag: "DIGITAL" },
  { match: /creative\s*&(amp;)?\s*marketing/i, to: "creative@formintel.co", tag: "CREATIVE" },
  { match: /live experience|form\.\s*experience/i, to: "experience@formintel.co", tag: "EXPERIENCE" },

  /* Ordering note: this legacy rule has to outrank the Continuum rule below.
     The retired option string was "Keep it running — managed services /
     Continuum", naming both. "Keep it running" is the buyer's actual intent
     and managed@ — this route's predecessor — became support@, so Support
     wins the tie. No current option string matches this pattern. */
  { match: /managed services|keep it running/i, to: "support@formintel.co", tag: "SUPPORT" },

  { match: /continuum/i, to: "continuum@formintel.co", tag: "CONTINUUM" },
  { match: /\bsupport\b/i, to: "support@formintel.co", tag: "SUPPORT" },

  /* ── Legacy option strings ─────────────────────────────────────────────
     HTML pages carry no explicit cache header, so a visitor sitting on a
     cached contact.html will POST the retired taxonomy for a while yet.
     These keep those inquiries classified instead of dumping them into
     "unclassified". Safe to delete once the old page has aged out.

     "Creative & Experience" was split into two doors on 2026-08-13; the
     legacy string carries no signal about which half the buyer meant, so it
     routes to creative@ (the larger share of that intent) with the house
     inbox CC'd as always. */
  { match: /creative\s*&(amp;)?\s*experience/i, to: "creative@formintel.co", tag: "CREATIVE" },
  { match: /messages by form/i, to: "creative@formintel.co", tag: "CREATIVE" },
  { match: /labs product|processes, people or ledger/i, to: "solutions@formintel.co", tag: "SOLUTIONS" },
  { match: /form\.\s*learning|curriculum/i, to: "solutions@formintel.co", tag: "SOLUTIONS" },
  { match: /\bai\b/i, to: "solutions@formintel.co", tag: "SOLUTIONS" },
];

export function routeFor(clean) {
  const fallback = { to: INQUIRY_TO, cc: null, tag: null, reason: "unclassified" };
  if (typeof clean !== "object" || clean === null) return fallback;

  // The ministry override comes first: a church asking for a digital build
  // still enters through the ministry door.
  if (typeof clean.orgType === "string" && /ministry\s*\/\s*church/i.test(clean.orgType)) {
    return { to: "ministry@formintel.co", cc: INQUIRY_TO, tag: "MINISTRY", reason: "orgType is Ministry / Church" };
  }

  const practice = typeof clean.practice === "string" ? clean.practice : "";
  if (!practice || /not sure yet|multiple areas/i.test(practice)) return fallback;

  for (const route of ROUTES) {
    if (route.match.test(practice)) {
      return {
        to: route.to,
        cc: route.to === INQUIRY_TO ? null : INQUIRY_TO,
        tag: route.tag,
        reason: `practice matched "${route.tag}"`,
      };
    }
  }
  return fallback;
}

/** HTML-escape every interpolated value — the email body is attacker-influenced. */
export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function renderEmail(c, routed) {
  const row = (k, v) => (v ? `<tr><td style="padding:4px 12px 4px 0;color:#666">${esc(k)}</td><td>${esc(v)}</td></tr>` : "");
  // The audit row: where this inquiry went and why. Never claims more than it
  // did — with routing off it says so plainly.
  const routedTo = routed
    ? `${routed.to} (${routed.reason})`
    : `${INQUIRY_TO} (default — routing disabled)`;
  return `<div style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.6">
<h2 style="margin:0 0 16px">New project inquiry</h2>
<table style="border-collapse:collapse;margin-bottom:20px">
${row("Name", c.name)}${row("Email", c.email)}${row("Organization", c.organization)}${row("Role", c.role)}
${row("Practice", c.practice)}${row("Area", c.areas)}${row("Support", c.support)}${row("Org type", c.orgType)}
${row("Timeline", c.timeline)}${row("Budget", c.budget)}${row("Stage", c.stage)}${row("Heard via", c.referral)}
${row("Routed to", routedTo)}
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

  // Routing is opt-in via env so a misconfigured alias can be rolled back with
  // `vercel env rm CONTACT_ROUTING` — instant, no code deploy.
  const routingOn = process.env.CONTACT_ROUTING === "on";
  const routed = routingOn ? routeFor(clean) : null;
  const to = routed ? [routed.to] : [INQUIRY_TO];
  const cc = routed && routed.cc ? [routed.cc] : undefined;
  const subject = routed && routed.tag
    ? `[${routed.tag}] Inquiry — ${clean.organization} (${clean.name})`
    : `Inquiry — ${clean.organization} (${clean.name})`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: INQUIRY_FROM,
        to,
        ...(cc ? { cc } : {}),
        reply_to: clean.email,
        subject,
        html: renderEmail(clean, routed),
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
