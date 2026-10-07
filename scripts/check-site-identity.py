"""Rendered identity proof using installed Playwright; serve the repo first."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BASE = os.environ.get("QA_BASE_URL", "http://127.0.0.1:8765").rstrip("/")
OUT = ROOT / "screenshots/site-lockups"
OUT.mkdir(parents=True, exist_ok=True)
results, errors = [], []
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(device_scale_factor=1, reduced_motion="reduce")
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("requestfailed", lambda request: errors.append(request.url))
    for width in (1440, 390, 320, 768, 1181):
        page.set_viewport_size({"width": width, "height": 1000})
        for name in ("index", "about", "services"):
            page.goto(f"{BASE}/{name}.html", wait_until="networkidle")
            page.evaluate("document.fonts.ready")
            header = page.locator("header").first
            height = header.bounding_box()["height"]
            assert height == (102 if width > 1100 else 112 if width <= 650 else 94) if name == "index" else height == 68, (name, width, height)
            assert not page.evaluate("document.documentElement.scrollWidth > innerWidth"), (name, width, "overflow")
            images = page.locator('img[src="/intel/assets/form-intel-horizontal-paper.svg"]')
            assert images.count() == 2
            assert images.evaluate_all("els => els.every(e => e.complete && e.naturalWidth > 0)"), (name, width, "image load")
            assert page.get_by_role("link", name="form.intel", exact=True).count() == (2 if name == "index" else 1)
            if name != "index":
                assert page.get_by_role("img", name="form.intel", exact=True).count() == 1
            brand = header.get_by_role("link", name="form.intel", exact=True)
            assert brand.get_attribute("href") == ("#top" if name == "index" else "/")
            brand.focus()
            assert brand.evaluate("e => getComputedStyle(e).outlineStyle !== 'none'"), (name, "focus")
            brand.evaluate("e => e.blur()")
            if name != "index" and width <= 1180:
                page.get_by_role("button", name="Open menu").click()
                assert page.locator(".fi-mobile-panel").is_visible()
                page.get_by_role("button", name="Open menu").click()
                assert page.locator(".fi-mobile-panel").get_attribute("aria-hidden") == "true"
            if width in (1440, 390):
                page.screenshot(path=str(OUT / f"{name}-{width}-header.jpg"), quality=85)
                # Fit the entire footer below the unchanged fixed navigation.
                footer_height = int(page.locator("footer").bounding_box()["height"])
                page.set_viewport_size({"width": width, "height": max(1000, footer_height + 100)})
                page.locator("footer").scroll_into_view_if_needed()
                assert images.last.bounding_box()["y"] >= header.bounding_box()["height"]
                page.locator("footer").screenshot(path=str(OUT / f"{name}-{width}-footer.jpg"), quality=85)
                page.set_viewport_size({"width": width, "height": 1000})
                page.evaluate("scrollTo(0, 0)")
                page.screenshot(path=str(OUT / f"{name}-{width}-full.jpg"), full_page=True, quality=85)
            results.append({"page": name, "width": width, "headerHeight": height, "lockups": 2, "overflow": False})
    page.set_viewport_size({"width": 1440, "height": 1000})
    for file in sorted(ROOT.glob("*.html")):
        page.goto(f"{BASE}/{file.name}", wait_until="networkidle")
        assert page.locator('img[src="/intel/assets/form-intel-horizontal-paper.svg"]').count() == 2, file.name
    for file in ("the-friday-drop/sept-4-26/index.html", "the-friday-drop/sept-4-26/thanks.html"):
        for width in (1440, 390):
            page.set_viewport_size({"width": width, "height": 1000})
            page.goto(f"{BASE}/{file}", wait_until="networkidle")
            assert page.get_by_role("img", name="form.intel", exact=True).count() == (2 if file.endswith("index.html") else 1)
            assert not page.evaluate("document.documentElement.scrollWidth > innerWidth"), (file, width)
    browser.close()
assert not errors, errors
(OUT / "checks.json").write_text(json.dumps({"base": BASE, "checks": results, "errors": errors}, indent=2) + "\n")
print(f"PASS: {len(results)} responsive checks, all 31 root pages, nested campaign branding, no browser errors")
