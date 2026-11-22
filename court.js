// SVG rendering in metres: the court with all stations, and the A4 portrait print page.
import { layout, connectors, toWorld, itemU, ITEM_TYPES, START_LEN, material, span, spotOffsets,
  placedItems, badges, crossings, geom, hallOf, circuit } from './model.js';

const COL = {
  floor: '#f3e9d6', line: '#a8977a', run: '#0f766e', throw: '#c2410c', ink: '#111827', start: '#15803d',
  cone: ['#f97316', '#9a3412'], hoop: ['none', '#7c3aed'], disc: ['#facc15', '#854d0e'], helper: ['#334155', '#0f172a'],
  bench: ['#a0692f', '#6b4423'], kastendeckel: ['#9ca3af', '#4b5563'], mat: ['#4f8fd1', '#1e5a96'],
  weichboden: ['#1e3a8a', '#1e3a8a'], ballbox: ['#fde68a', '#b45309'], minigoal: ['#ffffff', '#374151'],
  kasten: ['#d6b58a', '#7c5a2e'], hurdle: ['#ef4444', '#991b1b'], ladder: ['#fef9c3', '#a16207'],
  rope: ['#475569', '#475569'], tunnel: ['#86efac', '#15803d'], tau: ['#d6b58a', '#78350f'],
};
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const n = v => +v.toFixed(3);
const pt = q => `${n(q.x)} ${n(q.y)}`;
// The drawing frame stays 40 x 20 m (the standard court); a smaller hall sits centred in it with blank
// space around, so the canvas never changes size. Only a hall bigger than 40 x 20 enlarges the frame.
function frame(p) {
  const { w, h } = hallOf(p), W = Math.max(w, 40), H = Math.max(h, 20);
  return { W, H, x0: -1.6 - (W - w) / 2, y0: -1 - (H - h) / 2 };
}
export const viewBox = p => { const f = frame(p); return `${n(f.x0)} ${n(f.y0)} ${n(f.W + 3.2)} ${n(f.H + 2)}`; };

// Court lines for any hall size: goal areas (6 m) and free-throw lines (9 m) around each goal,
// clipped to the hall; the centre line only when there are two goals.
function courtLines(p, id) {
  const { w, h, goals } = hallOf(p), c = COL.line, y0 = h / 2;
  const area = (r, x, dir) => `M ${x} ${n(y0 - 1.5 - r)} A ${r} ${r} 0 0 ${dir > 0 ? 1 : 0} ${x + dir * r} ${n(y0 - 1.5)} `
    + `L ${x + dir * r} ${n(y0 + 1.5)} A ${r} ${r} 0 0 ${dir > 0 ? 1 : 0} ${x} ${n(y0 + 1.5 + r)}`;
  const ends = goals === 'left' ? [[0, 1]] : [[0, 1], [w, -1]];
  return `<defs><clipPath id="${id}-hall"><rect x="0" y="0" width="${w}" height="${h}"/></clipPath></defs>
<rect x="0" y="0" width="${w}" height="${h}" fill="${COL.floor}" stroke="${c}" stroke-width="0.1"/>
${goals === 'left' ? '' : `<line x1="${w / 2}" y1="0" x2="${w / 2}" y2="${h}" stroke="${c}" stroke-width="0.08"/>`}
<g fill="none" stroke="${c}" stroke-width="0.08" clip-path="url(#${id}-hall)">
${ends.map(([x, d]) => `<path d="${area(6, x, d)}"/><path stroke-dasharray="0.3 0.25" d="${area(9, x, d)}"/>`).join('\n')}</g>
${ends.map(([x, d]) => `<rect x="${d > 0 ? -1 : w}" y="${n(y0 - 1.5)}" width="1" height="3" fill="#e5e7eb" stroke="#374151" stroke-width="0.12"/>`).join('')}`;
}

function shape(it) {
  const T = ITEM_TYPES[it.type], [fill, stroke] = COL[it.type];
  if (T.r) {
    const r = it.type === 'hoop' ? (it.size || 0.8) / 2 : T.r;
    return `<circle r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${it.type === 'hoop' ? 0.1 : 0.05}"/>`;
  }
  const w = it.w ?? T.w, h = it.h ?? T.h;
  const across = xs => xs.map(x => `<line x1="${n(x)}" y1="${-h / 2}" x2="${n(x)}" y2="${h / 2}" stroke="${stroke}" stroke-width="0.04"/>`).join('');
  const extra = it.type === 'ladder' ? across(Array.from({ length: Math.round(w / 0.45) - 1 }, (_, k) => -w / 2 + (k + 1) * w / Math.round(w / 0.45)))
    : it.type === 'kasten' ? across([-w / 6, w / 6]) : '';
  return `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${it.type === 'tunnel' ? 0.3 : 0.08}" fill="${fill}" stroke="${stroke}" stroke-width="0.05"/>${extra}`;
}
// Labels stay upright, whatever the item rotation.
const label = (it, t) => ({
  helper: '<text y="0.18" text-anchor="middle" font-size="0.5" font-weight="700" fill="#fff">H</text>',
  tau: '<text y="0.15" text-anchor="middle" font-size="0.4" font-weight="700" fill="#78350f">T</text>',
  ballbox: `<text y="0.18" text-anchor="middle" font-size="0.5" font-weight="700" fill="#78350f">${esc(t('item.balls'))}</text>`,
}[it.type] || '');

const placed = (it, q, rot, attrs, edit, sel, t) =>
  `<g transform="translate(${pt(q)})" ${attrs}>${edit ? '<circle r="0.6" fill="transparent"/>' : ''}<g transform="rotate(${rot})">${shape(it)}</g>${label(it, t)}`
  + (sel ? '<circle r="0.75" fill="none" stroke="#0f766e" stroke-width="0.07" stroke-dasharray="0.2 0.12"/>' : '') + '</g>';

const arrow = (pts, kind, id) => `<path d="M ${pts.map(pt).join(' L ')}" fill="none" stroke="${kind === 'run' ? COL.run : COL.throw}"
 stroke-width="0.09" stroke-linecap="round" stroke-linejoin="round"${kind === 'run' ? ' stroke-dasharray="0.35 0.3"' : ''} marker-end="url(#${id}-${kind === 'run' ? 'r' : 't'})"/>`;

// Polyline with rounded corners (radius up to r metres), as an SVG path.
export function smoothD(pts, r = 1.6) {
  if (pts.length < 3) return `M ${pts.map(pt).join(' L ')}`;
  let d = `M ${pt(pts[0])}`;
  for (let k = 1; k < pts.length - 1; k++) {
    const p0 = pts[k - 1], p1 = pts[k], p2 = pts[k + 1];
    const l1 = Math.hypot(p1.x - p0.x, p1.y - p0.y), l2 = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const rr = Math.min(r, l1 / 2, l2 / 2);
    if (rr < 1e-6) { d += ` L ${pt(p1)}`; continue; }
    const a = { x: p1.x + (p0.x - p1.x) * rr / l1, y: p1.y + (p0.y - p1.y) * rr / l1 };
    const b = { x: p1.x + (p2.x - p1.x) * rr / l2, y: p1.y + (p2.y - p1.y) * rr / l2 };
    d += ` L ${pt(a)} Q ${pt(p1)} ${pt(b)}`;
  }
  return d + ` L ${pt(pts.at(-1))}`;
}

function slalom(len, fr, dv) {
  const segs = Math.max(2, Math.round(len / 2)) * 2, step = len / segs;
  let d = `M ${pt(toWorld(fr, 0, dv))}`;
  for (let i = 0; i < segs; i++)
    d += ` Q ${pt(toWorld(fr, step * (i + 0.5), dv + (i % 2 ? 1 : -1) * 0.9))} ${pt(toWorld(fr, step * (i + 1), dv))}`;
  return d;
}

// Axis-aligned box around a placed station (world metres).
export function stationBox(st, L, pad = 0.8) {
  const qs = placedItems(st, L).map(c => c.q);
  qs.push(L.exit);
  if (L.entry) qs.push(L.entry);
  const xs = qs.map(q => q.x), ys = qs.map(q => q.y);
  return { x1: Math.min(...xs) - pad, y1: Math.min(...ys) - pad, x2: Math.max(...xs) + pad, y2: Math.max(...ys) + pad };
}

// World position and rough radius of an item (free or in a placed station).
export function itemPlace(it, st, L) {
  const T = ITEM_TYPES[it.type], q = st ? toWorld(L.frame, itemU(st, it), it.v) : it;
  return { x: q.x, y: q.y, r: T.r ? (it.type === 'hoop' ? (it.size || 0.8) / 2 : T.r) : Math.max(it.w ?? T.w, it.h ?? T.h) / 2 };
}

const rotHandle = (q, attrs, title) => `<g ${attrs} style="cursor:grab"><title>${esc(title)}</title>`
  + `<circle cx="${n(q.x)}" cy="${n(q.y)}" r="0.45" fill="#fff" stroke="#0f766e" stroke-width="0.1"/>`
  + `<text x="${n(q.x)}" y="${n(q.y + 0.2)}" text-anchor="middle" font-size="0.6" font-weight="700" fill="#0f766e">↻</text></g>`;

// Inner SVG markup of the court. opts: { id, t, edit, sel: { st, item, free } }
export function courtInner(p, opts) {
  const { id, t, edit, sel = {} } = opts, lay = layout(p), o = [], zirkel = p.mode === 'zirkel';
  const run = `<path d="M0 0L10 5L0 10z" fill="${COL.run}"/>`, thr = `<path d="M0 0L10 5L0 10z" fill="${COL.throw}"/>`;
  o.push(`<defs><marker id="${id}-r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">${run}</marker>`
    + `<marker id="${id}-t" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">${thr}</marker></defs>`);
  o.push(courtLines(p, id));

  // run connectors (lines with rounded corners; in the editor a wide invisible stroke makes them clickable)
  const cons = connectors(p, lay);
  for (const c of cons) {
    if (c.type === 'line') {
      o.push(`<path d="${smoothD(c.pts)}" fill="none" stroke="${COL.run}" stroke-width="${sel.route === c.to ? 0.16 : 0.09}" stroke-linecap="round" stroke-dasharray="0.35 0.3" marker-end="url(#${id}-r)"/>`);
      if (edit) o.push(`<path data-drag="route" data-r="${c.to}" d="${smoothD(c.pts)}" fill="none" stroke="transparent" stroke-width="0.8" style="cursor:pointer"><title>${esc(t('handle.route'))}</title></path>`);
    } else o.push(`<path d="M ${pt(c.a)} Q ${pt(c.c)} ${pt(c.b)}" fill="none" stroke="${COL.run}" stroke-width="0.09" stroke-dasharray="0.35 0.3" marker-end="url(#${id}-r)"/>`);
  }
  // station paths and pass/throw arrows
  p.stations.forEach((st, i) => {
    const L = lay[i];
    if (!L.fits) return;
    const offs = spotOffsets(st);
    if (st.kind === 'lane' && st.path !== 'none') {
      const tracks = st.spots === 'along' ? [{ len: span(st), dv: 0 }] : offs.map(o => ({ len: st.length, dv: o.dv }));
      for (const { len, dv } of tracks)
        o.push(`<path d="${st.path === 'slalom' ? slalom(len, L.frame, dv) : `M ${pt(toWorld(L.frame, 0, dv))} L ${pt(toWorld(L.frame, len, dv))}`}" fill="none" stroke="${COL.run}" stroke-width="0.09" stroke-dasharray="0.35 0.3"/>`);
    }
    for (const { du, dv } of offs) for (const a of st.arrows || []) {
      const w = q => toWorld(L.frame, (q.f != null ? q.f * st.length : q.u) + du, q.v + dv);
      o.push(arrow([w(a.from), w(a.to)], a.kind, id));
    }
    if (st.kind === 'goal' && st.target) o.push(arrow([L.exit, toWorld(L.frame, st.target.u, st.target.v)], st.targetKind || 'throw', id));
  });
  // selection box of the selected station (behind the items, drag area for the whole station)
  const S = sel.st != null && lay[sel.st]?.fits ? sel.st : null;
  if (edit && S != null) {
    const b = stationBox(p.stations[S], lay[S]);
    o.push(`<rect data-drag="station" data-st="${S}" x="${n(b.x1)}" y="${n(b.y1)}" width="${n(b.x2 - b.x1)}" height="${n(b.y2 - b.y1)}"
 rx="0.4" fill="rgba(15,118,110,0.08)" stroke="#0f766e" stroke-width="0.07" stroke-dasharray="0.3 0.2" style="cursor:move"/>`);
  }
  // start (not in circuit mode: groups begin at their station)
  if (!zirkel) o.push(`<g ${edit ? 'data-drag="start" style="cursor:move"' : ''}><rect x="${n(p.start.x - START_LEN / 2)}" y="${n(p.start.y - 0.6)}" width="${START_LEN}" height="1.2" rx="0.3" fill="${COL.start}"/>`
    + `<text x="${n(p.start.x)}" y="${n(p.start.y + 0.2)}" text-anchor="middle" font-size="0.55" font-weight="700" fill="#fff">${esc(t('start'))}</text></g>`);
  // items
  p.free.forEach((it, j) => o.push(placed(it, it, it.rot || 0, edit ? `data-drag="free" data-i="${j}" style="cursor:move"` : '', edit, sel.free === j, t)));
  p.stations.forEach((st, i) => {
    const L = lay[i];
    if (!L.fits) return;
    for (const { it, j, k, q, rot } of placedItems(st, L))
      o.push(placed(it, q, rot, edit ? `data-drag="item" data-st="${i}" data-i="${j}" data-k="${k}" style="cursor:move"` : '', edit, S === i && sel.item === j, t));
    if (st.kind === 'goal')
      o.push(`<circle ${edit ? `data-drag="action" data-st="${i}" style="cursor:move"` : ''} cx="${n(L.exit.x)}" cy="${n(L.exit.y)}" r="0.35" fill="#fff" stroke="${COL.throw}" stroke-width="0.12"/>`);
  });
  // badges
  badges(p, lay).forEach((b, i) => {
    if (!b) return;
    o.push(`<g ${edit ? `data-drag="badge" data-st="${i}" style="cursor:move"` : ''}><circle cx="${n(b.x)}" cy="${n(b.y)}" r="0.65" fill="${S === i ? '#0f766e' : COL.ink}"/>`
      + `<text x="${n(b.x)}" y="${n(b.y + 0.27)}" text-anchor="middle" font-size="0.75" font-weight="700" fill="#fff">${i + 1}</text></g>`);
  });
  // unsafe crossings (editor only)
  if (edit) for (const c of crossings(p, lay))
    o.push(`<circle cx="${n(c.x.x)}" cy="${n(c.x.y)}" r="0.55" fill="rgba(220,38,38,0.15)" stroke="#dc2626" stroke-width="0.1"><title>${esc(t('hint.crossShort'))}</title></circle>`);
  // handles of the selected station
  if (edit && S != null) {
    const st = p.stations[S], L = lay[S];
    // start and end border of a resizable lane station: drag to change the length
    if (st.kind === 'lane' && st.maxLength > st.minLength) {
      const vs = [0, ...spotOffsets(st).flatMap(of => st.items.map(it => it.v + of.dv))];
      const v1 = Math.min(...vs) - 1.2, v2 = Math.max(...vs) + 1.2;
      const cur = (L.frame.rot % 180 === 0) ? 'ew-resize' : 'ns-resize';
      for (const [kind, u] of [['lenstart', 0], ['len', span(st)]])
        o.push(`<rect data-drag="${kind}" data-st="${S}" transform="translate(${pt(L.frame)}) rotate(${L.frame.rot})" x="${n(u - 0.18)}" y="${n(v1)}" width="0.36" height="${n(v2 - v1)}"
 rx="0.12" fill="#0f766e" fill-opacity="0.35" style="cursor:${cur}"><title>${esc(t('handle.length'))}</title></rect>`);
    }
    const h = (q, kind, title) => `<circle data-drag="${kind}" data-st="${S}" cx="${n(q.x)}" cy="${n(q.y)}" r="0.4" fill="#fff" stroke="#0f766e" stroke-width="0.1" style="cursor:grab"><title>${esc(title)}</title></circle>`;
    const b = stationBox(st, L);
    o.push(rotHandle({ x: b.x2, y: b.y1 }, `data-drag="rotst" data-st="${S}"`, t('handle.rotate')));
    const it = st.items[sel.item];
    if (it) {
      const q = itemPlace(it, st, L), d = q.r * 0.7 + 0.5;
      o.push(rotHandle({ x: q.x + d, y: q.y - d }, `data-drag="rotitem" data-st="${S}" data-i="${sel.item}"`, t('handle.rotate')));
    }
    if (st.kind === 'goal') {
      for (const c of connectors(p, lay).filter(c => c.type === 'curve' && c.st === S)) {
        o.push(`<path d="M ${pt(c.a)} L ${pt(c.c)} L ${pt(c.b)}" fill="none" stroke="#0f766e" stroke-width="0.04" stroke-dasharray="0.15 0.15"/>`);
        o.push(h(c.c, c.ctrl, t('handle.curve')));
      }
    }
  }
  // corners of the selected run line: drag a corner, drag "+" to add one
  const rc = edit && sel.route != null && cons.find(c => c.type === 'line' && c.to === sel.route);
  if (rc) {
    const P = rc.pts;
    for (let k = 0; k + 1 < P.length; k++) {
      const m = { x: (P[k].x + P[k + 1].x) / 2, y: (P[k].y + P[k + 1].y) / 2 };
      o.push(`<g data-drag="viamid" data-r="${sel.route}" data-i="${k}" style="cursor:copy"><title>${esc(t('handle.viaAdd'))}</title>`
        + `<circle cx="${n(m.x)}" cy="${n(m.y)}" r="0.28" fill="#d5ebe4" stroke="#0f766e" stroke-width="0.06"/>`
        + `<text x="${n(m.x)}" y="${n(m.y + 0.15)}" text-anchor="middle" font-size="0.45" font-weight="700" fill="#0f766e">+</text></g>`);
    }
    P.slice(1, -1).forEach((q, k) => o.push(`<circle data-drag="via" data-r="${sel.route}" data-i="${k}" cx="${n(q.x)}" cy="${n(q.y)}" r="0.38"`
      + ` fill="${sel.vi === k ? '#0f766e' : '#fff'}" stroke="#0f766e" stroke-width="0.1" style="cursor:grab"><title>${esc(t('handle.via'))}</title></circle>`));
  }
  const fi = edit && p.free[sel.free];
  if (fi) {
    const q = itemPlace(fi), d = q.r * 0.7 + 0.5;
    o.push(rotHandle({ x: q.x + d, y: q.y - d }, `data-drag="rotfree" data-i="${sel.free}"`, t('handle.rotate')));
  }
  return o.join('\n');
}

// Wrap text into lines that fit `width` (mm) at font `size` (mm). measure(text, size) -> mm.
function wrap(text, size, width, measure) {
  const lines = [];
  for (const para of String(text || '').split('\n')) {
    let line = '';
    for (const w of para.split(/\s+/).filter(Boolean)) {
      const tryLine = line ? `${line} ${w}` : w;
      if (line && measure(tryLine, size) > width) { lines.push(line); line = w; } else line = tryLine;
    }
    lines.push(line);
  }
  return lines;
}

// Full A4 portrait page (mm). The station texts shrink and, if needed, go into two columns so that
// everything fits one page. Returns { svg, overflow }.
export function pageSVG(p, t, measure, date) {
  const W = 210, H = 297, M = 12, CW = W - 2 * M, F = 'Arial, Helvetica, sans-serif';
  const { W: hw, H: hh } = frame(p), CH = Math.min(CW * (hh + 2) / (hw + 3.2), 120), CWc = CH * (hw + 3.2) / (hh + 2);
  const lay = layout(p), head = [`<rect width="${W}" height="${H}" fill="#fff"/>`];
  let y0 = M + 6;
  head.push(`<text x="${M}" y="${y0}" font-size="7" font-weight="700" fill="${COL.ink}">${esc(p.title || t('untitled'))}</text>`);
  y0 += 6;
  const ci = circuit(p, lay);
  const sub = [p.group, `${p.children} ${t('children')}`,
    p.mode === 'zirkel' && t('print.circuit', { g: ci.groups, k: ci.perGroup, m: p.rotation || 3 }), date].filter(Boolean).join(' · ');
  head.push(`<text x="${M}" y="${y0}" font-size="3.5" fill="#4b5563">${esc(sub)}</text>`);
  y0 += 4;
  head.push(`<svg x="${n(M + (CW - CWc) / 2)}" y="${y0}" width="${n(CWc)}" height="${n(CH)}" viewBox="${viewBox(p)}">${courtInner(p, { id: 'pg', t })}</svg>`);
  y0 += CH + 6;

  const mat = material(p).map(m => `${m.n} × ${t('item.' + m.type)}`).join(' · ');
  const build = (s, cols) => { // s = font scale; returns { y, o }
    const o = [], fs = 3.4 * s, fh = 3.9 * s, lh = 4.6 * s, colW = cols === 1 ? CW : (CW - 6) / 2;
    const rows = p.stations.map((st, i) => {
      const lines = wrap(st.task, fs, colW - 8, measure);
      return { i, st, lines, h: 8.2 * s + lines.length * lh + 1 };
    });
    const total = rows.reduce((a, r) => a + r.h, 0);
    let col = 0, y = y0, x = M, colTop = y0, maxY = y0;
    for (const r of rows) {
      if (cols === 2 && col === 0 && y - colTop >= total / 2 - 1e-6) { col = 1; x = M + colW + 6; maxY = Math.max(maxY, y); y = colTop; }
      o.push(`<circle cx="${n(x + 2.8 * s)}" cy="${n(y + 2.3 * s)}" r="${n(2.8 * s)}" fill="${COL.ink}"/><text x="${n(x + 2.8 * s)}" y="${n(y + 3.4 * s)}" text-anchor="middle" font-size="${n(3.2 * s)}" font-weight="700" fill="#fff">${r.i + 1}</text>`);
      o.push(`<text x="${n(x + 8)}" y="${n(y + 3.5 * s)}" font-size="${n(fh)}" font-weight="700" fill="${COL.ink}">${esc(r.st.name)}</text>`);
      r.lines.forEach((l, k) => o.push(`<text x="${n(x + 8)}" y="${n(y + 8.2 * s + k * lh)}" font-size="${n(fs)}" fill="#374151">${esc(l)}</text>`));
      y += r.h;
    }
    y = Math.max(y, maxY);
    for (const [title, text] of [[t('notes'), p.notes], [t('material'), mat]]) {
      if (!String(text || '').trim()) continue;
      y += 2;
      o.push(`<text x="${M}" y="${n(y + 3.5 * s)}" font-size="${n(fh)}" font-weight="700" fill="${COL.ink}">${esc(title)}</text>`);
      const lines = wrap(text, fs, CW, measure);
      lines.forEach((l, k) => o.push(`<text x="${M}" y="${n(y + 8.2 * s + k * lh)}" font-size="${n(fs)}" fill="#374151">${esc(l)}</text>`));
      y += 8.2 * s + lines.length * lh;
    }
    return { y, o };
  };
  const fits = r => r.y <= H - M / 2;
  const tries = [[1, 1], [0.9, 1], [0.8, 1], [0.9, 2], [0.8, 2], [0.7, 2], [0.62, 2]];
  let best;
  for (const [s, c] of tries) { best = build(s, c); if (fits(best)) break; }
  return {
    overflow: !fits(best),
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="794" height="1123" viewBox="0 0 ${W} ${H}" font-family="${F}">${head.join('\n')}\n${best.o.join('\n')}</svg>`,
  };
}
