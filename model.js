// Pure parcours logic: lane layout, coordinate transforms, connectors, material count.
// No DOM access, so test.js can run it in node and in the browser.

export const GAP = 2, START_LEN = 4, SNAP = 0.5;
// Clockwise lane, INSET metres inside the walls of a 40 x 20 m court.
export const INSET = 2.5;
const I = INSET, LX = 40 - 2 * I, LY = 20 - 2 * I;
export const SIDES = [
  { x: I, y: I, rot: 0, len: LX },
  { x: 40 - I, y: I, rot: 90, len: LY },
  { x: 40 - I, y: 20 - I, rot: 180, len: LX },
  { x: I, y: 20 - I, rot: 270, len: LY },
];
export const LAP = SIDES.reduce((s, S) => s + S.len, 0);
// Goal frames: u points into the court, v points to the side the lane comes from.
export const GOALS = { 1: { x: 40, y: 10, rot: 180 }, 3: { x: 0, y: 10, rot: 0 } };

export const ITEM_TYPES = {
  cone: { r: 0.28 }, hoop: { r: 0.4 }, disc: { r: 0.3 }, helper: { r: 0.4 },
  bench: { w: 4, h: 0.4 }, kastendeckel: { w: 0.9, h: 0.7 }, mat: { w: 2, h: 1 },
  weichboden: { w: 2, h: 3 }, ballbox: { w: 2, h: 1 }, minigoal: { w: 0.6, h: 1.8 },
  kasten: { w: 1.5, h: 0.9 }, hurdle: { w: 0.15, h: 0.8 }, ladder: { w: 4, h: 0.5 }, rope: { w: 0.06, h: 3 },
  tunnel: { w: 2, h: 0.7 },
};

const cs = deg => { const r = deg * Math.PI / 180; return [Math.round(Math.cos(r) * 1e9) / 1e9, Math.round(Math.sin(r) * 1e9) / 1e9]; };
export const snap = v => Math.round(v / SNAP) * SNAP;
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function toWorld(fr, u, v) {
  const [c, s] = cs(fr.rot);
  return { x: fr.x + u * c - v * s, y: fr.y + u * s + v * c };
}
export function toLocal(fr, x, y) {
  const [c, s] = cs(fr.rot), dx = x - fr.x, dy = y - fr.y;
  return { u: dx * c + dy * s, v: -dx * s + dy * c };
}
export const itemU = (st, it) => (it.f != null ? it.f * (st.length || 0) : it.u);

// Places (Plätze): lane items describe one place; each place k is the same set-up shifted by an offset.
const places = st => (st.kind === 'lane' ? Math.max(1, st.capacity | 0) : 1);
export const span = st => st.length * (st.spots === 'along' ? places(st) : 1);
export const spotOffsets = st => Array.from({ length: places(st) }, (_, k) =>
  (st.spots === 'along' ? { du: k * st.length, dv: 0 } : { du: 0, dv: k * (st.spotStep ?? 2) }));

// Change a lane station's length. Rows of evenly spread items (same type, `f` set) keep at least
// their original spacing (`pitch`, stored on first resize): an item is added as soon as it fits,
// and removed when it no longer does. Items at the same `f` (e.g. a cone gate) move as one slot.
export function resize(st, len) {
  st.pitch ??= {};
  const groups = {};
  for (const it of st.items) if (it.f != null) (groups[it.type] ??= []).push(it);
  for (const [type, items] of Object.entries(groups)) {
    const fs = [...new Set(items.map(it => it.f))].sort((a, b) => a - b);
    const slots = fs.map(f => items.filter(it => it.f === f));
    const f0 = fs[0], df = fs.at(-1) - f0;
    if (slots.length < 2 || df <= 0) continue;
    const pitch = st.pitch[type] ??= r3(df * st.length / (slots.length - 1));
    const n = Math.max(2, Math.floor(df * len / pitch + 1e-6) + 1);
    if (n === slots.length) continue;
    // repeat the slot pattern (e.g. alternating zigzag) with its shortest period
    const sig = sl => sl.map(it => it.v).join();
    let per = 1;
    while (slots.some((sl, i) => sig(sl) !== sig(slots[i % per]))) per++;
    const next = Array.from({ length: n }, (_, i) =>
      slots[i % per].map(it => ({ ...it, f: r3(f0 + df * i / (n - 1)) }))).flat();
    st.items = st.items.filter(it => !(it.f != null && it.type === type)).concat(next);
  }
  st.length = len;
}

// Place every station. Returns one entry per station:
// { fits, frame, entry, exit, side, goal?, pinned? }
export function layout(p) {
  let side = 0, pos = START_LEN;
  return p.stations.map(st => {
    if (st.kind === 'goal') {
      const gs = side === 0 ? 1 : side <= 2 ? 3 : null; // next free goal end
      if (gs == null) return { fits: false };
      side = gs + 1; pos = 0;
      const frame = GOALS[gs];
      return { fits: true, goal: true, side: gs, frame, entry: null, exit: toWorld(frame, st.action.u, st.action.v) };
    }
    if (st.pin) {
      const frame = st.pin, entry = { x: frame.x, y: frame.y }, exit = toWorld(frame, span(st), 0);
      // a pinned station still marks a place on the lane: the next station continues after it
      const s = Math.max(project(entry).s, project(exit).s);
      const cur = side >= 4 ? LAP : SIDES.slice(0, side).reduce((a, S) => a + S.len, 0) + pos;
      if (s > cur + 1e-9) {
        let k = 0, u = s;
        while (k < 3 && u > SIDES[k].len + 1e-9) { u -= SIDES[k].len; k++; }
        side = k; pos = u;
      }
      return { fits: true, pinned: true, frame, entry, exit };
    }
    let start = pos + GAP;
    const len = span(st);
    const room = k => SIDES[k].len - (k === 3 ? GAP : 0); // keep the gap before the finish free
    while (side < 4 && start + len > room(side) + 1e-9) { side++; start = GAP; } // ponytail: no bending, jump to next side
    if (side >= 4) return { fits: false };
    const frame = { ...toWorld(SIDES[side], start, 0), rot: SIDES[side].rot };
    pos = start + len;
    return { fits: true, side, frame, entry: { x: frame.x, y: frame.y }, exit: toWorld(frame, len, 0) };
  });
}

export const startExit = p => ({ x: p.start.x + START_LEN / 2, y: p.start.y });
export const finishPoint = p => ({ x: p.start.x - START_LEN / 2, y: p.start.y });

// Nearest lane point and its distance along the lane.
export function project(pt) {
  let best = null, off = 0;
  for (const S of SIDES) {
    const u = clamp(toLocal(S, pt.x, pt.y).u, 0, S.len), w = toWorld(S, u, 0);
    const d = Math.hypot(w.x - pt.x, w.y - pt.y);
    if (!best || d < best.d - 1e-9) best = { d, s: off + u, pt: w };
    off += S.len;
  }
  return best;
}

// Run from a to b clockwise along the lane, through the corners in between.
export function laneRoute(a, b) {
  const pa = project(a), pb = project(b);
  let sb = pb.s;
  if (sb < pa.s - 1e-9) sb += LAP;
  const pts = [a];
  if (pa.d > 0.05) pts.push(pa.pt);
  let k = 0;
  for (let lap = 0; lap < 2; lap++) for (let i = 0; i < 4; i++) {
    k += SIDES[i].len;
    if (k > pa.s + 1e-9 && k < sb - 1e-9) pts.push({ x: SIDES[(i + 1) % 4].x, y: SIDES[(i + 1) % 4].y });
  }
  if (pb.d > 0.05) pts.push(pb.pt);
  pts.push(b);
  return pts.filter((q, i) => i === 0 || Math.hypot(q.x - pts[i - 1].x, q.y - pts[i - 1].y) > 1e-6);
}

// Run connectors between start, stations and finish.
// { type: 'line', pts } or { type: 'curve', a, c, b, st, ctrl } (quadratic bezier; ctrl = 'approach'|'exitCtrl').
export function connectors(p, lay) {
  const out = [];
  let prev = { pt: startExit(p) };
  const curveFrom = (prev, b) => {
    const { st, L, pt: a } = prev;
    const c = st.exitCtrl ? toWorld(L.frame, st.exitCtrl.u, st.exitCtrl.v) : { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    return { type: 'curve', a, c, b, st: prev.i, ctrl: 'exitCtrl' };
  };
  p.stations.forEach((st, i) => {
    const L = lay[i];
    if (!L.fits) return;
    if (st.kind === 'goal') {
      const a = prev.pt, b = L.exit;
      out.push({ type: 'curve', a, c: approachCtrl(st, L, a), b, st: i, ctrl: 'approach' });
    } else if (prev.st?.kind === 'goal') out.push(curveFrom(prev, L.entry));
    else out.push({ type: 'line', pts: laneRoute(prev.pt, L.entry) });
    prev = { pt: L.exit, st, L, i };
  });
  const fin = finishPoint(p);
  out.push(prev.st?.kind === 'goal' ? curveFrom(prev, fin) : { type: 'line', pts: laneRoute(prev.pt, fin) });
  return out;
}

// Default approach: bend through the corner (action.u, entry.v) in goal coordinates.
export function approachCtrl(st, L, a) {
  if (st.approach) return toWorld(L.frame, st.approach.u, st.approach.v);
  return toWorld(L.frame, st.action.u, toLocal(L.frame, a.x, a.y).v);
}

export const norm = d => ((d % 360) + 360) % 360;
export const r3 = v => +v.toFixed(3);
function turn(p, c, th) { // rotate point p around c by th degrees (clockwise on screen)
  const a = th * Math.PI / 180, dx = p.x - c.x, dy = p.y - c.y;
  return { x: c.x + dx * Math.cos(a) - dy * Math.sin(a), y: c.y + dx * Math.sin(a) + dy * Math.cos(a) };
}
// Lane station: rotate its frame (pins it). Goal station: rotate its items and spots in goal coordinates.
export function rotateStation(st, stO, L, c, th) {
  if (st.kind === 'lane') {
    const o = turn(L.frame, c, th);
    st.pin = { x: r3(o.x), y: r3(o.y), rot: norm(L.frame.rot + th) };
    return;
  }
  const cl = toLocal(L.frame, c.x, c.y), cc = { x: cl.u, y: cl.v };
  const uv = p => { const q = turn({ x: p.u, y: p.v }, cc, th); return { u: r3(q.x), v: r3(q.y) }; };
  st.action = uv(stO.action);
  if (stO.approach) st.approach = uv(stO.approach);
  stO.items.forEach((o, k) => Object.assign(st.items[k], uv(o), { rot: norm((o.rot || 0) + th) }));
}

export function material(p) {
  const n = {};
  const add = (it, k = 1) => { n[it.type] = (n[it.type] || 0) + k; };
  p.free.forEach(it => add(it));
  for (const s of p.stations) s.items.forEach(it => add(it, places(s)));
  return Object.keys(ITEM_TYPES).filter(t => n[t]).map(t => ({ type: t, n: n[t] }));
}

// Copy a catalog entry into a parcours station; texts become plain strings in `lang`.
export function newStation(entry, lang) {
  const tx = v => (typeof v === 'string' ? v : v?.[lang] ?? v?.de ?? '');
  const st = structuredClone(entry);
  Object.assign(st, { name: tx(entry.name), task: tx(entry.task), badge: null });
  st.arrows ??= [];
  delete st.skill;
  if (st.kind === 'lane') st.pin = null;
  else Object.assign(st, { approach: null, exitCtrl: null });
  return st;
}

export const emptyParcours = () => ({
  schemaVersion: 2, title: '', group: 'F-Jugend', children: 20, interval: 5,
  start: { x: INSET + START_LEN / 2, y: INSET }, free: [], stations: [],
});

// Trust boundary for imported files.
export function validate(p) {
  const ok = p && p.schemaVersion === 2 && Array.isArray(p.stations) && Array.isArray(p.free)
    && Number.isFinite(p.start?.x) && Number.isFinite(p.start?.y)
    && p.stations.every(s => Array.isArray(s.items) && (s.kind === 'lane' && Number.isFinite(s.length)) || (s.kind === 'goal' && s.action))
    && [...p.free, ...p.stations.flatMap(s => s.items)].every(it => it && ITEM_TYPES[it.type]);
  if (!ok) throw new Error('invalid');
  return p;
}
