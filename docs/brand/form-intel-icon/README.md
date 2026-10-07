# Form Intel f. mark

Draft vector reconstruction for Dontae's review, not a production release.

## Provenance

The supplied `reference/FI-icon-R2-lockups-v002.png` board and
`reference/08-FI-concept02-mark-crop.png` silhouette were approved by Dontae
on 2026-10-07 at 5:01 AM CT. Concept and board were generated in ChatGPT via
Allen. Prompt files and dates live in the Form Intel Site project folder;
those prompt records were not independently verified here.

`source/geometry.json` manually reconstructs the crop, not Form Digital's
geometry. `source/build_assets.py` generates the exports and review page.
Rebuild with `python3 docs/brand/form-intel-icon/source/build_assets.py` from
the repo root, using Python 3 and the already-installed CairoSVG 2.9.1 for
PNG export. SVG/XML/HTML generation uses only the Python standard library.

Lockups reuse the existing [form.intel wordmark](../../../intel/assets/form-intel-lockup.svg)
without drawing new glyphs. Original path data and transforms are preserved;
only color and overall scale/placement change. The raster board demonstrates
composition; the existing vector wordmark controls the lettering.

## Palette

| Colorway | Mark | Signal period | Wordmark | Background |
| --- | --- | --- | --- | --- |
| Ink | `#05070B` | `#3D6BFF` | All ink, including its period | `#FAFAFA` |
| Cobalt | `#3D6BFF` | `#3D6BFF` | Paper with cobalt period | `#05070B` |
| Paper | `#FAFAFA` | `#FAFAFA` | All paper | `#3D6BFF` |
| currentColor | Inherited | Inherited | Not exported | Contrasting host surface |

Symbols are transparent. Lockups include their approved background and clear
space. Paper on cobalt always has a paper period. Inline the currentColor SVG
to inherit host text color; an SVG loaded with `<img>` cannot inherit it.

## Sizing and clear space

- Master viewBox: `0 0 1024 1024`. Five named parts remain separately editable.
- Optical exports use the same paths with a tight viewBox, not a redrawn mark.
- Standard channel width is 16 master units. The hook and stem share an edge
  along the uninterrupted spine in the reference, with a 16-unit overlap to
  prevent an antialias hairline. No new gap is invented there.
- One signal-period diameter, 188 master units, defines lockup gap and external
  clear space. Measure gap from visible bounds, not transparent SVG padding.
- Horizontal wordmark height is 40% of mark height. Stacked wordmark width is
  1.9 times mark width; center the wordmark and mark on the same axis.
- Standalone symbols and optical crops do not include full protected clear
  space. Add one period diameter outside their visible bounds when placing.
- Use the dedicated 16 or 32 px favicon at those sizes. Use the full geometry
  at 64 px and above; the apple touch export is 180 px. All favicons have a
  paper background to preserve contrast on light and dark browser chrome.
  Favicons are a bounded
  small-square exception to surrounding clear space.
- Keep lockups at least 240 px wide horizontally or 160 px wide stacked.
  Below that, use the symbol. These are draft implementation sizing rules
  awaiting visual approval, not newly approved brand canon.

## 16 px seam decision

At 16 and 32 px, the full-size channels are subpixel and can break the f. into
specks. The small-icon SVG closes them with a same-color, rounded 20-unit
stroke on the four ink parts only. It does not stroke or move the period.
The 64 and 180 px PNGs retain the original filled paths. `favicon.svg` uses
the same closed-seam treatment as the 16 and 32 px PNGs. Inspect native-size
and enlarged samples on `review.html`; never use the small variant as a master.

## Misuse

Do not stretch, rotate, outline, add shadows or gradients, rearrange modules,
move or resize either period, change the palette, substitute type, or collapse
clear space. Do not add a blue period to the paper-on-cobalt mark. Do not edit
generated assets by hand or wire them into site pages before Dontae's review.

## Trademark

Trademark clearance has not been done. Source approval and reconstruction do
not establish legal clearance, registration, exclusivity, or permission to
publish. No trademark claim is made by this package.
