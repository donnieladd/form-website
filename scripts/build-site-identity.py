"""Publish only the approved assets needed by the site, using Python stdlib."""
from pathlib import Path
import re
from shutil import copyfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs/brand/form-intel-icon"
DEST = ROOT / "intel/assets"
for name in ("favicon.svg", "favicon-32.png", "apple-touch-icon.png"):
    copyfile(SOURCE / "favicon" / name, DEST / name)
name = "form-intel-horizontal-paper.svg"
svg = (SOURCE / "svg/lockup" / name).read_text()
# The blue review-board background is not part of the transparent site lockup.
svg, count = re.subn(r'<rect\b[^>]*/>\n', '', svg)
assert count == 1, "Expected exactly one presentation background"
(DEST / name).write_text(svg)
print("Published 3 canonical favicons and 1 transparent paper lockup")
