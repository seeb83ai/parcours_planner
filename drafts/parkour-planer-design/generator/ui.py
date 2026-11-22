import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
import court

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
P1, P2 = f"{DATA}/parcours1_movement.json", f"{DATA}/parcours2_ball_f_jugend.json"
OUT = os.path.join(HERE, "..", "canvas")
os.makedirs(OUT, exist_ok=True)

INK, MUTED, SUBTLE = "#111827", "#4b5563", "#6b7280"
BG, SURF, BORDER = "#f5f5f2", "#ffffff", "#e4e4df"
ACC, ACC_SOFT, ACC_DARK = "#0f766e", "#e6f4f1", "#115e59"
ORA, ORA_SOFT = "#c2410c", "#fff3eb"
HEAD = "'Space Grotesk', Inter, system-ui, sans-serif"

ICONS = {
    "route": '<circle cx="6" cy="19" r="2"></circle><circle cx="18" cy="5" r="2"></circle><path d="M8 19h6a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h6"></path>',
    "undo": '<path d="M9 14 4 9l5-5"></path><path d="M4 9h11a5 5 0 0 1 0 10h-3"></path>',
    "redo": '<path d="m15 14 5-5-5-5"></path><path d="M20 9H9a5 5 0 0 0 0 10h3"></path>',
    "download": '<path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path>',
    "upload": '<path d="M12 21V9"></path><path d="m7 14 5-5 5 5"></path><path d="M5 3h14"></path>',
    "printer": '<path d="M6 9V3h12v6"></path><path d="M6 18H4v-7h16v7h-2"></path><path d="M6 14h12v7H6z"></path>',
    "template": '<rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M3 9h18"></path><path d="M9 21V9"></path>',
    "plus": '<path d="M12 5v14"></path><path d="M5 12h14"></path>',
    "grip": '<path d="M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01" stroke-width="3"></path>',
    "pointer": '<path d="m4 4 7 17 2.5-7.5L21 11z"></path>',
    "throw": '<path d="M4 20 20 4"></path><path d="M10 4h10v10"></path>',
    "note": '<path d="M4 7V5h16v2"></path><path d="M9 19h6"></path><path d="M12 5v14"></path>',
    "zoomin": '<circle cx="11" cy="11" r="7"></circle><path d="m21 21-4.3-4.3"></path><path d="M11 8v6M8 11h6"></path>',
    "zoomout": '<circle cx="11" cy="11" r="7"></circle><path d="m21 21-4.3-4.3"></path><path d="M8 11h6"></path>',
    "alert": '<path d="M12 3 2 21h20z"></path><path d="M12 10v5"></path><path d="M12 18h.01"></path>',
    "check": '<circle cx="12" cy="12" r="9"></circle><path d="m8 12 3 3 5-6"></path>',
    "info": '<circle cx="12" cy="12" r="9"></circle><path d="M12 11v6"></path><path d="M12 7h.01"></path>',
    "users": '<circle cx="9" cy="8" r="4"></circle><path d="M2 21a7 7 0 0 1 14 0"></path><path d="M17 4a4 4 0 0 1 0 8"></path><path d="M22 21a6 6 0 0 0-4-5.6"></path>',
    "clock": '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>',
    "flag": '<path d="M5 21V4"></path><path d="M5 4h11l-2 4 2 4H5"></path>',
    "book": '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"></path><path d="M19 19v2H6"></path>',
    "trash": '<path d="M4 7h16"></path><path d="M9 7V4h6v3"></path><path d="m6 7 1 13h10l1-13"></path>',
    "rotate": '<path d="M20 12a8 8 0 1 1-2.3-5.7"></path><path d="M20 4v4h-4"></path>',
    "copy": '<rect x="8" y="8" width="12" height="12" rx="2"></rect><path d="M16 8V4H4v12h4"></path>',
    "search": '<circle cx="11" cy="11" r="7"></circle><path d="m21 21-4.3-4.3"></path>',
    "chevleft": '<path d="m15 18-6-6 6-6"></path>',
    "share": '<circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"></path>',
    "minus": '<path d="M5 12h14"></path>',
    "grid": '<path d="M3 9h18M3 15h18M9 3v18M15 3v18"></path><rect x="3" y="3" width="18" height="18" rx="2"></rect>',
}


def ic(name, size=18, color="currentColor"):
    return (f'<svg aria-hidden="true" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" '
            f'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex: none">{ICONS[name]}</svg>')


BTN = "display: inline-flex; align-items: center; gap: 8px; min-height: 40px; padding: 0 14px; border-radius: 10px; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; white-space: nowrap"
B_PRI = BTN + f"; background: {ACC}; color: #ffffff; border: 1px solid {ACC}"
B_SEC = BTN + f"; background: {SURF}; color: {INK}; border: 1px solid {BORDER}"
B_GHOST = BTN + f"; background: transparent; color: {MUTED}; border: 1px solid transparent"
B_ICON = f"display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 10px; background: transparent; color: {MUTED}; border: 1px solid transparent; cursor: pointer"
CARD = f"background: {SURF}; border: 1px solid {BORDER}; border-radius: 16px"
H2 = f"margin: 0; font-family: {HEAD}; font-size: 15px; font-weight: 700; color: {INK}"
CHIP = "display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600"


def logo(size=36):
    return (f'<div style="display: flex; align-items: center; gap: 10px">'
            f'<span style="display: inline-flex; align-items: center; justify-content: center; width: {size}px; height: {size}px; border-radius: 10px; background: {ACC}; color: #ffffff">{ic("route", 20)}</span>'
            f'<span style="font-family: {HEAD}; font-size: 18px; font-weight: 700; letter-spacing: -0.01em; color: {INK}">Parkour-Planer</span></div>')


GLYPH = {
    "Hütchen": '<circle cx="14" cy="14" r="7" fill="#f97316" stroke="#9a3412" stroke-width="2"></circle>',
    "Reifen": '<circle cx="14" cy="14" r="9" fill="none" stroke="#7c3aed" stroke-width="3"></circle>',
    "Teller": '<circle cx="14" cy="14" r="8" fill="#facc15" stroke="#854d0e"></circle>',
    "Bank": '<rect x="2" y="10" width="24" height="8" rx="2" fill="#a0692f" stroke="#6b4423"></rect>',
    "Kastendeckel": '<rect x="5" y="7" width="18" height="14" rx="2" fill="#9ca3af" stroke="#4b5563"></rect>',
    "Matte": '<rect x="2" y="7" width="24" height="14" rx="3" fill="#4f8fd1" stroke="#1e5a96"></rect>',
    "Weichboden": '<rect x="5" y="2" width="18" height="24" rx="4" fill="#1e3a8a"></rect>',
    "Ballkiste": '<rect x="3" y="7" width="22" height="14" rx="3" fill="#fde68a" stroke="#b45309"></rect>',
}


def glyph(name, size=28):
    return f'<svg aria-hidden="true" width="{size}" height="{size}" viewBox="0 0 28 28" style="flex: none">{GLYPH[name]}</svg>'


def page(title, root_style, body, w, h, extra_style=""):
    return f'''<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=Space+Grotesk:wght@600;700&amp;display=swap">
<style>
body{{margin:0;background:{BG}}}
a{{color:{ACC}}}a:hover{{color:{ACC_DARK}}}
.sr-only{{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}}
:focus-visible{{outline:2px solid {ACC};outline-offset:2px}}
{extra_style}
</style>
</helmet>
<div style="{root_style}">
{body}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":{w},"height":{h}}}}}'>
class Component extends DCLogic {{
renderVals() {{
return {{}};
}}
}}
</script>
</body>
</html>
'''


d2 = json.load(open(P2))
d1 = json.load(open(P1))

# ======================= EDITOR (Main) =======================
header = f'''<header style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 20px; background: {SURF}; border-bottom: 1px solid {BORDER}">
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 16px; min-width: 0">
{logo()}
<span aria-hidden="true" style="width: 1px; height: 28px; background: {BORDER}"></span>
<div style="display: flex; align-items: center; gap: 10px; min-width: 0">
<label for="title" class="sr-only">Name des Parkours</label>
<input id="title" type="text" value="Ball-Parkour F-Jugend" style="min-width: 0; width: 15rem; max-width: 100%; height: 40px; padding: 0 10px; border: 1px solid transparent; border-radius: 10px; background: transparent; font: inherit; font-size: 16px; font-weight: 600; color: {INK}">
<span style="{CHIP}; background: {BG}; color: {MUTED}">{ic("check", 14)}Entwurf gespeichert</span>
</div>
</div>
<nav aria-label="Aktionen" style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px">
<button type="button" aria-label="Rückgängig" style="{B_ICON}">{ic("undo")}</button>
<button type="button" aria-label="Wiederholen" style="{B_ICON}">{ic("redo")}</button>
<a href="Start.dc.html" style="{B_GHOST}">{ic("template")}Vorlagen</a>
<button type="button" style="{B_SEC}">{ic("upload")}Laden</button>
<button type="button" style="{B_SEC}">{ic("download")}Speichern</button>
<button type="button" style="{B_PRI}">{ic("printer")}Drucken (A4)</button>
</nav>
</header>'''

tools = [("pointer", "Auswählen", "V", True), ("route", "Laufweg", "L", False), ("throw", "Pass / Wurf", "W", False), ("note", "Notiz", "T", False)]
tool_btns = "\n".join(
    f'<button type="button" aria-pressed="{"true" if on else "false"}" style="display: flex; align-items: center; gap: 10px; width: 100%; min-height: 44px; padding: 0 12px; border-radius: 10px; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; text-align: left; '
    + (f'background: {ACC_SOFT}; color: {ACC_DARK}; border: 1px solid #b9ded5' if on else f'background: transparent; color: {INK}; border: 1px solid transparent')
    + f'">{ic(i)}<span style="flex: 1">{t}</span><kbd style="font: inherit; font-size: 12px; color: {SUBTLE}; padding: 1px 6px; border: 1px solid {BORDER}; border-radius: 6px; background: {SURF}">{k}</kbd></button>'
    for i, t, k, on in tools)
mat_counts = [("Hütchen", 9), ("Reifen", 7), ("Teller", 3), ("Bank", 0), ("Kastendeckel", 0), ("Matte", 0), ("Weichboden", 0), ("Ballkiste", 1)]
mat_tiles = "\n".join(
    f'<button type="button" style="display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 6px 10px; border-radius: 12px; border: 1px solid {BORDER}; background: {SURF}; font: inherit; cursor: grab; color: {INK}">'
    f'{glyph(n)}<span style="font-size: 13px; font-weight: 600">{n}</span><span style="font-size: 12px; color: {SUBTLE}">{c} im Plan</span></button>'
    for n, c in mat_counts)
layers = [("Hallenlinien", True), ("9-m-Linie", True), ("Laufweg", True), ("Beschriftungen", True), ("Raster 1 m", False)]
layer_rows = "\n".join(
    f'<label style="display: flex; align-items: center; gap: 10px; min-height: 36px; font-size: 14px; color: {INK}; cursor: pointer"><input type="checkbox"{" checked" if on else ""} style="width: 18px; height: 18px; accent-color: {ACC}; margin: 0">{n}</label>'
    for n, on in layers)

left = f'''<aside aria-label="Werkzeuge und Material" style="flex: 1 1 220px; max-width: 100%; display: flex; flex-direction: column; gap: 16px">
<section style="{CARD}; padding: 14px; display: flex; flex-direction: column; gap: 6px">
<h2 style="{H2}; margin-bottom: 4px">Werkzeuge</h2>
{tool_btns}
</section>
<section style="{CARD}; padding: 14px; display: flex; flex-direction: column; gap: 10px">
<h2 style="{H2}">Material</h2>
<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">
{mat_tiles}
</div>
<p style="margin: 0; font-size: 12px; line-height: 16px; color: {SUBTLE}">Auf das Feld ziehen. Bänke mit R drehen.</p>
</section>
<section style="{CARD}; padding: 14px; display: flex; flex-direction: column; gap: 2px">
<h2 style="{H2}; margin-bottom: 6px">Ebenen</h2>
{layer_rows}
</section>
</aside>'''

court_svg = court.render(P2, "ed", "Spielfeld 40 mal 20 Meter mit dem Ball-Parkour, Station 6 ausgewählt", selected=6)
center = f'''<main style="flex: 999 1 560px; min-width: 0; display: flex; flex-direction: column; gap: 16px">
<div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; {CARD}; padding: 8px 10px">
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
<span style="{CHIP}; background: {ACC_SOFT}; color: {ACC_DARK}">Auswahl: Station 6 · 2 Hütchen</span>
<button type="button" style="{B_GHOST}; min-height: 36px">{ic("rotate", 16)}Drehen</button>
<button type="button" style="{B_GHOST}; min-height: 36px">{ic("copy", 16)}Duplizieren</button>
<button type="button" style="{B_GHOST}; min-height: 36px; color: #b91c1c">{ic("trash", 16)}Löschen</button>
</div>
<div style="display: flex; align-items: center; gap: 4px">
<label style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: {MUTED}; margin-right: 8px; cursor: pointer"><input type="checkbox" checked style="width: 16px; height: 16px; accent-color: {ACC}; margin: 0">Am 0,5-m-Raster ausrichten</label>
<button type="button" aria-label="Verkleinern" style="{B_ICON}; width: 36px; height: 36px">{ic("zoomout")}</button>
<span style="font-size: 13px; font-weight: 600; color: {INK}; min-width: 44px; text-align: center">100 %</span>
<button type="button" aria-label="Vergrößern" style="{B_ICON}; width: 36px; height: 36px">{ic("zoomin")}</button>
</div>
</div>
<div style="{CARD}; padding: 20px; background: #fbfaf7">
{court_svg}
<div style="display: flex; flex-wrap: wrap; gap: 16px; margin-top: 14px; font-size: 12px; color: {MUTED}">
<span style="display: inline-flex; align-items: center; gap: 6px"><svg aria-hidden="true" width="28" height="8"><line x1="0" y1="4" x2="28" y2="4" stroke="#0f766e" stroke-width="2" stroke-dasharray="6 5"></line></svg>Laufweg</span>
<span style="display: inline-flex; align-items: center; gap: 6px"><svg aria-hidden="true" width="28" height="8"><line x1="0" y1="4" x2="28" y2="4" stroke="#c2410c" stroke-width="2"></line></svg>Pass / Wurf</span>
<span>Feld 40 × 20 m · Maßstab 1 Kästchen = 1 m</span>
</div>
</div>
<section aria-label="Prüfung" style="display: flex; flex-wrap: wrap; gap: 16px">
<div style="flex: 1 1 260px; {CARD}; padding: 16px; display: flex; flex-wrap: wrap; gap: 20px">
<div style="display: flex; align-items: center; gap: 10px">{ic("users", 22, ACC)}<div><div style="font-family: {HEAD}; font-size: 22px; font-weight: 700">23</div><div style="font-size: 12px; color: {SUBTLE}">Kinder</div></div></div>
<div style="display: flex; align-items: center; gap: 10px">{ic("clock", 22, ACC)}<div><div style="font-family: {HEAD}; font-size: 22px; font-weight: 700">5 s</div><div style="font-size: 12px; color: {SUBTLE}">Startabstand</div></div></div>
<div style="display: flex; align-items: center; gap: 10px">{ic("flag", 22, ACC)}<div><div style="font-family: {HEAD}; font-size: 22px; font-weight: 700">6</div><div style="font-size: 12px; color: {SUBTLE}">Stationen</div></div></div>
</div>
<ul style="flex: 2 1 360px; list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px">
<li style="display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: 12px; background: {ORA_SOFT}; border: 1px solid #f6c9ac; font-size: 13px; line-height: 18px; color: #7c2d12">{ic("alert", 18, ORA)}<span style="flex: 1"><b>Station 6 – Zielwurf:</b> nur 1 Kind gleichzeitig. Bei 23 Kindern bildet sich hier eine Schlange.</span><button type="button" style="{B_SEC}; min-height: 32px; font-size: 13px; padding: 0 10px">Zweites Ziel</button></li>
<li style="display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: 12px; background: {SURF}; border: 1px solid {BORDER}; font-size: 13px; line-height: 18px; color: {INK}">{ic("check", 18, "#15803d")}<span>Kein Wurf kreuzt einen Laufweg.</span></li>
<li style="display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: 12px; background: {SURF}; border: 1px solid {BORDER}; font-size: 13px; line-height: 18px; color: {INK}">{ic("info", 18, MUTED)}<span>Ballanzahl unbekannt. Der Plan rechnet mit 15 Bällen.</span></li>
</ul>
</section>
</main>'''

SKILL_DE = {"dribbling": "Prellen", "passing": "Passen", "ballFeeling": "Ballgefühl", "defence": "Abwehr", "throwing": "Werfen"}
rows = []
for st in d2["stations"]:
    sel = st["number"] == 6
    skill = " · ".join(SKILL_DE[s] for s in st["skills"])
    cap = f'{st["capacity"]} Platz' if st["capacity"] == 1 else f'{st["capacity"]} Plätze'
    rows.append(
        f'<li style="display: flex; align-items: center; gap: 8px; padding: 8px 8px 8px 4px; border-radius: 12px; '
        + (f'background: {ACC_SOFT}; border: 1px solid #9fd3c6' if sel else 'border: 1px solid transparent')
        + f'"><button type="button" aria-label="Station {st["number"]} verschieben" style="{B_ICON}; width: 28px; height: 36px; cursor: grab; color: {SUBTLE}">{ic("grip", 16)}</button>'
        f'<span style="display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; background: {ACC if sel else INK}; color: #ffffff; font-size: 13px; font-weight: 700; flex: none">{st["number"]}</span>'
        f'<span style="flex: 1; min-width: 0"><span style="display: block; font-size: 14px; font-weight: 600; color: {INK}">{st["name"]}</span>'
        f'<span style="display: block; font-size: 12px; color: {SUBTLE}">{skill} · {cap}</span></span></li>')
station_list = "\n".join(rows)

s6 = d2["stations"][5]
skills_all = [("Prellen", True), ("Werfen", True), ("Passen", False), ("Ballgefühl", False), ("Abwehr", False)]
skill_chips = "\n".join(
    f'<button type="button" aria-pressed="{"true" if on else "false"}" style="{CHIP}; min-height: 32px; padding: 0 12px; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; '
    + (f'background: {ACC}; color: #ffffff; border: 1px solid {ACC}' if on else f'background: {SURF}; color: {INK}; border: 1px solid {BORDER}')
    + f'">{n}</button>' for n, on in skills_all)
FIELD = f"width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid {BORDER}; border-radius: 10px; font: inherit; font-size: 14px; color: {INK}; background: {SURF}"
LBL = f"display: block; font-size: 12px; font-weight: 600; color: {MUTED}; margin-bottom: 6px"

right = f'''<aside aria-label="Stationen" style="flex: 1 1 300px; max-width: 100%; display: flex; flex-direction: column; gap: 16px">
<section style="{CARD}; padding: 14px; display: flex; flex-direction: column; gap: 8px">
<div style="display: flex; align-items: center; justify-content: space-between; gap: 8px">
<h2 style="{H2}">Stationen <span style="{CHIP}; background: {BG}; color: {MUTED}; margin-left: 4px">6</span></h2>
<button type="button" style="{B_SEC}; min-height: 36px; font-size: 13px">{ic("plus", 16)}Station</button>
</div>
<ol style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px">
{station_list}
</ol>
</section>
<section aria-label="Station 6 bearbeiten" style="{CARD}; padding: 16px; display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; align-items: center; gap: 10px">
<span style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: {ACC}; color: #ffffff; font-size: 13px; font-weight: 700">6</span>
<h2 style="{H2}; flex: 1">Station bearbeiten</h2>
<button type="button" aria-label="Station löschen" style="{B_ICON}; width: 36px; height: 36px">{ic("trash", 18)}</button>
</div>
<div><label for="st-name" style="{LBL}">Name</label><input id="st-name" type="text" value="{s6["name"]}" style="{FIELD}"></div>
<div><label for="st-task" style="{LBL}">Aufgabe (steht auf dem Plan)</label><textarea id="st-task" rows="4" style="{FIELD}; resize: vertical; line-height: 20px">{s6["task"]}</textarea></div>
<div><span style="{LBL}">Fähigkeiten</span><div style="display: flex; flex-wrap: wrap; gap: 6px">{skill_chips}</div></div>
<div style="display: flex; align-items: center; justify-content: space-between; gap: 12px">
<span style="font-size: 14px; color: {INK}">Kinder gleichzeitig</span>
<div style="display: flex; align-items: center; border: 1px solid {BORDER}; border-radius: 10px">
<button type="button" aria-label="Weniger" style="{B_ICON}">{ic("minus", 16)}</button>
<span style="min-width: 28px; text-align: center; font-weight: 700">1</span>
<button type="button" aria-label="Mehr" style="{B_ICON}">{ic("plus", 16)}</button>
</div>
</div>
<div style="display: flex; flex-wrap: wrap; gap: 8px">
<span style="{CHIP}; background: {BG}; color: {INK}">{glyph("Hütchen", 16)}2 Hütchen</span>
<span style="{CHIP}; background: {BG}; color: {INK}">{glyph("Reifen", 16)}2 Reifen im Tor</span>
</div>
<button type="button" style="{B_SEC}; justify-content: center">{ic("book", 16)}Aus Übungsbibliothek wählen</button>
</section>
<section style="{CARD}; padding: 16px; display: flex; flex-direction: column; gap: 10px">
<div style="display: flex; align-items: baseline; justify-content: space-between; gap: 8px"><h2 style="{H2}">Materialliste</h2><span style="font-size: 12px; color: {SUBTLE}">automatisch gezählt</span></div>
<table style="width: 100%; border-collapse: collapse; font-size: 14px">
<tbody>
<tr style="border-top: 1px solid {BORDER}"><td style="padding: 8px 0; display: flex; align-items: center; gap: 8px">{glyph("Hütchen", 20)}Hütchen</td><td style="padding: 8px 0; text-align: right; font-weight: 700">9</td></tr>
<tr style="border-top: 1px solid {BORDER}"><td style="padding: 8px 0; display: flex; align-items: center; gap: 8px">{glyph("Reifen", 20)}Reifen</td><td style="padding: 8px 0; text-align: right; font-weight: 700">7</td></tr>
<tr style="border-top: 1px solid {BORDER}"><td style="padding: 8px 0; display: flex; align-items: center; gap: 8px">{glyph("Teller", 20)}Markierungsteller</td><td style="padding: 8px 0; text-align: right; font-weight: 700">3</td></tr>
<tr style="border-top: 1px solid {BORDER}"><td style="padding: 8px 0; display: flex; align-items: center; gap: 8px">{glyph("Ballkiste", 20)}Ballkiste, 15 Bälle</td><td style="padding: 8px 0; text-align: right; font-weight: 700">1</td></tr>
</tbody>
</table>
</section>
</aside>'''

editor_body = header + f'''
<div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px; padding: 16px; max-width: 1600px; width: 100%; box-sizing: border-box; margin: 0 auto">
{left}
{center}
{right}
</div>'''
ROOT = f"min-height: 100vh; background: {BG}; font-family: Inter, system-ui, sans-serif; color: {INK}; display: flex; flex-direction: column"
open(f"{OUT}/Main.dc.html", "w").write(page("Parkour-Planer – Editor", ROOT, editor_body, 1440, 1120))

# ======================= START =======================
thumb1 = court.render(P1, "t1", "Vorschau Parkour in der Turnhalle", compact=True)
thumb2 = court.render(P2, "t2", "Vorschau Ball-Parkour F-Jugend", compact=True)
LIB = [("Prellen", "Hütchen-Slalom prellend", "Hütchen"), ("Prellen", "Prellen auf der Bank", "Bank"),
       ("Ballgefühl", "Ball um den Körper", "ohne Material"), ("Passen", "Pass an die Wand", "Wand"),
       ("Werfen", "Zielwurf auf Reifen im Tor", "Reifen, Tor"), ("Abwehr", "Abwehrschritte zwischen Hütchen", "Hütchen")]
lib_cards = "\n".join(
    f'<li style="flex: 1 1 260px; {CARD}; padding: 16px; display: flex; flex-direction: column; gap: 8px">'
    f'<span style="{CHIP}; align-self: flex-start; background: {ACC_SOFT}; color: {ACC_DARK}">{sk}</span>'
    f'<span style="font-size: 15px; font-weight: 600; color: {INK}">{nm}</span>'
    f'<span style="font-size: 13px; color: {SUBTLE}">Braucht: {nd}</span>'
    f'<button type="button" style="{B_SEC}; align-self: flex-start; min-height: 36px; font-size: 13px; margin-top: 4px">{ic("plus", 16)}Zum Parkour</button></li>'
    for sk, nm, nd in LIB)
filters = "\n".join(
    f'<button type="button" aria-pressed="{"true" if i == 0 else "false"}" style="{CHIP}; min-height: 36px; padding: 0 14px; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; '
    + (f'background: {INK}; color: #ffffff; border: 1px solid {INK}' if i == 0 else f'background: {SURF}; color: {INK}; border: 1px solid {BORDER}')
    + f'">{f}</button>' for i, f in enumerate(["Alle", "Prellen", "Ballgefühl", "Passen", "Werfen", "Abwehr", "Bewegung"]))


def tmpl_card(svg, title, meta, tags):
    tg = "".join(f'<span style="{CHIP}; background: {BG}; color: {MUTED}">{t}</span>' for t in tags)
    return (f'<a href="Main.dc.html" style="flex: 1 1 320px; {CARD}; padding: 14px; display: flex; flex-direction: column; gap: 12px; text-decoration: none; color: {INK}">'
            f'<div style="border-radius: 10px; background: #fbfaf7; padding: 10px; border: 1px solid {BORDER}">{svg}</div>'
            f'<span style="font-family: {HEAD}; font-size: 18px; font-weight: 700">{title}</span>'
            f'<span style="font-size: 13px; color: {SUBTLE}">{meta}</span><span style="display: flex; flex-wrap: wrap; gap: 6px">{tg}</span></a>')


start_body = f'''<header style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 20px; background: {SURF}; border-bottom: 1px solid {BORDER}">
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 24px">
{logo()}
<nav aria-label="Bereiche" style="display: flex; gap: 4px">
<a href="Start.dc.html" aria-current="page" style="{B_GHOST}; color: {INK}; background: {BG}">Meine Parkours</a>
<a href="#bibliothek" style="{B_GHOST}">Übungsbibliothek</a>
</nav>
</div>
<div style="display: flex; flex-wrap: wrap; gap: 8px">
<button type="button" style="{B_SEC}">{ic("upload")}JSON laden</button>
<a href="Main.dc.html" style="{B_PRI}">{ic("plus")}Neuer Parkour</a>
</div>
</header>
<main style="max-width: 1240px; width: 100%; box-sizing: border-box; margin: 0 auto; padding: 40px 20px 56px; display: flex; flex-direction: column; gap: 40px">
<section style="display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 16px">
<div style="max-width: 640px">
<h1 style="margin: 0; font-family: {HEAD}; font-size: 40px; line-height: 1.1; letter-spacing: -0.02em; text-wrap: balance">Was baust du heute auf?</h1>
<p style="margin: 12px 0 0; font-size: 16px; line-height: 24px; color: {MUTED}; text-wrap: pretty">Plane Stationen auf einem maßstabsgetreuen Handballfeld. Der Planer zählt das Material und druckt den Plan auf A4.</p>
</div>
<div style="display: flex; align-items: center; gap: 8px; min-width: 260px; flex: 0 1 320px">
<label for="q" class="sr-only">Parkours suchen</label>
<div style="position: relative; flex: 1">
<span style="position: absolute; left: 12px; top: 12px; color: {SUBTLE}">{ic("search", 18)}</span>
<input id="q" type="search" placeholder="Parkours suchen" style="width: 100%; box-sizing: border-box; height: 44px; padding: 0 12px 0 40px; border: 1px solid {BORDER}; border-radius: 12px; font: inherit; font-size: 14px; background: {SURF}">
</div>
</div>
</section>
<section aria-labelledby="neu" style="display: flex; flex-direction: column; gap: 16px">
<h2 id="neu" style="{H2}; font-size: 18px">Neu anfangen</h2>
<div style="display: flex; flex-wrap: wrap; gap: 16px">
<a href="Main.dc.html" style="flex: 1 1 260px; min-height: 260px; border: 2px dashed #c9c9c2; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; text-decoration: none; color: {INK}; background: transparent; padding: 20px">
<span style="display: inline-flex; align-items: center; justify-content: center; width: 52px; height: 52px; border-radius: 14px; background: {ACC_SOFT}; color: {ACC}">{ic("plus", 26)}</span>
<span style="font-family: {HEAD}; font-size: 18px; font-weight: 700">Leerer Parkour</span>
<span style="font-size: 13px; color: {SUBTLE}">Handballfeld 40 × 20 m</span>
</a>
{tmpl_card(thumb1, "Parkour in der Turnhalle", "9 Stationen · 5 Bänke · Weichboden", ["Bewegung", "Sprungwurf", "F-Jugend"])}
{tmpl_card(thumb2, "Ball-Parkour F-Jugend", "6 Stationen · 15 Bälle · 23 Kinder", ["Prellen", "Passen", "Werfen", "Abwehr"])}
</div>
</section>
<section aria-labelledby="zuletzt" style="display: flex; flex-direction: column; gap: 12px">
<h2 id="zuletzt" style="{H2}; font-size: 18px">Zuletzt bearbeitet</h2>
<ul style="list-style: none; margin: 0; padding: 0; {CARD}; overflow: hidden">
<li style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 14px 16px"><a href="Main.dc.html" style="flex: 1 1 240px; font-size: 15px; font-weight: 600; color: {INK}; text-decoration: none">Ball-Parkour F-Jugend</a><span style="font-size: 13px; color: {SUBTLE}">6 Stationen</span><span style="font-size: 13px; color: {SUBTLE}; min-width: 96px; text-align: right">17.11.2026</span></li>
<li style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 14px 16px; border-top: 1px solid {BORDER}"><a href="Main.dc.html" style="flex: 1 1 240px; font-size: 15px; font-weight: 600; color: {INK}; text-decoration: none">Parkour in der Turnhalle</a><span style="font-size: 13px; color: {SUBTLE}">9 Stationen</span><span style="font-size: 13px; color: {SUBTLE}; min-width: 96px; text-align: right">16.11.2026</span></li>
</ul>
</section>
<section id="bibliothek" aria-labelledby="lib" style="display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px">
<h2 id="lib" style="{H2}; font-size: 18px">Übungsbibliothek</h2>
<div role="group" aria-label="Nach Fähigkeit filtern" style="display: flex; flex-wrap: wrap; gap: 6px">
{filters}
</div>
</div>
<ul style="list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 12px">
{lib_cards}
</ul>
</section>
</main>'''
open(f"{OUT}/Start.dc.html", "w").write(page("Parkour-Planer – Start", ROOT, start_body, 1440, 1300))

# ======================= MOBILE =======================
mob_court = court.render(P2, "mb", "Plan des Ball-Parkours", compact=True)
mob_st = "\n".join(
    f'<li style="display: flex; gap: 12px; padding: 12px 0; border-top: 1px solid {BORDER}">'
    f'<span style="display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; background: {INK}; color: #ffffff; font-size: 13px; font-weight: 700; flex: none">{st["number"]}</span>'
    f'<span><span style="display: block; font-size: 15px; font-weight: 600">{st["name"]}</span><span style="display: block; font-size: 13px; line-height: 18px; color: {MUTED}; margin-top: 2px">{st["task"]}</span></span></li>'
    for st in d2["stations"])
checklist = [("Hütchen", 9, True), ("Reifen", 7, True), ("Teller", 3, False), ("Ballkiste", 1, False)]
check_rows = "\n".join(
    f'<li style="border-top: 1px solid {BORDER}"><label style="display: flex; align-items: center; gap: 12px; min-height: 48px; font-size: 15px; cursor: pointer">'
    f'<input type="checkbox"{" checked" if on else ""} style="width: 22px; height: 22px; accent-color: {ACC}; margin: 0">{glyph(n, 22)}<span style="flex: 1">{c} × {"Markierungsteller" if n == "Teller" else n}</span></label></li>'
    for n, c, on in checklist)
mobile_body = f'''<header style="display: flex; align-items: center; gap: 4px; padding: 8px 8px 8px 4px; background: {SURF}; border-bottom: 1px solid {BORDER}">
<a href="Start.dc.html" aria-label="Zurück" style="{B_ICON}; width: 44px; height: 44px; color: {INK}">{ic("chevleft", 22)}</a>
<div style="flex: 1; min-width: 0"><div style="font-family: {HEAD}; font-size: 17px; font-weight: 700">Ball-Parkour F-Jugend</div><div style="font-size: 12px; color: {SUBTLE}">6 Stationen · 23 Kinder · Start alle 5 s</div></div>
<button type="button" aria-label="Teilen" style="{B_ICON}; width: 44px; height: 44px; color: {INK}">{ic("share", 20)}</button>
</header>
<div style="flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 16px">
<div style="{CARD}; padding: 10px; background: #fbfaf7">{mob_court}</div>
<div role="tablist" aria-label="Ansicht" style="display: flex; padding: 4px; background: #ebebe6; border-radius: 12px">
<button type="button" role="tab" aria-selected="true" style="flex: 1; min-height: 40px; border: none; border-radius: 9px; background: {SURF}; font: inherit; font-size: 14px; font-weight: 600; color: {INK}">Aufbau</button>
<button type="button" role="tab" aria-selected="false" style="flex: 1; min-height: 40px; border: none; border-radius: 9px; background: transparent; font: inherit; font-size: 14px; font-weight: 600; color: {MUTED}">Stationen</button>
</div>
<section aria-labelledby="mcheck" style="{CARD}; padding: 4px 16px 8px">
<div style="display: flex; align-items: baseline; justify-content: space-between; padding: 12px 0 10px"><h2 id="mcheck" style="{H2}; font-size: 16px">Aufbau-Checkliste</h2><span style="font-size: 13px; color: {ACC_DARK}; font-weight: 600">2 von 4</span></div>
<ul style="list-style: none; margin: 0; padding: 0">
{check_rows}
</ul>
</section>
<section aria-labelledby="mst" style="{CARD}; padding: 4px 16px 8px">
<h2 id="mst" style="{H2}; font-size: 16px; padding: 12px 0 10px">Stationen</h2>
<ol style="list-style: none; margin: 0; padding: 0">
{mob_st}
</ol>
</section>
</div>'''
MROOT = f"width: 390px; height: 844px; overflow: hidden; background: {BG}; font-family: Inter, system-ui, sans-serif; color: {INK}; display: flex; flex-direction: column"
open(f"{OUT}/Mobile.dc.html", "w").write(page("Parkour-Planer – Handy-Ansicht", MROOT, mobile_body, 390, 844))

canvas = {"v": 3, "createdOnFiles": {"v": 1, "at": "2026-11-22T12:00:00Z"}, "title": "Parkour-Planer – Website-Entwurf",
          "launch": {"view": "canvas"}, "pages": [],
          "boards": {
              "Main.dc.html": {"x": 1520, "y": 0, "w": 1440, "h": 1120, "title": "Editor", "expand": "fill", "is_interactive": True},
              "Start.dc.html": {"x": 0, "y": 0, "w": 1440, "h": 1300, "title": "Start und Vorlagen", "expand": "fill", "is_interactive": True},
              "Mobile.dc.html": {"x": 3040, "y": 0, "w": 390, "h": 844, "title": "Handy-Ansicht in der Halle", "is_interactive": True}},
          "order": ["Main.dc.html", "Start.dc.html", "Mobile.dc.html"],
          "notes": {"title": {"x": 0, "y": -300, "text": "Parkour-Planer – Website-Entwurf", "kind": "title1", "maxW": 3430}},
          "designSystems": []}
open(f"{OUT}/canvas.json", "w").write(json.dumps(canvas, ensure_ascii=False, indent=1))
print("ok")
