// SVG rendering in metres: the court with all stations, and the A4 portrait print page.
import { layout, connectors, toWorld, itemU, ITEM_TYPES, START_LEN, material, span, spotOffsets } from './model.js';

export const VIEWBOX = '-1.6 -1 43.2 22';
const COL = {
  floor: '#f3e9d6', line: '#a8977a', run: '#0f766e', throw: '#c2410c', ink: '#111827', start: '#15803d',
  cone: ['#f97316', '#9a3412'], hoop: ['none', '#7c3aed'], disc: ['#facc15', '#854d0e'], helper: ['#334155', '#0f172a'],
  bench: ['#a0692f', '#6b4423'], kastendeckel: ['#9ca3af', '#4b5563'], mat: ['#4f8fd1', '#1e5a96'],
  weichboden: ['#1e3a8a', '#1e3a8a'], ballbox: ['#fde68a', '#b45309'], minigoal: ['#ffffff', '#374151'],
  kasten: ['#d6b58a', '#7c5a2e'], hurdle: ['#ef4444', '#991b1b'], ladder: ['#fef9c3', '#a16207'],
  rope: ['#475569', '#475569'], tunnel: ['#86efac', '#15803d'],
};
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const n = v => +v.toFixed(3);
const pt = q => `${n(q.x)} ${n(q.y)}`;

function courtLines() {
  const c = COL.line, x0 = Math.sqrt(81 - 8.5 ** 2);
  return `<rect x="0" y="0" width="40" height="20" fill="${COL.floor}" stroke="${c}" stroke-width="0.1"/>
<line x1="20" y1="0" x2="20" y2="20" stroke="${c}" stroke-width="0.08"/>
<g fill="none" stroke="${c}" stroke-width="0.08">
<path d="M 0 2.5 A 6 6 0 0 1 6 8.5 L 6 11.5 A 6 6 0 0 1 0 17.5"/>
<path d="M 40 2.5 A 6 6 0 0 0 34 8.5 L 34 11.5 A 6 6 0 0 0 40 17.5"/>
<path stroke-dasharray="0.3 0.25" d="M ${n(x0)} 0 A 9 9 0 0 1 9 8.5 L 9 11.5 A 9 9 0 0 1 ${n(x0)} 20"/>
<path stroke-dasharray="0.3 0.25" d="M ${n(40 - x0)} 0 A 9 9 0 0 0 31 8.5 L 31 11.5 A 9 9 0 0 0 ${n(40 - x0)} 20"/></g>
<rect x="-1" y="8.5" width="1" height="3" fill="#e5e7eb" stroke="#374151" stroke-width="0.12"/>
<rect x="40" y="8.5" width="1" height="3" fill="#e5e7eb" stroke="#374151" stroke-width="0.12"/>`;
}

function shape(it) {
  const T = ITEM_TYPES[it.type], [fill, stroke] = COL[it.type];
  if (T.r) {
    const r = it.type === 'hoop' ? (it.size || 0.8) / 2 : T.r;
    const ring = it.type === 'hoop';
    return `<circle r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${ring ? 0.1 : 0.05}"/>`;
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
  ballbox: `<text y="0.18" text-anchor="middle" font-size="0.5" font-weight="700" fill="#78350f">${esc(t('item.balls'))}</text>`,
}[it.type] || '');

const placed = (it, q, rot, attrs, edit, sel, t) =>
  `<g transform="translate(${pt(q)})" ${attrs}>${edit ? '<circle r="0.6" fill="transparent"/>' : ''}<g transform="rotate(${rot})">${shape(it)}</g>${label(it, t)}`
  + (sel ? '<circle r="0.75" fill="none" stroke="#0f766e" stroke-width="0.07" stroke-dasharray="0.2 0.12"/>' : '') + '</g>';

const arrow = (pts, kind, id) => `<path d="M ${pts.map(pt).join(' L ')}" fill="none" stroke="${kind === 'run' ? COL.run : COL.throw}"
 stroke-width="0.09" stroke-linecap="round" stroke-linejoin="round"${kind === 'run' ? ' stroke-dasharray="0.35 0.3"' : ''} marker-end="url(#${id}-${kind === 'run' ? 'r' : 't'})"/>`;

function slalom(len, fr, dv) {
  const segs = Math.max(2, Math.round(len / 2)) * 2, step = len / segs;
  let d = `M ${pt(toWorld(fr, 0, dv))}`;
  for (let i = 0; i < segs; i++)
    d += ` Q ${pt(toWorld(fr, step * (i + 0.5), dv + (i % 2 ? 1 : -1) * 0.9))} ${pt(toWorld(fr, step * (i + 1), dv))}`;
  return d;
}

// Every drawn copy of a station's items: { it, j (base index), k (place), q (world), rot }
function copies(st, L) {
  return spotOffsets(st).flatMap(({ du, dv }, k) => st.items.map((it, j) =>
    ({ it, j, k, q: toWorld(L.frame, itemU(st, it) + du, it.v + dv), rot: L.frame.rot + (it.rot || 0) })));
}

export function badgePos(st, L) {
  if (st.badge) return st.badge;
  if (st.kind === 'goal') return toWorld(L.frame, st.action.u + 1.4, st.action.v - 1.4);
  return toWorld(L.frame, span(st) / 2, 2.4 + Math.max(...spotOffsets(st).map(o => o.dv)));
}

// Axis-aligned box around a placed station (world metres).
export function stationBox(st, L, pad = 0.8) {
  const qs = copies(st, L).map(c => c.q);
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
  const { id, t, edit, sel = {} } = opts, lay = layout(p), o = [];
  const run = `<path d="M0 0L10 5L0 10z" fill="${COL.run}"/>`, thr = `<path d="M0 0L10 5L0 10z" fill="${COL.throw}"/>`;
  o.push(`<defs><marker id="${id}-r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">${run}</marker>`
    + `<marker id="${id}-t" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">${thr}</marker></defs>`);
  o.push(courtLines());

  // run connectors
  for (const c of connectors(p, lay)) {
    if (c.type === 'line') o.push(arrow(c.pts, 'run', id));
    else o.push(`<path d="M ${pt(c.a)} Q ${pt(c.c)} ${pt(c.b)}" fill="none" stroke="${COL.run}" stroke-width="0.09" stroke-dasharray="0.35 0.3" marker-end="url(#${id}-r)"/>`);
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
  // start
  o.push(`<g ${edit ? 'data-drag="start" style="cursor:move"' : ''}><rect x="${n(p.start.x - START_LEN / 2)}" y="${n(p.start.y - 0.6)}" width="${START_LEN}" height="1.2" rx="0.3" fill="${COL.start}"/>`
    + `<text x="${n(p.start.x)}" y="${n(p.start.y + 0.2)}" text-anchor="middle" font-size="0.55" font-weight="700" fill="#fff">${esc(t('start'))}</text></g>`);
  // items
  p.free.forEach((it, j) => o.push(placed(it, it, it.rot || 0, edit ? `data-drag="free" data-i="${j}" style="cursor:move"` : '', edit, sel.free === j, t)));
  p.stations.forEach((st, i) => {
    const L = lay[i];
    if (!L.fits) return;
    for (const { it, j, k, q, rot } of copies(st, L))
      o.push(placed(it, q, rot, edit ? `data-drag="item" data-st="${i}" data-i="${j}" data-k="${k}" style="cursor:move"` : '', edit, S === i && sel.item === j, t));
    if (st.kind === 'goal')
      o.push(`<circle ${edit ? `data-drag="action" data-st="${i}" style="cursor:move"` : ''} cx="${n(L.exit.x)}" cy="${n(L.exit.y)}" r="0.35" fill="#fff" stroke="${COL.throw}" stroke-width="0.12"/>`);
  });
  // badges
  p.stations.forEach((st, i) => {
    if (!lay[i].fits) return;
    const b = badgePos(st, lay[i]);
    o.push(`<g ${edit ? `data-drag="badge" data-st="${i}" style="cursor:move"` : ''}><circle cx="${n(b.x)}" cy="${n(b.y)}" r="0.65" fill="${S === i ? '#0f766e' : COL.ink}"/>`
      + `<text x="${n(b.x)}" y="${n(b.y + 0.27)}" text-anchor="middle" font-size="0.75" font-weight="700" fill="#fff">${i + 1}</text></g>`);
  });
  // handles of the selected station
  if (edit && S != null) {
    const st = p.stations[S], L = lay[S];
    const h = (q, kind, title) => `<circle data-drag="${kind}" data-st="${S}" cx="${n(q.x)}" cy="${n(q.y)}" r="0.4" fill="#fff" stroke="#0f766e" stroke-width="0.1" style="cursor:grab"><title>${esc(title)}</title></circle>`;
    if (st.kind === 'lane' && st.maxLength > st.minLength) {
      const q = toWorld(L.frame, span(st), 0);
      o.push(`<rect data-drag="len" data-st="${S}" x="${n(q.x - 0.35)}" y="${n(q.y - 0.35)}" width="0.7" height="0.7" fill="#fff" stroke="#0f766e" stroke-width="0.1" style="cursor:ew-resize"><title>${esc(t('handle.length'))}</title></rect>`);
    }
    const b = stationBox(st, L);
    o.push(rotHandle({ x: b.x2, y: b.y1 }, `data-drag="rotst" data-st="${S}"`, t('handle.rotate')));
    const it = st.items[sel.item];
    if (it) {
      const q = itemPlace(it, st, L), d = q.r * 0.7 + 0.5;
      o.push(rotHandle({ x: q.x + d, y: q.y - d }, `data-drag="rotitem" data-st="${S}" data-i="${sel.item}"`, t('handle.rotate')));
    }
    if (st.kind === 'goal') {
      const cons = connectors(p, lay).filter(c => c.type === 'curve' && c.st === S);
      for (const c of cons) {
        o.push(`<path d="M ${pt(c.a)} L ${pt(c.c)} L ${pt(c.b)}" fill="none" stroke="#0f766e" stroke-width="0.04" stroke-dasharray="0.15 0.15"/>`);
        o.push(h(c.c, c.ctrl, t('handle.curve')));
      }
    }
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

// Full A4 portrait page (mm). Returns { svg, overflow }.
export function pageSVG(p, t, measure, date) {
  const W = 210, H = 297, M = 12, CW = W - 2 * M, CH = CW * 22 / 43.2, F = 'Arial, Helvetica, sans-serif';
  const o = [`<rect width="${W}" height="${H}" fill="#fff"/>`];
  let y = M + 6;
  o.push(`<text x="${M}" y="${y}" font-size="7" font-weight="700" fill="${COL.ink}">${esc(p.title || t('untitled'))}</text>`);
  y += 6;
  o.push(`<text x="${M}" y="${y}" font-size="3.5" fill="#4b5563">${esc([p.group, `${p.children} ${t('children')}`, date].filter(Boolean).join(' · '))}</text>`);
  y += 4;
  o.push(`<svg x="${M}" y="${y}" width="${CW}" height="${n(CH)}" viewBox="${VIEWBOX}">${courtInner(p, { id: 'pg', t })}</svg>`);
  y += CH + 6;
  const TX = M + 8, TW = CW - 8;
  p.stations.forEach((st, i) => {
    const lines = wrap(st.task, 3.4, TW, measure);
    o.push(`<circle cx="${M + 2.8}" cy="${n(y + 2.3)}" r="2.8" fill="${COL.ink}"/><text x="${M + 2.8}" y="${n(y + 3.4)}" text-anchor="middle" font-size="3.2" font-weight="700" fill="#fff">${i + 1}</text>`);
    o.push(`<text x="${TX}" y="${n(y + 3.5)}" font-size="3.9" font-weight="700" fill="${COL.ink}">${esc(st.name)}</text>`);
    lines.forEach((l, k) => o.push(`<text x="${TX}" y="${n(y + 8.2 + k * 4.6)}" font-size="3.4" fill="#374151">${esc(l)}</text>`));
    y += 8.2 + lines.length * 4.6 + 1;
  });
  const mat = material(p).map(m => `${m.n} × ${t('item.' + m.type)}`).join(' · ');
  if (mat) {
    y += 2;
    o.push(`<text x="${M}" y="${n(y + 3.5)}" font-size="3.9" font-weight="700" fill="${COL.ink}">${esc(t('material'))}</text>`);
    wrap(mat, 3.4, CW, measure).forEach((l, k) => o.push(`<text x="${M}" y="${n(y + 8.2 + k * 4.6)}" font-size="3.4" fill="#374151">${esc(l)}</text>`));
    y += 8.2 + wrap(mat, 3.4, CW, measure).length * 4.6;
  }
  return {
    overflow: y > H - M / 2,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="794" height="1123" viewBox="0 0 ${W} ${H}" font-family="${F}">${o.join('\n')}</svg>`,
  };
}
