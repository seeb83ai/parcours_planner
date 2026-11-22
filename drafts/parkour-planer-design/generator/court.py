"""Draw a parcours JSON (schemaVersion 1) as one inline SVG string."""
import json, math

S = 22  # px per metre
COL = dict(floor="#f3e9d6", line="#a8977a", run="#0f766e", throw="#c2410c",
           cone="#f97316", coneB="#9a3412", hoop="#7c3aed", disc="#facc15", discB="#854d0e",
           bench="#a0692f", benchB="#6b4423", kasten="#9ca3af", kastenB="#4b5563",
           mat="#4f8fd1", matB="#1e5a96", big="#1e3a8a", box="#fde68a", boxB="#b45309",
           start="#15803d", zone="#d5ebe4", ink="#111827")


def p(v):
    return round(v * S, 1)


def court_lines():
    c = COL["line"]
    out = [f'<rect x="0" y="0" width="{p(40)}" height="{p(20)}" rx="2" fill="{COL["floor"]}" stroke="{c}" stroke-width="2"></rect>',
           f'<line x1="{p(20)}" y1="0" x2="{p(20)}" y2="{p(20)}" stroke="{c}" stroke-width="2"></line>']
    r6, r9 = p(6), p(9)
    out.append(f'<path d="M 0 {p(2.5)} A {r6} {r6} 0 0 1 {p(6)} {p(8.5)} L {p(6)} {p(11.5)} A {r6} {r6} 0 0 1 0 {p(17.5)}" fill="none" stroke="{c}" stroke-width="2"></path>')
    out.append(f'<path d="M {p(40)} {p(2.5)} A {r6} {r6} 0 0 0 {p(34)} {p(8.5)} L {p(34)} {p(11.5)} A {r6} {r6} 0 0 0 {p(40)} {p(17.5)}" fill="none" stroke="{c}" stroke-width="2"></path>')
    x0 = math.sqrt(81 - 8.5 ** 2)
    out.append(f'<path d="M {p(x0)} 0 A {r9} {r9} 0 0 1 {p(9)} {p(8.5)} L {p(9)} {p(11.5)} A {r9} {r9} 0 0 1 {p(x0)} {p(20)}" fill="none" stroke="{c}" stroke-width="1.5" stroke-dasharray="6 5"></path>')
    out.append(f'<path d="M {p(40 - x0)} 0 A {r9} {r9} 0 0 0 {p(31)} {p(8.5)} L {p(31)} {p(11.5)} A {r9} {r9} 0 0 0 {p(40 - x0)} {p(20)}" fill="none" stroke="{c}" stroke-width="1.5" stroke-dasharray="6 5"></path>')
    for gx in (-1, 40):
        out.append(f'<rect x="{p(gx)}" y="{p(8.5)}" width="{S}" height="{p(3)}" fill="#e5e7eb" stroke="#374151" stroke-width="3"></rect>')
    return out


def item(it):
    t, x, y = it["type"], it["x"], it["y"]
    if t == "cone":
        return f'<circle cx="{p(x)}" cy="{p(y)}" r="6" fill="{COL["cone"]}" stroke="{COL["coneB"]}" stroke-width="2"></circle>'
    if t == "hoop":
        r = 9 * it.get("size", 0.8) / 0.8
        return f'<circle cx="{p(x)}" cy="{p(y)}" r="{r:.1f}" fill="none" stroke="{COL["hoop"]}" stroke-width="3"></circle>'
    if t == "disc":
        return f'<circle cx="{p(x)}" cy="{p(y)}" r="7" fill="{COL["disc"]}" stroke="{COL["discB"]}"></circle>'
    if t == "kastendeckel":
        return f'<rect x="{p(x) - 10}" y="{p(y) - 8}" width="20" height="16" rx="2" fill="{COL["kasten"]}" stroke="{COL["kastenB"]}"></rect>'
    if t == "bench":
        w, h = (p(4), 10) if it.get("rotation", 0) == 0 else (10, p(4))
        return f'<rect x="{p(x) - w / 2}" y="{p(y) - h / 2}" width="{w}" height="{h}" rx="2" fill="{COL["bench"]}" stroke="{COL["benchB"]}"></rect>'
    if t in ("mat", "weichboden", "ballbox"):
        w, h = p(it["w"]), p(it["h"])
        fill, stroke, rx = {"mat": (COL["mat"], COL["matB"], 3), "weichboden": (COL["big"], COL["big"], 6),
                            "ballbox": (COL["box"], COL["boxB"], 3)}[t]
        s = f'<rect x="{p(x) - w / 2}" y="{p(y) - h / 2}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}"></rect>'
        if t == "ballbox":
            s += f'<text x="{p(x)}" y="{p(y) + 4}" text-anchor="middle" font-size="11" font-weight="600" fill="#78350f">Bälle</text>'
        return s
    return ""


def path_el(el, pid):
    kind = el["kind"]
    color = COL["throw"] if kind in ("pass", "throw") else COL["run"]
    dash = "" if kind in ("pass", "throw") else ' stroke-dasharray="6 6"'
    marker = "" if el.get("head", True) is False else f' marker-end="url(#{pid}-{"t" if color == COL["throw"] else "r"})"'
    if kind == "runArc":
        (fx, fy), (tx, ty), r = el["from"], el["to"], el["radius"]
        d = f"M {p(fx)} {p(fy)} A {p(r)} {p(r)} 0 0 0 {p(tx)} {p(ty)}"
        for qx, qy in el.get("then", []):
            d += f" L {p(qx)} {p(qy)}"
    elif kind == "slalom":
        (ax, ay), (bx, by) = el["points"]
        amp, n = el.get("amplitude", 0.7), 6
        d = f"M {p(ax)} {p(ay)}"
        step = (bx - ax) / n
        for i in range(n):
            cx = ax + step * (i + 0.5); sgn = -1 if i % 2 == 0 else 1
            d += f" Q {p(cx)} {p(ay + sgn * amp * 1.6)} {p(ax + step * (i + 1))} {p(ay)}"
    else:
        d = "M " + " L ".join(f"{p(a)} {p(b)}" for a, b in el["points"])
    return f'<path d="{d}" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"{dash}{marker}></path>'


def pill(st, selected=False, compact=False):
    x, y = p(st["label"]["x"]), p(st["label"]["y"])
    n = st["number"]
    if compact:
        return (f'<circle cx="{x}" cy="{y}" r="13" fill="{COL["ink"]}"></circle>'
                f'<text x="{x}" y="{y + 5}" text-anchor="middle" font-size="14" font-weight="700" fill="#ffffff">{n}</text>')
    w = len(st["name"]) * 6.4 + 38
    bg, fg, bd = ("#0f766e", "#ffffff", "#0f766e") if selected else ("#ffffff", COL["ink"], "#cbd5e1")
    badge_bg, badge_fg = ("#ffffff", "#0f766e") if selected else (COL["ink"], "#ffffff")
    return (f'<g><rect x="{x - w / 2}" y="{y - 12}" width="{w}" height="24" rx="12" fill="{bg}" stroke="{bd}"></rect>'
            f'<circle cx="{x - w / 2 + 12}" cy="{y}" r="9" fill="{badge_bg}"></circle>'
            f'<text x="{x - w / 2 + 12}" y="{y + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="{badge_fg}">{n}</text>'
            f'<text x="{x - w / 2 + 26}" y="{y + 4}" font-size="11.5" font-weight="600" fill="{fg}">{st["name"]}</text></g>')


def selection_box(items, pad=10):
    xs = [p(i["x"]) for i in items]; ys = [p(i["y"]) for i in items]
    x1, x2, y1, y2 = min(xs) - pad, max(xs) + pad, min(ys) - pad, max(ys) + pad
    s = f'<rect x="{x1}" y="{y1}" width="{x2 - x1}" height="{y2 - y1}" fill="none" stroke="#0f766e" stroke-width="1.5" stroke-dasharray="4 3"></rect>'
    for hx, hy in ((x1, y1), (x2, y1), (x1, y2), (x2, y2)):
        s += f'<rect x="{hx - 4}" y="{hy - 4}" width="8" height="8" rx="1" fill="#ffffff" stroke="#0f766e" stroke-width="1.5"></rect>'
    return s


def render(path_json, pid, aria, selected=None, compact=False, show_notes=True, style="width: 100%; height: auto; display: block"):
    d = json.load(open(path_json))
    out = [f'<defs><marker id="{pid}-r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="{COL["run"]}"></path></marker>'
           f'<marker id="{pid}-t" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="{COL["throw"]}"></path></marker></defs>']
    out += court_lines()
    for st in d["stations"]:
        if "zone" in st:
            z = st["zone"]
            out.append(f'<rect x="{p(z["x"] - z["w"] / 2)}" y="{p(z["y"] - z["h"] / 2)}" width="{p(z["w"])}" height="{p(z["h"])}" rx="8" fill="{COL["zone"]}"></rect>')
    for el in d["path"]:
        out.append(path_el(el, pid))
    sx, sy, sw, sh = d["start"]["x"], d["start"]["y"], d["start"]["w"], d["start"]["h"]
    out.append(f'<rect x="{p(sx - sw / 2)}" y="{p(sy - sh / 2)}" width="{p(sw)}" height="{p(sh)}" rx="6" fill="{COL["start"]}"></rect>')
    if not compact:
        out.append(f'<text x="{p(sx)}" y="{p(sy) + 4}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">{d["start"]["label"]}</text>')
    for it in d.get("extraItems", []):
        out.append(item(it))
    for st in d["stations"]:
        for it in st["items"]:
            out.append(item(it))
    if selected is not None:
        st = next(s for s in d["stations"] if s["number"] == selected)
        out.append(selection_box([i for i in st["items"] if i["x"] >= 0]))
    if show_notes and not compact:
        for nt in d.get("notes", []):
            if "x" in nt:
                out.append(f'<text x="{p(nt["x"])}" y="{p(nt["y"]) + 10}" font-size="11" fill="#4b5563">{nt["text"]}</text>')
    for st in d["stations"]:
        out.append(pill(st, selected == st["number"], compact))
    vb = f"{-p(1.4)} {-p(0.6)} {p(42.8)} {p(21.2)}"
    return (f'<svg role="img" aria-label="{aria}" viewBox="{vb}" style="{style}" font-family="Inter, system-ui, sans-serif">'
            + "".join(out) + "</svg>")
