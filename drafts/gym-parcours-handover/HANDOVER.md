# Gym Parcours Planner – Handover

Nov 22, 2026

## Package contents

| Path | Content |
| --- | --- |
| `HANDOVER.md` | This document. |
| `data/parcours1_movement.json` | Parcours 1 in the proposed data model (template). |
| `data/parcours2_ball_f_jugend.json` | Parcours 2 in the proposed data model (template). |
| `scripts/parcours1_movement.py` | Generator for Parcours 1. |
| `scripts/parcours2_ball_f_jugend.py` | Generator for Parcours 2. |
| `plans/parcours1_movement.html` | Parcours 1 plan as a plain HTML page. Open in a browser and print A4 landscape. |
| `plans/parcours2_ball_f_jugend.html` | Parcours 2 plan as a plain HTML page. |
| `plans/design-canvas/` | The script output for the Claude Design canvas (`Main.dc.html` and `canvas.json` per parcours). |

## Purpose

This handover holds two finished gym parcours, the coaching learnings behind them, and the two Python scripts that drew them. Use it as the baseline for a static HTML website where a coach can create and change parcours.

The scripts are one-off and hard-code every coordinate. The website must replace them with one data-driven editor. The section "Proposed data model and website requirements" gives the data model and the requirements.

Current plans (A4 landscape, ready to print):

- [Parcours 1 – Movement parcours](https://claude.ai/artifact/MsuLrN6QimaiDMgqVYdtPf)
- [Parcours 2 – Ball parcours F-Jugend](https://claude.ai/artifact/FBwzXoN81BJU3EXbcaMqdn)
- [This handover as a live doc](https://claude.ai/artifact/XkWT2NU7ryTB1Ffymwu5Qc)

## Context

Both parcours are for one handball team in a gym the size of a handball court. All positions in this document use one coordinate system.

| Item | Value |
| --- | --- |
| Hall | Handball court, 40 × 20 m. Assumption: the walls are on the side lines and end lines. |
| Coordinates | Origin = top-left corner of the court. x = 0–40 m along the long side, y = 0–20 m across. |
| Goals | Left goal at x = 0, y = 8.5–11.5 m. Right goal at x = 40, same y. |
| Court lines | 6 m goal area, 9 m free-throw line (dashed), centre line at x = 20 m. |
| Group | F-Jugend (U9, about 7–8 years), 20–23 children. |
| Known equipment | 5–6 benches. Mats, 1 Weichboden, cones, hoops, balls (ball count unknown). |
| Output | One printed A4 landscape plan per parcours. |
| Language | Plans and station texts are in German. |

## Parcours 1 – Movement parcours

A circuit with 9 stations for balance, crawling, jumping, rolling, speed and a handball jump shot. The children run along the bottom side line, up the right side, back along the top side line and down the left side.

| # | Station | Equipment | Position (m) | Task (German text on the plan) |
| --- | --- | --- | --- | --- |
| – | Start / Ziel | – | x 1–5.5, y 16.9–18.1 | – |
| 1 | Slalom vorwärts | 5 cones | x 7, 9, 11, 13, 15; y 17.5 | Im Sprint um die Hütchen laufen. |
| 2 | Balancieren | 1 bench | x 18–22, y 17.5 | Über die Bank gehen. Schwerer: rückwärts oder mit Ball. |
| 3 | Auf Bank ziehen | 1 bench | x 25–29, y 17.5 | In Bauchlage auf die Bank legen. Mit den Armen nach vorn ziehen. |
| 4 | Sprungwurf | 1 Weichboden (2 × 3 m), ball box | Mat x 34.3–36.3, y 8.5–11.5. Box x 28.6, y 12. | Ball nehmen, 3 Schritte, Absprung an der 6-m-Linie, Wurf aufs Tor, Landung auf dem Weichboden. |
| 5 | Bänke überspringen | 2 benches (3 if a 6th bench exists) | x 29 and 26.5; y 1–5 | Mit beiden Beinen über jede Bank springen. |
| 6 | Unter Bank kriechen | 1 bench on 2 Kastendeckel | x 20; y 1–5 | Unter der Bank durchkriechen. |
| 7 | Purzelbaum | 3 small mats (2 × 1 m) | x 8–10, 10.5–12.5, 13–15; y 2.5–3.5 | Auf jeder Matte eine Rolle vorwärts. |
| 8 | Seitwärts | 3 cones | x 4; y 5, 7, 9 | Im Seitgalopp an den Hütchen vorbei. Blick nach vorn. |
| 9 | Rückwärts | 4 cones (2 gates) | x 3.2 and 4.8; y 11 and 15.5 | Rückwärts zum Ziel laufen. Über die Schulter schauen. |

Material: 5 benches, 2 Kastendeckel, 3 small mats, 1 Weichboden, 12 cones, 1 ball box with about 10 balls.

History: the first version used 7 benches. The coach reported only 5–6 benches, so stations 5 and 6 lost one bench each.

## Parcours 2 – Ball parcours F-Jugend

A circuit with 6 stations for dribbling, ball feeling, passing, defence footwork and throwing. Each child takes a ball at the start and keeps it until the throw.

| # | Station | Equipment | Position (m) | Task (German text on the plan) |
| --- | --- | --- | --- | --- |
| – | Start / Ziel, ball box | Ball box with about 15 balls | Start x 4.5–9.5, y 0.9–2.1. Box x 1.5–3.5, y 1–2. | – |
| 1 | Slalom prellen | 5 cones | x 12–20 (step 2); y 1.5 | Ball aus der Kiste nehmen. Prellend um die Hütchen laufen. Schwerer: mit der schwachen Hand. |
| 2 | Reifen-Prellen | 5 hoops | x 22–28 (step 1.5); y 1.1 and 1.9 alternating | In jedem Reifen 1-mal prellen. |
| 3 | Pass an die Wand | 3 marker discs | x 37.5; y 3.5, 5.5, 7.5 (right end wall, above the goal) | An einen freien Teller stellen. 5 Pässe gegen die Stirnwand und den Ball fangen. |
| 4 | Ball um den Körper | 1 cone at the centre line | Walk along y 19 from x 35.3 to x 20 | Bis zur Mittellinie gehen. Dabei den Ball um den Bauch kreisen lassen. |
| 5 | Abwehrschritte seitwärts | 1 cone at the 9 m line | Along y 19 from x 20 to x 5 | Ball in beide Hände nehmen. Seitwärts an der Seitenlinie bis zum Hütchen an der 9-m-Linie. Füße nicht kreuzen. |
| 6 | Zielwurf | 2 cones as a gate, 2 hoops in the goal corners | Gate x 7.5; y 9.2 and 10.8. Throw from x 9, y 10. | An der 9-m-Linie entlang zur Mitte prellen. Durch die 2 Hütchen auf die Reifen im Tor werfen. Ohne Ball zurück zum Start. |

Route: start → along the top side line → down the right side → along the bottom side line → along the 9 m arc to the centre → throw at the left goal → straight back to the start at x = 9.

Material: 9 cones, 7 hoops (2 in the goal), 3 marker discs, 1 ball box with about 15 balls.

Safety rule on the plan: throw only when nobody is in front of the goal. A helper stands beside the left goal and returns the balls to the box.

History of coach changes:

1. The coach picked 6 of 15 proposed exercises and set the order.
2. Wall passes moved from the top side wall to the right end wall.
3. Station 4 became a walk to the centre line.
4. Defence steps end at a cone on the 9 m line.
5. The route from station 5 to 6 follows the 9 m arc. The throw cones stand parallel to the 6 m line, so the children throw through them.

## Coaching findings and learnings

The biggest risk with 20–23 children is waiting time, not exercise choice. The website should help the coach see bottlenecks and equipment limits before the session.

- **Throughput:** Start one child every 5 seconds. Stations where only one child can work (jump shot, rolls, throw) cause queues. Give busy stations several spots (3 pass spots, 3 spots for ball circling) or use a second start point.
- **Equipment first:** The real equipment count changed the plan (7 benches became 5). Ask for counts before the first draft.
- **Crawling:** A flat bench is about 35 cm high. Bigger children do not fit under it, so put the bench on 2 Kastendeckel.
- **Partners:** Pass and defence exercises need a partner or a wall. Without helpers, use wall passes and footwork drills.
- **Balls:** One ball per child is best. A helper returns thrown balls to the box.
- **Safety:** The throw direction must not cross a running path. Secure the Weichboden so it cannot slide.
- **Throw distance:** 9 m is far for U9. Parcours 2 throws from 9 m through a cone gate at 7.5 m.
- **9 m line:** The line is an arc. On the lane 1 m inside the side line it is only about 5 m from the goal line. Coaches can mean "9 m from the goal" instead. Confirm what the coach means.

### End-of-training game

With about 20 children, 6 children wait at the side. The proposed fix is 2 games at the same time:

- Split the court at the centre line into 2 cross courts of about 20 × 20 m.
- Make 4 teams of 5 (4 field players + 1 goalkeeper). Extra children rotate in every 2 minutes.
- Change opponents every 5–7 minutes, like a small tournament.
- Extra goals: mini goals, a box top or Weichboden against the wall, or 2 cones (flat shots only).
- Without 2 courts: Zehnerball (10 passes = 1 point) or "team that concedes goes out".

### Exercise library (ball skills, F-Jugend)

The coach chose from these 15 ideas. The website can use them as a seed library.

| Skill | Exercise | Needs |
| --- | --- | --- |
| Dribbling | Hütchen-Slalom prellend (slalom dribble) | Cones |
| Dribbling | Prellen auf der Bank (dribble on the bench) | Bench |
| Dribbling | Reifen-Prellen (one bounce per hoop) | Hoops |
| Ball feeling | Ball um den Körper (around waist, knees, head) | – |
| Ball feeling | Ball um Hütchen rollen (roll the ball around cones) | Cones |
| Ball feeling | Hochwerfen, klatschen, fangen | – |
| Passing | Pass an die Wand | Wall |
| Passing | Pass zum Helfer | Helper |
| Passing | Pass in den Kasten oder Reifen | Box top or hoop |
| Throwing | Zielwurf auf Reifen im Tor | Hoops, goal |
| Throwing | Sprungwurf auf den Weichboden | Weichboden, goal |
| Throwing | Hütchen vom Kasten abwerfen | Box, cone |
| Defence | Abwehrschritte zwischen Hütchen | Cones |
| Defence | Bälle abwehren (helper throws soft balls) | Helper, soft balls |
| Defence | 1 gegen 1 gegen Trainer | Helper |

## Technical learnings

Placing labels and arrows by hand took most of the effort and caused most layout errors. The website should compute them from data or let the coach drag them.

| Topic | What the scripts do |
| --- | --- |
| Page | A4 landscape, 1123 × 794 px at 96 dpi. Title on top, court in the middle, legend and material list at the bottom. |
| Scale | 22 px per metre. Court = 880 × 440 px, top-left corner at (121, 104) px. Helpers `X(m)` and `Y(m)` convert metres to px. |
| Court lines | 6 m goal area = a box 6 × 15 m with corner radius 6 m (two quarter circles plus 3 m straight). 9 m line = the same with radius 9 m, dashed, clipped to the court. |
| Equipment symbols | Bench: brown bar, 10 px wide. Cone: orange circle, 12 px. Hoop: purple ring, 18 px. Marker disc: yellow circle, 14 px. Small mat: blue 2 × 1 m. Weichboden: dark blue. Kastendeckel: grey. Ball box: yellow with the word "Bälle". |
| Path | Dashed teal arrows. One SVG per straight segment, each with its own arrowhead marker id. Diagonal and arc segments (the 9 m arc) need a custom SVG path. |
| Throws and passes | Solid orange arrows, so they differ from the running path. |
| Labels | A white card with a number badge and the station name. Positions are hand-tuned per station. |
| Editor format | Output is a `.dc.html` artboard for the Claude Design canvas. Every item is a separate absolutely positioned element, so the coach can drag single items in that editor. |
| Print | Colours differ in lightness, so the plan also reads in greyscale. Minimum text size 12 px. |

Most coach requests were small moves: move a station, change the route, change a count. In a data-driven model each of these is a one-line change. In the scripts each needed new hand-tuned pixel values.

## Generator scripts

Two Python scripts made the final plans. They use only the standard library. They are in `scripts/`.

| File | Draws | Lines | Writes |
| --- | --- | --- | --- |
| `parcours1_movement.py` | Parcours 1, final version with 5 benches | 240 | `canvas/project/Main.dc.html` and `canvas.json` |
| `parcours2_ball_f_jugend.py` | Parcours 2, final version with the 9 m arc | 208 | `canvas3/project/Main.dc.html` and `canvas.json` |

### How to run

1. Install Python 3.8 or newer.
2. Change the `root` path near the end of the script. It points to `/home/claude/...` now.
3. Run `python3 parcours1_movement.py`.
4. Upload `Main.dc.html` and `canvas.json` to a Claude Design canvas under `project/`.

The files in `plans/*.html` are the same plans converted to plain HTML. They need no runtime.

### Structure of each script

1. Constants: scale, origin, colours.
2. Drawing helpers: `X()`, `Y()`, `svg()`, `harrow()`, `varrow()`, `box()`.
3. Equipment helpers: `cone()`, `bench_h()`, `bench_v()`, `kasten()`, `mat()`, `hoop()`, `disc()`.
4. `station()` for the numbered label cards.
5. Court lines, then path arrows, then equipment, then labels (this is the paint order).
6. Legend data (`STATIONS`, `MATERIAL`) and the HTML template.

### Limits

- Every coordinate and label position is hard-coded.
- One script per parcours. The helpers are copied, not shared.
- The material list is typed by hand, not counted from the items.
- The script output needs the Design canvas runtime (`support.js`). It is not a plain HTML page.
- Script 2 still holds an unused `darrow()` helper for diagonal arrows.
- There are no tests.

## Proposed data model and website requirements

Store one parcours as one JSON file. The website draws the plan from it, so a coach changes data, not pixels. Both parcours already exist in this format as templates in `data/`.

### Data model (schemaVersion 1)

All positions are in metres in the court coordinates from the section "Context". Item positions are centre points.

```json
{
  "schemaVersion": 1,
  "title": "Ball-Parkour F-Jugend",
  "language": "de",
  "court": { "length": 40, "width": 20, "unit": "m", "wallsAtLines": true },
  "group": { "name": "F-Jugend", "children": 23 },
  "startIntervalSeconds": 5,
  "start": { "x": 7, "y": 1.5, "w": 5, "h": 1.2, "label": "Start / Ziel" },
  "extraItems": [{ "type": "ballbox", "x": 2.5, "y": 1.5, "w": 2, "h": 1, "count": 15 }],
  "stations": [{
    "number": 1,
    "name": "Slalom prellen",
    "task": "Prellend um die Hütchen laufen.",
    "skills": ["dribbling"],
    "capacity": 1,
    "label": { "x": 16, "y": 3.24 },
    "items": [{ "type": "cone", "x": 12, "y": 1.5 }]
  }],
  "path": [
    { "kind": "run", "points": [[9.5, 1.5], [12, 1.5]] },
    { "kind": "runArc", "center": [0, 11.5], "radius": 9, "from": [5.53, 18.6], "to": [9, 11.5] },
    { "kind": "throw", "points": [[9, 10], [0, 10]] }
  ],
  "notes": [{ "legend": true, "text": "Erst werfen, wenn das Tor frei ist." }]
}
```

| Item type | Default size (m) | Fields | Symbol |
| --- | --- | --- | --- |
| `cone` | Ø 0.3 | x, y | Orange circle |
| `hoop` | Ø 0.8 | x, y, size? | Purple ring |
| `disc` | Ø 0.2 | x, y | Yellow circle |
| `bench` | 4 × 0.3 | x, y, rotation (0 or 90), raised? | Brown bar |
| `kastendeckel` | 0.9 × 0.7 | x, y | Grey block |
| `mat` | 2 × 1 | x, y, w, h | Blue rectangle |
| `weichboden` | 2 × 3 | x, y, w, h | Dark blue rectangle |
| `ballbox` | 2 × 1 | x, y, w, h, count | Yellow box with "Bälle" |

Path kinds: `run` (dashed teal arrow, polyline), `runArc` (dashed arc, for the 9 m line), `slalom` (wave through cones), `pass` and `throw` (solid orange arrow). The last point of each path element gets an arrowhead unless `head` is false.

### Website requirements

The target is one static HTML page with no backend, for example on GitHub Pages.

1. Draw the court to scale as SVG: side lines, centre line, 6 m areas, 9 m lines, goals.
2. Draw all items, path elements, station labels and notes from the JSON.
3. Add items from a palette. Drag them on the court with a 0.5 m snap. Rotate benches by 90°. Delete items.
4. Add, edit, delete and reorder stations. The numbers update when the order changes.
5. Draw the path by clicking points. Support straight segments first, arcs later.
6. Count the material list from the items, not by hand.
7. Show a throughput hint: estimated lap time and queue risk for stations with capacity 1.
8. Warn when a throw arrow crosses a run path.
9. Save and load JSON: localStorage for drafts, file download and upload for sharing.
10. Print one A4 landscape page with the plan, the station legend and the material list (CSS `@page`).
11. Ship the two parcours as templates and the exercise library as a picker.
12. Keep the UI language German, because the coaches and plans are German.

## Open questions

The coach did not answer these questions. They affect the plans or the website.

- [ ] Is the hall exactly the court size, with the walls on the lines? Or is there space around the court?
- [ ] How many balls does the team have? Parcours 2 assumes about 15.
- [ ] How many helpers are there per session?
- [ ] Are mini goals available for the 2-court end game?
- [ ] Does "9 m line" mean the painted arc or "9 m from the goal"?
- [ ] Must the website work for editing on a phone, or is phone only for viewing?
- [ ] Where will the website be hosted (for example GitHub Pages)?
- [ ] Must parcours be shared between coaches, or does each coach keep local files?
