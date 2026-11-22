// Layout logic checks. Run: `node test.js`, or open test.html in the browser.
import * as M from './model.js';
import { CATALOG } from './stations.js';

const results = [];
const check = (name, ok) => results.push([name, !!ok]);
const st = (ref, o = {}) => Object.assign(M.newStation(CATALOG.find(c => c.ref === ref), 'de'), o);
const P = stations => ({ ...M.emptyParcours(), stations });
const near = (a, b) => Math.abs(a.x - b.x) < 1e-6 && Math.abs(a.y - b.y) < 1e-6;

// lane placement: first station after start box + gap
let lay = M.layout(P([st('slalom-prellen')]));
const I = M.INSET;
check('first station starts at inset + 4 + 2', near(lay[0].frame, { x: I + 6, y: I }));

// corner jump: 3 x 10 m does not fit on the 35 m top side
lay = M.layout(P([st('slalom-prellen'), st('slalom-prellen'), st('slalom-prellen')]));
check('third station jumps to the right end', lay[2].side === 1 && near(lay[2].frame, { x: 40 - I, y: I + 2 }) && lay[2].frame.rot === 90);

// goal station takes the next end side; lane continues on the bottom
lay = M.layout(P([st('balancieren'), st('zielwurf'), st('balancieren')]));
check('goal station at right goal', lay[1].goal && lay[1].side === 1 && near(lay[1].exit, { x: 31, y: 10 }));
check('next station on bottom after goal', lay[2].side === 2 && near(lay[2].frame, { x: 40 - I - 2, y: 20 - I }));

// only two goal ends
lay = M.layout(P([st('zielwurf'), st('sprungwurf'), st('torstation')]));
check('third goal station does not fit', lay[0].side === 1 && lay[1].side === 3 && !lay[2].fits);

// lane full
lay = M.layout(P(Array.from({ length: 12 }, () => st('slalom-prellen', { length: 14 }))));
check('lane full marks the rest', lay.filter(l => l.fits).length === 3 && !lay[11].fits); // 14 m: 1 top, 0 right (15 m), 2 bottom

// the last side keeps the gap before the finish free
const s14 = () => st('slalom-prellen', { length: 14 });
lay = M.layout(P([s14(), st('zielwurf'), s14(), s14(), st('seitgalopp', { length: 4 }), st('seitgalopp', { length: 7 })]));
check('last side ends a gap before the finish', lay[4].side === 3 && !lay[5].fits); // 8..15 would touch the start corner

// spread items follow the length, fixed items do not
const s = st('slalom-prellen', { length: 12 });
check('spread cone at the end', M.itemU(s, s.items[4]) === 12);
check('fixed bench keeps u', M.itemU(st('balancieren', { length: 99 }), st('balancieren').items[0]) === 2);

// pinned station leaves the lane flow
lay = M.layout(P([st('balancieren', { pin: { x: 20, y: 10, rot: 90 } }), st('balancieren')]));
check('pinned keeps its frame', lay[0].pinned && near(lay[0].exit, { x: 20, y: 14 }));
check('next station takes the free lane slot', near(lay[1].frame, { x: I + 6, y: I }));

// transforms are inverse
const fr = { x: 38.5, y: 18.5, rot: 180 }, w = M.toWorld(fr, 3, 1), l = M.toLocal(fr, w.x, w.y);
check('toLocal inverts toWorld', Math.abs(l.u - 3) < 1e-9 && Math.abs(l.v - 1) < 1e-9 && near(w, { x: 35.5, y: 17.5 }));

// route along the lane passes the corners in between
const r = M.laneRoute({ x: 30, y: I }, { x: 30, y: 20 - I });
check('route via 2 corners', r.length === 4 && near(r[1], { x: 40 - I, y: I }) && near(r[2], { x: 40 - I, y: 20 - I }));
const fin = M.laneRoute({ x: I, y: 10 }, { x: I, y: I });
check('route to finish goes up the left side', fin.length === 2);

// material count
const mp = P([st('slalom-prellen'), st('zielwurf')]);
mp.free.push({ type: 'ballbox', x: 1, y: 1 });
const mat = Object.fromEntries(M.material(mp).map(m => [m.type, m.n]));
check('material counted', mat.cone === 7 && mat.hoop === 2 && mat.ballbox === 1);

// rotating a lane station pins it around the centre; a goal station turns its items
const rs = st('balancieren'), rl = M.layout(P([rs]))[0];
M.rotateStation(rs, structuredClone(rs), rl, { x: I + 8, y: I }, 90);
check('lane station rotated 90° about its centre', rs.pin.rot === 90 && near(rs.pin, { x: I + 8, y: I - 2 }));
const gs = st('zielwurf'), gl = M.layout(P([gs]))[0];
M.rotateStation(gs, structuredClone(gs), gl, M.toWorld(gl.frame, 9, 0), 180);
check('goal station rotated around the throw spot', gs.action.u === 9 && gs.items[0].u === 10.5 && gs.items[0].rot === 180);
check('norm wraps negative angles', M.norm(-15) === 345);

// places (Plätze): along makes the station longer, across adds parallel tracks; material multiplies
const pw = st('pass-wand'); // 3 places along, 2 m each
check('along: span = places x length', M.span(pw) === 6 && M.spotOffsets(pw)[2].du === 4);
lay = M.layout(P([pw, st('balancieren')]));
check('along: next station starts after the full span', near(lay[1].frame, { x: I + 4 + 2 + 6 + 2, y: I }));
const sl = st('slalom-prellen', { capacity: 2 });
check('across: second track 2.2 m inside, same length', M.span(sl) === 10 && M.spotOffsets(sl)[1].dv === 2.2);
const cm = Object.fromEntries(M.material(P([sl, pw])).map(m => [m.type, m.n]));
check('material counts every place', cm.cone === 10 && cm.disc === 3);
check('every catalog station is valid', !(() => { try { M.validate(P(CATALOG.map(c => st(c.ref)))); } catch { return true; } })());

// validation at the import boundary
const bad = x => { try { M.validate(x); return false; } catch { return true; } };
check('validate rejects schema 1', bad({ schemaVersion: 1, stations: [] }));
check('validate rejects unknown item', bad({ ...mp, free: [{ type: 'rocket' }] }));
check('validate accepts a parcours', !bad(mp));

const failed = results.filter(([, ok]) => !ok);
const report = results.map(([n, ok]) => `${ok ? 'ok  ' : 'FAIL'} ${n}`).join('\n') + `\n${results.length - failed.length}/${results.length} passed`;
if (typeof document !== 'undefined') document.body.textContent = report;
else { console.log(report); if (failed.length) process.exit(1); }
