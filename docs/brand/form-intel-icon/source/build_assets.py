"""Rebuild the review package. Python stdlib plus installed CairoSVG for PNGs."""
from copy import deepcopy
from html import escape
import json
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
G = json.loads((ROOT / "source/geometry.json").read_text())
C = G["palette"]
ET.register_namespace("", "http://www.w3.org/2000/svg")
WORDMARK = ET.parse(ROOT.parents[2] / "intel/assets/form-intel-lockup.svg").getroot()
EXPORTS = []


def numbers(values):
    return " ".join(f"{value:.6f}".rstrip("0").rstrip(".") for value in values)


def mark(style, small=False):
    elements = []
    for part in G["parts"]:
        fill = "currentColor" if style == "currentcolor" else C[style]
        if style == "ink" and part["id"] == "signal-dot":
            fill = C["cobalt"]
        attrs = {"id": part["id"], "fill": fill}
        if "circle" in part:
            element = ET.Element("circle", attrs | {k: str(v) for k, v in part["circle"].items()})
        else:
            if small:
                attrs |= {"stroke": fill, "stroke-width": str(G["smallIconStroke"]), "stroke-linejoin": "round"}
            element = ET.Element("path", attrs | {"d": part["path"]})
        elements.append(ET.tostring(element, encoding="unicode"))
    return "\n".join(elements)


def svg(content, box, title, background=None):
    content = "\n".join(line.rstrip() for line in content.splitlines())
    bg = f'<rect x="{box[0]}" y="{box[1]}" width="{box[2]}" height="{box[3]}" fill="{C[background]}"/>' if background else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{numbers(box)}" role="img" aria-label="{escape(title)}">\n'
            f'<title>{escape(title)}</title>\n{bg}\n{content}\n</svg>\n')


def lockup(layout, style):
    x, y, w, h = G["opticalViewBox"]
    wx, wy, ww, wh = G["wordmarkBounds"]
    gap = G["parts"][-1]["circle"]["r"] * 2
    scale = h * 0.4 / wh if layout == "horizontal" else w * 1.9 / ww
    tw, th = ww * scale, wh * scale
    width = w + gap + tw if layout == "horizontal" else tw
    height = h if layout == "horizontal" else h + gap + th
    mx, my = (gap, gap) if layout == "horizontal" else (gap + (width - w) / 2, gap)
    tx, ty = (gap + w + gap, gap + (h - th) / 2) if layout == "horizontal" else (gap, gap + h + gap)
    word = deepcopy(WORDMARK)
    for path in word.iter("{http://www.w3.org/2000/svg}path"):
        color = "ink" if style == "ink" else "paper"
        if style == "cobalt" and path.get("id") == "form-4-period":
            color = "cobalt"
        path.set("fill", C[color])
    glyphs = "\n".join(ET.tostring(e, encoding="unicode") for e in word if e.tag.endswith("}g"))
    content = (f'<g id="mark" transform="translate({numbers([mx - x, my - y])})">{mark(style)}</g>\n'
               f'<g id="wordmark" transform="translate({numbers([tx, ty])}) scale({scale:.12f}) translate({numbers([-wx, -wy])})">{glyphs}</g>')
    return svg(content, [0, 0, width + 2 * gap, height + 2 * gap], f"Form Intel {layout} {style} lockup", backgrounds[style])


def write(path, content, style, group, size=None):
    dest = ROOT / path
    dest.parent.mkdir(parents=True, exist_ok=True)
    if size:
        import cairosvg
        cairosvg.svg2png(bytestring=content.encode(), write_to=str(dest), output_width=size, output_height=size)
    else:
        dest.write_text(content, encoding="utf-8")
    EXPORTS.append((path, style, group, size))


backgrounds = {"ink": "paper", "cobalt": "ink", "paper": "cobalt", "currentcolor": "paper"}


def main():
    # Fail before overwriting exports if the required renderer or source has drifted.
    import cairosvg
    assert len(list(WORDMARK.iter("{http://www.w3.org/2000/svg}path"))) == 11, "Check source wordmark before rebuilding"
    for crop, box in (("symbol", G["viewBox"]), ("optical", G["opticalViewBox"])):
        for style in backgrounds:
            write(f"svg/{crop}/form-intel-{style}.svg", svg(mark(style), box, f"Form Intel f. {style} {crop}"), style, crop)
    for layout in ("horizontal", "stacked"):
        for style in ("ink", "cobalt", "paper"):
            write(f"svg/lockup/form-intel-{layout}-{style}.svg", lockup(layout, style), style, layout)
    # A compact square frame leaves a margin while making the 16 px mark readable.
    favicon_box = [132, 132, 760, 760]
    small = svg(mark("ink", small=True), favicon_box, "Form Intel f. small favicon", "paper")
    write("favicon/favicon.svg", small, "ink", "favicon")
    for size in (16, 32, 64, 180):
        name = "apple-touch-icon" if size == 180 else f"favicon-{size}"
        content = small if size <= 32 else svg(mark("ink"), favicon_box, "Form Intel f. favicon", "paper")
        write(f"favicon/{name}.png", content, "ink", "favicon", size)
    cards = []
    for path, style, group, size in EXPORTS:
        native = f'<p class="native">Actual {size} px <img src="{path}" width="{size}" height="{size}" alt="{size} pixel favicon at native size"></p>' if size else ""
        cards.append(f'''<article class="{group}">
<h3><a href="{path}">{path}</a></h3>
<div class="pair"><figure class="{backgrounds[style]}"><img class="export" src="{path}" alt="Form Intel {group} {style} export"><figcaption>Vector rebuild{f' / {size} px PNG' if size else ''}</figcaption></figure>
<figure class="paper"><img src="reference/08-FI-concept02-mark-crop.png" alt="Approved raster silhouette"><figcaption>Supplied reference</figcaption></figure></div>{native}</article>''')
    groups = "".join(f'<section id="{group}"><h2>{label}</h2><div class="grid">' + "".join(card for card, export in zip(cards, EXPORTS) if export[2] == group) + '</div></section>' for group, label in (("symbol", "01 / Master symbols"), ("optical", "02 / Optical crops"), ("horizontal", "03 / Horizontal lockups"), ("stacked", "04 / Stacked lockups"), ("favicon", "05 / Favicons")))
    (ROOT / "review.html").write_text('''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Form Intel f. | Vector review</title>
<style>
:root { color-scheme: light; font: 16px/1.5 system-ui, sans-serif; color: #05070B; background: #FAFAFA; }
* { box-sizing: border-box; } body { margin: 0; } main { max-width: 1240px; margin: auto; padding: 40px 24px; }
h1 { font-size: clamp(2rem, 5vw, 3.6rem); line-height: 1.05; letter-spacing: -.04em; } h2 { margin: 48px 0 16px; }
h3 { margin: 0; padding: 14px; font-size: .8rem; font-weight: 500; overflow-wrap: anywhere; } a { color: inherit; }
a:focus-visible { outline: 3px solid #3D6BFF; outline-offset: 4px; } nav { display: flex; flex-wrap: wrap; gap: 8px 24px; }
nav a { padding: 8px 0; } p { max-width: 76ch; } .eyebrow { font-size: .75rem; text-transform: uppercase; letter-spacing: .12em; }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; } article { border: 1px solid #bcc0c8; min-width: 0; }
.pair { display: grid; grid-template-columns: 1fr 1fr; } figure { margin: 0; padding: 16px; min-width: 0; }
figure img, figure svg { display: block; width: 100%; height: 190px; object-fit: contain; } figcaption { font-size: .7rem; margin-top: 12px; }
.paper { background: #FAFAFA; color: #05070B; } .ink { background: #05070B; color: #FAFAFA; } .cobalt { background: #3D6BFF; color: #05070B; }
.reference-board { display: block; width: min(100%, 500px); height: auto; } .hero figure img, .hero figure svg { height: 320px; }
.native { padding: 16px; margin: 0; display: flex; gap: 16px; align-items: center; flex-wrap: wrap; } .native img { flex: none; }
.favicon .export { image-rendering: pixelated; } .horizontal .pair { grid-template-columns: 3fr 1fr; }
@media (max-width: 680px) { main { padding: 24px 12px; } .grid { grid-template-columns: 1fr; } figure { padding: 10px; } figure img { height: 160px; } .hero figure img, .hero figure svg { height: 220px; } .horizontal .pair { grid-template-columns: 1fr; } }
</style></head><body><main>
<header><p class="eyebrow">Form Intel / Brief 03 / Draft review</p><h1>The f. mark, rebuilt.</h1>
<p>Manual vector reconstruction of the supplied silhouette. No site integration or release. Compare the exports below with the original crop, then review the board for composition. <a href="README.md">Usage and provenance</a>.</p>
<nav aria-label="Review sections"><a href="#symbol">Symbols</a><a href="#optical">Optical</a><a href="#horizontal">Horizontal</a><a href="#stacked">Stacked</a><a href="#favicon">Favicons</a></nav></header>
<section aria-label="Primary comparison" class="hero"><h2>Reference / Reconstruction</h2><div class="pair">
<figure><svg viewBox="164 178 472 588" role="img" aria-label="Approved original crop aligned to visible bounds"><image href="reference/08-FI-concept02-mark-crop.png" width="765" height="912"/></svg><figcaption>Original raster, unchanged; aligned to visible bounds</figcaption></figure>
<figure><img src="svg/optical/form-intel-ink.svg" alt="Reconstructed ink mark and cobalt period"><figcaption>Same master paths, aligned to visible bounds</figcaption></figure></div>
<details><summary>Open the supplied approval board</summary><a href="reference/FI-icon-R2-lockups-v002.png"><img class="reference-board" src="reference/FI-icon-R2-lockups-v002.png" width="1254" height="1254" alt="Approved board: colorways, horizontal and stacked lockups, clear space and misuse"></a></details></section>
<p>The 16 and 32 px exports close fine channels; larger exports retain the original geometry. currentColor samples use the image document's default black; inline their SVG to inherit a host color. Lockups include one signal-period diameter of gap and clear space.</p>
''' + groups + '''<footer><p>Draft for Dontae's review. Trademark clearance not done. No approval to merge, deploy or wire these assets into site pages.</p></footer>
</main></body></html>
''', encoding="utf-8")
    print(f"Built {len(EXPORTS)} exports and review.html with CairoSVG {cairosvg.__version__}")


if __name__ == "__main__":
    main()
