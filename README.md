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

49 tests, Node's built-in runner, no dependencies to install. **This must pass
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

## Deploying

```bash
npm run verify && vercel deploy --prod --scope formintel
```

`.vercelignore` paths are **anchored with a leading slash on purpose**. An
unanchored pattern like `nav-footer.css` also matches `intel/nav-footer.css`,
which would ship every page with no nav and no footer. A test guards this.

## Structure

```
*.html            17 pages, each self-contained apart from /intel
intel/            shared design system — tokens, components, nav+footer, product
intel/nav-footer.js  injects nav, footer, and the atmosphere layer on every page
api/contact.mjs   contact form handler
tests/            verify gate
_first-attempt/   superseded pages, kept for reference, never deployed
```

Colour tokens carry their measured WCAG ratio in a comment. Every value used for
text clears 4.5:1 against `--fi-black`; `tests/contrast.test.js` fails the build
if one regresses.
