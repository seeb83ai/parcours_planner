// Ready-made parcours. `ages`: the age groups (from-to) the template is shown for. Built from the catalog at load time, so they always match
// the current stations and come out in the chosen language. Each entry: [catalog ref, { length?, capacity? }].
// test.js checks that every station of every preset fits on the lane.
import { CATALOG } from './stations.js';
import { emptyParcours, newStation, resize } from './model.js';

const T = (de, en) => ({ de, en });
const BALLS = [{ type: 'ballbox', x: 4.5, y: 4, rot: 0 }];

export const PRESETS = [
  { id: 'bewegung', ages: 'minis-E', title: T('Bewegungs-Parcours', 'Movement parcours'), children: 22,
    stations: [['slalom-vorwaerts'], ['balancieren'], ['bank-ziehen'], ['sprungwurf'],
      ['baenke-springen', { length: 8 }], ['bank-kriechen', { length: 3 }], ['purzelbaum', { length: 10 }],
      ['seitgalopp'], ['rueckwaerts']] },
  { id: 'ball', ages: 'F-E', title: T('Ball-Parcours F-Jugend', 'Ball parcours U9'), children: 22, free: BALLS,
    stations: [['slalom-prellen', { length: 14 }], ['reifen-prellen', { length: 10 }], ['pass-wand', { capacity: 4 }],
      ['ball-um-koerper', { length: 15 }], ['abwehrschritte', { length: 15 }], ['zielwurf']] },
  // coordination without balls: ladder, hurdles, hopping, crawling
  { id: 'koordination', ages: 'F-D', title: T('Koordinations-Parcours', 'Coordination parcours'),
    stations: [['koordinationsleiter'], ['huerdenlauf'], ['huepfkaestchen'], ['reifenbahn'],
      ['kriechtunnel'], ['baerengang'],
      ['bank-hopser'], ['slalom-vorwaerts'], ['krebsgang'],
      ['rueckwaerts']] },
  // dribbling on the way, throwing at both goals
  { id: 'prellen-werfen', ages: 'F-E', title: T('Prellen & Werfen', 'Dribble & throw'), free: BALLS,
    stations: [['zickzack-prellen'], ['achterlauf', { capacity: 2 }], ['unter-schnur-prellen'], ['aufsetzer'],
      ['prellen-reifen-stand', { capacity: 3 }], ['ball-bank-rollen'], ['korbwurf', { capacity: 2 }], ['slalom-prellen'], ['sprungwurf-kastendeckel']] },
  // gym equipment adventure (5 benches, 1 crash mat, 1 box)
  { id: 'abenteuer', ages: 'superminis-F', title: T('Turnhallen-Abenteuer', 'Gym adventure'),
    stations: [['balancieren'], ['kasten-sprung'], ['bank-kriechen'], ['tarzan'],
      ['kriechtunnel'], ['baumstammrolle'],
      ['bank-ziehen'], ['purzelbaum'], ['baenke-springen'], ['huerdenlauf']] },
  // only cones, hoops, marker discs and balls
  { id: 'wenig-material', ages: 'minis-E', title: T('Mit wenig Material', 'Little equipment'), free: BALLS,
    stations: [['slalom-prellen'], ['reifen-prellen'], ['kaenguru'], ['pass-wand', { capacity: 4 }],
      ['hochwerfen-fangen'], ['ball-rollen'], ['abwehrschritte'], ['rueckwaerts'], ['zielwurf']] },
  // passing and throwing, goalkeeper at one goal (1 helper)
  { id: 'wurf-zirkel', ages: 'F-D', title: T('Pass- und Wurf-Zirkel', 'Passing & throwing circuit'), free: BALLS,
    stations: [['pass-wand'], ['huetchen-abwerfen', { capacity: 2 }], ['schnur-werfen'], ['korbwurf', { capacity: 2 }], ['torhueter'],
      ['pass-kasten', { capacity: 2 }], ['ball-um-koerper'], ['slalom-prellen'], ['wurf-ueber-schnur']] },
  // Super-Minis and Minis: crawling, climbing, rolling, animal walks, first ball contact
  { id: 'superminis', ages: 'superminis-minis', title: T('Bewegungslandschaft Super-Minis', 'Movement landscape for super minis'), children: 12, interval: 8,
    stations: [['tierwege'], ['balancieren'], ['bank-kriechen', { length: 3 }], ['ball-ins-tor'],
      ['wackelberg'], ['kriechtunnel'], ['purzelbaum'], ['luftballon'], ['ball-transport']] },
  // E/D: dribbling, feints, defence footwork, throwing technique
  { id: 'technik', ages: 'E-D', title: T('Technik-Parcours E/D-Jugend', 'Technique parcours U11/U13'), children: 16, interval: 8, free: BALLS,
    stations: [['taeuschung'], ['zwei-baelle'], ['wandpass-lauf'], ['dreischritt-wurf'],
      ['abwehr-viereck', { capacity: 2 }], ['koordinationsleiter'], ['achterlauf', { capacity: 2 }], ['seilspringen', { capacity: 3 }], ['gegenstoss']] },
  // C to A: athletics circuit, every station 45 s – change
  { id: 'athletik', ages: 'C-A', title: T('Athletik-Zirkel C–A-Jugend', 'Athletics circuit U15–U19'), children: 16, mode: 'zirkel', rotation: 2,
    stations: [['stuetz'], ['box-jumps'], ['medizinball'], ['pendelsprint'], ['lauf-abc'],
      ['bank-hopser'], ['abwehr-viereck'], ['seilspringen', { capacity: 3 }], ['koordinationsleiter']] },
  // Super-Minis / Minis: first ball contact – rolling, carrying, aiming with soft things
  { id: 'ballspass', ages: 'superminis-minis', title: T('Ballspaß für die Kleinsten', 'Ball fun for the youngest'), children: 12, interval: 8, free: BALLS,
    stations: [['luftballon'], ['ball-rollen'], ['kegeln', { capacity: 2 }], ['ball-ins-tor'],
      ['ball-transport'], ['sandsack-zielwurf', { capacity: 2 }], ['ball-bank-rollen'], ['ball-um-koerper']] },
  // Super-Minis / Minis: climbing, rolling, sliding (wall bars at the top wall)
  { id: 'klettern', ages: 'superminis-minis', title: T('Klettern, Rollen, Rutschen', 'Climb, roll, slide'), children: 12, interval: 8,
    stations: [['sprossenwand-klettern'], ['rollbrett', { capacity: 2 }], ['schraege-bank'], ['kriechtunnel'],
      ['baumstammrolle'], ['weichboden-berg'], ['tierwege'], ['purzelbaum']] },
  // D to B: throwing technique on the way, two goal stations
  { id: 'wurf-technik', ages: 'D-B', title: T('Wurf- und Technik-Parcours', 'Throwing & technique parcours'), children: 16, interval: 8, free: BALLS,
    stations: [['wandpass-lauf'], ['taeuschung'], ['zwei-baelle'], ['dreischritt-wurf'],
      ['abwehr-viereck', { capacity: 2 }], ['pendelsprint', { capacity: 2 }], ['koordinationsleiter'], ['rueckraumwurf']] },
  // D to A: defence footwork and quick feet, fast break at the end
  { id: 'abwehr', ages: 'D-A', title: T('Abwehr & schnelle Beine', 'Defence & quick feet'), children: 16, interval: 8, free: BALLS,
    stations: [['abwehrschritte'], ['abwehr-viereck', { capacity: 2 }], ['lauf-abc'], ['gegenstoss'],
      ['bank-hopser'], ['koordinationsleiter'], ['seilspringen', { capacity: 3 }], ['pendelsprint', { capacity: 2 }]] },
  // C to A: jumping power and speed as a circuit
  { id: 'sprungkraft', ages: 'C-A', title: T('Sprungkraft & Schnelligkeit', 'Jumping power & speed'), children: 16, mode: 'zirkel', rotation: 2,
    stations: [['box-jumps'], ['huerdenlauf'], ['bank-hopser'], ['kempa'],
      ['seilspringen', { capacity: 3 }], ['pendelsprint'], ['lauf-abc'], ['sprungwurf']] },
  // C to A: game-like handball parcours
  { id: 'spielnah', ages: 'C-A', title: T('Handball-Parcours C–A-Jugend', 'Handball parcours U15–U19'), children: 16, interval: 8, mode: 'parcours', free: BALLS,
    stations: [['wandpass-lauf'], ['taeuschung'], ['zwei-baelle'], ['gegenstoss'],
      ['abwehr-viereck', { capacity: 2 }], ['zickzack-prellen'], ['pass-wand', { capacity: 3 }], ['doppelpass-tor']] },
];

for (const d of PRESETS) d.ages = d.ages.split('-');

export function buildPreset(def, lang) {
  const p = { ...emptyParcours(), title: def.title[lang] ?? def.title.de, children: def.children ?? 20, interval: def.interval ?? 5, free: structuredClone(def.free ?? []),
    group: def.ages[0], mode: def.mode ?? 'parcours', rotation: def.rotation ?? 3 };
  for (const [ref, o = {}] of def.stations) {
    const st = newStation(CATALOG.find(c => c.ref === ref), lang);
    if (o.length) resize(st, o.length);
    if (o.capacity) st.capacity = o.capacity;
    p.stations.push(st);
  }
  return p;
}
