# Changelog

Working record of what changed, why, and what it cost. Newest first.
Deploy-excluded (`.vercelignore`). The commit history carries the full
mechanism per change; this file is the readable narrative across changes —
where the next session starts before touching anything.

Rule, per the owner (2026-08-13): **annotate everything, every time,
everywhere.** A change without its reasoning written down is half a change.

---

## 2026-08-13 — League Spartan adopted as the label voice

Trialed on a preview deploy, adopted by the owner the same day. The rules,
in their words: League Spartan replaces IBM Plex Mono everywhere **except**
the "vision needs structure." slogan, and "when we use League Spartan, it
needs to be in all caps."

Mechanically:

- `--fi-label` (League Spartan) is the new label-voice token — eyebrows,
  `[ NN ]` numerals, status chips, route-card kickers, footer column heads,
  and every page-local micro-label (14 blocks across 9 pages were found
  using the old token inside `<style>` blocks — the shared-CSS sweep alone
  would have missed them).
- `--fi-mono` (IBM Plex Mono) survives with exactly one user:
  `.fi-footer-tag`, the slogan.
- Five blocks that previously had no `text-transform` (numeral-only labels,
  the digital.formintel.co URL chip, founder credential categories, the
  messages price captions) gained `uppercase` so the all-caps rule holds
  everywhere the face appears.
- Every head loads both families from one Google Fonts stylesheet.

**Enforced, not remembered:** `tests/typography.test.js` (109 → 112 tests)
fails the build if a League Spartan block lacks `uppercase`, if anything
but the slogan uses `--fi-mono`, or if a page drops either family. Both
guards were mutation-tested — each seeded violation turned the suite red.
(The mutation testing itself ate a lesson: `git checkout` on a file with
uncommitted real work restores the pre-work version — the components.css
sweep had to be re-applied. Stage before you mutate.)

---

## 2026-08-13 — Standard English for nav and buttons

Owner's direction, verbatim scope: "use english standard writing for the Nav
bar and for all buttons throughout the site." The all-lowercase treatment is
retired for those two surfaces only; headings stay lowercase because CSS
(`text-transform: lowercase`) enforces them regardless of authored casing.

The system applied, so future edits stay consistent:

- **Nav labels: Title Case** ("What We Do", "Businesses", …) — including the
  mobile panel and the contact-page nav state.
- **Buttons: sentence case** ("Explore what we do →", "Start a project →") —
  94 buttons across all 31 pages, rewritten by script with every change
  printed and reviewed, not by hand.
- **Brand and product marks stay lowercase everywhere**, per the locked brand
  rule: "Talk to form." keeps `form.` lowercase; the `intellect by form.` and
  `messages by form.` buttons are untouched in full.
- **Named offerings keep proper-noun capitals** inside button text:
  Solutions & Intelligence, Managed Services, Solutions Architecture,
  Applied AI.
- The footer nav column reuses the nav array but renders lowercase via its
  own `text-transform` — deliberate, so this change touches exactly the two
  surfaces the owner named.

Verified: no test pinned the old strings; `.fi-nav-link` and `.fi-btn` carry
no `text-transform`, so authored casing is what renders.

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

### Routing activation — live-tested 2026-08-13

The five practice aliases were created in Google Workspace (MX
`smtp.google.com`; the aliases live on the owner's user, same inbox as
`hello@`) and **verified by real sends, not by assumption**:

- 12:25 UTC, first round: advisory@, solutions@ and creative@ accepted;
  **managed@ and ministry@ hard-bounced** ("Address not found") — they had
  not actually saved in Admin. This is exactly what the live-test gate
  exists to catch: with routing on, those two routes would have pointed at
  a void (the always-CC to hello@ would still have caught every lead).
- 12:51 UTC, after re-adding: both accepted, zero bounces. **5/5 PASS.**

Verification method worth keeping: on a same-account alias Gmail keeps one
copy (the sent message is the delivered message), so a mailer-daemon bounce
is the only failure signal — and Google returned the failed-round bounces
within four seconds, so short silence is conclusive acceptance.

### Still open (owner's court)

- ~~The five routing aliases~~ **Done, 5/5 live-tested.** Remaining for P8
  activation: merge PR #1 → `vercel env add CONTACT_ROUTING production` =
  `on` → deploy → submit one inquiry per practice on the live form and
  confirm tag + alias + hello@ CC on each.
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
