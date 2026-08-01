# FORM. Intel Brand Kit

Production asset kit generated from the FORM. brand identity system boards and campaign references, with Higgsfield identity locks and replicated exports.

## Canonical authority

Visual execution follows the **Art Direction Lock File** (`source/board-art-direction-lock.png`).

| Token | Value |
|---|---|
| Near black | `#0A0D12` |
| Soft white | `#F4F5F7` |
| Muted gray | `#A7ADB7` |
| Dim gray | `#6F7682` |
| Accent blue | `#3D6BFF` |
| UI typography | Manrope, lowercase default |
| Logo | always lowercase `form.` with blue period |

## Directory map

```
brand-kit/
├── source/           # Original uploads + canonical naming
├── exports/
│   ├── logos/        # A1–A6 colorways (+ Higgsfield transparent/cinematic)
│   ├── icons/        # 3×3 icon sheet (Higgsfield)
│   ├── ui/           # System boards + component sheet
│   └── atmosphere/   # Cinematic backgrounds
├── mockups/
│   ├── campaigns/    # E1–E7 canonical + Higgsfield replications
│   ├── applications/ # Website, social, product UI
│   ├── core/         # Primary website hero
│   ├── editorial/    # Proposal + Messages launch
│   └── authority/    # Institutional slide
├── manifest.json     # Reference element IDs + generation log
└── README.md
```

## Higgsfield reference elements

15 identity-locked elements are registered in your Higgsfield workspace. Use element names in downstream generations (e.g. `form-logo-primary`, `form-atmosphere-prism`).

Full IDs and media mappings: see `manifest.json` → `referenceElements`.

## File naming

| Prefix | Meaning |
|---|---|
| `A1`–`A6` | Logo lockups |
| `E1`–`E7` | Campaign templates |
| `*-hf.png` | Higgsfield-generated replication |
| `board-*` | System specification boards |
| No suffix | Canonical source export |

## Usage

- **Logos (vector masters):** Prefer existing SVGs in `form-website/logo-*.svg` for precise geometry; use `exports/logos/` for raster/social.
- **Campaigns:** `mockups/campaigns/E*-hf.png` for generated variants; files without `-hf` are approved canonical references.
- **UI build:** `exports/ui/component-system-sheet-hf.png` + `board-website-dna.png`.
- **Backgrounds:** `exports/atmosphere/` for hero and cinematic frames.

## QA checklist

- Logo lowercase with blue period — never uppercase FORM
- Background `#0A0D12`, accent `#3D6BFF` as accent only
- Dark cinematic foundation, spacious layout, minimal icons
- No SaaS-generic, cyberpunk, or light-corporate drift
