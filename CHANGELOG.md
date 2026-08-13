# Changelog

Working record of what changed, why, and what it cost. Newest first.
Deploy-excluded (`.vercelignore`). The commit history carries the full
mechanism per change; this file is the readable narrative across changes —
where the next session starts before touching anything.

Rule, per the owner (2026-08-13): **annotate everything, every time,
everywhere.** A change without its reasoning written down is half a change.

---

## 2026-08-13 — Services architecture rebuilt to the superseding directive

The owner issued a canonical services-architecture directive that supersedes
prior parent-site architecture. The core correction: earlier versions blurred
**methodology**, **capability**, **specialized business** and **engagement
model** into one flat list of "practices". They are not interchangeable, and
the site now separates them.

**Solutions Architecture is the method, not a door.** It moved above the
capabilities on `services.html` under a "how we work" heading, and its own
page now says plainly that it is not a service competing with the others —
it is how form. decides which of them a problem actually needs.

**Six capability doors replace four practices.** Advisory & Transformation ·
Solutions & Intelligence · Digital Services · Creative & Marketing · Live
Experience · Support. Deliberately *not* rebranded as "six practices": the
directive is explicit that the count is not part of the brand promise, so
`tests/content.test.js` now bans "four/five/six practices" outright and the
copy says "capabilities" instead. That test also bans the retired page names
and `managed@formintel.co`, so none of this can quietly come back.

**Creative & Experience split in two.** They were never one buying category —
brand/campaign work and live production have different buyers, different
disciplines and different businesses behind them. `creative-experience.html`
retired with a 301 to `/creative-marketing.html`, which carries the larger
share of that page's intent; the live half is one click on from there.

**Managed Services became Support**, with a genuinely wider mandate than
managed IT: three territories — human (executive/virtual/administrative
capacity), systems (platform, technical, automation and AI operations) and
operational (recurring execution). `support.html` was rewritten from a
"not open yet, go to managed services" holding page into the real capability
page, absorbing what was worth keeping from `managed-services.html`, which is
retired with a 301. It also states where Support *stops*, because a support
category with no boundary becomes the dumping ground for everything.

**Continuum was pulled out from under Managed Services.** Its old eyebrow read
"the standing partnership — inside managed services", which is exactly the
misclassification the directive names. It is an engagement model, not a
practice and not a support plan: services answer *what expertise do you need*,
Continuum answers *how continuously do you want form. alongside you*. It now
cross-links from the homepage, What We Do, and every capability page.

**No public form. AI business.** AI stays anchored in Solutions &
Intelligence; `digital.html` was rewritten so AI-enabled applications read as
a first-class capability rather than a third bullet, with a fourth card for
integrations and digital infrastructure.

**Contact taxonomy and routing.** The dropdown collapsed from three optgroups
and fourteen options to the directive's nine, phrased in buyer intent. The
routing table maps them to the canonical aliases — `advisory@` `solutions@`
`digital@` `creative@` `experience@` `support@` `continuum@` `ministry@` —
and tags are now the CRM classification values (`ADVISORY`, `SOLUTIONS`, …)
rather than display labels, so a copy edit cannot change what the CRM records.

Two routing details worth knowing about:

- **The retired option strings still classify.** HTML pages ship with no
  explicit cache header, so a visitor sitting on a cached `contact.html` will
  POST the old taxonomy for a while yet. A legacy block keeps those inquiries
  classified instead of dumping them into "unclassified", and a test pins it.
- **One legacy string is ambiguous by construction.** "Keep it running —
  managed services / Continuum" names both destinations. It resolves to
  Support, because "keep it running" is the buyer's actual intent and
  `managed@` — the route it used to take — became `support@`. That required
  ordering the legacy rule above the Continuum rule; the reason is written at
  the line so nobody re-sorts the table and silently changes where those
  leads go.

A new test asserts `routeFor` can never return an alias outside the canonical
set, so a typo in the table fails the build rather than mailing leads to an
address nobody reads.

**Blocked on a human step, stated plainly:** `digital@`, `experience@` and
`support@` are new aliases. They must exist and be live-tested before
`CONTACT_ROUTING` is switched on. The no-lead-lost invariant still holds
either way — `hello@` is in to-or-cc on every route — but until those
mailboxes exist, the practice-side copy of an inquiry has nowhere to land.

`npm run verify` — 110/110 green. Page set: 31 → 29.

---

## 2026-08-13 — Business landing pages + approved pricing + QA sweep

Three moves, one commit:

- **`creative-marketing.html` rebuilt on the `digital.html` pattern** — the
  branded site-card with wordmark and tag, because the agency is getting its
  own dedicated site (owner is building it now). Until it launches this page
  is the front door; the card carries an amber "dedicated site in build"
  chip, and the swap to a live "Visit" button + domain chip is annotated in
  the page CSS as a one-block change. `social by form.` gets its own section
  with scope and price.
- **Published pricing, deliberately unbanned.** The blanket no-rates rule
  dated from *unverified* figures shipping in 2026-08. The owner approved two
  starting rates verbatim ("seventy five hundred bucks a month" for creative
  & marketing retainers; social by form. "starts at five grand a month"), so
  the guard became a per-page allowlist: `$7,500` and `$5,000` are legal on
  `creative-marketing.html` only. Mutation-tested both ways — an unapproved
  figure fails, an approved figure on the wrong page fails. (First mutation
  run passed vacuously because the seed sed matched nothing — re-run with
  the insertion verified. A mutation test that can't prove its mutation
  landed proves nothing.)
- **`messages.html` marked as the launchpad** for the standalone messages
  platform site (a paid product, owner's call) — a platform card in the hero
  mirrors the digital.html unit, with the same annotated one-block swap for
  when the site ships. Product content unchanged; still no published price
  for messages (none was approved).

**QA sweep** across all 31 pages at 1400px and 320px in a real browser:
zero horizontal overflow, zero clipped headings, zero page errors, nav
holds one line at 1181px. Plus the 112-test gate, green.

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
