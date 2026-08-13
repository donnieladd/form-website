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
operations, intelligence, and solutions company.** Four practices (advisory &
transformation · solutions & intelligence · creative & experience · managed
services), two flagship capabilities (solutions architecture · AI enablement),
three businesses (form. digital · form. creative & marketing · form. support),
two divisions (form. labs · form. learning), a first-class Ministries path,
and a contact pipeline that classifies inquiries by practice.

Static HTML/CSS/JS, zero dependencies, no build step. Deployed on Vercel;
`npm run verify` (109 tests) must pass before any deploy.

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
  mono micro-labels. **Navigation and buttons use standard English as of
  2026-08-13** (owner) — Title Case nav labels, sentence-case buttons; brand
  and product marks (`form.`, `intellect by form.`, …) stay lowercase even
  there. The footer nav column keeps its lowercase look via CSS by design.
- No emojis anywhere in the product.
- **Standard market language first, form. language second** — a first-time
  visitor must understand every page without decoding internal vocabulary.
- **Annotate everything, every time, everywhere** (owner, 2026-08-13).

Anything else the old file claimed as locked: check `CHANGELOG.md` and the
tests before believing it.
