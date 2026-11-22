import json, os

S = 22; X0 = 121; Y0 = 104
def X(m): return round(X0 + S * m)
def Y(m): return round(Y0 + S * m)

LINE = "#9a8b72"; PATH = "#0f766e"; THROW = "#c2410c"; INK = "#1f2937"
CONE = "#f97316"; CONE_B = "#9a3412"
HOOP = "#7c3aed"
DISC = "#facc15"; DISC_B = "#854d0e"

bg, arrows, cards, labels = [], [], [], []
aid = [0]

def svg(left, top, w, h, d, head, aria, color=PATH, dash=True):
    style = (f"position: absolute; left: {left}px; top: {top}px; width: {w}px; height: {h}px; overflow: visible; "
             f"fill: none; stroke: {color}; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round"
             + ("; stroke-dasharray: 6 6" if dash else ""))
    a = f'role="img" aria-label="{aria}"' if aria else 'aria-hidden="true"'
    if head:
        aid[0] += 1; i = aid[0]
        defs = (f'<defs><marker id="dc-arrow-head-filled-{i}" orient="auto" markerWidth="5" markerHeight="5" refX="2" refY="2" overflow="visible">'
                f'<path d="M0 0 L4 2 L0 4 Z" fill="{color}" stroke="none" style="stroke: none; fill: {color}; fill: context-stroke"/></marker></defs>')
        p = f'<path d="{d}" marker-end="url(#dc-arrow-head-filled-{i})"></path>'
    else:
        defs = ""; p = f'<path d="{d}"></path>'
    arrows.append(f'<svg {a} width="{w}" height="{h}" viewBox="0 0 {w} {h}" preserveAspectRatio="none" style="{style}">{defs}{p}</svg>')

def harrow(x1, x2, y, head=True, aria=None, **kw):
    n = abs(x2 - x1); h = 4 if head else 0
    d = f"M 0 4 L {n-h} 4" if x2 > x1 else f"M {n} 4 L {h} 4"
    svg(min(x1, x2), y - 4, n, 8, d, head, aria, **kw)

def varrow(y1, y2, x, head=True, aria=None, **kw):
    n = abs(y2 - y1); h = 4 if head else 0
    d = f"M 4 0 L 4 {n-h}" if y2 > y1 else f"M 4 {n} L 4 {h}"
    svg(x - 4, min(y1, y2), 8, n, d, head, aria, **kw)

def box(left, top, w, h, style, inner="", aria=None):
    a = f' role="img" aria-label="{aria}"' if aria else ""
    cards.append(f'<div{a} style="position: absolute; left: {left}px; top: {top}px; width: {w}px; height: {h}px; box-sizing: border-box; {style}">{inner}</div>')

def cone(xm, ym):
    box(X(xm) - 6, Y(ym) - 6, 12, 12, f"background: {CONE}; border: 2px solid {CONE_B}; border-radius: 50%", aria="Hütchen")
def hoop(xm, ym, d=18):
    box(round(X(xm) - d / 2), round(Y(ym) - d / 2), d, d, f"border: 3px solid {HOOP}; border-radius: 50%", aria="Reifen")
def disc(xm, ym):
    box(X(xm) - 7, Y(ym) - 7, 14, 14, f"background: {DISC}; border: 1px solid {DISC_B}; border-radius: 50%", aria="Markierungsteller")

BADGE = ("display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; flex: none; "
         "border-radius: 50%; background: #111827; color: #ffffff; font-weight: 700; font-size: 12px; line-height: 12px")

def station(num, text, cx=None, left=None, right=None, top=0):
    w = len(text) * 7 + 52; w += w % 2
    if left is None:
        left = right - w if right is not None else round(cx - w / 2)
    labels.append(
        f'<div style="position: absolute; left: {left}px; top: {top}px; width: {w}px; height: 28px; box-sizing: border-box; '
        f'padding: 4px 8px; display: flex; align-items: center; gap: 6px; background: #ffffff; border: 1px solid #c9ced6; '
        f'border-radius: 8px; font-size: 12px; line-height: 16px; color: {INK}; white-space: nowrap">'
        f'<span style="{BADGE}">{num}</span><span><b>{text}</b></span></div>')

# ---------- Field ----------
FW, FH = X(40) - X(0), Y(20) - Y(0)
R = 6 * S
bg.append(f'<div aria-hidden="true" style="position: absolute; left: {X(0)}px; top: {Y(0)}px; width: {FW}px; height: {FH}px; box-sizing: border-box; background: #f6eedf; border: 2px solid {LINE}"></div>')
# Pass-Zone band
bg.append(f'<div aria-hidden="true" style="position: absolute; left: {X(36.2)}px; top: {Y(2.4)}px; width: {X(40) - X(36.2) - 2}px; height: {Y(8.4) - Y(2.4)}px; background: #dcefe9; border-radius: 8px 0 0 8px"></div>')
bg.append(f'<div aria-hidden="true" style="position: absolute; left: {X(20) - 1}px; top: {Y(0)}px; width: 2px; height: {FH}px; background: {LINE}"></div>')
bg.append(f'<div aria-hidden="true" style="position: absolute; left: {X(0)}px; top: {Y(2.5)}px; width: {R}px; height: {Y(17.5) - Y(2.5)}px; box-sizing: border-box; border: 2px solid {LINE}; border-left: none; border-radius: 0 {R}px {R}px 0"></div>')
bg.append(f'<div aria-hidden="true" style="position: absolute; left: {X(34)}px; top: {Y(2.5)}px; width: {R}px; height: {Y(17.5) - Y(2.5)}px; box-sizing: border-box; border: 2px solid {LINE}; border-right: none; border-radius: {R}px 0 0 {R}px"></div>')
R9 = 9 * S
bg.append(f'<div aria-hidden="true" style="position: absolute; left: {X(0)}px; top: {Y(0)}px; width: {FW}px; height: {FH}px; overflow: hidden"><div style="position: absolute; left: 0px; top: {Y(-0.5) - Y(0)}px; width: {R9}px; height: {Y(20.5) - Y(-0.5)}px; box-sizing: border-box; border: 2px dashed {LINE}; border-left: none; border-radius: 0 {R9}px {R9}px 0"></div><div style="position: absolute; left: {FW - R9}px; top: {Y(-0.5) - Y(0)}px; width: {R9}px; height: {Y(20.5) - Y(-0.5)}px; box-sizing: border-box; border: 2px dashed {LINE}; border-right: none; border-radius: {R9}px 0 0 {R9}px"></div></div>')
bg.append(f'<div role="img" aria-label="Tor links" style="position: absolute; left: {X(-1)}px; top: {Y(8.5)}px; width: {S}px; height: {Y(11.5) - Y(8.5)}px; box-sizing: border-box; background: #e5e7eb; border: 3px solid #374151; border-right: none"></div>')
bg.append(f'<div role="img" aria-label="Tor rechts" style="position: absolute; left: {X(40)}px; top: {Y(8.5)}px; width: {S}px; height: {Y(11.5) - Y(8.5)}px; box-sizing: border-box; background: #e5e7eb; border: 3px solid #374151; border-left: none"></div>')

# ---------- Path arrows ----------
def darrow(x1, y1, x2, y2, aria, color=PATH):
    import math
    L = math.hypot(x2 - x1, y2 - y1); ux, uy = (x2 - x1) / L, (y2 - y1) / L
    left, top = min(x1, x2) - 4, min(y1, y2) - 4
    w, h = abs(x2 - x1) + 8, abs(y2 - y1) + 8
    d = f"M {x1-left} {y1-top} L {x2-4*ux-left:.1f} {y2-4*uy-top:.1f}"
    svg(left, top, w, h, d, True, aria, color=color)

harrow(X(9.5) + 1, X(12) - 7, Y(1.5), aria="Vom Start zum Slalom")
harrow(X(20) + 7, X(22) - 10, Y(1.5), aria="Vom Slalom zu den Reifen")
harrow(X(28) + 10, X(35.3), Y(1.5), head=False)
varrow(Y(1.5), Y(8.6), X(35.3), aria="Zur Pass-Zone an der Stirnwand")
for y in (3.5, 5.5, 7.5):
    harrow(X(37.5) + 8, X(40) - 3, Y(y), aria="Pass an die Wand", color=THROW, dash=False)
varrow(Y(8.6), Y(19), X(35.3), head=False)
harrow(X(35.3), X(20) + 7, Y(19), aria="Ball um den Körper bis zur Mittellinie")
harrow(X(20) - 7, X(5) + 7, Y(19), aria="Abwehrschritte seitwärts bis zur 9-Meter-Linie")
# arc along 9 m line from (5.53, 18.6) to (9, 11.5), then up to (9, 10.4)
_l, _t = X(5.53) - 4, Y(10.4) - 4
_w, _h = X(9) + 4 - _l, Y(18.6) + 4 - _t
_d = (f"M {X(5.53)-_l} {Y(18.6)-_t} A {9*S} {9*S} 0 0 0 {X(9)-_l} {Y(11.5)-_t} "
      f"L {X(9)-_l} {Y(10.4)+4-_t}")
svg(_l, _t, _w, _h, _d, True, "Entlang der 9-Meter-Linie zur Mitte prellen")
harrow(X(9) - 8, X(0) + 1, Y(10), aria="Wurf durch die Hütchen aufs Tor", color=THROW, dash=False)
varrow(Y(10) - 8, Y(2.1) + 1, X(9), aria="Ohne Ball zurück zum Start")

# ---------- Equipment ----------
box(X(4.5), Y(0.9), X(9.5) - X(4.5), Y(2.1) - Y(0.9), "background: #15803d; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 12px; line-height: 16px; font-weight: 700", "Start / Ziel")
box(X(1.5), Y(1), 44, 22, "background: #fde68a; border: 1px solid #b45309; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 12px; line-height: 16px; color: #78350f; font-weight: 600", "Bälle", aria=None)
for x in (12, 14, 16, 18, 20):
    cone(x, 1.5)
for i, x in enumerate((22, 23.5, 25, 26.5, 28)):
    hoop(x, 1.1 if i % 2 == 0 else 1.9)
for y in (3.5, 5.5, 7.5):
    disc(37.5, y)
cone(20, 19); cone(5, 19)
cone(7.5, 9.2); cone(7.5, 10.8)
hoop(-0.5, 9.1, 16); hoop(-0.5, 10.9, 16)
labels.append(f'<div style="position: absolute; left: {X(0.3)}px; top: {Y(12.6)}px; width: 130px; font-size: 12px; line-height: 16px; color: #4b5563">Helfer neben dem Tor sammelt die Bälle</div>')

# ---------- Station labels ----------
station(1, "Slalom prellen", cx=X(16), top=Y(2.6))
station(2, "Reifen-Prellen", cx=X(24.8), top=Y(2.6))
station(3, "Pass an die Wand", right=X(34.8), top=Y(5.5) - 14)
station(4, "Ball um den Körper", cx=X(27.75), top=Y(17.3))
station(5, "Abwehrschritte seitwärts", cx=X(12.5), top=Y(17.3))
station(6, "Zielwurf", left=X(9.6), top=Y(10) - 14)

header = f'''<div style="position: absolute; left: 40px; top: 34px; font-family: 'Space Grotesk', Inter, sans-serif; font-size: 30px; line-height: 36px; font-weight: 700; color: {INK}">Ball-Parkour F-Jugend</div>
<div style="position: absolute; left: 40px; top: 72px; font-size: 13px; line-height: 18px; color: #4b5563">Handballfeld 40 × 20 m · 6 Stationen · jedes Kind läuft mit Ball · alle 5 Sekunden ein Kind starten lassen</div>
<div aria-hidden="true" style="position: absolute; left: {X(40) - 5 * S}px; top: 84px; width: {5 * S}px; height: 6px; box-sizing: border-box; border: 2px solid {INK}; border-top: none"></div>
<div style="position: absolute; left: {X(40) - 5 * S}px; top: 64px; width: {5 * S}px; text-align: center; font-size: 12px; line-height: 16px; color: {INK}">5 m</div>'''

STATIONS = [
    ("Slalom prellen", "Ball aus der Kiste nehmen. Prellend um die Hütchen laufen. Schwerer: mit der schwachen Hand."),
    ("Reifen-Prellen", "In jedem Reifen 1-mal prellen."),
    ("Pass an die Wand", "An einen freien Teller stellen. 5 Pässe gegen die Stirnwand und den Ball fangen."),
    ("Ball um den Körper", "Bis zur Mittellinie gehen. Dabei den Ball um den Bauch kreisen lassen."),
    ("Abwehrschritte seitwärts", "Ball in beide Hände nehmen. Seitwärts an der Seitenlinie bis zum Hütchen an der 9-m-Linie. Füße nicht kreuzen."),
    ("Zielwurf", "An der 9-m-Linie entlang zur Mitte prellen. Durch die 2 Hütchen auf die Reifen im Tor werfen. Ohne Ball zurück zum Start."),
]
items = "\n".join(
    f'<div style="display: flex; gap: 8px; align-items: flex-start"><span style="{BADGE}">{i+1}</span>'
    f'<div style="font-size: 12px; line-height: 16px; color: {INK}"><b>{n}</b><br>{t}</div></div>'
    for i, (n, t) in enumerate(STATIONS))

def sw(style):
    return f'<span aria-hidden="true" style="display: inline-block; flex: none; {style}"></span>'
MATERIAL = [
    (sw(f"width: 12px; height: 12px; box-sizing: border-box; background: {CONE}; border: 2px solid {CONE_B}; border-radius: 50%"), "9 Hütchen"),
    (sw(f"width: 16px; height: 16px; box-sizing: border-box; border: 3px solid {HOOP}; border-radius: 50%"), "7 Reifen (2 davon im Tor)"),
    (sw(f"width: 14px; height: 14px; box-sizing: border-box; background: {DISC}; border: 1px solid {DISC_B}; border-radius: 50%"), "3 Markierungsteller"),
    (sw("width: 22px; height: 12px; background: #fde68a; border: 1px solid #b45309; border-radius: 2px"), "Ballkiste, ca. 15 Bälle"),
]
mat_html = "\n".join(
    f'<div style="display: flex; align-items: center; gap: 8px; font-size: 12px; line-height: 16px; color: {INK}">'
    f'<span style="display: flex; width: 28px; justify-content: center; flex: none">{s}</span><span>{t}</span></div>'
    for s, t in MATERIAL)

legend = f'''<div style="position: absolute; left: 40px; top: 562px; width: 790px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); column-gap: 20px; row-gap: 14px">
{items}
</div>
<div style="position: absolute; left: 856px; top: 562px; width: 227px; display: flex; flex-direction: column; gap: 5px">
<div style="font-size: 13px; line-height: 18px; font-weight: 700; color: {INK}">Material</div>
{mat_html}
<div style="font-size: 12px; line-height: 16px; color: #4b5563; margin-top: 4px">1 Helfer am Tor. Erst werfen, wenn das Tor frei ist.</div>
</div>'''

body = "\n".join(bg + arrows + cards + labels)
html = f'''<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Ball-Parkour F-Jugend</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;family=Space+Grotesk:wght@700&amp;display=swap">
<style>
body{{margin:0}}
a{{color:#0f766e}}a:hover{{color:#115e59}}
</style>
</helmet>
<div style="position: relative; width: 1123px; height: 794px; overflow: hidden; background: #ffffff; font-family: Inter, system-ui, sans-serif; color: {INK}">
{header}
{body}
{legend}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":1123,"height":794}}}}'>
class Component extends DCLogic {{
renderVals() {{
return {{}};
}}
}}
</script>
</body>
</html>
'''

root = "/home/claude/canvas3/project"
os.makedirs(root, exist_ok=True)
open(f"{root}/Main.dc.html", "w").write(html)
canvas = {"v": 3, "createdOnFiles": {"v": 1, "at": "2026-11-17T12:00:00Z"}, "title": "Ball-Parkour F-Jugend – Aufbauplan",
          "launch": {"view": "focused", "file": "Main.dc.html"}, "pages": [],
          "boards": {"Main.dc.html": {"x": 0, "y": 0, "w": 1123, "h": 794, "title": "Aufbauplan (A4 quer)"}},
          "order": ["Main.dc.html"], "notes": {}, "designSystems": []}
open(f"{root}/canvas.json", "w").write(json.dumps(canvas, ensure_ascii=False, indent=1))
print("ok", len(html))
