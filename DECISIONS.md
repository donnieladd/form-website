# Decision ledger

The repositioning has 22 items that are **not locked**. This file exists so that none
of them blocks the build.

Every open item ships a **placeholder** — real, honest content that is safe to publish
today — and records the **exact edit cost** to change it later. When an item is decided,
change the rows listed, flip the status, and note the date. No item should ever be
"waiting" while the build stalls behind it.

**Rule:** nothing ships as a placeholder if it would be a lie, a dead link, or a
fabricated number. A placeholder is a real answer we might revise, never filler.
`work.html` is the reference example — it says plainly that case studies aren't up yet
rather than inventing them.

Status: 🔒 locked · 🟡 placeholder shipped · ⚪ not yet built

---

## Locked

| # | Item | Decision | Date |
|---|---|---|---|
| 12 | form. methodology / IP | **UNDERSTAND → DIAGNOSE → ARCHITECT → BUILD → OPERATIONALIZE → LEARN** | 2026-08-12 |
| 21 | Insights structure | Ship the structure with an honest "first pieces publishing soon" state. No fabricated back catalogue. | 2026-08-12 |
| — | Orphan products | `processes` / `people` / `ledger` → **form. labs**. `intellect` → **form. learning**. | 2026-08-12 |
| — | `form. sound` | Retires as a public name; folds into **form. experience**. | 2026-08-12 |
| — | Business units | `form. creative & marketing` and `form. support` built in this repo first, split to own domains later. `form. digital` already external. | 2026-08-12 |
| — | Published pricing | Owner-approved starting rates only, per-page allowlisted in `tests/content.test.js`: creative & marketing retainers **from $7,500/month**, `social by form.` **from $5,000/month** (both on `creative-marketing.html`). Any other figure anywhere fails the build. | 2026-08-13 |
| — | Standalone sites | `form. creative & marketing` gets its own site (owner building now) — `creative-marketing.html` is the landing page until launch, then links out like `digital.html` does. `messages by form.` becomes its own paid product site, launched from `messages.html`. | 2026-08-13 |

---

## Open

| # | Item | Status | Placeholder shipping | Decides | Files that change |
|---|---|---|---|---|---|
| 1 | Parent-company descriptor | 🟡 | "form. is an AI-augmented operations, intelligence, and solutions company." | Owner | `index.html` §01 lead · `about.html` hero · `intel/nav-footer.js` footer tag — **3 strings** |
| 2 | Advisory & Transformation scope | ⚪ | Capability list from the brief, no pricing | Owner | `advisory-transformation.html` §steps — ~8 strings |
| 3 | Solutions & Intelligence scope | ⚪ | Capability list from the brief | Owner | `solutions-intelligence.html` §steps — ~10 strings |
| 4 | AI Enablement offer architecture | ⚪ | Six stages, named only: READINESS / STRATEGY / WORKFORCE / WORKFLOWS / GOVERNANCE / IMPLEMENTATION | Owner | `ai-enablement.html` §stages — 6 labels + 6 lines |
| 5 | Solutions Architecture offer architecture | ⚪ | Six layers, named only: PEOPLE / PROCESS / TECHNOLOGY / DATA / INTELLIGENCE / EXPERIENCE | Owner | `solutions-architecture.html` §layers — 6 labels + 6 lines |
| 6 | Creative & Experience scope | ⚪ | Capability list from the brief | Owner | `creative-experience.html` — ~10 strings |
| 7 | Managed Services scope | ⚪ | Capability list; Continuum named as the program behind it | Owner | `managed-services.html` · `continuum.html` cross-link |
| 8 | Business-unit architecture | 🟡 | 3 units: digital (external), creative & marketing, support | Owner | `businesses.html` cards · `intel/nav-footer.js:103-110` |
| 9 | Product / specialized-solution architecture | 🟡 | labs = processes/people/ledger · learning = intellect · messages + social under creative & marketing | Owner | `labs.html` · `learning.html` · `intel/nav-footer.js:103-110` |
| 10 | Ministries hub architecture | ⚪ | Four routing doors mirroring the four practices, plus ministry products | Owner | `ministries.html` — the largest single-page copy surface |
| 11 | Industry architecture | ⚪ | 5 contexts: Churches & Ministries · Business & Enterprise · Professional Services · Media/Creative · Mission-Driven | Owner | `industries.html` tag row — 5 labels |
| 13 | Top navigation | 🟡 | `what we do · businesses · ministries · work · insights · about` + CTA. **`labs` and `learning` deliberately one click deep** — see plan. | Owner | `intel/nav-footer.js:5-12` — **1 file, drives nav + mobile + footer** |
| 14 | Intelligent-intake architecture | 🟡 | Deterministic `routeFor()` table SHIPPED behind `CONTACT_ROUTING` (off). To turn on: create advisory@/solutions@/creative@/managed@/ministry@ aliases, send a live test to each, then `vercel env add CONTACT_ROUTING production` = `on`. Kill switch: `vercel env rm CONTACT_ROUTING`. | Owner | aliases + env var (manual) — code is done |
| 15 | Homepage copy | 🟡 | Brand line retained, plain-English descriptor beneath | Owner | `index.html` — all 11 sections |
| 16 | Homepage wireframe | 🟡 | 11 sections per the brief | Owner | `index.html` structure |
| 17 | Individual practice pages | ⚪ | Four pages on the shared product template | Owner | the 4 practice files |
| 18 | Individual ministry pages | ⚪ | Hub only; no sub-pages in v1 | Owner | `ministries.html` |
| 19 | Business-unit routing | 🟡 | Internal links to in-repo BU pages; `form. digital` routes out | Owner | `businesses.html` · `digital.html` |
| 20 | Case-study system | 🟡 | **Honest empty state retained.** Structure: context / what we built / what we can't say yet. | Owner | `work.html` |
| 22 | AI workforce ownership & handoff | ⚪ | Not built. Deterministic routing is the floor and stays the floor. | Owner | prerequisites listed in the plan |

---

## Working principle

Per the brief, an item is only **locked** once all of these are answered:

what is it · is it a practice, business unit, product, capability, industry path, or offer ·
what problem does it solve · who buys it · what language does the market already
understand · what form. language sits on top of that · where does it live on the parent
site · does it need its own page or site · what is the CTA · who or what owns the lead ·
what happens after conversion · what should **not** be included.

## The one rule that governs all of it

**Standard market language first. form. language second.**

A first-time visitor must be able to engage immediately, without decoding internal
vocabulary. Structurally enforced on every page: the `h1` is the market-standard name,
the lead paragraph beneath it is plain English, and proprietary form. language appears
no higher than the third section.
