# form. — formintel.co

Static marketing site. Plain HTML/CSS/JS, **zero runtime dependencies**, one
serverless function for the contact form.

## Run it locally

```bash
python3 -m http.server 5050
# http://localhost:5050
```

No build step. Files are served as authored.

## Verify before shipping

```bash
npm run verify
```

68 tests, Node's built-in runner, no dependencies to install. **This must pass
before any production deploy.** CI runs it on every push and pull request
(`.github/workflows/verify.yml`).

Each test encodes a defect that actually reached the repo — contrast tokens,
`.vercelignore` anchoring, published pricing, retired entity names, dangling
links, canonical resolution. See the header comment in each file for the
mechanism it guards.

## Environment variables

| Name | Required | If missing |
|---|---|---|
| `RESEND_API_KEY` | **Yes, for the contact form** | `/api/contact` returns `503 mail_unconfigured`. The form then shows the visitor a prefilled `mailto:` link so the inquiry is **never silently lost**. The rest of the site is unaffected. |
| `CONTACT_FROM` | No | Defaults to `form. website <noreply@formintel.co>`. Must be on a domain verified in Resend. |

### First-time setup for `RESEND_API_KEY`

1. Create the key at <https://resend.com/api-keys>.
2. Scope it **Sending access only**, restricted to the `formintel.co` domain —
   not full access. It only ever needs to send one email to one inbox.
3. Verify `formintel.co` in Resend (DNS records) so `CONTACT_FROM` can send.
4. Add it to Vercel — never commit it, never paste it into a chat or an issue:

```bash
vercel env add RESEND_API_KEY production --scope formintel
```

5. Redeploy so the function picks it up, then submit a real test inquiry and
   confirm it arrives at `hello@formintel.co`.

**Rotation:** owned by Dontae. Rotate if the key is ever exposed in a log,
screenshot, or shared terminal.

## Contact endpoint

`POST /api/contact` → `api/contact.mjs`

- Requires `name`, `email`, `organization`, `message`; optional context fields are length-capped.
- Honeypot field `company_website`; bots get `200` with nothing sent.
- Rate limit 5 per 10 minutes per IP. **Per-instance, in memory** — it raises the
  cost of casual abuse but is not a distributed limiter. Deliberate: the blast
  radius is one email to one inbox, and a shared-state dependency would cost
  more than it protects.
- All values HTML-escaped before rendering into the email body.
- Never reports success it cannot back. Provider failure returns `502`/`503`
  with `fallbackEmail`, and the client surfaces the prefilled mail link.

## Where the record lives

Three documents, three jobs — deploy-excluded, and `tests/deploy-manifest.test.js`
fails the build if any of them goes missing (a lesson learned: CHANGELOG.md was
cited by `.vercelignore` for weeks before it existed):

- **`CHANGELOG.md`** — the narrative record. What changed, why, what it cost,
  with a commit anchor per phase. Start here before touching anything.
- **`DECISIONS.md`** — the open-items ledger. What is locked, what is a
  placeholder, who decides, and the exact edit cost when a decision lands.
- **Commit messages** — the mechanism. Every commit states what broke or
  what was at risk, how the change addresses it, and how it was verified.

Standing rule from the owner (2026-08-13): **annotate everything, every time,
everywhere.** A change without its reasoning written down is half a change.

## Security headers

Set in `vercel.json` for `/(.*)`, so they cover every page and every asset with
no per-page markup. JSON has no comments, so the reasoning lives here.

`Content-Security-Policy` is **enforcing** (promoted from report-only
2026-08-13, after the one predicted violation was fixed). `script-src 'self'`
became possible when `contact.html`'s inline handler — the only inline script
on the site — moved to `/intel/contact.js` (loaded with `defer`; behaviour
verified unchanged: counter, validation, submit, mailto fallback). All pages
verified violation-free in a browser against this exact header, and
`tests/head.test.js` fails the build if an inline `<script>` reappears or the
header regresses to report-only.

Two honest limits, stated rather than hidden:

- **`style-src` needs `'unsafe-inline'`** and will for the foreseeable future.
  Pages carry page-local `<style>` blocks and inline `style=` attributes
  throughout. Removing that requires a build step, which this repo has
  deliberately refused.
- **`font-src` allows both `api.fontshare.com` and `cdn.fontshare.com`**
  because the woff2-serving host could not be verified from CI (unreachable
  there). If the wrong one is blocked in production the failure mode is a
  fallback font, not broken behaviour — check DevTools once on the live site
  and delete whichever host never appears.

## Images

`intel/assets/` holds the homepage hero at three sizes. Serve AVIF via
`<picture>` with a real JPEG fallback:

| File | Size | Role |
|---|---|---|
| `hero-1376.avif` | 25 KB | primary, native resolution |
| `hero-688.avif` | 7 KB | small viewports / low DPR |
| `hero-1376.jpg` | 42 KB | fallback for browsers without AVIF |

This replaced a single 1.7 MB file named `hero.jpg` that was **actually a PNG** —
photographic content in a lossless format, 68% of the site's total weight, and
a Content-Type that disagreed with its extension. It also declared
`width="1920" height="1080"` while the real file was 1376×768, so the browser
reserved the wrong aspect box.

`tests/head.test.js` asserts the declared dimensions match the real file, that
an AVIF source exists, that the hero carries `fetchpriority="high"`, and that
every `srcset` candidate exists on disk — `srcset` is a comma-separated list
with width descriptors, so it slips past the `deploy-manifest` asset check.

**If you re-encode:** the source is dark and low-detail, so AVIF q80 matches a
q82 JPEG's fidelity (44.3 dB vs 44.1 dB PSNR) at 60% of the size while
retaining 186 of 192 luma levels in the gradient — no banding. Higher quality
buys nothing measurable.

## Deploying

```bash
npm run verify && vercel deploy --prod --scope formintel
```

`.vercelignore` paths are **anchored with a leading slash on purpose**. An
unanchored pattern like `nav-footer.css` also matches `intel/nav-footer.css`,
which would ship every page with no nav and no footer. A test guards this.

## Structure

```
*.html            29 pages, each self-contained apart from /intel
                  (the exact set is pinned in tests/pages.test.js)
intel/            shared design system — tokens, components, nav+footer, product
intel/nav-footer.js  injects nav, footer, and the atmosphere layer on every page
api/contact.mjs   contact form handler
tests/            verify gate
_first-attempt/   superseded pages, kept for reference, never deployed
```

Colour tokens carry their measured WCAG ratio in a comment. Every value used for
text clears 4.5:1 against `--fi-black`; `tests/contrast.test.js` fails the build
if one regresses.
