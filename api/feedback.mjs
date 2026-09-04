/**
 * POST /api/feedback — review-page feedback (the-friday-drop and successors).
 *
 * Same posture as /api/contact: never report a success it cannot back. If the
 * mail provider is unconfigured or errors, return a machine-readable code and
 * let the page fall back to a direct email with the note preserved.
 *
 * Body: { name, piece, note, drop, "bot-field"? } as JSON.
 * Delivery: one email to the founder's inbox, subject tagged with the piece.
 */

export const FEEDBACK_TO = "dontae@innovativemusic.cc";
const FEEDBACK_FROM = process.env.CONTACT_FROM || "form. website <noreply@formintel.co>";

const LIMIT_MAX = 12;
const LIMIT_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map();

export function rateLimit(key, now = Date.now()) {
  const window = (hits.get(key) || []).filter((t) => now - t < LIMIT_WINDOW_MS);
  window.push(now);
  hits.set(key, window);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < LIMIT_WINDOW_MS)) hits.delete(k);
  }
  return { allowed: window.length <= LIMIT_MAX };
}

export function validate(body) {
  const errors = [];
  const clean = {};
  if (typeof body !== "object" || body === null) return { errors: ["Malformed request body."], clean };
  for (const [field, max] of [["name", 120], ["piece", 160], ["note", 6000], ["drop", 80]]) {
    const v = typeof body[field] === "string" ? body[field].trim() : "";
    if (!v && field !== "drop") errors.push(`${field} is required.`);
    if (v.length > max) errors.push(`${field} exceeds ${max} characters.`);
    clean[field] = v.slice(0, max);
  }
  return { errors, clean };
}

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function renderEmail(c) {
  return `<div style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.6">
<h2 style="margin:0 0 12px">Feedback · ${esc(c.drop || "drop")}</h2>
<table style="border-collapse:collapse;margin-bottom:16px">
<tr><td style="padding:4px 12px 4px 0;color:#666">From</td><td>${esc(c.name)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666">Piece</td><td>${esc(c.piece)}</td></tr>
</table>
<div style="white-space:pre-wrap;border-left:3px solid #3d6bff;padding-left:14px">${esc(c.note)}</div>
</div>`;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, code: "method_not_allowed" });
  }
  const body = typeof req.body === "string" ? safeParse(req.body) : req.body;
  if (body && typeof body["bot-field"] === "string" && body["bot-field"].trim() !== "") {
    return res.status(200).json({ ok: true });
  }
  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (!rateLimit(ip).allowed) {
    res.setHeader("Retry-After", "600");
    return res.status(429).json({ ok: false, code: "rate_limited" });
  }
  const { errors, clean } = validate(body);
  if (errors.length) return res.status(400).json({ ok: false, code: "invalid", errors });

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("[feedback] RESEND_API_KEY is not set — feedback NOT delivered", { piece: clean.piece, at: new Date().toISOString() });
    return res.status(503).json({ ok: false, code: "mail_unconfigured", fallbackEmail: FEEDBACK_TO });
  }
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FEEDBACK_FROM,
        to: [FEEDBACK_TO],
        subject: `Friday Drop feedback · ${clean.piece} · ${clean.name}`,
        html: renderEmail(clean),
      }),
    });
    if (!r.ok) {
      console.error("[feedback] provider rejected send", r.status, (await r.text()).slice(0, 300));
      return res.status(502).json({ ok: false, code: "mail_failed", fallbackEmail: FEEDBACK_TO });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[feedback] send threw", err && err.message);
    return res.status(502).json({ ok: false, code: "mail_failed", fallbackEmail: FEEDBACK_TO });
  }
}

function safeParse(s) { try { return JSON.parse(s); } catch { return null; } }
