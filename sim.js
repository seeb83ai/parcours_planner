// Simulation: the children run through the parcours on the court. They start every `interval` seconds,
// run between stations at 3 m/s, queue when all places of a station are busy, and play the station
// (dribble, pass, throw at the goal, jump, crawl). Same timing as the model's lap / jam estimate.
// ponytail: no collision between runners, kids on the same run may overlap.
import * as M from './model.js';
import { withBall } from './stations.js';

const NS = 'http://www.w3.org/2000/svg', RUN = 3, KID = 0.32, BALL = 0.15;
const len = pts => pts.slice(1).reduce((a, q, i) => a + Math.hypot(q.x - pts[i].x, q.y - pts[i].y), 0);
function at(pts, d) { // point at distance d along a polyline
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], l = Math.hypot(b.x - a.x, b.y - a.y);
    if (d <= l || i === pts.length - 1) { const s = l ? Math.min(1, Math.max(0, d / l)) : 0; return { x: a.x + (b.x - a.x) * s, y: a.y + (b.y - a.y) * s }; }
    d -= l;
  }
  return pts[0];
}
const lerp = (a, b, s) => ({ x: a.x + (b.x - a.x) * s, y: a.y + (b.y - a.y) * s });

// The way through one place of a lane station (world points).
function track(st, L, off) {
  const w = (u, v) => M.toWorld(L.frame, u, v), { du, dv } = off;
  if (st.spots === 'along') return [w(0, 0), w(M.span(st), 0)];
  const mid = [];
  if (st.path === 'slalom') {
    const n = Math.max(2, Math.round(st.length / 2)) * 2, step = st.length / n;
    for (let i = 0; i <= n; i++) mid.push(w(du + step * i, dv + (i % 2 ? (i % 4 === 1 ? -0.9 : 0.9) : 0)));
  } else mid.push(w(du, dv), w(du + st.length, dv));
  return [w(0, 0), ...mid, w(M.span(st), 0)];
}

// Every child's timeline: phases { t0, t1, type: 'run' | 'wait' | 'station', pts, i, place, start }.
export function schedule(p) {
  const lay = M.layout(p), cons = M.connectors(p, lay).map(c => M.samplePath(c));
  const fit = p.stations.map((st, i) => ({ st, L: lay[i], i })).filter(x => x.L.fits);
  const free = fit.map(({ st }) => Array(Math.max(1, st.capacity | 0)).fill(0));
  const kids = [];
  for (let k = 0; k < Math.max(1, p.children | 0); k++) {
    let t = k * (p.interval || 5);
    const ph = [], run = (pts, i) => { const d = len(pts) / RUN; ph.push({ t0: t, t1: t + d, type: 'run', pts, i }); t += d; };
    fit.forEach(({ st, L, i }, n) => {
      run(cons[n], n);
      const f = free[n], j = f.indexOf(Math.min(...f)), start = Math.max(t, f[j]), dur = M.stationSecs(st);
      if (start > t) ph.push({ t0: t, t1: start, type: 'wait', pts: cons[n], i: n, arrive: t });
      f[j] = start + (st.flow ? Math.min(dur, 1.5) : dur); // a walk-through station takes the next child soon
      const pts = st.kind === 'goal' ? [L.exit] : track(st, L, M.spotOffsets(st)[j] ?? { du: 0, dv: 0 });
      ph.push({ t0: start, t1: start + dur, type: 'station', pts, st, L, place: j });
      t = start + dur;
    });
    run(cons[fit.length], fit.length);
    kids.push(ph);
  }
  return { kids, end: Math.max(...kids.map(ph => ph.at(-1).t1)) };
}

// Position of child k at time t, plus what it does: { q, r, ball, ballR, state }.
function pose(S, k, t) {
  const ph = S.kids[k].find(x => t >= x.t0 && t < x.t1);
  if (!ph) return null;
  const s = (t - ph.t0) / (ph.t1 - ph.t0 || 1);
  if (ph.type === 'run') return { q: at(ph.pts, s * len(ph.pts)) };
  if (ph.type === 'wait') { // line up on the run towards the station
    const q = S.kids.filter((o, m) => m !== k && o.some(x => x.type === 'wait' && x.i === ph.i && t >= x.t0 && t < x.t1 && x.arrive < ph.arrive)).length;
    return { q: at(ph.pts, len(ph.pts) - 0.8 * q), state: 'wait' };
  }
  const { st, L } = ph, q = ph.pts.length > 1 ? at(ph.pts, s * len(ph.pts)) : ph.pts[0];
  const tags = st.tags || [], out = { q, r: KID };
  if (tags.includes('springen') || st.skill === 'jumping') out.r = KID * (1 + 0.45 * Math.abs(Math.sin(t * Math.PI / 0.5)));
  if (tags.includes('kriechen')) out.r = KID * 0.7;
  if (!withBall(st)) return out;
  const side = { x: q.x + 0.3, y: q.y - 0.3 };
  if (st.kind === 'goal') {
    const goal = st.target ? M.toWorld(L.frame, st.target.u, st.target.v) : null;
    if (!goal || s < 0.15) out.ball = side; else if (s < 0.4) out.ball = lerp(side, goal, (s - 0.15) / 0.25);
    return out;
  }
  const a = (st.arrows || []).find(x => x.kind !== 'run');
  if (a) {
    const off = M.spotOffsets(st)[ph.place] ?? { du: 0, dv: 0 };
    const to = M.toWorld(L.frame, (a.to.f != null ? a.to.f * st.length : a.to.u) + off.du, a.to.v + off.dv);
    if (s < 0.35 || s > (a.kind === 'pass' ? 0.6 : 0.5)) out.ball = side;
    else if (a.kind === 'pass') out.ball = lerp(side, to, 1 - Math.abs((s - 0.35) / 0.125 - 1)); // there and back
    else out.ball = lerp(side, to, Math.min(1, (s - 0.35) / 0.1));
    return out;
  }
  out.ball = side;
  if (st.skill === 'dribbling' || tags.includes('prellen')) out.ballR = BALL * (0.75 + 0.5 * Math.abs(Math.sin(t * Math.PI / 0.45)));
  return out;
}

// Player: draws the children into the court SVG each frame.
export function createSim(svg, getP, t) {
  let S = null, time = 0, last = 0, raf = 0, speed = 2, g = null;
  const el = (name, attrs) => { const e = document.createElementNS(NS, name); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
  function build() {
    const p = getP();
    S = schedule(p);
    g = el('g', { id: 'sim', 'pointer-events': 'none' });
    g.append(el('text', { x: 0, y: -0.3, 'font-size': 0.6, 'font-weight': 700, fill: '#0f766e' }));
    S.kids.forEach((_, k) => {
      const c = `hsl(${(k * 137.5) % 360} 70% 45%)`;
      g.append(el('circle', { r: BALL, fill: '#fde047', stroke: '#713f12', 'stroke-width': 0.04 }),
        el('circle', { r: KID, fill: c, stroke: '#fff', 'stroke-width': 0.07 }));
    });
  }
  function frame(now) {
    time += Math.min(0.1, (now - last) / 1000) * speed;
    last = now;
    if (!S) build();
    if (!svg.contains(g)) svg.append(g);
    if (time > S.end + 3) time = 0; // loop
    const done = S.kids.filter(ph => time >= ph.at(-1).t1).length, mm = Math.floor(time / 60), ss = String(Math.floor(time % 60)).padStart(2, '0');
    g.firstChild.textContent = `${mm}:${ss} · ${t('sim.done', { n: done, of: S.kids.length })}`;
    S.kids.forEach((_, k) => {
      const ball = g.children[1 + 2 * k], kid = g.children[2 + 2 * k], o = pose(S, k, time);
      kid.style.display = o ? '' : 'none';
      ball.style.display = o?.ball ? '' : 'none';
      if (!o) return;
      kid.setAttribute('cx', o.q.x); kid.setAttribute('cy', o.q.y); kid.setAttribute('r', o.r ?? KID);
      kid.setAttribute('opacity', o.state === 'wait' ? 0.6 : 1);
      if (o.ball) { ball.setAttribute('cx', o.ball.x); ball.setAttribute('cy', o.ball.y); ball.setAttribute('r', o.ballR ?? BALL); }
    });
    raf = requestAnimationFrame(frame);
  }
  return {
    get running() { return !!raf; },
    start() { if (raf) return; time = 0; S = null; last = performance.now(); raf = requestAnimationFrame(frame); },
    stop() { cancelAnimationFrame(raf); raf = 0; g?.remove(); S = null; },
    changed() { if (raf) { g?.remove(); S = null; } }, // parcours edited: new timeline, same clock
    set speed(v) { speed = v; },
  };
}
