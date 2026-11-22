// Ready-made parcours for the F-Jugend. Built from the catalog at load time, so they always match
// the current stations and come out in the chosen language. Each entry: [catalog ref, { length?, capacity? }].
// test.js checks that every station of every preset fits on the lane.
import { CATALOG } from './stations.js';
import { emptyParcours, newStation, resize } from './model.js';

const T = (de, en) => ({ de, en });
const BALLS = [{ type: 'ballbox', x: 4.5, y: 4, rot: 0 }];

export const PRESETS = [
  { id: 'bewegung', title: T('Bewegungs-Parcours', 'Movement parcours'), children: 22,
    stations: [['slalom-vorwaerts'], ['balancieren'], ['bank-ziehen'], ['sprungwurf'],
      ['baenke-springen', { length: 8 }], ['bank-kriechen', { length: 3 }], ['purzelbaum', { length: 10 }],
      ['seitgalopp'], ['rueckwaerts']] },
  { id: 'ball', title: T('Ball-Parcours F-Jugend', 'Ball parcours U9'), children: 22, free: BALLS,
    stations: [['slalom-prellen', { length: 14 }], ['reifen-prellen', { length: 10 }], ['pass-wand', { capacity: 4 }],
      ['ball-um-koerper', { length: 15 }], ['abwehrschritte', { length: 15 }], ['zielwurf']] },
  // coordination without balls: ladder, hurdles, hopping, crawling
  { id: 'koordination', title: T('Koordinations-Parcours', 'Coordination parcours'),
    stations: [['koordinationsleiter'], ['huerdenlauf'], ['huepfkaestchen'], ['reifenbahn'],
      ['kriechtunnel'], ['baerengang'],
      ['bank-hopser'], ['slalom-vorwaerts'], ['krebsgang'],
      ['rueckwaerts']] },
  // dribbling on the way, throwing at both goals
  { id: 'prellen-werfen', title: T('Prellen & Werfen', 'Dribble & throw'), free: BALLS,
    stations: [['zickzack-prellen'], ['achterlauf', { capacity: 2 }], ['unter-schnur-prellen'], ['aufsetzer'],
      ['prellen-reifen-stand', { capacity: 3 }], ['ball-bank-rollen'], ['korbwurf', { capacity: 2 }], ['slalom-prellen'], ['sprungwurf-kastendeckel']] },
  // gym equipment adventure (5 benches, 1 crash mat, 1 box)
  { id: 'abenteuer', title: T('Turnhallen-Abenteuer', 'Gym adventure'),
    stations: [['balancieren'], ['kasten-sprung'], ['bank-kriechen'], ['tarzan'],
      ['kriechtunnel'], ['baumstammrolle'],
      ['bank-ziehen'], ['purzelbaum'], ['baenke-springen'], ['huerdenlauf']] },
  // only cones, hoops, marker discs and balls
  { id: 'wenig-material', title: T('Mit wenig Material', 'Little equipment'), free: BALLS,
    stations: [['slalom-prellen'], ['reifen-prellen'], ['kaenguru'], ['pass-wand', { capacity: 4 }],
      ['hochwerfen-fangen'], ['ball-rollen'], ['abwehrschritte'], ['rueckwaerts'], ['zielwurf']] },
  // passing and throwing, goalkeeper at one goal (1 helper)
  { id: 'wurf-zirkel', title: T('Pass- und Wurf-Zirkel', 'Passing & throwing circuit'), free: BALLS,
    stations: [['pass-wand'], ['huetchen-abwerfen', { capacity: 2 }], ['schnur-werfen'], ['korbwurf', { capacity: 2 }], ['torhueter'],
      ['pass-kasten', { capacity: 2 }], ['ball-um-koerper'], ['slalom-prellen'], ['wurf-ueber-schnur']] },
];

export function buildPreset(def, lang) {
  const p = { ...emptyParcours(), title: def.title[lang] ?? def.title.de, children: def.children ?? 20, free: structuredClone(def.free ?? []) };
  for (const [ref, o = {}] of def.stations) {
    const st = newStation(CATALOG.find(c => c.ref === ref), lang);
    if (o.length) resize(st, o.length);
    if (o.capacity) st.capacity = o.capacity;
    p.stations.push(st);
  }
  return p;
}
