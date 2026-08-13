# form. — project record pointer

**This file was rewritten on 2026-08-13. Read this header before trusting
anything you remember about the previous version.**

The previous replit.md carried a "Locked Doctrine (DO NOT VIOLATE)" section
describing a four-division / twelve-entity brand system (`form. services /
products / labs / learning`, `relay by form.`, `frame by form.`, `axis by
form.`, `formation`, Signal Green `#39FF14`, Canela, a `vision / standards /
ecosystem` navigation). **None of that describes the shipped site, and most
of it never did** — of its twelve "locked" entities, only three ever appeared
in a live page, and several of its mandated names are now on the RETIRED
denylist in `tests/content.test.js`, meaning reintroducing them fails CI.

That mattered because this file is read as *instructions* by Replit's agent.
A stale doctrine here is not a harmless archive — it is an agent actively
enforcing a retired brand against the current site. So it was replaced, not
annotated around.

## What the site actually is (2026-08-13)

`formintel.co` is the corporate routing layer for **form. — an AI-augmented
operations, intelligence, and solutions company.**

The public architecture separates four things that earlier versions of this
site blurred together — **methodology**, **capability**, **specialized
business**, and **engagement model**:

- **How we work** — **Solutions Architecture**, the method behind everything.
  It is deliberately *not* a service door competing with the capabilities.
- **What we do** — six buyer-facing capability doors: advisory &
  transformation · solutions & intelligence · digital services · creative &
  marketing · live experience · support. The *count* is not a brand promise;
  "four practices" is retired and banned in `tests/content.test.js`, and so
  are "five"/"six practices".
- **How we can work together** — individual engagements, or **Continuum**,
  the ongoing partnership model. Continuum is not a practice and does not
  live under Support.
- **Specialized businesses** — form. digital · form. creative & marketing ·
  form. experience · form. support. The capability is the public category;
  the business is the operating brand that fulfils it (Digital Services →
  form. digital, Live Experience → form. experience).

Plus AI enablement as a flagship capability, two divisions (form. labs ·
form. learning), a first-class Ministries path, and a contact pipeline that
classifies inquiries into the CRM taxonomy and routes them to the canonical
alias.

Static HTML/CSS/JS, zero dependencies, no build step. Deployed on Vercel;
`npm run verify` (110 tests) must pass before any deploy.

## Where the truth lives — in order

1. **`CHANGELOG.md`** — the narrative record, one entry per body of work,
   with a commit anchor per phase. Start here.
2. **`DECISIONS.md`** — what is locked, what is a placeholder, who decides.
3. **`README.md`** — how to run, verify, and deploy; security posture;
   image pipeline.
4. **`FORM_UI_DOCTRINE.md`** — the visual/interaction contract (amended
   2026-08-13; its old "performance contract" was removed as unenforceable).
5. **`tests/`** — the enforced subset of all of the above. When prose and
   tests disagree, the tests are the contract.

## Rules that survive from the old file

- The brand mark is lowercase `form.` with the blue period — never uppercase.
- Dark, cinematic, restrained. Typography leads; chrome is set design.
- Lowercase headers (CSS-enforced via `text-transform`); uppercase only for
  micro-labels. **Navigation and buttons use standard English as of
  2026-08-13** (owner) — Title Case nav labels, sentence-case buttons; brand
  and product marks (`form.`, `intellect by form.`, …) stay lowercase even
  there. The footer nav column keeps its lowercase look via CSS by design.
- **Label typography (owner, 2026-08-13): League Spartan is the label voice
  and is ALWAYS all caps.** It lives in the `--fi-label` token; every block
  using it must carry `text-transform: uppercase`. **IBM Plex Mono survives
  on exactly one surface** — the "vision needs structure." slogan tag
  (`.fi-footer-tag`), via `--fi-mono`. Both rules are enforced by
  `tests/typography.test.js`; a violation fails the build.
- No emojis anywhere in the product.
- **Standard market language first, form. language second** — a first-time
  visitor must understand every page without decoding internal vocabulary.
- **Annotate everything, every time, everywhere** (owner, 2026-08-13).

Anything else the old file claimed as locked: check `CHANGELOG.md` and the
tests before believing it.
