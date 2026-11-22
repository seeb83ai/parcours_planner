import { t, setLang, getLang } from './i18n.js';
import { CATALOG } from './stations.js';
import * as M from './model.js';
import { courtInner, pageSVG, esc, badgePos, stationBox, itemPlace } from './court.js';

const $ = id => document.getElementById(id);
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode: no autosave */ } },
};
const ctx = document.createElement('canvas').getContext('2d');
const measure = (s, size) => { ctx.font = `${size * 10}px Arial, Helvetica, sans-serif`; return ctx.measureText(s).width / 10; };
const today = () => new Date().toLocaleDateString(getLang() === 'de' ? 'de-DE' : 'en-GB');

let P = (() => { try { return M.validate(store.get('parcours.draft')); } catch { return M.emptyParcours(); } })();
let sel = {};
let custom = store.get('parcours.custom') || [];

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
function renderCourt() {
  $('court').innerHTML = courtInner(P, { id: 'ed', t, edit: true, sel });
  renderSelbar();
  renderSide();
  store.set('parcours.draft', P);
}

function renderAll() {
  $('title').value = P.title;
  $('group').value = P.group;
  $('children').value = P.children;
  $('interval').value = P.interval;
  renderCatalog();
  renderStations();
  renderCourt();
}

function renderSide() {
  const lay = M.layout(P), hints = [];
  const secs = (P.children - 1) * P.interval;
  hints.push(['', t('hint.starts', { n: P.children, s: P.interval, t: `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')} min` })]);
  const named = f => P.stations.map((s, i) => (f(s, i) ? `${i + 1} ${s.name}` : null)).filter(Boolean).join(', ');
  const single = named(s => s.capacity <= 1 && !s.flow), nofit = named((s, i) => !lay[i].fits);
  if (single) hints.push(['warn', t('hint.single', { list: single })]);
  if (nofit) hints.push(['warn', t('hint.nofit', { list: nofit })]);
  if (pageSVG(P, t, measure, today()).overflow) hints.push(['warn', t('hint.overflow')]);
  if (hints.length === 1) hints.push(['', t('hint.ok')]);
  $('hints').innerHTML = hints.map(([c, s]) => `<li class="${c}">${esc(s)}</li>`).join('');
  $('material').innerHTML = M.material(P).map(m => `<li>${m.n} × ${esc(t('item.' + m.type))}</li>`).join('');
  $('palette-hint').textContent = sel.st != null ? t('palette.toStation', { n: sel.st + 1 }) : t('palette.free');
}

function renderSelbar() {
  const b = (act, key) => `<button data-sact="${act}">${esc(t(key))}</button>`;
  let h;
  const hint = `<span>${esc(t('sel.keys'))}</span>`;
  if (sel.free != null && P.free[sel.free]) h = `${esc(t('sel.item'))}: ${esc(t('item.' + P.free[sel.free].type))} ${b('rotate', 'sel.rotate')} ${b('delete', 'sel.delete')} ${hint}`;
  else if (sel.st != null && P.stations[sel.st]) {
    const st = P.stations[sel.st];
    h = `<strong>${sel.st + 1} ${esc(st.name)}</strong>`;
    if (sel.item != null && st.items[sel.item]) h += ` – ${esc(t('item.' + st.items[sel.item].type))} ${b('rotate', 'sel.rotate')} ${b('delete', 'sel.delete')}`;
    else h += ` ${b('rotate', 'st.rotate')} ${b('delete', 'st.delete')}`;
    if (st.pin) h += ` ${b('unpin', 'st.unpin')}`;
    h += ` ${hint}`;
  } else h = esc(t('sel.none'));
  $('selbar').innerHTML = h;
}

function renderCatalog() {
  const q = $('filter').value.trim().toLowerCase(), lang = getLang();
  const name = e => (typeof e.name === 'string' ? e.name : e.name[lang] ?? e.name.de);
  const row = (e, attr, del = '') => `<div class="cat-item"><button class="add" ${attr}>${esc(name(e))}</button>`
    + `<span class="meta">${e.kind === 'lane' ? `${e.length} m` : ''}</span>${del}</div>`;
  const match = e => !q || name(e).toLowerCase().includes(q);
  let h = '';
  const mine = custom.map((e, k) => [e, k]).filter(([e]) => match(e));
  if (mine.length) h += `<div class="cat-group">${esc(t('side.custom'))}</div>`
    + mine.map(([e, k]) => row(e, `data-custom="${k}"`, `<button data-delcustom="${k}" title="${esc(t('custom.delete'))}" aria-label="${esc(t('custom.delete'))}">✕</button>`)).join('');
  const groups = {};
  for (const e of CATALOG.filter(match)) (groups[e.kind === 'goal' ? 'goal' : e.skill] ??= []).push(e);
  for (const [g, list] of Object.entries(groups))
    h += `<div class="cat-group">${esc(t('skill.' + g))}</div>` + list.map(e => row(e, `data-ref="${e.ref}"`)).join('');
  $('catalog').innerHTML = h;
}

function renderStations() {
  const lay = M.layout(P);
  if (!P.stations.length) { $('stations').innerHTML = `<li class="muted">${esc(t('st.empty'))}</li>`; return; }
  $('stations').innerHTML = P.stations.map((st, i) => {
    const L = lay[i], ib = (act, key, sym) => `<button data-act="${act}" title="${esc(t(key))}" aria-label="${esc(t(key))}">${sym}</button>`;
    const flags = [st.kind === 'goal' && `<span class="flag">${esc(t('st.goal'))}</span>`,
      st.pin && `<span class="flag">${esc(t('st.pinned'))}</span>`,
      !L.fits && `<span class="flag warn">${esc(t('st.nofit'))}</span>`].filter(Boolean).join('');
    const len = st.kind === 'lane' && st.maxLength > st.minLength
      ? `<label>${esc(t('st.length'))} <input type="range" data-f="length" min="${st.minLength}" max="${st.maxLength}" step="0.5" value="${st.length}"><output>${st.length} m</output></label>` : '';
    return `<li class="st${sel.st === i ? ' sel' : ''}${L.fits ? '' : ' bad'}" data-i="${i}">
<span class="badge">${i + 1}</span>
<div><div class="st-head"><input data-f="name" value="${esc(st.name)}" aria-label="Name">${flags}
${ib('up', 'st.up', '↑')}${ib('down', 'st.down', '↓')}${ib('custom', 'st.saveCustom', '☆')}${ib('del', 'st.delete', '✕')}</div>
<textarea data-f="task" rows="2" aria-label="Aufgabe">${esc(st.task)}</textarea>
<div class="st-meta">${len}<label>${esc(t('st.capacity'))} <input type="number" data-f="capacity" min="1" max="6" value="${st.capacity}"></label></div></div></li>`;
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
    const st = P.stations[sel.st];
    if (st) {
      const it = st.kind === 'lane' ? { type, u: st.length / 2, v: 1.5 } : { type, u: st.action.u - 1.5, v: st.action.v + 1.5 };
      st.items.push(it);
      sel.item = st.items.length - 1;
    } else {
      P.free.push({ type, x: 20, y: 10, rot: 0 });
      sel = { free: P.free.length - 1 };
    }
  });
}

function selAction(act) {
  const st = P.stations[sel.st];
  const item = sel.free != null ? P.free[sel.free] : st?.items[sel.item];
  if (act === 'rotate' && !item && !st) return;
  if (act === 'delete' && !item && !st) return;
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
    $('selbar').textContent = t('custom.saved');
    return;
  }
  change(() => {
    const j = act === 'up' ? i - 1 : i + 1;
    if ((act === 'up' || act === 'down') && P.stations[j]) {
      [P.stations[i], P.stations[j]] = [P.stations[j], P.stations[i]];
      sel = { st: j };
    }
    if (act === 'del') { P.stations.splice(i, 1); sel = {}; }
  });
}

function replace(next) {
  if (P.stations.length && !confirm(t('confirm.replace'))) return;
  change(() => { P = next; sel = {}; });
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

// --- court dragging
const svg = $('court');
let drag = null;
const svgPt = e => { const q = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse()); return { x: q.x, y: q.y }; };

svg.addEventListener('pointerdown', e => {
  const el = e.target.closest('[data-drag]');
  if (!el) { sel = {}; renderCourt(); markList(); return; }
  let kind = el.dataset.drag;
  const st = el.dataset.st != null ? +el.dataset.st : null, i = el.dataset.i != null ? +el.dataset.i : null;
  if (kind === 'free' || kind === 'rotfree') sel = { free: i };
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
  drag = { kind, st, i, k: +(el.dataset.k || 0), c, p0: svgPt(e), O, lay, moved: false };
  svg.setPointerCapture(e.pointerId);
  renderCourt();
  markList();
});

svg.addEventListener('pointermove', e => {
  if (!drag) return;
  const q = svgPt(e), dx = q.x - drag.p0.x, dy = q.y - drag.p0.y;
  if (!drag.moved && Math.hypot(dx, dy) < 0.2) return;
  if (!drag.moved) { drag.moved = true; commit(); }
  const { kind, st: s, i, O, lay } = drag, L = lay[s], stO = O.stations[s], st = P.stations[s];
  const local = (x, y) => { const l = M.toLocal(L.frame, x, y); return { u: r3(M.snap(l.u)), v: r3(M.snap(l.v)) }; };
  if (kind === 'free') Object.assign(P.free[i], { x: M.snap(O.free[i].x + dx), y: M.snap(O.free[i].y + dy) });
  if (kind === 'start') P.start = { x: M.snap(O.start.x + dx), y: M.snap(O.start.y + dy) };
  if (kind === 'item') {
    // dragging any place's copy moves the base item, so all places stay identical
    const { du, dv } = M.spotOffsets(stO)[drag.k] || { du: 0, dv: 0 };
    const o = stO.items[i], w = M.toWorld(L.frame, M.itemU(stO, o) + du, o.v + dv);
    const l = local(w.x + dx, w.y + dy), it = st.items[i];
    if (o.f != null && st.length) it.f = r3((l.u - du) / st.length); else it.u = r3(l.u - du);
    it.v = r3(l.v - dv);
  }
  if (kind === 'station' && st.kind === 'lane') st.pin = { x: M.snap(L.frame.x + dx), y: M.snap(L.frame.y + dy), rot: L.frame.rot };
  if (kind === 'station' && st.kind === 'goal') {
    const d = M.toLocal({ x: 0, y: 0, rot: L.frame.rot }, dx, dy), du = M.snap(d.u), dv = M.snap(d.v);
    const mv = (a, b) => { if (a) Object.assign(b, { u: r3(a.u + du), v: r3(a.v + dv) }); };
    mv(stO.action, st.action);
    stO.items.forEach((o, k) => mv(o, st.items[k]));
    mv(stO.approach, st.approach);
  }
  if (kind === 'badge') { const b = badgePos(stO, L); st.badge = { x: M.snap(b.x + dx), y: M.snap(b.y + dy) }; }
  if (kind === 'len') st.length = M.clamp(M.snap(M.toLocal(L.frame, q.x, q.y).u * st.length / M.span(st)), st.minLength, st.maxLength);
  if (kind === 'action') st.action = local(q.x, q.y);
  if (kind === 'approach' || kind === 'exitCtrl') st[kind] = local(q.x, q.y);
  if (kind.startsWith('rot')) {
    const c = drag.c, a = Math.atan2(q.y - c.y, q.x - c.x) - Math.atan2(drag.p0.y - c.y, drag.p0.x - c.x);
    const th = Math.round(a * 180 / Math.PI / 15) * 15; // ponytail: 15° steps, free angle if anyone asks
    if (kind === 'rotfree') P.free[i].rot = norm((O.free[i].rot || 0) + th);
    if (kind === 'rotitem') st.items[i].rot = norm((stO.items[i].rot || 0) + th);
    if (kind === 'rotst') rotateStation(st, stO, L, c, th);
  }
  renderCourt();
});

const { norm, rotateStation, r3 } = M;

const endDrag = () => {
  if (!drag) return;
  const moved = drag.moved;
  drag = null;
  pending = null;
  if (moved) renderAll();
};
svg.addEventListener('pointerup', endDrag);
svg.addEventListener('pointercancel', endDrag);

// --- UI events
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
$('filter').addEventListener('input', renderCatalog);
$('palette').innerHTML = Object.keys(M.ITEM_TYPES).map(k => `<button data-type="${k}" data-i18n="item.${k}"></button>`).join('');
$('palette').addEventListener('click', e => { const b = e.target.closest('button'); if (b) addItem(b.dataset.type); });
$('selbar').addEventListener('click', e => { const b = e.target.closest('button'); if (b) selAction(b.dataset.sact); });

const list = $('stations');
list.addEventListener('focusin', e => { if (e.target.dataset.f) begin(); });
list.addEventListener('input', e => {
  const f = e.target.dataset.f, li = e.target.closest('li');
  if (!f || !li) return;
  commit();
  const st = P.stations[+li.dataset.i];
  if (f === 'name' || f === 'task') st[f] = e.target.value;
  if (f === 'capacity') st.capacity = M.clamp(parseInt(e.target.value, 10) || 1, 1, 6);
  if (f === 'length') {
    st.length = M.clamp(+e.target.value, st.minLength, st.maxLength);
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

for (const id of ['title', 'group', 'children', 'interval']) {
  $(id).addEventListener('focus', begin);
  $(id).addEventListener('input', e => {
    commit();
    const v = e.target.value;
    P[id] = id === 'children' || id === 'interval' ? M.clamp(parseInt(v, 10) || 1, 1, 99) : v;
    renderCourt();
  });
}

$('btn-new').addEventListener('click', () => replace(M.emptyParcours()));
$('tpl').addEventListener('change', async e => {
  const v = e.target.value;
  e.target.value = '';
  if (!v) return;
  const res = await fetch(`templates/${v}.json`);
  replace(M.validate(await res.json()));
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

document.addEventListener('keydown', e => {
  if ($('help').open) return; // the dialog handles Esc itself; keep the editor still behind it
  const typing = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
  const mod = e.ctrlKey || e.metaKey;
  if (mod && !typing && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? restore(redo, undo) : restore(undo, redo); }
  else if (mod && !typing && e.key.toLowerCase() === 'y') { e.preventDefault(); restore(redo, undo); }
  else if (typing || mod) return;
  else if (e.key === 'Delete' || e.key === 'Backspace') selAction('delete');
  else if (e.key === 'r') selAction('rotate');
  else if (e.key === 'Escape') { sel = {}; renderCourt(); markList(); }
  else if (e.key === '?') $('help').showModal();
});

$('lang').value = getLang();
setLang(getLang());
renderAll();
