"""Generate the Sidecar "Split Pane" brand SVGs.

The mark is a main pane with a narrow pane docked beside it: the main app and its sidecar.
Usage: python3 -I make_svgs.py <geist-semibold.woff2> <out_svg_dir>
"""
import sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

font_path, out = sys.argv[1], sys.argv[2]

COBALT = "#3155FF"
CHARCOAL = "#0C0E13"
WHITE = "#FFFFFF"
OFF = "#F7F8FA"


def mark(x, y, size, main, side, main_opacity=1.0):
    """Mark on a 48-unit grid: main pane (5,9,26x30,r6) + side pane (34,9,9x30,r4.5)."""
    s = size / 48
    op = f' fill-opacity="{main_opacity}"' if main_opacity != 1 else ""
    return (f'<rect x="{x + 5*s:.2f}" y="{y + 9*s:.2f}" width="{26*s:.2f}" height="{30*s:.2f}" rx="{6*s:.2f}" fill="{main}"{op}/>'
            f'<rect x="{x + 34*s:.2f}" y="{y + 9*s:.2f}" width="{9*s:.2f}" height="{30*s:.2f}" rx="{4.5*s:.2f}" fill="{side}"/>')


def svg(w, h, body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{body}</svg>\n'


def wordmark_path(text, x, baseline, cap_px, fill, tracking_em=-0.03):
    font = TTFont(font_path)
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    upem = font["head"].unitsPerEm
    scale = cap_px / upem
    hmtx = font["hmtx"]
    paths, cursor = [], 0.0
    for ch in text:
        name = cmap[ord(ch)]
        pen = SVGPathPen(glyphs)
        tpen = TransformPen(pen, (scale, 0, 0, -scale, x + cursor, baseline))
        glyphs[name].draw(tpen)
        paths.append(pen.getCommands())
        cursor += hmtx[name][0] * scale + tracking_em * cap_px
    return f'<path d="{" ".join(paths)}" fill="{fill}"/>', cursor


def icon(bg, main, side, main_opacity=1.0):
    r = 1024 * 0.225
    return svg(1024, 1024, f'<rect width="1024" height="1024" rx="{r}" fill="{bg}"/>' + mark(512 - 24 * 15, 512 - 24 * 15, 720, main, side, main_opacity))


files = {
    "sidecar-symbol.svg": svg(48, 48, mark(0, 0, 48, COBALT, CHARCOAL)),
    "sidecar-symbol-black.svg": svg(48, 48, mark(0, 0, 48, "#000000", "#000000")),
    "sidecar-symbol-white.svg": svg(48, 48, mark(0, 0, 48, WHITE, WHITE)),
    "sidecar-symbol-reversed.svg": svg(48, 48, mark(0, 0, 48, COBALT, WHITE)),
    "sidecar-app-icon-dark.svg": icon(CHARCOAL, COBALT, WHITE),
    "sidecar-app-icon-light.svg": icon(OFF, COBALT, CHARCOAL),
    "sidecar-app-icon-blue.svg": icon(COBALT, WHITE, WHITE, 0.55),
}
for name, color in (("black", "#0C0E13"), ("white", WHITE)):
    path, width = wordmark_path("sidecar", 0, 132, 176, color)
    files[f"sidecar-wordmark-{name}.svg"] = svg(round(width) + 8, 176, path)
for name, text_color, side in (("light", CHARCOAL, CHARCOAL), ("dark", WHITE, WHITE)):
    path, width = wordmark_path("sidecar", 450, 322, 230, text_color)
    bg = OFF if name == "light" else CHARCOAL
    files[f"sidecar-lockup-{name}.svg"] = svg(1820, 480, f'<rect width="1820" height="480" fill="{bg}"/>' + mark(80, 64, 352, COBALT, side) + path)

for name, content in files.items():
    with open(f"{out}/{name}", "w") as handle:
        handle.write(content)
print("\n".join(sorted(files)))
