"""Local browser proof; requires the already-installed Playwright and Chromium."""
import json
from base64 import b64encode
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
G = json.loads((ROOT / "source/geometry.json").read_text())
EVIDENCE = ROOT / "evidence"
EVIDENCE.mkdir(exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(device_scale_factor=1, java_script_enabled=False, reduced_motion="reduce")
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("requestfailed", lambda request: errors.append(request.url))
    for width, label in ((1440, "desktop"), (768, "tablet"), (320, "mobile")):
        page.set_viewport_size({"width": width, "height": 1000})
        page.goto((ROOT / "review.html").as_uri(), wait_until="load")
        assert page.locator("article").count() == 19
        assert page.locator("img").evaluate_all("images => images.every(i => i.complete && i.naturalWidth > 0)")
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), label
        page.keyboard.press("Tab")
        assert page.evaluate("getComputedStyle(document.activeElement).outlineStyle === 'solid'"), "Visible keyboard focus"
        page.screenshot(path=str(EVIDENCE / f"review-{label}.png"), full_page=True)
        if label == "desktop":
            page.locator(".hero").screenshot(path=str(EVIDENCE / "comparison.png"))
            page.locator("#favicon").screenshot(path=str(EVIDENCE / "favicons.png"))
        print(f"PASS {label}: {width}px, 19 cards, all images loaded, no overflow, keyboard focus, JS disabled")
    page.goto((ROOT.parents[2] / "intel/assets/form-intel-lockup.svg").as_uri())
    bounds = page.locator("svg").evaluate("s => { const b=s.getBBox(); return [b.x,b.y,b.width,b.height]; }")
    assert all(abs(a-b) < 0.001 for a, b in zip(bounds, G["wordmarkBounds"])), "Wordmark bounds drift"
    for file in sorted((ROOT / "svg/lockup").glob("*.svg")):
        page.goto(file.as_uri())
        # Transform each local bounding box into the exported SVG coordinate space.
        boxes = page.evaluate("""() => Object.fromEntries(['mark', 'wordmark'].map(id => {
          const el=document.getElementById(id), b=el.getBBox(), m=el.transform.baseVal.consolidate().matrix;
          return [id, {x:b.x*m.a+m.e, y:b.y*m.d+m.f, w:b.width*m.a, h:b.height*m.d}];
        }))""")
        m, w = boxes["mark"], boxes["wordmark"]
        box = page.locator("svg").get_attribute("viewBox").split()
        width, height = map(float, box[2:])
        gap = w["x"] - m["x"] - m["w"] if "horizontal" in file.name else w["y"] - m["y"] - m["h"]
        spaces = [min(m["x"], w["x"]), min(m["y"], w["y"]), width-max(m["x"]+m["w"], w["x"]+w["w"]), height-max(m["y"]+m["h"], w["y"]+w["h"])]
        assert abs(gap-188) < 0.01 and all(abs(s-188) < 0.01 for s in spaces), (file.name, gap, spaces)
    print("PASS 6 lockups: glyph bounds unchanged, gap and all four clear-space edges = 188 units")
    page.goto("about:blank")
    for file in sorted((ROOT / "svg").glob("*/form-intel-currentcolor.svg")):
        page.set_content(f'<div style="color:rgb(61,107,255)">{file.read_text()}</div>')
        assert page.locator("path, circle").evaluate_all("shapes => shapes.every(s => getComputedStyle(s).fill === 'rgb(61, 107, 255)')")
    for size in (16, 32, 64, 180):
        name = "apple-touch-icon" if size == 180 else f"favicon-{size}"
        data = b64encode((ROOT / f"favicon/{name}.png").read_bytes()).decode()
        pixels = page.evaluate("""async ({data, size}) => {
          const image=new Image(); image.src='data:image/png;base64,'+data; await image.decode();
          const canvas=document.createElement('canvas'); canvas.width=canvas.height=size;
          const ctx=canvas.getContext('2d'); ctx.drawImage(image,0,0);
          return [[706,778],[132,132],...[598,610,626].map(y => [430,y])].map(([x,y]) =>
            Array.from(ctx.getImageData(Math.floor((x-132)*size/760),Math.floor((y-132)*size/760),1,1).data));
        }""", {"data": data, "size": size})
        assert pixels[0] == [61, 107, 255, 255] and pixels[1] == [250, 250, 250, 255], (name, pixels)
        if size >= 64:
            assert all(pixel == [5, 7, 11, 255] for pixel in pixels[2:]), (name, "Spine antialias seam", pixels)
    print("PASS 4 PNGs: opaque paper, cobalt period, no raster seam in the 64/180 px spine")
    assert not errors, errors
    print("PASS both currentColor exports inherit host color; no browser or loading errors")
    browser.close()
