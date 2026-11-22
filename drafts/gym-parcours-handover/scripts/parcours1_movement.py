import json, os

S = 22; X0 = 121; Y0 = 104
def X(m): return round(X0 + S * m)
def Y(m): return round(Y0 + S * m)

LINE = "#9a8b72"
PATH = "#0f766e"
INK = "#1f2937"
BENCH = "#a0692f"; BENCH_B = "#6b4423"
KASTEN = "#9ca3af"; KASTEN_B = "#4b5563"
MAT = "#4f8fd1"; MAT_B = "#1e5a96"
BIG = "#1e3a8a"
CONE = "#f97316"; CONE_B = "#9a3412"

bg, arrows, cards, labels = [], [], [], []
aid = [0]

def svg(left, top, w, h, d, head, aria):
    style = (f"position: absolute; left: {left}px; top: {top}px; width: {w}px; height: {h}px; overflow: visible; "
             f"fill: none; stroke: {PATH}; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 6 6")
    a = f'role="img" aria-label="{aria}"' if aria else 'aria-hidden="true"'
    if head:
        aid[0] += 1
        i = aid[0]
        defs = (f'<defs><marker id="dc-arrow-head-filled-{i}" orient="auto" markerWidth="5" markerHeight="5" refX="2" refY="2" overflow="visible">'
                f'<path d="M0 0 L4 2 L0 4 Z" fill="{PATH}" stroke="none" style="stroke: none; fill: {PATH}; fill: context-stroke"/></marker></defs>')
        p = f'<path d="{d}" marker-end="url(#dc-arrow-head-filled-{i})"></path>'
    else:
        defs = ""; p = f'<path d="{d}"></path>'
    arrows.append(f'<svg {a} width="{w}" height="{h}" viewBox="0 0 {w} {h}" preserveAspectRatio="none" style="{style}">{defs}{p}</svg>')

def harrow(x1, x2, y, head=True, aria=None):
    n = abs(x2 - x1); h = 4 if head else 0
    d = f"M 0 4 L {n-h} 4" if x2 > x1 else f"M {n} 4 L {h} 4"
    svg(min(x1, x2), y - 4, n, 8, d, head, aria)

def varrow(y1, y2, x, head=True, aria=None):
    n = abs(y2 - y1); h = 4 if head else 0
    d = f"M 4 0 L 4 {n-h}" if y2 > y1 else f"M 4 {n} L 4 {h}"
    svg(x - 4, min(y1, y2), 8, n, d, head, aria)

def box(left, top, w, h, style, inner="", aria=None):
    a = f' role="img" aria-label="{aria}"' if aria else ""
    cards.append(f'<div{a} style="position: absolute; left: {left}px; top: {top}px; width: {w}px; height: {h}px; box-sizing: border-box; {style}">{inner}</div>')

def bench_h(x1, x2, ym, aria):
    box(X(x1), Y(ym) - 5, X(x2) - X(x1), 10, f"background: {BENCH}; border: 1px solid {BENCH_B}; border-radius: 2px", aria=aria)

def bench_v(xm, y1, y2, aria):
    box(X(xm) - 5, Y(y1), 10, Y(y2) - Y(y1), f"background: {BENCH}; border: 1px solid {BENCH_B}; border-radius: 2px", aria=aria)

def kasten(xm, ym):
    box(X(xm) - 10, Y(ym) - 8, 20, 16, f"background: {KASTEN}; border: 1px solid {KASTEN_B}; border-radius: 2px", aria="Kastendeckel")

def cone(xm, ym):
    box(X(xm) - 6, Y(ym) - 6, 12, 12, f"background: {CONE}; border: 2px solid {CONE_B}; border-radius: 50%", aria="Hütchen")

def mat(x1, x2, y1, y2, color, aria, radius=3):
    box(X(x1), Y(y1), X(x2) - X(x1), Y(y2) - Y(y1), f"background: {color}; border: 1px solid {MAT_B}; border-radius: {radius}px", aria=aria)

BADGE = ("display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; flex: none; "
         "border-radius: 50%; background: #111827; color: #ffffff; font-weight: 700; font-size: 12px; line-height: 12px")

def station(num, text, cx=None, left=None, top=0):
    w = len(text) * 7 + 52
    w += w % 2
    if left is None:
        left = round(cx - w / 2)
    labels.append(
        f'<div style="position: absolute; left: {left}px; top: {top}px; width: {w}px; height: 28px; box-sizing: border-box; '
        f'padding: 4px 8px; display: flex; align-items: center; gap: 6px; background: #ffffff; border: 1px solid #c9ced6; '
        f'border-radius: 8px; font-size: 12px; line-height: 16px; color: {INK}; white-space: nowrap">'
        f'<span style="{BADGE}">{num}</span><span><b>{text}</b></span></div>')

# ---------- Field background ----------
FW, FH = X(40) - X(0), Y(20) - Y(0)
bg.append(f'<div aria-hidden="true" style="position: absolute; left: {X(0)}px; top: {Y(0)}px; width: {FW}px; height: {FH}px; box-sizing: border-box; background: #f6eedf; border: 2px solid {LINE}"></div>')
bg.append(f'<div aria-hidden="true" style="position: absolute; left: {X(20) - 1}px; top: {Y(0)}px; width: 2px; height: {FH}px; background: {LINE}"></div>')
R = 6 * S
bg.append(f'<div aria-hidden="true" style="position: absolute; left: {X(0)}px; top: {Y(2.5)}px; width: {R}px; height: {Y(17.5) - Y(2.5)}px; box-sizing: border-box; border: 2px solid {LINE}; border-left: none; border-radius: 0 {R}px {R}px 0"></div>')
bg.append(f'<div aria-hidden="true" style="position: absolute; left: {X(34)}px; top: {Y(2.5)}px; width: {R}px; height: {Y(17.5) - Y(2.5)}px; box-sizing: border-box; border: 2px solid {LINE}; border-right: none; border-radius: {R}px 0 0 {R}px"></div>')
bg.append(f'<div role="img" aria-label="Tor links" style="position: absolute; left: {X(-1)}px; top: {Y(8.5)}px; width: {S}px; height: {Y(11.5) - Y(8.5)}px; box-sizing: border-box; background: #e5e7eb; border: 3px solid #374151; border-right: none"></div>')
bg.append(f'<div role="img" aria-label="Tor rechts" style="position: absolute; left: {X(40)}px; top: {Y(8.5)}px; width: {S}px; height: {Y(11.5) - Y(8.5)}px; box-sizing: border-box; background: #e5e7eb; border: 3px solid #374151; border-left: none"></div>')
bg.append(f'<div style="position: absolute; left: {X(0) + 8}px; top: {Y(20) - 22}px; font-size: 12px; line-height: 16px; color: #6b5f4b">Mittellinie bei 20 m · Torraum 6 m</div>')

# ---------- Slalom wave (illustration) ----------
wl, wt = 243, 465
pts = [(243, 489), (275, 474), (319, 504), (363, 474), (407, 504), (451, 474), (470, 489)]
d = f"M {pts[0][0]-wl} {pts[0][1]-wt} " + " ".join(
    f"Q {(a[0]+b[0])/2 - wl:.0f} {b[1]-wt + (0 if i==len(pts)-2 else 0)} {b[0]-wl} {b[1]-wt}" for i, (a, b) in enumerate(zip(pts, pts[1:])))
arrows.append(f'<svg aria-hidden="true" width="230" height="50" viewBox="0 0 230 50" style="position: absolute; left: {wl}px; top: {wt}px; width: 230px; height: 50px; overflow: visible; fill: none; stroke: {PATH}; stroke-width: 2; stroke-linecap: round; stroke-dasharray: 6 6"><path d="{d}"></path></svg>')

# ---------- Path arrows ----------
harrow(470, X(18) - 1, Y(17.5), aria="Vom Slalom zur Balancier-Bank")
harrow(X(22) + 2, X(25) - 1, Y(17.5), aria="Von der Balancier-Bank zur Zieh-Bank")
harrow(X(29) + 2, X(31), Y(17.5), head=False)
varrow(Y(17.5), Y(10), X(31), head=False)
harrow(X(31), X(34.3) - 1, Y(10), aria="Anlauf zum Sprungwurf auf den Weichboden")
varrow(Y(8.5) - 2, Y(3), X(35.3), head=False)
harrow(X(35.3), X(29) + 6, Y(3), aria="Vom Weichboden zu den Sprung-Bänken")
harrow(X(26.5) - 6, X(20) + 11, Y(3), aria="Von den Sprung-Bänken zur Kriech-Bank")
harrow(X(20) - 11, X(15) + 1, Y(3), aria="Von der Kriech-Bank zu den Matten")
harrow(X(8) - 1, X(4), Y(3), head=False)
varrow(Y(3), Y(5) - 7, X(4), aria="Von den Matten zu den Seitwärts-Hütchen")
varrow(Y(5) + 6, Y(11) - 7, X(4), aria="Seitwärts zu den Rückwärts-Hütchen")
varrow(Y(11) + 6, Y(16.9) - 1, X(4), aria="Rückwärts zum Ziel")

# ---------- Equipment ----------
# 1 Slalom
for x in (7, 9, 11, 13, 15):
    cone(x, 17.5)
# 2 Balancieren, 3 Ziehen
bench_h(18, 22, 17.5, "Bank zum Balancieren")
bench_h(25, 29, 17.5, "Bank zum Ziehen in Bauchlage")
# Ballkiste
box(X(28.6), Y(12), 44, 22, "background: #fde68a; border: 1px solid #b45309; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 12px; line-height: 16px; color: #78350f; font-weight: 600", "Bälle", aria=None)
# 4 Weichboden
mat(34.3, 36.3, 8.5, 11.5, BIG, "Weichboden", radius=6)
# 5 Sprung-Bänke
for x in (29, 26.5):
    bench_v(x, 1, 5, "Bank zum Überspringen")
# 6 Kriech-Bänke (auf Kastendeckeln)
for x in (20,):
    kasten(x, 1.4); kasten(x, 4.6)
    bench_v(x, 1, 5, "Bank auf Kastendeckeln zum Drunterkriechen")
# 7 Matten
for x1 in (13, 10.5, 8):
    mat(x1, x1 + 2, 2.5, 3.5, MAT, "Kleine Matte")
# 8 Seitwärts
for y in (5, 7, 9):
    cone(4, y)
# 9 Rückwärts (Tore)
for y in (11, 15.5):
    cone(3.2, y); cone(4.8, y)
# Start / Ziel
box(X(1), Y(16.9), X(5.5) - X(1), Y(18.1) - Y(16.9), "background: #15803d; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 12px; line-height: 16px; font-weight: 700", "Start / Ziel")

# ---------- Station labels ----------
station(1, "Slalom vorwärts", cx=X(11), top=Y(15))
station(2, "Balancieren", cx=X(20), top=Y(15))
station(3, "Auf Bank ziehen", cx=715, top=Y(15))
station(4, "Sprungwurf", cx=X(35.3), top=Y(12.5))
station(5, "Bänke überspringen", cx=X(27.75), top=Y(5.6))
station(6, "Unter Bank kriechen", cx=X(19), top=Y(5.6))
station(7, "Purzelbaum", cx=362, top=Y(4.2))
station(8, "Seitwärts", left=X(4) + 19, top=Y(7) - 14)
station(9, "Rückwärts", left=X(4) + 19, top=Y(13.25) - 14)

# ---------- Header ----------
header = f'''<div style="position: absolute; left: 40px; top: 34px; font-family: 'Space Grotesk', Inter, sans-serif; font-size: 30px; line-height: 36px; font-weight: 700; color: {INK}">Parkour in der Turnhalle</div>
<div style="position: absolute; left: 40px; top: 72px; font-size: 13px; line-height: 18px; color: #4b5563">Handballfeld 40 × 20 m · 9 Stationen · 23 Kinder: alle 5 Sekunden ein Kind starten lassen</div>
<div aria-hidden="true" style="position: absolute; left: {X(40) - 5 * S}px; top: 84px; width: {5 * S}px; height: 6px; box-sizing: border-box; border: 2px solid {INK}; border-top: none"></div>
<div style="position: absolute; left: {X(40) - 5 * S}px; top: 64px; width: {5 * S}px; text-align: center; font-size: 12px; line-height: 16px; color: {INK}">5 m</div>'''

# ---------- Legend ----------
STATIONS = [
    ("Slalom vorwärts", "Im Sprint um die Hütchen laufen."),
    ("Balancieren", "Über die Bank gehen. Schwerer: rückwärts oder mit Ball."),
    ("Auf Bank ziehen", "In Bauchlage auf die Bank legen. Mit den Armen nach vorn ziehen."),
    ("Sprungwurf", "Ball nehmen, 3 Schritte, Absprung an der 6-m-Linie, Wurf aufs Tor, Landung auf dem Weichboden."),
    ("Bänke überspringen", "Mit beiden Beinen über jede Bank springen."),
    ("Unter Bank kriechen", "Unter der Bank durchkriechen. Die Bank liegt auf 2 Kastendeckeln."),
    ("Purzelbaum", "Auf jeder Matte eine Rolle vorwärts."),
    ("Seitwärts", "Im Seitgalopp an den Hütchen vorbei. Blick nach vorn."),
    ("Rückwärts", "Rückwärts zum Ziel laufen. Über die Schulter schauen."),
]
items = "\n".join(
    f'<div style="display: flex; gap: 8px; align-items: flex-start"><span style="{BADGE}">{i+1}</span>'
    f'<div style="font-size: 12px; line-height: 16px; color: {INK}"><b>{n}</b><br>{t}</div></div>'
    for i, (n, t) in enumerate(STATIONS))

def sw(style):
    return f'<span aria-hidden="true" style="display: inline-block; flex: none; {style}"></span>'
MATERIAL = [
    (sw(f"width: 28px; height: 8px; background: {BENCH}; border: 1px solid {BENCH_B}; border-radius: 2px"), "5 Bänke"),
    (sw(f"width: 16px; height: 12px; background: {KASTEN}; border: 1px solid {KASTEN_B}; border-radius: 2px"), "2 Kastendeckel"),
    (sw(f"width: 22px; height: 12px; background: {MAT}; border: 1px solid {MAT_B}; border-radius: 2px"), "3 kleine Matten"),
    (sw(f"width: 22px; height: 16px; background: {BIG}; border-radius: 3px"), "1 Weichboden"),
    (sw(f"width: 12px; height: 12px; box-sizing: border-box; background: {CONE}; border: 2px solid {CONE_B}; border-radius: 50%"), "12 Hütchen"),
    (sw("width: 22px; height: 12px; background: #fde68a; border: 1px solid #b45309; border-radius: 2px"), "Ballkiste, ca. 10 Bälle"),
]
mat_html = "\n".join(
    f'<div style="display: flex; align-items: center; gap: 8px; font-size: 12px; line-height: 16px; color: {INK}">'
    f'<span style="display: flex; width: 28px; justify-content: center; flex: none">{s}</span><span>{t}</span></div>'
    for s, t in MATERIAL)

legend = f'''<div style="position: absolute; left: 40px; top: 562px; width: 790px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); column-gap: 20px; row-gap: 10px">
{items}
</div>
<div style="position: absolute; left: 856px; top: 562px; width: 227px; display: flex; flex-direction: column; gap: 4px">
<div style="font-size: 13px; line-height: 18px; font-weight: 700; color: {INK}">Material</div>
{mat_html}
<div style="font-size: 12px; line-height: 16px; color: #4b5563; margin-top: 4px">6. Bank: zu Station 5 dazu.</div>
<div style="font-size: 12px; line-height: 16px; color: #4b5563">Ein Helfer bringt die Bälle zurück.</div>
</div>'''

body = "\n".join(bg + arrows + cards + labels)
html = f'''<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Parkour Aufbauplan</title>
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

root = "/home/claude/canvas/project"
os.makedirs(root, exist_ok=True)
open(f"{root}/Main.dc.html", "w").write(html)
canvas = {"v": 3, "createdOnFiles": {"v": 1, "at": "2026-11-16T12:00:00Z"}, "title": "Parkour Turnhalle – Aufbauplan",
          "launch": {"view": "focused", "file": "Main.dc.html"}, "pages": [],
          "boards": {"Main.dc.html": {"x": 0, "y": 0, "w": 1123, "h": 794, "title": "Aufbauplan (A4 quer)"}},
          "order": ["Main.dc.html"], "notes": {}, "designSystems": []}
open(f"{root}/canvas.json", "w").write(json.dumps(canvas, ensure_ascii=False, indent=1))
print("ok", len(html))
