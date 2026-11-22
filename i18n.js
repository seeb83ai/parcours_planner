const DICT = {
  de: {
    'app.title': 'Parcours-Planer', untitled: 'Parcours ohne Titel', start: 'Start / Ziel', children: 'Kinder', material: 'Material',
    'tb.new': 'Neu', 'tb.template': 'Vorlage laden …', 'tb.import': 'Importieren', 'tb.export': 'JSON speichern',
    'tb.png': 'PNG', 'tb.print': 'Drucken', 'tb.undo': 'Rückgängig', 'tb.redo': 'Wiederholen',
    'tpl.parcours1': 'Bewegungs-Parcours', 'tpl.parcours2': 'Ball-Parcours F-Jugend',
    'side.catalog': 'Stationen', 'side.filter': 'Suchen …', 'side.palette': 'Material hinzufügen', 'side.settings': 'Gruppe',
    'side.hints': 'Hinweise', 'side.material': 'Materialliste', 'side.custom': 'Eigene Stationen',
    'palette.toStation': 'Wird zu Station {n} hinzugefügt.', 'palette.free': 'Keine Station ausgewählt: freies Material.',
    'f.title': 'Titel', 'f.group': 'Gruppe', 'f.children': 'Anzahl Kinder', 'f.interval': 'Start-Intervall (s)',
    'st.heading': 'Stationen', 'st.empty': 'Noch keine Station. Links eine Station wählen – sie wird im Uhrzeigersinn angehängt.',
    'st.length': 'Länge', 'st.capacity': 'Plätze', 'st.pinned': 'frei verschoben', 'st.nofit': 'passt nicht mehr',
    'st.goal': 'Torstation', 'st.up': 'Nach oben', 'st.down': 'Nach unten', 'st.delete': 'Station löschen',
    'st.saveCustom': 'Als eigene Station speichern', 'st.unpin': 'An Bahn ausrichten', 'st.rotate': '90° drehen',
    'sel.item': 'Material', 'sel.rotate': 'Drehen', 'sel.delete': 'Löschen', 'sel.none': 'Station oder Material anklicken zum Bearbeiten. Ziehen zum Verschieben.',
    'handle.length': 'Ziehen: Länge ändern', 'handle.curve': 'Ziehen: Laufweg biegen', 'handle.rotate': 'Ziehen: drehen',
    'sel.keys': 'Entf: löschen · R: 90° drehen · Strg+Ziehen oder ↻: frei drehen',
    'hint.starts': '{n} Kinder, Start alle {s} s: das letzte Kind startet nach {t}.',
    'hint.single': 'Nur 1 Platz (Stau-Gefahr): {list}.', 'hint.nofit': 'Passt nicht mehr auf die Bahn: {list}.',
    'hint.overflow': 'Text zu lang für eine Druckseite.', 'hint.ok': 'Keine Probleme gefunden.',
    'confirm.replace': 'Den aktuellen Parcours ersetzen?', 'err.import': 'Die Datei ist kein gültiger Parcours (schemaVersion 2).',
    'custom.saved': 'Gespeichert unter „Eigene Stationen“.', 'custom.delete': 'Eigene Station löschen',
    'skill.dribbling': 'Prellen', 'skill.ballFeeling': 'Ballgefühl', 'skill.passing': 'Passen', 'skill.throwing': 'Werfen',
    'skill.defence': 'Abwehr', 'skill.movement': 'Bewegung', 'skill.other': 'Sonstiges', 'skill.goal': 'Torstationen',
    'item.cone': 'Hütchen', 'item.hoop': 'Reifen', 'item.disc': 'Markierungsteller', 'item.helper': 'Helfer',
    'item.bench': 'Bank', 'item.kastendeckel': 'Kastendeckel', 'item.mat': 'Matte', 'item.weichboden': 'Weichboden',
    'item.ballbox': 'Ballkiste', 'item.minigoal': 'Mini-Tor', 'item.balls': 'Bälle',
    'item.kasten': 'Kasten', 'item.hurdle': 'Minihürde', 'item.ladder': 'Koordinationsleiter', 'item.rope': 'Zauberschnur', 'item.tunnel': 'Kriechtunnel',
  },
  en: {
    'app.title': 'Parcours Planner', untitled: 'Untitled parcours', start: 'Start / Finish', children: 'children', material: 'Equipment',
    'tb.new': 'New', 'tb.template': 'Load template …', 'tb.import': 'Import', 'tb.export': 'Save JSON',
    'tb.png': 'PNG', 'tb.print': 'Print', 'tb.undo': 'Undo', 'tb.redo': 'Redo',
    'tpl.parcours1': 'Movement parcours', 'tpl.parcours2': 'Ball parcours U9',
    'side.catalog': 'Stations', 'side.filter': 'Search …', 'side.palette': 'Add equipment', 'side.settings': 'Group',
    'side.hints': 'Hints', 'side.material': 'Equipment list', 'side.custom': 'My stations',
    'palette.toStation': 'Will be added to station {n}.', 'palette.free': 'No station selected: free equipment.',
    'f.title': 'Title', 'f.group': 'Group', 'f.children': 'Number of children', 'f.interval': 'Start interval (s)',
    'st.heading': 'Stations', 'st.empty': 'No station yet. Pick a station on the left – it is appended clockwise.',
    'st.length': 'Length', 'st.capacity': 'Spots', 'st.pinned': 'moved freely', 'st.nofit': 'does not fit',
    'st.goal': 'Goal station', 'st.up': 'Move up', 'st.down': 'Move down', 'st.delete': 'Delete station',
    'st.saveCustom': 'Save as my station', 'st.unpin': 'Snap back to lane', 'st.rotate': 'Rotate 90°',
    'sel.item': 'Equipment', 'sel.rotate': 'Rotate', 'sel.delete': 'Delete', 'sel.none': 'Click a station or equipment to edit it. Drag to move.',
    'handle.length': 'Drag: change length', 'handle.curve': 'Drag: bend the run', 'handle.rotate': 'Drag: rotate',
    'sel.keys': 'Del: delete · R: rotate 90° · Ctrl+drag or ↻: rotate freely',
    'hint.starts': '{n} children, one start every {s} s: the last child starts after {t}.',
    'hint.single': 'Only 1 spot (queue risk): {list}.', 'hint.nofit': 'No room left on the lane: {list}.',
    'hint.overflow': 'Text too long for one printed page.', 'hint.ok': 'No problems found.',
    'confirm.replace': 'Replace the current parcours?', 'err.import': 'This file is not a valid parcours (schemaVersion 2).',
    'custom.saved': 'Saved under “My stations”.', 'custom.delete': 'Delete my station',
    'skill.dribbling': 'Dribbling', 'skill.ballFeeling': 'Ball feeling', 'skill.passing': 'Passing', 'skill.throwing': 'Throwing',
    'skill.defence': 'Defence', 'skill.movement': 'Movement', 'skill.other': 'Other', 'skill.goal': 'Goal stations',
    'item.cone': 'Cone', 'item.hoop': 'Hoop', 'item.disc': 'Marker disc', 'item.helper': 'Helper',
    'item.bench': 'Bench', 'item.kastendeckel': 'Box top', 'item.mat': 'Mat', 'item.weichboden': 'Crash mat',
    'item.ballbox': 'Ball box', 'item.minigoal': 'Mini goal', 'item.balls': 'Balls',
    'item.kasten': 'Vaulting box', 'item.hurdle': 'Mini hurdle', 'item.ladder': 'Agility ladder', 'item.rope': 'Rope', 'item.tunnel': 'Crawl tunnel',
  },
};

let lang = 'de';
try { lang = localStorage.getItem('parcours.lang') || (navigator.language.startsWith('de') ? 'de' : 'en'); } catch {}
if (!DICT[lang]) lang = 'de';

export const getLang = () => lang;
export function setLang(l) {
  lang = DICT[l] ? l : 'de';
  try { localStorage.setItem('parcours.lang', lang); } catch {}
  document.documentElement.lang = lang;
  applyStatic();
}
export const t = (key, vars = {}) =>
  (DICT[lang][key] ?? DICT.de[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');

export function applyStatic(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  root.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); el.setAttribute('aria-label', el.title); });
}
