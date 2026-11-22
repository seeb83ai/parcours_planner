import { t, setLang, getLang } from './i18n.js';
import { CATALOG, FILTERS } from './stations.js';
import { PRESETS, buildPreset } from './presets.js';
import * as M from './model.js';
import { courtInner, pageSVG, esc, stationBox, itemPlace, viewBox } from './court.js';

const $ = id => document.getElementById(id);
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode: no autosave */ } },
};
const ctx = document.createElement('canvas').getContext('2d');
const measure = (s, size) => { ctx.font = `${size * 10}px Arial, Helvetica, sans-serif`; return ctx.measureText(s).width / 10; };
const locale = () => (getLang() === 'de' ? 'de-DE' : 'en-GB');
const today = () => new Date().toLocaleDateString(locale());
// under a minute in seconds ("21 s"), otherwise minutes ("1:45 min"), so "0:21 min" cannot be misread
const mmss = s => (s = Math.round(s)) < 60 ? `${s} s` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')} min`;
const { norm, rotateStation, r3 } = M;

let P = (() => { try { return M.validate(store.get('parcours.draft')); } catch { return M.emptyParcours(); } })();
let sel = {};
let custom = store.get('parcours.custom') || [];
let saved = store.get('parcours.saved') || [];
const stock = store.get('parcours.stock') || {};

function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast.id);
  toast.id = setTimeout(() => el.classList.remove('show'), 2600);
}

// --- undo / redo: snapshot before an edit, push it on the first real change
const undo = [], redo = [];
let pending = null;
const begin = () => { pending = JSON.stringify(P); };
const commit = () => {
  if (pending === null) return;
  undo.push(pending);
  if (undo.length > 50) undo.shift();
  redo.length = 0;
  pending = null;
};
const change = fn => { begin(); fn(); commit(); renderAll(); };
function restore(from, to) {
  if (!from.length) return;
  to.push(JSON.stringify(P));
  P = JSON.parse(from.pop());
  sel = {};
  renderAll();
}

// --- rendering
function renderCourt({ selbar = true } = {}) {
  $('court').setAttribute('viewBox', viewBox(P));
  $('court').innerHTML = courtInner(P, { id: 'ed', t, edit: true, sel });
  if (selbar) renderSelbar();
  renderSide();
  store.set('parcours.draft', P);
}

function renderAll() {
  const hall = M.hallOf(P), zirkel = P.mode === 'zirkel';
  $('title').value = P.title;
  $('group').value = P.group;
  $('children').value = P.children;
  $('interval').value = P.interval;
  $('rotation').value = P.rotation ?? 3;
  $('notes').value = P.notes ?? '';
  $('hall').innerHTML = ['full', 'small', 'half', 'custom'].map(k => `<option value="${k}">${esc(t('hall.' + k))}</option>`).join('');
  $('hall').value = M.HALLS[hall.id] ? hall.id : 'custom';
  $('hall-custom').hidden = $('hall').value !== 'custom';
  $('hall-w').value = hall.w;
  $('hall-h').value = hall.h;
  $('mode').innerHTML = ['parcours', 'zirkel'].map(k => `<option value="${k}">${esc(t('mode.' + k))}</option>`).join('');
  $('mode').value = zirkel ? 'zirkel' : 'parcours';
  $('row-interval').hidden = zirkel;
  $('row-rotation').hidden = !zirkel;
  $('btn-timer').hidden = !zirkel;
  const fv = $('filter').value || 'all', groups = [...new Set(FILTERS.map(x => x.group).filter(Boolean))];
  $('filter').innerHTML = `<option value="all">${esc(t('filter.all'))}</option>` + groups.map(g => `<optgroup label="${esc(t('filter.g.' + g))}">`
    + FILTERS.filter(x => x.group === g).map(x => `<option value="${x.id}">${esc(t('filter.' + x.id))}</option>`).join('') + '</optgroup>').join('');
  $('filter').value = fv;
  $('tpl').innerHTML = `<option value="">${esc(t('tb.template'))}</option>`
    + PRESETS.map(d => `<option value="${d.id}">${esc(d.title[getLang()] ?? d.title.de)}</option>`).join('');
  if (!$('stock').contains(document.activeElement))
    $('stock').innerHTML = Object.keys(M.ITEM_TYPES).map(k => `<label><span>${esc(t('item.' + k))}</span>`
      + `<input type="number" min="0" max="99" data-stock="${k}" value="${stock[k] ?? ''}" placeholder="–"></label>`).join('');
  renderCatalog();
  renderStations();
  renderCourt();
}

function renderSide() {
  const lay = M.layout(P), hints = [];
  const named = list => list.map(i => `${i + 1} ${P.stations[i].name}`).join(', ');
  if (P.mode === 'zirkel') {
    const c = M.circuit(P, lay);
    hints.push(['', t('hint.circuit', { g: c.groups, k: c.perGroup, m: P.rotation || 3, t: c.total })]);
  } else {
    const tm = M.timing(P, lay);
    hints.push(['', t('hint.timing', { lap: mmss(tm.lap), last: mmss(tm.lastStart), total: mmss(tm.total) })]);
    for (const j of tm.jams) hints.push(['warn', t('hint.jam', { st: named([j.i]), per: j.per, s: P.interval, wait: mmss(j.wait) })]);
  }
  const nofit = P.stations.map((s, i) => i).filter(i => !lay[i].fits);
  if (nofit.length) hints.push(['warn', t('hint.nofit', { list: named(nofit) })]);
  const cross = [...new Set(M.crossings(P, lay).map(c => c.st))];
  if (cross.length) hints.push(['warn', t('hint.cross', { list: named(cross) })]);
  const short = M.shortages(P, stock);
  if (short.length) hints.push(['warn', t('hint.stock', { list: short.map(m => `${m.n} × ${t('item.' + m.type)} (${m.have})`).join(', ') })]);
  if (pageSVG(P, t, measure, today()).overflow) hints.push(['warn', t('hint.overflow')]);
  if (!hints.some(h => h[0] === 'warn')) hints.push(['', t('hint.ok')]);
  $('hints').innerHTML = hints.map(([c, s]) => `<li class="${c}">${esc(s)}</li>`).join('');
  $('material').innerHTML = M.material(P).map(m => {
    const low = Number.isFinite(stock[m.type]) && m.n > stock[m.type];
    return `<li class="${low ? 'warn' : ''}">${m.n} × ${esc(t('item.' + m.type))}${low ? ` (${esc(t('stock.have', { n: stock[m.type] }))})` : ''}</li>`;
  }).join('');
  $('palette-hint').textContent = sel.st != null ? t('palette.toStation', { n: sel.st + 1 }) : t('palette.free');
}

function sizeInputs(it) {
  const T = M.ITEM_TYPES[it.type];
  if (it.type === 'hoop') return `<label class="size">Ø <input type="number" data-size="size" min="0.3" max="2" step="0.1" value="${it.size || 0.8}"> m</label>`;
  if (T.r) return '';
  return `<label class="size">${esc(t('sel.size'))} <input type="number" data-size="w" min="0.1" max="10" step="0.1" value="${it.w ?? T.w}">`
    + ` × <input type="number" data-size="h" min="0.05" max="10" step="0.1" value="${it.h ?? T.h}"> m</label>`;
}

function renderSelbar() {
  const b = (act, key) => `<button data-sact="${act}">${esc(t(key))}</button>`;
  const hint = `<span>${esc(t('sel.keys'))}</span>`;
  const st = P.stations[sel.st], item = sel.free != null ? P.free[sel.free] : st?.items[sel.item];
  let h;
  if (sel.route != null) {
    h = `<strong>${esc(t('sel.route'))}</strong> ${sel.vi != null ? b('viadel', 'sel.viaDel') : ''} ${b('viareset', 'sel.viaReset')} <span>${esc(t('sel.routeKeys'))}</span>`;
    $('selbar').innerHTML = h;
    return;
  }
  if (sel.free != null && item) h = `${esc(t('sel.item'))}: ${esc(t('item.' + item.type))} ${sizeInputs(item)} ${b('rotate', 'sel.rotate')} ${b('delete', 'sel.delete')} ${hint}`;
  else if (st) {
    h = `<strong>${sel.st + 1} ${esc(st.name)}</strong>`;
    if (item) h += ` – ${esc(t('item.' + item.type))} ${sizeInputs(item)} ${b('rotate', 'sel.rotate')} ${b('delete', 'sel.delete')}`;
    else h += ` ${b('rotate', 'st.rotate')} ${b('dup', 'st.dup')} ${b('delete', 'st.delete')}`;
    if (st.pin) h += ` ${b('unpin', 'st.unpin')}`;
    h += ` ${hint}`;
  } else h = esc(t('sel.none'));
  $('selbar').innerHTML = h;
}

function renderCatalog() {
  const lang = getLang(), flt = FILTERS.find(x => x.id === $('filter').value) || FILTERS[0];
  const name = e => (typeof e.name === 'string' ? e.name : e.name[lang] ?? e.name.de);
  const row = (e, attr, del = '') => `<div class="cat-item"><button class="add" ${attr}>${esc(name(e))}</button>`
    + `<span class="meta">${e.kind === 'lane' ? `${e.length} m` : ''}</span>${del}</div>`;
  let h = '';
  const mine = custom.map((e, k) => [e, k]).filter(([e]) => flt.f(e));
  if (mine.length) h += `<div class="cat-group">${esc(t('side.custom'))}</div>`
    + mine.map(([e, k]) => row(e, `data-custom="${k}"`, `<button data-delcustom="${k}" title="${esc(t('custom.delete'))}" aria-label="${esc(t('custom.delete'))}">✕</button>`)).join('');
  const groups = {};
  for (const e of CATALOG.filter(flt.f)) (groups[e.kind === 'goal' ? 'goal' : e.skill] ??= []).push(e);
  for (const [g, list] of Object.entries(groups))
    h += `<div class="cat-group">${esc(t('skill.' + g))}</div>` + list.map(e => row(e, `data-ref="${e.ref}"`)).join('');
  $('catalog').innerHTML = h;
}

function renderStations() {
  const lay = M.layout(P), zirkel = P.mode === 'zirkel';
  if (!P.stations.length) { $('stations').innerHTML = `<li class="muted">${esc(t('st.empty'))}</li>`; return; }
  $('stations').innerHTML = P.stations.map((st, i) => {
    const L = lay[i], ib = (act, key, sym) => `<button data-act="${act}" title="${esc(t(key))}" aria-label="${esc(t(key))}">${sym}</button>`;
    const flags = [st.kind === 'goal' && `<span class="flag">${esc(t('st.goal'))}</span>`,
      st.pin && `<span class="flag">${esc(t('st.pinned'))}</span>`,
      !L.fits && `<span class="flag warn">${esc(t('st.nofit'))}</span>`].filter(Boolean).join('');
    const len = st.kind === 'lane' && st.maxLength > st.minLength
      ? `<label>${esc(t('st.length'))} <input type="range" data-f="length" min="${st.minLength}" max="${st.maxLength}" step="0.5" value="${st.length}"><output>${st.length} m</output></label>` : '';
    const secs = zirkel ? '' : `<label>${esc(t('st.secs'))} <input type="number" data-f="secs" min="1" max="120" value="${M.stationSecs(st)}"></label>`;
    return `<li class="st${sel.st === i ? ' sel' : ''}${L.fits ? '' : ' bad'}" data-i="${i}">
<span class="badge" draggable="true" title="${esc(t('st.drag'))}">${i + 1}</span>
<div><div class="st-head"><input data-f="name" value="${esc(st.name)}" aria-label="Name">${flags}
${ib('up', 'st.up', '↑')}${ib('down', 'st.down', '↓')}${ib('dup', 'st.dup', '⧉')}${ib('custom', 'st.saveCustom', '☆')}${ib('del', 'st.delete', '✕')}</div>
<textarea data-f="task" rows="2" aria-label="Aufgabe">${esc(st.task)}</textarea>
<div class="st-meta">${len}<label>${esc(t('st.capacity'))} <input type="number" data-f="capacity" min="1" max="6" value="${st.capacity}"></label>${secs}</div></div></li>`;
  }).join('');
}

const markList = () => document.querySelectorAll('.st').forEach(li => li.classList.toggle('sel', +li.dataset.i === sel.st));

// --- actions
function addStation(entry) {
  change(() => {
    const at = sel.st != null ? sel.st + 1 : P.stations.length;
    P.stations.splice(at, 0, M.newStation(entry, getLang()));
    sel = { st: at };
  });
}

function addItem(type) {
  change(() => {
    const st = P.stations[sel.st], hall = M.hallOf(P);
    if (st) {
      const it = st.kind === 'lane' ? { type, u: st.length / 2, v: 1.5 } : { type, u: st.action.u - 1.5, v: st.action.v + 1.5 };
      st.items.push(it);
      sel.item = st.items.length - 1;
    } else {
      P.free.push({ type, x: hall.w / 2, y: hall.h / 2, rot: 0 });
      sel = { free: P.free.length - 1 };
    }
  });
}

function duplicate(i) {
  const c = M.duplicateStation(P, i);
  if (!c) return toast(t('dup.nofit'));
  change(() => { P.stations.push(c); sel = { st: P.stations.length - 1 }; });
}

function moveStation(from, to) {
  if (from === to || !P.stations[from] || !P.stations[to]) return;
  change(() => {
    const [s] = P.stations.splice(from, 1);
    P.stations.splice(to, 0, s);
    sel = { st: to };
  });
}

function deleteCorner(to, k) {
  change(() => {
    const v = M.viaOf(P, M.layout(P), to);
    v.splice(k, 1);
    M.setVia(P, to, v);
    sel = { route: to };
  });
}

function selAction(act) {
  if (sel.route != null) {
    if (act === 'viareset') change(() => { M.setVia(P, sel.route, undefined); sel = { route: sel.route }; });
    if ((act === 'viadel' || act === 'delete') && sel.vi != null) deleteCorner(sel.route, sel.vi);
    return;
  }
  const st = P.stations[sel.st];
  const item = sel.free != null ? P.free[sel.free] : st?.items[sel.item];
  if (!item && !st) return;
  if (act === 'dup') return st && duplicate(sel.st);
  change(() => {
    if (act === 'rotate' && item) item.rot = norm((item.rot || 0) + 90);
    else if (act === 'rotate') {
      const L = M.layout(P)[sel.st];
      if (!L.fits) return;
      const bx = stationBox(st, L);
      rotateStation(st, structuredClone(st), L, { x: (bx.x1 + bx.x2) / 2, y: (bx.y1 + bx.y2) / 2 }, 90);
    }
    if (act === 'delete') {
      if (sel.free != null) { P.free.splice(sel.free, 1); sel = {}; }
      else if (item) { st.items.splice(sel.item, 1); sel = { st: sel.st }; }
      else { P.stations.splice(sel.st, 1); sel = {}; }
    }
    if (act === 'unpin') st.pin = null;
  });
}

function stationAction(act, i) {
  const st = P.stations[i];
  if (act === 'custom') {
    const c = structuredClone(st);
    for (const k of ['pin', 'badge', 'approach', 'exitCtrl']) delete c[k];
    c.ref = 'custom-' + Date.now();
    custom.push(c);
    store.set('parcours.custom', custom);
    renderCatalog();
    toast(t('custom.saved'));
    return;
  }
  if (act === 'dup') return duplicate(i);
  if (act === 'up' || act === 'down') return moveStation(i, act === 'up' ? i - 1 : i + 1);
  if (act === 'del') change(() => { P.stations.splice(i, 1); sel = {}; });
}

function replace(next) {
  if (P.stations.length && !confirm(t('confirm.replace'))) return false;
  change(() => { P = next; sel = {}; });
  return true;
}

function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
const fileName = ext => (P.title || 'parcours').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').toLowerCase() + ext;

async function exportPNG() {
  const url = URL.createObjectURL(new Blob([pageSVG(P, t, measure, today()).svg], { type: 'image/svg+xml' }));
  const img = new Image();
  await new Promise((ok, fail) => { img.onload = ok; img.onerror = fail; img.src = url; });
  const c = document.createElement('canvas');
  c.width = 1588; c.height = 2246; // A4 at 2x of 96 dpi
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(url);
  c.toBlob(b => download(b, fileName('.png')));
}

const renderPrint = () => { $('print-area').innerHTML = pageSVG(P, t, measure, today()).svg; };

// --- moving things: shared by mouse dragging and the arrow keys
// d = { kind, st, i, k, c, p0, O (state before), lay (layout before) }; q = pointer, (dx, dy) = movement.
function applyMove(d, q, dx, dy, exact) {
  const { kind, st: s, i, O, lay } = d, L = lay[s], stO = O.stations[s], st = P.stations[s];
  const sn = exact ? r3 : M.snap;
  const local = (x, y) => { const l = M.toLocal(L.frame, x, y); return { u: r3(sn(l.u)), v: r3(sn(l.v)) }; };
  if (kind === 'free') Object.assign(P.free[i], { x: sn(O.free[i].x + dx), y: sn(O.free[i].y + dy) });
  if (kind === 'start') P.start = { x: sn(O.start.x + dx), y: sn(O.start.y + dy) };
  if (kind === 'item') {
    // moving any place's copy moves the base item, so all places stay identical
    const { du, dv } = M.spotOffsets(stO)[d.k] || { du: 0, dv: 0 };
    const o = stO.items[i], w = M.toWorld(L.frame, M.itemU(stO, o) + du, o.v + dv);
    const l = local(w.x + dx, w.y + dy), it = st.items[i];
    if (o.f != null && st.length) {
      it.f = r3((l.u - du) / st.length);
      st.manual = { ...st.manual, [o.type]: true }; // hand-placed row: resizing only stretches it
    } else it.u = r3(l.u - du);
    it.v = r3(l.v - dv);
  }
  if (kind === 'station' && st.kind === 'lane') {
    const x = sn(L.frame.x + dx), y = sn(L.frame.y + dy);
    // a click with a little jitter must not pin the station
    st.pin = x === L.frame.x && y === L.frame.y ? stO.pin : { x: r3(x), y: r3(y), rot: L.frame.rot };
  }
  if (kind === 'station' && st.kind === 'goal') {
    const dl = M.toLocal({ x: 0, y: 0, rot: L.frame.rot }, dx, dy), du = sn(dl.u), dv = sn(dl.v);
    const mv = (a, b) => { if (a) Object.assign(b, { u: r3(a.u + du), v: r3(a.v + dv) }); };
    mv(stO.action, st.action);
    stO.items.forEach((o, k) => mv(o, st.items[k]));
    mv(stO.approach, st.approach);
  }
  if (kind === 'badge') { const b = M.badges(O, lay)[s]; st.badge = { x: r3(sn(b.x + dx)), y: r3(sn(b.y + dy)) }; }
  if (kind === 'len' || kind === 'lenstart') {
    // relative to where the border was grabbed; the start border keeps the end in place (pins)
    const du = M.toLocal(L.frame, q.x, q.y).u - M.toLocal(L.frame, d.p0.x, d.p0.y).u;
    const spanO = M.span(stO), mult = spanO / stO.length;
    const len = M.clamp(M.snap((spanO + (kind === 'len' ? du : -du)) / mult), st.minLength, st.maxLength);
    M.resize(st, len);
    if (kind === 'lenstart') {
      const o = M.toWorld(L.frame, spanO - len * mult, 0);
      st.pin = len === stO.length ? stO.pin : { x: r3(o.x), y: r3(o.y), rot: L.frame.rot };
    }
    sel.item = undefined;
  }
  if (kind === 'via' || kind === 'viamid') {
    // the first move turns the automatic route into editable corners; "+" inserts a new corner
    const v = M.viaOf(O, lay, d.r), c = { x: r3(sn(q.x)), y: r3(sn(q.y)) };
    if (kind === 'viamid') v.splice(d.i, 0, c); else v[d.i] = c;
    M.setVia(P, d.r, v);
    sel = { route: d.r, vi: d.i };
  }
  if (kind === 'action') st.action = local(q.x, q.y);
  if (kind === 'approach' || kind === 'exitCtrl') st[kind] = local(q.x, q.y);
  if (kind.startsWith('rot')) {
    const c = d.c, a = Math.atan2(q.y - c.y, q.x - c.x) - Math.atan2(d.p0.y - c.y, d.p0.x - c.x);
    const th = Math.round(a * 180 / Math.PI / 15) * 15; // 15° steps
    if (kind === 'rotfree') P.free[i].rot = norm((O.free[i].rot || 0) + th);
    if (kind === 'rotitem') st.items[i].rot = norm((stO.items[i].rot || 0) + th);
    if (kind === 'rotst') rotateStation(st, stO, L, c, th);
  }
}

function nudge(dx, dy) {
  const kind = sel.free != null ? 'free' : sel.item != null ? 'item' : sel.st != null ? 'station' : null;
  if (!kind) return;
  begin();
  const O = JSON.parse(pending), lay = M.layout(O);
  if (kind !== 'free' && !lay[sel.st]?.fits) { pending = null; return; }
  applyMove({ kind, st: sel.st, i: kind === 'free' ? sel.free : sel.item, k: 0, O, lay }, null, dx, dy, true);
  commit();
  renderAll();
}

// --- court dragging
const svg = $('court');
let drag = null, lastDown = {};
const svgPt = e => { const q = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse()); return { x: q.x, y: q.y }; };

svg.addEventListener('pointerdown', e => {
  const el = e.target.closest('[data-drag]');
  if (!el) { sel = {}; renderCourt(); markList(); return; }
  let kind = el.dataset.drag;
  const st = el.dataset.st != null ? +el.dataset.st : null, i = el.dataset.i != null ? +el.dataset.i : null;
  // double-click on a corner deletes it (detected here: pointer capture sends dblclick to the svg)
  const key = `${kind}:${el.dataset.r}:${i}`, now = Date.now();
  if (kind === 'via' && lastDown.key === key && now - lastDown.at < 400) { lastDown = {}; return deleteCorner(+el.dataset.r, i); }
  lastDown = { key, at: now };
  if (kind === 'route' || kind === 'via' || kind === 'viamid') sel = { route: +el.dataset.r, vi: kind === 'via' ? i : undefined };
  else if (kind === 'free' || kind === 'rotfree') sel = { free: i };
  else if (kind === 'item' || kind === 'rotitem') sel = { st, item: i };
  else if (kind === 'start') sel = {};
  else if (kind === 'station' || kind === 'badge' || sel.st !== st) sel = { st };
  if (e.ctrlKey || e.metaKey) kind = { station: 'rotst', badge: 'rotst', item: 'rotitem', free: 'rotfree' }[kind] || kind;
  begin();
  const O = JSON.parse(pending), lay = M.layout(O);
  let c = null; // rotation centre
  if (kind === 'rotst') { const b = stationBox(O.stations[st], lay[st]); c = { x: (b.x1 + b.x2) / 2, y: (b.y1 + b.y2) / 2 }; }
  if (kind === 'rotitem') c = itemPlace(O.stations[st].items[i], O.stations[st], lay[st]);
  if (kind === 'rotfree') c = O.free[i];
  drag = { kind, st, i, r: +el.dataset.r, k: +(el.dataset.k || 0), c, p0: svgPt(e), O, lay, moved: false };
  svg.setPointerCapture(e.pointerId);
  renderCourt();
  markList();
});

svg.addEventListener('pointermove', e => {
  if (!drag) return;
  const q = svgPt(e), dx = q.x - drag.p0.x, dy = q.y - drag.p0.y;
  if (!drag.moved && Math.hypot(dx, dy) < 0.2) return;
  if (!drag.moved) { drag.moved = true; commit(); }
  applyMove(drag, q, dx, dy, e.altKey); // Alt: no 0.5 m grid
  renderCourt();
});

const endDrag = () => {
  if (!drag) return;
  const moved = drag.moved;
  drag = null;
  pending = null;
  if (moved) renderAll();
};
svg.addEventListener('pointerup', endDrag);

svg.addEventListener('pointercancel', endDrag);

// --- catalog, palette, selection bar
$('catalog').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.ref) addStation(CATALOG.find(c => c.ref === b.dataset.ref));
  if (b.dataset.custom) addStation(custom[+b.dataset.custom]);
  if (b.dataset.delcustom) {
    custom.splice(+b.dataset.delcustom, 1);
    store.set('parcours.custom', custom);
    renderCatalog();
  }
});
$('filter').addEventListener('change', renderCatalog);
$('palette').innerHTML = Object.keys(M.ITEM_TYPES).map(k => `<button data-type="${k}" data-i18n="item.${k}"></button>`).join('');
$('palette').addEventListener('click', e => { const b = e.target.closest('button'); if (b) addItem(b.dataset.type); });
$('selbar').addEventListener('click', e => { const b = e.target.closest('button'); if (b) selAction(b.dataset.sact); });
$('selbar').addEventListener('focusin', e => { if (e.target.dataset.size) begin(); });
$('selbar').addEventListener('input', e => {
  const k = e.target.dataset.size, v = parseFloat(e.target.value);
  const item = sel.free != null ? P.free[sel.free] : P.stations[sel.st]?.items[sel.item];
  if (!k || !item || !(v > 0)) return;
  commit();
  item[k] = M.clamp(v, 0.05, 10);
  renderCourt({ selbar: false });
});

$('btn-custom-export').addEventListener('click', () =>
  download(new Blob([JSON.stringify(custom, null, 2)], { type: 'application/json' }), 'eigene-stationen.json'));
$('custom-file').addEventListener('change', async e => {
  const f = e.target.files[0];
  e.target.value = '';
  if (!f) return;
  try {
    const list = M.validateStations(JSON.parse(await f.text())).filter(s => !custom.some(c => c.ref === s.ref));
    custom.push(...list);
    store.set('parcours.custom', custom);
    renderCatalog();
    toast(t('custom.imported', { n: list.length }));
  } catch { alert(t('err.customImport')); }
});

// --- station list
const list = $('stations');
list.addEventListener('focusin', e => { if (e.target.dataset.f) begin(); });
list.addEventListener('input', e => {
  const f = e.target.dataset.f, li = e.target.closest('li');
  if (!f || !li) return;
  commit();
  const st = P.stations[+li.dataset.i];
  if (f === 'name' || f === 'task') st[f] = e.target.value;
  if (f === 'capacity') st.capacity = M.clamp(parseInt(e.target.value, 10) || 1, 1, 6);
  if (f === 'secs') st.secs = M.clamp(parseInt(e.target.value, 10) || 1, 1, 120);
  if (f === 'length') {
    M.resize(st, M.clamp(+e.target.value, st.minLength, st.maxLength));
    sel.item = undefined;
    e.target.nextElementSibling.textContent = `${st.length} m`;
  }
  renderCourt();
});
list.addEventListener('change', e => { if (/length|capacity/.test(e.target.dataset.f)) renderStations(); }); // fit flags may change
list.addEventListener('click', e => {
  const li = e.target.closest('li[data-i]');
  if (!li) return;
  const b = e.target.closest('button[data-act]');
  if (b) return stationAction(b.dataset.act, +li.dataset.i);
  if (sel.st !== +li.dataset.i) { sel = { st: +li.dataset.i }; renderCourt(); markList(); }
});
// reorder by dragging the number badge
let dragFrom = null;
list.addEventListener('dragstart', e => {
  const li = e.target.closest('li[data-i]');
  if (!li || !e.target.classList?.contains('badge')) return;
  dragFrom = +li.dataset.i;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', li.dataset.i);
});
list.addEventListener('dragover', e => {
  const li = e.target.closest('li[data-i]');
  if (dragFrom == null || !li) return;
  e.preventDefault();
  list.querySelectorAll('.drop').forEach(x => x.classList.toggle('drop', x === li));
  li.classList.add('drop');
});
list.addEventListener('drop', e => {
  const li = e.target.closest('li[data-i]');
  e.preventDefault();
  if (dragFrom != null && li) moveStation(dragFrom, +li.dataset.i);
  dragFrom = null;
});
list.addEventListener('dragend', () => { dragFrom = null; list.querySelectorAll('.drop').forEach(x => x.classList.remove('drop')); });

// --- group, hall, mode, notes, stock
for (const id of ['title', 'group', 'children', 'interval', 'rotation', 'notes']) {
  $(id).addEventListener('focus', begin);
  $(id).addEventListener('input', e => {
    commit();
    const v = e.target.value;
    P[id] = ['children', 'interval', 'rotation'].includes(id) ? M.clamp(parseInt(v, 10) || 1, 1, 99) : v;
    renderCourt();
  });
}
function setHall(hall) { change(() => { P.hall = hall; P.start = M.startPoint(hall); }); }
$('hall').addEventListener('change', e => {
  const v = e.target.value, cur = M.hallOf(P);
  setHall(M.HALLS[v] || { id: 'custom', w: cur.w, h: cur.h, goals: 'both' });
});
for (const id of ['hall-w', 'hall-h']) $(id).addEventListener('change', () => {
  const w = M.clamp(+$('hall-w').value || 40, 12, 60), h = M.clamp(+$('hall-h').value || 20, 10, 40);
  setHall({ id: 'custom', w, h, goals: 'both' });
});
$('mode').addEventListener('change', e => change(() => { P.mode = e.target.value; P.rotation ??= 3; }));
$('stock').addEventListener('input', e => {
  const k = e.target.dataset.stock;
  if (!k) return;
  const v = parseInt(e.target.value, 10);
  if (Number.isFinite(v)) stock[k] = Math.max(0, v); else delete stock[k];
  store.set('parcours.stock', stock);
  renderSide();
});

// --- toolbar
$('btn-new').addEventListener('click', () => replace(M.emptyParcours()));
$('tpl').addEventListener('change', e => {
  const def = PRESETS.find(d => d.id === e.target.value);
  e.target.value = '';
  if (!def) return;
  const next = buildPreset(def, getLang()); // keep the hall and the format that are set
  Object.assign(next, { hall: M.hallOf(P), start: M.startPoint(M.hallOf(P)), mode: P.mode ?? 'parcours', rotation: P.rotation ?? 3 });
  replace(next);
});
$('file').addEventListener('change', async e => {
  const f = e.target.files[0];
  e.target.value = '';
  if (!f) return;
  try { replace(M.validate(JSON.parse(await f.text()))); } catch { alert(t('err.import')); }
});
$('btn-export').addEventListener('click', () => download(new Blob([JSON.stringify(P, null, 2)], { type: 'application/json' }), fileName('.json')));
$('btn-png').addEventListener('click', exportPNG);
$('btn-print').addEventListener('click', () => { renderPrint(); window.print(); });
window.addEventListener('beforeprint', renderPrint);
$('btn-undo').addEventListener('click', () => restore(undo, redo));
$('btn-redo').addEventListener('click', () => restore(redo, undo));
$('lang').addEventListener('change', e => { setLang(e.target.value); renderAll(); });
$('btn-help').addEventListener('click', () => $('help').showModal());

// share link: the whole parcours in the URL
$('btn-share').addEventListener('click', async () => {
  const url = `${location.origin}${location.pathname}#p=${await M.encodeShare(P)}`;
  if (navigator.share && matchMedia('(pointer: coarse)').matches) {
    try { await navigator.share({ title: P.title || t('untitled'), url }); return; } catch { /* cancelled: copy instead */ }
  }
  try { await navigator.clipboard.writeText(url); toast(t('share.copied')); } catch { prompt(t('share.copy'), url); }
});
async function openShared() {
  if (!location.hash.startsWith('#p=')) return;
  try {
    const shared = await M.decodeShare(location.hash.slice(3));
    begin(); // the previous draft stays reachable with undo
    P = shared;
    commit();
    sel = {};
    renderAll();
    toast(t('share.loaded'));
  } catch { toast(t('share.bad')); }
  history.replaceState(null, '', location.pathname + location.search);
}
window.addEventListener('hashchange', openShared);

// my parcours (saved in this browser)
function renderSaved() {
  $('saved-list').innerHTML = saved.length ? saved.map((s, k) => `<li><div><strong>${esc(s.title || t('untitled'))}</strong>`
    + `<span class="muted">${esc(new Date(s.at).toLocaleString(locale()))} · ${s.data.stations.length} ${esc(t('st.heading'))}</span></div>`
    + `<button data-open="${k}">${esc(t('saved.open'))}</button><button data-del="${k}" aria-label="${esc(t('saved.delete'))}" title="${esc(t('saved.delete'))}">✕</button></li>`).join('')
    : `<li class="muted">${esc(t('saved.empty'))}</li>`;
}
$('btn-saved').addEventListener('click', () => { renderSaved(); $('saved').showModal(); });
$('btn-save-current').addEventListener('click', () => {
  P.id ??= Date.now().toString(36);
  saved = [{ id: P.id, title: P.title, at: Date.now(), data: structuredClone(P) }, ...saved.filter(s => s.id !== P.id)];
  store.set('parcours.saved', saved);
  renderSaved();
  toast(t('saved.done'));
});
$('saved-list').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.open != null) {
    try { if (replace(M.validate(structuredClone(saved[+b.dataset.open].data)))) $('saved').close(); } catch { alert(t('err.import')); }
  }
  if (b.dataset.del != null && confirm(t('saved.confirmDelete'))) {
    saved.splice(+b.dataset.del, 1);
    store.set('parcours.saved', saved);
    renderSaved();
  }
});

// set-up checklist (phone friendly)
$('btn-setup').addEventListener('click', () => {
  const mat = list => list.map(m => `${m.n} × ${esc(t('item.' + m.type))}`).join(', ') || esc(t('setup.none'));
  $('setup-list').innerHTML = P.stations.map((st, i) => `<li><label><input type="checkbox"><span class="badge">${i + 1}</span>`
    + `<span><strong>${esc(st.name)}</strong><span class="muted">${mat(M.stationMaterial(st))}</span></span></label></li>`).join('')
    + (P.free.length ? `<li><label><input type="checkbox"><span class="badge">+</span><span><strong>${esc(t('setup.free'))}</strong>`
      + `<span class="muted">${mat(M.material({ free: P.free, stations: [] }))}</span></span></label></li>` : '');
  $('setup').showModal();
});

// circuit timer
const timer = { round: 1, left: 0, id: null };
const groupsNow = () => Math.max(1, M.circuit(P, M.layout(P)).groups);
function beep() {
  try {
    const ac = new AudioContext();
    [0, 0.5].forEach(at => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.frequency.value = 880;
      o.connect(g).connect(ac.destination);
      g.gain.setValueAtTime(0.3, ac.currentTime + at);
      o.start(ac.currentTime + at);
      o.stop(ac.currentTime + at + 0.35);
    });
  } catch { /* no audio */ }
}
function renderTimer() {
  $('timer-round').textContent = t('timer.round', { r: timer.round, n: groupsNow() });
  $('timer-clock').textContent = `${Math.floor(timer.left / 60)}:${String(timer.left % 60).padStart(2, '0')}`;
  $('timer-next').textContent = t('timer.next');
  $('timer-start').textContent = t(timer.id ? 'timer.pause' : 'timer.start');
}
function timerNext() {
  if (timer.round < groupsNow()) { timer.round++; timer.left = (P.rotation || 3) * 60; } else { stopTimer(); timer.left = 0; }
}
function stopTimer() { clearInterval(timer.id); timer.id = null; }
function resetTimer() { stopTimer(); timer.round = 1; timer.left = (P.rotation || 3) * 60; renderTimer(); }
$('btn-timer').addEventListener('click', () => { if (!timer.id && !timer.left) resetTimer(); renderTimer(); $('timer').showModal(); });
$('timer-start').addEventListener('click', () => {
  if (timer.id) stopTimer();
  else {
    if (!timer.left) resetTimer();
    timer.id = setInterval(() => {
      timer.left--;
      if (timer.left <= 0) { beep(); timerNext(); }
      renderTimer();
    }, 1000);
  }
  renderTimer();
});
$('timer-skip').addEventListener('click', () => { timerNext(); renderTimer(); });
$('timer-reset').addEventListener('click', resetTimer);

// --- keyboard
document.addEventListener('keydown', e => {
  if (document.querySelector('dialog[open]')) return; // dialogs handle Esc themselves; keep the editor still behind them
  const typing = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
  const mod = e.ctrlKey || e.metaKey, key = e.key.toLowerCase();
  const arrows = { arrowleft: [-1, 0], arrowright: [1, 0], arrowup: [0, -1], arrowdown: [0, 1] };
  if (mod && !typing && key === 'z') { e.preventDefault(); e.shiftKey ? restore(redo, undo) : restore(undo, redo); }
  else if (mod && !typing && key === 'y') { e.preventDefault(); restore(redo, undo); }
  else if (mod && !typing && key === 'd') { e.preventDefault(); if (sel.st != null && sel.item == null) duplicate(sel.st); }
  else if (typing || mod) return;
  else if (arrows[key] && (sel.st != null || sel.free != null)) {
    e.preventDefault();
    const step = e.shiftKey ? 0.1 : 0.5, [x, y] = arrows[key];
    nudge(x * step, y * step);
  }
  else if (e.key === 'Delete' || e.key === 'Backspace') selAction('delete');
  else if (key === 'r') selAction('rotate');
  else if (e.key === 'Escape') { sel = {}; renderCourt(); markList(); }
  else if (e.key === '?') $('help').showModal();
});

$('lang').value = getLang();
setLang(getLang());
renderAll();
openShared();
