// Pure parcours logic: hall geometry, lane layout, transforms, connectors, timing, safety and
// material checks. No DOM access, so test.js can run it in node and in the browser.

export const GAP = 2, START_LEN = 4, SNAP = 0.5, INSET = 2.5;

// Halls. goals: 'both' = a goal at each end, 'left' = only the left end has a goal (half court).
export const HALLS = {
  full: { id: 'full', w: 40, h: 20, goals: 'both' },
  small: { id: 'small', w: 27, h: 15, goals: 'both' },
  half: { id: 'half', w: 20, h: 20, goals: 'left' },
};
export const hallOf = p => p?.hall || HALLS.full;

// Lane sides (clockwise, INSET metres inside the walls) and goal frames for a hall.
// Goal frames: u points into the court, v points to the side the lane comes from.
const geoms = new Map();
export function geom(hall = HALLS.full) {
  const key = `${hall.w}x${hall.h}:${hall.goals}`;
  if (geoms.has(key)) return geoms.get(key);
  const { w, h } = hall, I = INSET, LX = w - 2 * I, LY = h - 2 * I;
  const sides = [
    { x: I, y: I, rot: 0, len: LX },
    { x: w - I, y: I, rot: 90, len: LY },
    { x: w - I, y: h - I, rot: 180, len: LX },
    { x: I, y: h - I, rot: 270, len: LY },
  ];
  const goals = { 3: { x: 0, y: h / 2, rot: 0 } };
  if (hall.goals !== 'left') goals[1] = { x: w, y: h / 2, rot: 180 };
  const g = { w, h, sides, goals, lap: sides.reduce((s, S) => s + S.len, 0) };
  geoms.set(key, g);
  return g;
}
// Defaults for the standard court (used by tests).
export const { sides: SIDES, lap: LAP, goals: GOALS } = geom();

export const ITEM_TYPES = {
  cone: { r: 0.28 }, hoop: { r: 0.4 }, disc: { r: 0.3 }, helper: { r: 0.4 },
  bench: { w: 4, h: 0.4 }, kastendeckel: { w: 0.9, h: 0.7 }, mat: { w: 2, h: 1 },
  weichboden: { w: 2, h: 3 }, ballbox: { w: 2, h: 1 }, minigoal: { w: 0.6, h: 1.8 },
  kasten: { w: 1.5, h: 0.9 }, hurdle: { w: 0.15, h: 0.8 }, ladder: { w: 4, h: 0.5 }, rope: { w: 0.06, h: 3 },
  tunnel: { w: 2, h: 0.7 }, tau: { r: 0.3 },
};

const cs = deg => { const r = deg * Math.PI / 180; return [Math.round(Math.cos(r) * 1e9) / 1e9, Math.round(Math.sin(r) * 1e9) / 1e9]; };
export const snap = v => Math.round(v / SNAP) * SNAP;
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const norm = d => ((d % 360) + 360) % 360;
export const r3 = v => +v.toFixed(3);

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

// Every drawn copy of a station's items: { it, j (base index), k (place), q (world), rot }
export function placedItems(st, L) {
  return spotOffsets(st).flatMap(({ du, dv }, k) => st.items.map((it, j) =>
    ({ it, j, k, q: toWorld(L.frame, itemU(st, it) + du, it.v + dv), rot: L.frame.rot + (it.rot || 0) })));
}

// Change a lane station's length. Rows of evenly spread items (same type, `f` set) keep at least
// their original spacing (`pitch`, stored on first resize): an item is added as soon as it fits,
// and removed when it no longer does. Items at the same `f` (e.g. a cone gate) move as one slot.
// A row the coach adjusted by hand (`manual[type]`) only stretches, it is never rebuilt.
export function resize(st, len) {
  st.pitch ??= {};
  const groups = {};
  for (const it of st.items) if (it.f != null) (groups[it.type] ??= []).push(it);
  for (const [type, items] of Object.entries(groups)) {
    if (st.manual?.[type]) continue;
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
  const G = geom(hallOf(p)), S = G.sides;
  let side = 0, pos = START_LEN;
  return p.stations.map(st => {
    if (st.kind === 'goal') {
      const gs = (side === 0 ? [1, 3] : side <= 2 ? [3] : []).find(k => G.goals[k]); // next free goal end
      if (gs == null) return { fits: false };
      side = gs + 1; pos = 0;
      const frame = G.goals[gs];
      return { fits: true, goal: true, side: gs, frame, entry: null, exit: toWorld(frame, st.action.u, st.action.v) };
    }
    if (st.pin) {
      const frame = st.pin, entry = { x: frame.x, y: frame.y }, exit = toWorld(frame, span(st), 0);
      // a pinned station still marks a place on the lane: the next station continues after it
      const s = Math.max(project(entry, G).s, project(exit, G).s);
      const cur = side >= 4 ? G.lap : S.slice(0, side).reduce((a, x) => a + x.len, 0) + pos;
      if (s > cur + 1e-9) {
        let k = 0, u = s;
        while (k < 3 && u > S[k].len + 1e-9) { u -= S[k].len; k++; }
        side = k; pos = u;
      }
      return { fits: true, pinned: true, frame, entry, exit };
    }
    let start = pos + GAP;
    const len = span(st);
    const room = k => S[k].len - (k === 3 ? GAP : 0); // keep the gap before the finish free
    while (side < 4 && start + len > room(side) + 1e-9) { side++; start = GAP; } // ponytail: no bending, jump to next side
    if (side >= 4) return { fits: false };
    const frame = { ...toWorld(S[side], start, 0), rot: S[side].rot };
    pos = start + len;
    return { fits: true, side, frame, entry: { x: frame.x, y: frame.y }, exit: toWorld(frame, len, 0) };
  });
}

export const startPoint = hall => ({ x: INSET + START_LEN / 2, y: INSET });
export const startExit = p => ({ x: p.start.x + START_LEN / 2, y: p.start.y });
export const finishPoint = p => ({ x: p.start.x - START_LEN / 2, y: p.start.y });

// Nearest lane point and its distance along the lane.
export function project(pt, G = geom()) {
  let best = null, off = 0;
  for (const S of G.sides) {
    const u = clamp(toLocal(S, pt.x, pt.y).u, 0, S.len), w = toWorld(S, u, 0);
    const d = Math.hypot(w.x - pt.x, w.y - pt.y);
    if (!best || d < best.d - 1e-9) best = { d, s: off + u, pt: w };
    off += S.len;
  }
  return best;
}

// Run from a to b clockwise along the lane, through the corners in between.
export function laneRoute(a, b, G = geom()) {
  const pa = project(a, G), pb = project(b, G), S = G.sides;
  let sb = pb.s;
  if (sb < pa.s - 1e-9) sb += G.lap;
  const pts = [a];
  if (pa.d > 0.05) pts.push(pa.pt);
  let k = 0;
  for (let lap = 0; lap < 2; lap++) for (let i = 0; i < 4; i++) {
    k += S[i].len;
    if (k > pa.s + 1e-9 && k < sb - 1e-9) pts.push({ x: S[(i + 1) % 4].x, y: S[(i + 1) % 4].y });
  }
  if (pb.d > 0.05) pts.push(pb.pt);
  pts.push(b);
  return pts.filter((q, i) => i === 0 || Math.hypot(q.x - pts[i - 1].x, q.y - pts[i - 1].y) > 1e-6);
}

// Run connectors between start, stations and finish (none in circuit mode, groups stay at their station).
// { type: 'line', pts } or { type: 'curve', a, c, b, st, ctrl } (quadratic bezier; ctrl = 'approach'|'exitCtrl').
export function connectors(p, lay) {
  if (p.mode === 'zirkel') return [];
  const G = geom(hallOf(p)), out = [];
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
    else out.push({ type: 'line', pts: laneRoute(prev.pt, L.entry, G) });
    prev = { pt: L.exit, st, L, i };
  });
  const fin = finishPoint(p);
  out.push(prev.st?.kind === 'goal' ? curveFrom(prev, fin) : { type: 'line', pts: laneRoute(prev.pt, fin, G) });
  return out;
}

// Default approach: bend through the corner (action.u, entry.v) in goal coordinates.
export function approachCtrl(st, L, a) {
  if (st.approach) return toWorld(L.frame, st.approach.u, st.approach.v);
  return toWorld(L.frame, st.action.u, toLocal(L.frame, a.x, a.y).v);
}

// A connector as a polyline (curves sampled).
export function samplePath(c) {
  if (c.type === 'line') return c.pts;
  return Array.from({ length: 17 }, (_, k) => {
    const s = k / 16, a = (1 - s) ** 2, b = 2 * s * (1 - s), d = s * s;
    return { x: a * c.a.x + b * c.c.x + d * c.b.x, y: a * c.a.y + b * c.c.y + d * c.b.y };
  });
}
const polyLen = pts => pts.slice(1).reduce((a, q, i) => a + Math.hypot(q.x - pts[i].x, q.y - pts[i].y), 0);

// --- Timing. Children run at about 3 m/s between stations. A walk-through (flow) station takes
// its length at 1.2 m/s; other stations take `secs` (catalog or coach), default 10 s (goal: 8 s).
// A station with `secs` per child and c places needs secs / c seconds per child. If that is longer
// than the start interval, children queue there and the wait grows with every child.
export const stationSecs = st => st.secs ?? (st.kind === 'lane' && st.flow ? Math.round(span(st) / 1.2) : st.kind === 'goal' ? 8 : 10);
export function timing(p, lay) {
  const run = connectors(p, lay).reduce((a, c) => a + polyLen(samplePath(c)), 0);
  const fit = p.stations.filter((s, i) => lay[i].fits);
  const lap = run / 3 + fit.reduce((a, s) => a + stationSecs(s), 0);
  const lastStart = (p.children - 1) * p.interval;
  const jams = p.stations.map((s, i) => {
    if (!lay[i].fits || (s.kind === 'lane' && s.flow)) return null;
    const per = stationSecs(s) / Math.max(1, s.capacity | 0);
    return per > p.interval ? { i, per: Math.round(per), wait: Math.round((p.children - 1) * (per - p.interval)) } : null;
  }).filter(Boolean);
  const wait = Math.max(0, ...jams.map(j => j.wait));
  return { lap: Math.round(lap), lastStart, jams, total: Math.round(lastStart + lap + wait) };
}
// Circuit mode: one group per station, groups change every `rotation` minutes.
export function circuit(p, lay) {
  const k = lay.filter(l => l.fits).length;
  return { groups: k, perGroup: k ? Math.ceil(p.children / k) : 0, total: k * (p.rotation || 3) };
}

// --- Safety: a throw or pass arrow must not cross another station's running path.
function segX(a, b, c, d) {
  const r = { x: b.x - a.x, y: b.y - a.y }, s = { x: d.x - c.x, y: d.y - c.y }, den = r.x * s.y - r.y * s.x;
  if (Math.abs(den) < 1e-9) return null;
  const t = ((c.x - a.x) * s.y - (c.y - a.y) * s.x) / den, u = ((c.x - a.x) * r.y - (c.y - a.y) * r.x) / den;
  return t > 0.02 && t < 0.98 && u > 0.02 && u < 0.98 ? { x: a.x + t * r.x, y: a.y + t * r.y } : null;
}
export function crossings(p, lay) {
  const runs = connectors(p, lay).map(c => ({ pts: samplePath(c), owner: c.type === 'curve' ? c.st : null }));
  const shots = [];
  p.stations.forEach((st, i) => {
    const L = lay[i];
    if (!L.fits) return;
    const offs = spotOffsets(st);
    if (st.kind === 'lane' && st.path !== 'none') {
      const tracks = st.spots === 'along' ? [{ len: span(st), dv: 0 }] : offs.map(o => ({ len: st.length, dv: o.dv }));
      for (const { len, dv } of tracks) runs.push({ pts: [toWorld(L.frame, 0, dv), toWorld(L.frame, len, dv)], owner: i });
    }
    for (const { du, dv } of offs) for (const a of st.arrows || []) {
      const w = q => toWorld(L.frame, (q.f != null ? q.f * st.length : q.u) + du, q.v + dv);
      shots.push({ a: w(a.from), b: w(a.to), owner: i });
    }
    if (st.kind === 'goal' && st.target) shots.push({ a: L.exit, b: toWorld(L.frame, st.target.u, st.target.v), owner: i });
  });
  const out = [];
  for (const s of shots) for (const r of runs) {
    if (r.owner === s.owner) continue; // a station's own run and throws belong together
    for (let k = 0; k + 1 < r.pts.length; k++) {
      const x = segX(s.a, s.b, r.pts[k], r.pts[k + 1]);
      if (x) { out.push({ st: s.owner, x }); break; }
    }
  }
  return out;
}

// --- Number badges: first spot near the station that is free of material and other badges.
function itemPoints(it, q, rot) {
  const T = ITEM_TYPES[it.type];
  if (T.r) return [q];
  const w = it.w ?? T.w, h = it.h ?? T.h, long = Math.max(w, h);
  if (long <= 1.2) return [q];
  const fr = { x: q.x, y: q.y, rot: rot + (h > w ? 90 : 0) }, n = Math.ceil(long);
  return Array.from({ length: n + 1 }, (_, k) => toWorld(fr, -long / 2 + long * k / n, 0));
}
export function badges(p, lay) {
  const G = geom(hallOf(p)), pts = p.free.flatMap(it => itemPoints(it, it, it.rot || 0)), out = [];
  p.stations.forEach((st, i) => {
    if (lay[i].fits) placedItems(st, lay[i]).forEach(c => pts.push(...itemPoints(c.it, c.q, c.rot)));
  });
  p.stations.forEach((st, i) => {
    const L = lay[i];
    if (!L.fits) return out.push(null);
    if (st.badge) return out.push(st.badge);
    let cands;
    if (st.kind === 'goal') cands = [[1.4, -1.4], [1.4, 1.4], [2.4, 0], [-1.4, 1.8], [-1.4, -1.8], [3.2, -1.4]]
      .map(([du, dv]) => toWorld(L.frame, st.action.u + du, st.action.v + dv));
    else {
      const m = Math.max(...spotOffsets(st).map(o => o.dv)), s = span(st);
      cands = [[s / 2, 2.4], [s / 2, 3.4], [s / 2 - 1.6, 2.4], [s / 2 + 1.6, 2.4], [s / 2, 4.4], [s / 2 - 1.6, 3.4], [s / 2 + 1.6, 3.4]]
        .map(([u, v]) => toWorld(L.frame, u, v + m));
    }
    const free = q => q.x > 0.7 && q.x < G.w - 0.7 && q.y > 0.7 && q.y < G.h - 0.7
      && pts.every(c => Math.hypot(c.x - q.x, c.y - q.y) >= 1)
      && out.every(b => !b || Math.hypot(b.x - q.x, b.y - q.y) >= 1.5);
    out.push(cands.find(free) || cands[0]);
  });
  return out;
}

export function rotateTurn(p, c, th) { // rotate point p around c by th degrees (clockwise on screen)
  const a = th * Math.PI / 180, dx = p.x - c.x, dy = p.y - c.y;
  return { x: c.x + dx * Math.cos(a) - dy * Math.sin(a), y: c.y + dx * Math.sin(a) + dy * Math.cos(a) };
}
// Lane station: rotate its frame (pins it). Goal station: rotate its items and spots in goal coordinates.
export function rotateStation(st, stO, L, c, th) {
  if (st.kind === 'lane') {
    const o = rotateTurn(L.frame, c, th);
    st.pin = { x: r3(o.x), y: r3(o.y), rot: norm(L.frame.rot + th) };
    return;
  }
  const cl = toLocal(L.frame, c.x, c.y), cc = { x: cl.u, y: cl.v };
  const uv = p => { const q = rotateTurn({ x: p.u, y: p.v }, cc, th); return { u: r3(q.x), v: r3(q.y) }; };
  st.action = uv(stO.action);
  if (stO.approach) st.approach = uv(stO.approach);
  stO.items.forEach((o, k) => Object.assign(st.items[k], uv(o), { rot: norm((o.rot || 0) + th) }));
}

// Copy station i to the end of the track. Keeps size, places and rotation: a rotated lane station
// keeps its angle relative to the lane it sits on. Returns null when the copy has no room left.
export function duplicateStation(p, i) {
  const orig = p.stations[i], c = structuredClone(orig);
  c.badge = null;
  let delta = 0;
  if (c.kind === 'lane' && orig.pin) {
    const base = layout({ ...p, stations: p.stations.map((s, k) => (k === i ? { ...s, pin: null } : s)) })[i];
    if (base.fits) delta = norm(orig.pin.rot - base.frame.rot);
    c.pin = null;
  }
  const L = layout({ ...p, stations: [...p.stations, c] }).at(-1);
  if (!L.fits) return null;
  if (delta) {
    const qs = [...placedItems(c, L).map(x => x.q), L.entry, L.exit], xs = qs.map(q => q.x), ys = qs.map(q => q.y);
    const mid = { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 };
    rotateStation(c, structuredClone(c), L, mid, delta);
  }
  return c;
}

export function material(p) {
  const n = {};
  const add = (it, k = 1) => { n[it.type] = (n[it.type] || 0) + k; };
  p.free.forEach(it => add(it));
  for (const s of p.stations) s.items.forEach(it => add(it, places(s)));
  return Object.keys(ITEM_TYPES).filter(t => n[t]).map(t => ({ type: t, n: n[t] }));
}
export const stationMaterial = st => material({ free: [], stations: [st] });
// What the parcours needs beyond the hall's stock (inventory: { type: count }, missing = unknown).
export const shortages = (p, inv = {}) =>
  material(p).filter(m => Number.isFinite(inv[m.type]) && m.n > inv[m.type]).map(m => ({ ...m, have: inv[m.type] }));

// Copy a catalog entry into a parcours station; texts become plain strings in `lang`.
export function newStation(entry, lang) {
  const tx = v => (typeof v === 'string' ? v : v?.[lang] ?? v?.de ?? '');
  const st = structuredClone(entry);
  Object.assign(st, { name: tx(entry.name), task: tx(entry.task), badge: null });
  st.arrows ??= [];
  if (st.kind === 'lane') st.pin = null;
  else Object.assign(st, { approach: entry.approach ?? null, exitCtrl: null });
  return st;
}

export const emptyParcours = () => ({
  schemaVersion: 2, title: '', group: 'F-Jugend', children: 20, interval: 5,
  hall: HALLS.full, mode: 'parcours', rotation: 3, notes: '',
  start: startPoint(HALLS.full), free: [], stations: [],
});

// Trust boundary for imported files and shared links.
const okStation = s => s && Array.isArray(s.items)
  && ((s.kind === 'lane' && Number.isFinite(s.length)) || (s.kind === 'goal' && Number.isFinite(s.action?.u)))
  && s.items.every(it => it && ITEM_TYPES[it.type]);
export function validate(p) {
  const h = p?.hall;
  const ok = p && p.schemaVersion === 2 && Array.isArray(p.stations) && Array.isArray(p.free)
    && Number.isFinite(p.start?.x) && Number.isFinite(p.start?.y)
    && (!h || (Number.isFinite(h.w) && Number.isFinite(h.h) && h.w >= 12 && h.w <= 60 && h.h >= 10 && h.h <= 40))
    && p.stations.every(okStation) && p.free.every(it => it && ITEM_TYPES[it.type]);
  if (!ok) throw new Error('invalid');
  return p;
}
export function validateStations(list) {
  if (!Array.isArray(list) || !list.every(okStation)) throw new Error('invalid');
  return list;
}

// --- Share link: the parcours as deflate-compressed, URL-safe base64.
export async function encodeShare(p) {
  const s = new Blob([JSON.stringify(p)]).stream().pipeThrough(new CompressionStream('deflate-raw'));
  const buf = new Uint8Array(await new Response(s).arrayBuffer());
  let bin = '';
  for (const b of buf) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export async function decodeShare(code) {
  const bin = atob(code.replace(/-/g, '+').replace(/_/g, '/'));
  const s = new Blob([Uint8Array.from(bin, c => c.charCodeAt(0))]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return validate(JSON.parse(await new Response(s).text()));
}
