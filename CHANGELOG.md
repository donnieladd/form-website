# Changelog

Working record of what changed, why, and what it cost. Newest first.
Deploy-excluded (`.vercelignore`). The commit history carries the full
mechanism per change; this file is the readable narrative across changes —
where the next session starts before touching anything.

Rule, per the owner (2026-08-13): **annotate everything, every time,
everywhere.** A change without its reasoning written down is half a change.

---

## 2026-08-13 — The repositioning (Phases 0–10, PR #1)

One build, eleven phases, each independently deployable. 17 → 31 pages,
49 → 108 tests, zero pages deleted (one renamed with a 301). The ordering
rule that governed everything: **pages are created before anything links to
them; the nav flips last** — because `tests/pages.test.js` scans
`intel/nav-footer.js`, a nav entry pointing at a missing page fails CI, which
forces the safe sequence and means nothing is ever half-broken in public.

### What the site now is

`formintel.co` is the corporate routing layer for **form. — an AI-augmented
operations, intelligence, and solutions company.** Four practices (advisory &
transformation · solutions & intelligence · creative & experience · managed
services), two flagship capabilities (solutions architecture, AI enablement),
three businesses (digital · creative & marketing · support), two divisions
(labs · learning), a first-class Ministries path, and a contact pipeline that
classifies every inquiry by practice.

Locked rule on every page, enforced structurally: **standard market language
first, form. language second.** The h1 is the market-standard name; the plain-
English lead sits directly under it; proprietary language appears no higher
than the third section.

### Phase log

- **P0 `f8d77b1` — decision ledger.** `DECISIONS.md`: 22 unlocked items, each with an
  honest placeholder and the exact file+line cost of changing it later, so no
  decision blocks the build.
- **P1 `238a031`+`e49723a`+`fa7bc02`+`574dd1d` — global sweep.** The hero was a 1.7MB PNG *named* .jpg (68% of site
  weight, wrong declared dimensions) → AVIF `<picture>` at 25KB measured,
  q80 chosen by PSNR not instinct. Font preconnects ×4 on every page.
  `prefers-reduced-motion` (was zero coverage). CSP in report-only.
  `tests/head.test.js` locks all of it — verify, don't generate.
- **P2 `6fafbb6` — CSS foundation.** Promoted the 5×-duplicated primitives into
  `components.css`; added `.fi-layers`, `.fi-stages`, `.fi-route-card`.
  Proven pixel-identical: five viewports screenshotted before/after,
  byte-identical.
- **P3 `2d9c8e7` — practices + flagships.** Six pages, zero new CSS (the P2 payoff).
  Fixed a pre-existing 320px clip: the h1 clamp floor exceeded the content
  column and `overflow-x:hidden` hid the symptom from `scrollWidth`.
- **P4 `a014b12` — hubs, divisions, businesses.** Eight pages. Labs/learning badges
  mirror what the product pages already claim. Insights ships honestly empty.
- **Truth pass `ddcc5cc`+`784edc6`+`b7f6a57`.** Removed claims the owner never made: a fabricated "40%"
  statistic (now mechanically banned — digit-percent in visible copy fails
  CI), an invented labs origin story, "Taking work now" on a business that
  isn't open (support → "Not open yet", routed through managed services),
  and six articles framed as "in progress" that nobody was writing.
- **P5 `7364821` — homepage.** 4 → 11 sections, zero page-local CSS. Hero = the
  protected brand line over the plain-English descriptor (owner's pick).
  Found+fixed a live production bug: `.fi-btn-light` rendered white-on-white
  because `.fi-body a { color:inherit }` out-specified it — fixed at the
  cascade root, guarded by two tests.
- **P6 `70a4f15` — reworks.** `services.html` → What We Do (URL kept for SEO).
  `sound.html` → `experience.html` with a 301; `form. sound` retired as a
  public name. about/work/digital/continuum reframed; inline `<style>`
  duplicates retired opportunistically.
- **P7 `c748655` — the flip.** New nav (`what we do · businesses · ministries · work ·
  insights · about` + "talk to form." CTA), footer rebuilt, contact taxonomy
  moved to practices **in the same deploy** so nav and form never disagreed,
  sitemap → **28** URLs (the phase-7 commit message says 29 — a miscount;
  31 pages minus three noindex is 28, and the sitemap itself was verified
  complete and exact, so the error existed only in the record),
  burger breakpoint 1080→1180 for the longer labels, and
  the retired vocabulary (`six systems`, `six disciplines`, `one operation`,
  brand-form `form. sound`) added to the RETIRED denylist so it cannot creep
  back without turning CI red.
- **P8 `bdff4bd` — routing, shipped OFF.** `routeFor()` maps practice → inbox
  (advisory@/solutions@/creative@/managed@/ministry@), ministry orgType
  overrides, everything behind `CONTACT_ROUTING=on`. The invariant that makes
  it safe: **hello@ is in to-or-cc on every path, including garbage input** —
  a dead alias delays a lead, never loses one. To turn on: create the five
  aliases, live-test each, `vercel env add CONTACT_ROUTING`. Kill switch:
  `vercel env rm CONTACT_ROUTING`.
- **P9 `b04a66e` — CSP enforcing.** contact.html's inline script (the site's only one)
  → `/intel/contact.js` (defer). All 31 pages verified violation-free in a
  real browser against the exact enforcing header; form exercised end-to-end
  under enforcement. Tests keep both facts true.
- **P10 `7ccda33` — cleanup + lock.** Deleted the dead first-attempt stack (rev.*,
  field.*, mobile.css, root nav-footer.*, perf-*, tokens/ — referenced by no
  live page, excluded from deploy, cost only comprehension). Page floor
  `>= 17` → exact `EXPECTED_PAGES` manifest with deepEqual, so an accidental
  addition OR deletion is loud; changing the page set now deliberately means
  editing the manifest in the same commit.

### The pattern worth remembering

Four production defects this build were found by **looking at rendered
pixels**, not by the test suite: the 320px heading clip, two availability
contradictions (labs "in development" above cards saying "available now"),
and the white-on-white button. The gate is excellent at structure and blind
to appearance and meaning. Screenshot the work. Every time.

### Still open (owner's court)

- The five routing aliases + `CONTACT_ROUTING` env var (P8 activation).
- Which Fontshare host serves the woff2 — check DevTools on the live site
  once, delete the preconnect+CSP entry for whichever host never appears.
- Field-condition Lighthouse on the live deployment (sandbox egress blocked
  it; localhost perf numbers are meaningless and were not reported).
- `DECISIONS.md` items still ⚪ — practice scopes, ministries sub-pages,
  case-study content, insights articles.

---

## 2026-08-02 — Baseline (pre-repositioning)

`ba439a8` — main's last commit before the repositioning branch. 17 pages,
"six disciplines / six systems" model, 49 tests. The state this changelog's
first real entry rebuilt from. (An earlier draft of this entry said
2026-08-01, read off the sitemap's lastmod instead of the actual commit —
this file gets the same verification standard as the site.)
