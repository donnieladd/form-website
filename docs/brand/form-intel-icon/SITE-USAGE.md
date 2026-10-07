# Site identity application

**Status:** implemented for draft review, not merged or production released.
**Source / approval:** Brief 04 records Dontae's approval of PR #12 on
2026-10-07 at 10:06 AM CT. Integration is tracked in [PR #13](https://github.com/donnieladd/form-website/pull/13).

## Preserve the approved geometry

**Evidence:** owner direction and the approved package in this directory.
**Applies when:** placing Form Intel identity on existing site surfaces.
**Intent:** make the identity consistent without redesigning either system.
**Do:** run `python3 scripts/build-site-identity.py` from the repository root.
It copies the SVG favicon, 32 px PNG and 180 px apple touch icon byte-for-byte
to `/intel/assets/`. It removes only the presentation background rectangle
from the paper horizontal lockup. All remaining bytes, clear space, aspect
ratio, mark paths, lettering and color stay unchanged.
**Do not:** edit these generated public assets by hand, duplicate the full
package, recolor paths with CSS, or substitute new glyphs.
**Proof:** `npm run verify` checks favicon bytes and exact lockup derivation.

## Fit the existing surface

**Evidence:** implementation rule from Brief 04, not a new identity direction.
**Applies when:** replacing a header/nav or footer brand.
**Intent:** preserve existing height, composition, copy and destinations.
**Do:** use paper on the existing dark surfaces. No light header/footer or
pre-existing cobalt standalone mark was found, so no unused colorway ships.
Keep horizontal brand compositions horizontal, even when footer columns
collapse on mobile. The existing navigation governs size; this bounded
instruction overrides the earlier draft 240 px recommendation.
Each link is named `form.intel` once, with its image hidden from accessibility;
unlinked footer/campaign images use `alt="form.intel"`. V2 captions remain
visible but decorative within the named brand link. Existing hrefs stay intact.
**Do not:** resize navigation, change content, or touch either proxy mount.
**Proof:** the browser check measures original nav heights at five widths and
checks accessible names, image loading, overflow, focus and menu behavior.

## Verify every shipped page

**Evidence:** tracked HTML and `.vercelignore`, not the root-only page helper.
**Applies when:** changing site favicons or adding shipped HTML.
**Intent:** prevent nested pages silently retaining an obsolete icon.
**Do:** use the same three root-absolute favicon links on all 34 shipped pages.
The review-page generator carries the links so rebuilding cannot undo them.
All social images, their source files and metadata URLs are unchanged. The
existing `form.` text wordmark is not the obsolete dark-square/cobalt-dot mark
identified by Brief 04. Homepage photography and campaign images are unchanged.
**Proof:** run `python3 -m http.server 8765 --bind 127.0.0.1`, then
`python3 scripts/check-site-identity.py` using installed Playwright/Chromium.
The check captures desktop/mobile full pages and header/footer details under
`screenshots/site-lockups/`, already excluded from deployment. Set `QA_BASE_URL`
to check an authorized preview. The check never regenerates social cards.

Rollback before approval is to leave PR #13 unmerged. A later authorized
rollback can revert the integration commit while retaining the approved
PR #12 source package. No deployment or rollback drill is claimed.
