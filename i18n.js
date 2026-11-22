const DICT = {
  de: {
    'tb.help': 'Hilfe', 'help.close': 'Schließen', 'help.title': 'So funktioniert der Parcours-Planer', 'help.keys': 'Tastenkürzel',
    'help.build.h': 'Aufbauen', 'help.build': 'Links eine Station anklicken. Sie kommt im Uhrzeigersinn hinter die ausgewählte Station auf die Bahn (2,5 m von der Wand). Torstationen kommen vor das nächste freie Tor.',
    'help.edit.h': 'Bearbeiten', 'help.edit': 'Station oder Material anklicken, dann ziehen zum Verschieben. Eine verschobene Station löst sich von der Bahn – „An Bahn ausrichten“ setzt sie zurück. Balken am Anfang oder Ende ziehen: Länge ändern – Hütchen, Reifen und Hürden werden passend mehr oder weniger. ↻-Griff: drehen. Runde Griffe an Torstationen biegen den Laufweg.',
    'help.material.h': 'Material', 'help.material': 'Ist eine Station ausgewählt, gehört neues Material zu ihr und wandert mit. Ohne Auswahl wird es frei platziert.',
    'help.places.h': 'Plätze', 'help.places': 'Mehr Plätze wiederholen den Aufbau nebeneinander oder hintereinander. Die Materialliste zählt mit.',
    'help.texts.h': 'Texte', 'help.texts': 'Name, Aufgabe, Länge und Plätze unter dem Spielfeld ändern. ☆ speichert die Station unter „Eigene Stationen“.',
    'help.share.h': 'Teilen', 'help.share': '„PNG“ und „Drucken“ erzeugen eine A4-Seite mit Plan, Aufgaben und Material. „JSON speichern“ und „Importieren“ für Dateien. Der aktuelle Entwurf bleibt im Browser gespeichert.',
    'help.key.del': 'Entf', 'help.key.del.d': 'Ausgewähltes Material oder die ganze Station löschen',
    'help.key.r': 'R', 'help.key.r.d': 'Auswahl um 90° drehen',
    'help.key.ctrl': 'Strg + Ziehen', 'help.key.ctrl.d': 'Frei drehen in 15°-Schritten (Mac: Cmd)',
    'help.key.undo': 'Strg + Z / Strg + Y', 'help.key.undo.d': 'Rückgängig / Wiederholen',
    'help.key.esc': 'Esc', 'help.key.esc.d': 'Auswahl aufheben, Hilfe schließen',
    'help.key.help': '?', 'help.key.help.d': 'Diese Hilfe öffnen',
    'app.title': 'Parcours-Planer', untitled: 'Parcours ohne Titel', start: 'Start / Ziel', children: 'Kinder', material: 'Material',
    'tb.new': 'Neu', 'tb.template': 'Vorlage laden …', 'tb.import': 'Importieren', 'tb.export': 'JSON speichern',
    'tb.png': 'PNG', 'tb.print': 'Drucken', 'tb.undo': 'Rückgängig', 'tb.redo': 'Wiederholen',
    'side.catalog': 'Stationen', 'side.filter': 'Suchen …', 'side.palette': 'Material hinzufügen', 'side.settings': 'Gruppe',
    'side.hints': 'Hinweise', 'side.material': 'Materialliste', 'side.custom': 'Eigene Stationen',
    'palette.toStation': 'Wird zu Station {n} hinzugefügt.', 'palette.free': 'Keine Station ausgewählt: freies Material.',
    'f.title': 'Titel', 'f.group': 'Gruppe', 'f.children': 'Anzahl Kinder', 'f.interval': 'Start-Intervall (s)',
    'st.heading': 'Stationen', 'st.empty': 'Noch keine Station. Links eine Station wählen – sie wird im Uhrzeigersinn angehängt.',
    'st.length': 'Länge', 'st.capacity': 'Plätze', 'st.pinned': 'frei verschoben', 'st.nofit': 'passt nicht mehr',
    'st.goal': 'Torstation', 'st.up': 'Nach oben', 'st.down': 'Nach unten', 'st.delete': 'Station löschen',
    'st.saveCustom': 'Als eigene Station speichern', 'st.unpin': 'An Bahn ausrichten', 'st.rotate': '90° drehen',
    'sel.item': 'Material', 'sel.rotate': 'Drehen', 'sel.delete': 'Löschen', 'sel.none': 'Station oder Material anklicken zum Bearbeiten. Ziehen zum Verschieben.',
    'handle.length': 'Ziehen: Länge ändern (Material passt sich an)', 'handle.curve': 'Ziehen: Laufweg biegen', 'handle.rotate': 'Ziehen: drehen',
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
    'item.kasten': 'Kasten', 'item.hurdle': 'Minihürde', 'item.ladder': 'Koordinationsleiter', 'item.rope': 'Zauberschnur', 'item.tunnel': 'Kriechtunnel', 'item.tau': 'Tau',
  },
  en: {
    'tb.help': 'Help', 'help.close': 'Close', 'help.title': 'How the parcours planner works', 'help.keys': 'Keyboard shortcuts',
    'help.build.h': 'Build', 'help.build': 'Click a station on the left. It is placed clockwise on the lane after the selected station (2.5 m from the wall). Goal stations go in front of the next free goal.',
    'help.edit.h': 'Edit', 'help.edit': 'Click a station or equipment, then drag to move it. A moved station leaves the lane – “Snap back to lane” puts it back. Drag the bar at the start or end: change the length – cones, hoops and hurdles are added or removed to fit. ↻ handle: rotate. Round handles on goal stations bend the run.',
    'help.material.h': 'Equipment', 'help.material': 'With a station selected, new equipment belongs to it and moves with it. Without a selection it is placed freely.',
    'help.places.h': 'Spots', 'help.places': 'More spots repeat the set-up side by side or one after another. The equipment list counts them.',
    'help.texts.h': 'Texts', 'help.texts': 'Change name, task, length and spots below the court. ☆ saves the station under “My stations”.',
    'help.share.h': 'Share', 'help.share': '“PNG” and “Print” create an A4 page with the plan, the tasks and the equipment. “Save JSON” and “Import” for files. The current draft stays saved in the browser.',
    'help.key.del': 'Del', 'help.key.del.d': 'Delete the selected equipment or the whole station',
    'help.key.r': 'R', 'help.key.r.d': 'Rotate the selection by 90°',
    'help.key.ctrl': 'Ctrl + drag', 'help.key.ctrl.d': 'Rotate freely in 15° steps (Mac: Cmd)',
    'help.key.undo': 'Ctrl + Z / Ctrl + Y', 'help.key.undo.d': 'Undo / redo',
    'help.key.esc': 'Esc', 'help.key.esc.d': 'Clear the selection, close the help',
    'help.key.help': '?', 'help.key.help.d': 'Open this help',
    'app.title': 'Parcours Planner', untitled: 'Untitled parcours', start: 'Start / Finish', children: 'children', material: 'Equipment',
    'tb.new': 'New', 'tb.template': 'Load template …', 'tb.import': 'Import', 'tb.export': 'Save JSON',
    'tb.png': 'PNG', 'tb.print': 'Print', 'tb.undo': 'Undo', 'tb.redo': 'Redo',
    'side.catalog': 'Stations', 'side.filter': 'Search …', 'side.palette': 'Add equipment', 'side.settings': 'Group',
    'side.hints': 'Hints', 'side.material': 'Equipment list', 'side.custom': 'My stations',
    'palette.toStation': 'Will be added to station {n}.', 'palette.free': 'No station selected: free equipment.',
    'f.title': 'Title', 'f.group': 'Group', 'f.children': 'Number of children', 'f.interval': 'Start interval (s)',
    'st.heading': 'Stations', 'st.empty': 'No station yet. Pick a station on the left – it is appended clockwise.',
    'st.length': 'Length', 'st.capacity': 'Spots', 'st.pinned': 'moved freely', 'st.nofit': 'does not fit',
    'st.goal': 'Goal station', 'st.up': 'Move up', 'st.down': 'Move down', 'st.delete': 'Delete station',
    'st.saveCustom': 'Save as my station', 'st.unpin': 'Snap back to lane', 'st.rotate': 'Rotate 90°',
    'sel.item': 'Equipment', 'sel.rotate': 'Rotate', 'sel.delete': 'Delete', 'sel.none': 'Click a station or equipment to edit it. Drag to move.',
    'handle.length': 'Drag: change the length (equipment adapts)', 'handle.curve': 'Drag: bend the run', 'handle.rotate': 'Drag: rotate',
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
    'item.kasten': 'Vaulting box', 'item.hurdle': 'Mini hurdle', 'item.ladder': 'Agility ladder', 'item.rope': 'Rope', 'item.tunnel': 'Crawl tunnel', 'item.tau': 'Climbing rope',
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
