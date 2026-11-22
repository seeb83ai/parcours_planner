# Parcours-Planer – Plan

Static website (no build step, no backend) to build a handball parcours for F-Jugend step by step.
Reference material: `drafts/` (handover with learnings, old scripts, design draft).

## Decisions (grill session 2026-11-22)

| # | Topic | Decision |
|---|-------|----------|
| 1 | Layout model | Hybrid: stations are auto-placed one after another on a clockwise lane. Dragging a station pins it (absolute, no longer auto-laid). |
| 1b | Direction | Always clockwise (as seen on the plan). No switch. |
| 2 | Goal stations | Max one per goal end. Approach curve (bezier, one handle) from previous station to an action spot, optional action arrow (throw/pass), exit run to next station. No goal station → lane runs along the end wall. |
| 3 | Catalog | Static `stations.js`. Lane stations have `length` with `minLength`/`maxLength`; items with `f` (fraction) spread with length, items with `u` stay fixed. Placing copies the station into the parcours. Custom stations can be saved in the browser. |
| 4 | Storage | No server (option A). Browser storage + JSON download/import. Later maybe Go/Rust + SQLite storing the same JSON documents. |
| 5 | Stack | Vanilla JS modules + SVG in metres. PNG via SVG → canvas. Print via `@page`. Design draft look (teal `#0f766e`, Space Grotesk / Inter). |
| 6 | v1 scope | One editor page, templates, catalog, drag/pin/resize, extra material, texts, material count, PNG, print, JSON, autosave (one draft), simple throughput hint. Later: throw-crossing check, phone view, start screen, multiple saved parcours. |
| 7 | Lane | Rectangle 2.5 m inside the walls (`INSET` in `model.js`) (court 40 × 20, walls on lines, fixed). Start/Ziel top-left. 2 m gap. Stations never bend: they jump to the next side. Goal station takes the whole end side. Not fitting → marked red. |
| 8 | Print / PNG | A4 portrait: court on top, one row per station below (badge · name · task), material list. Number badges on the court, draggable. PNG = same page. Overflow → warning. |
| 9 | Extra material | Station selected → item joins the station (moves with it). Nothing selected → free item. Palette: handover items + Helfer + Mini-Tor. |
| 10 | Templates | Presets are station lists in `presets.js`, built from the catalog at load time (always in sync, in the chosen language). Tests check that every preset fits. 7 presets. No import of schemaVersion 1. |
| 12 | Plätze | Station items describe one place. Plätze repeats them side by side (`spots: 'across'`, parallel tracks `spotStep` m apart) or one after another (`spots: 'along'`, station becomes Plätze × length). Copies are derived, so material edits apply to every place, and the material list multiplies. Goal stations: number only. `flow: true` = walk-through station with no queue warning. |
| 13 | Length & pins | Drag the start/end border or use the slider. Rows of spread items (`f`) keep at least their original spacing (`pitch`, stored on first resize), so items are added/removed as the length changes; same-`f` items (cone gates) move as one slot. Dragging the start border pins the station with its end fixed. Pinned stations still advance the lane cursor: the next station goes after the last one. A click without real movement never pins. |
| 11 | Misc | Undo/redo (50). GitHub Pages now, nginx on a Raspberry Pi later (all paths relative). i18n DE/EN (`i18n.js`). Modern browsers only. `test.html` for layout logic. |

## Coordinates

Court: origin top-left, x 0–40 m, y 0–20 m. Lane sides (clockwise):

| Side | From | Direction | Length |
|------|------|-----------|--------|
| 0 top | (2.5, 2.5) | +x (rot 0) | 35 |
| 1 right end | (37.5, 2.5) | +y (rot 90) | 15 |
| 2 bottom | (37.5, 17.5) | −x (rot 180) | 35 |
| 3 left end | (2.5, 17.5) | −y (rot 270) | 15 |

Station-local coordinates: `u` along the running direction, `v` across, positive = towards the court centre.
Goal stations use goal-local coordinates: origin = goal centre, `u` into the court, `v` towards the side the lane comes from.

## Data model (schemaVersion 2)

```json
{
  "schemaVersion": 2,
  "title": "Ball-Parcours F-Jugend",
  "group": "F-Jugend", "children": 22, "interval": 5,
  "start": { "x": 4.5, "y": 2.5 },
  "free": [ { "type": "ballbox", "x": 3.5, "y": 3, "rot": 0 } ],
  "stations": [
    { "ref": "slalom-prellen", "kind": "lane", "name": "Slalom prellen", "task": "…",
      "capacity": 1, "length": 10, "minLength": 6, "maxLength": 14, "path": "slalom",
      "items": [ { "type": "cone", "f": 0.1, "v": 0 } ], "arrows": [],
      "pin": null, "badge": null },
    { "ref": "zielwurf", "kind": "goal", "name": "Zielwurf", "task": "…", "capacity": 1,
      "action": { "u": 9, "v": 0 }, "target": { "u": 0, "v": 0 }, "targetKind": "throw",
      "approach": null, "exitCtrl": null,
      "items": [ { "type": "cone", "u": 7.5, "v": 0.8 } ], "badge": null }
  ]
}
```

Item types: cone, hoop, disc, bench, kastendeckel, mat, weichboden, ballbox, helper, minigoal.
