# Parcours-Planer

A web app for handball coaches to plan a gym parcours (obstacle course) for young children, made for the F-Jugend (under 9). You build the parcours step by step: each station is placed clockwise around the hall. You can then print it on A4 or share it as an image.

The interface is in German and English.

## Features

- **Step-by-step building:** pick a station from the catalog. It goes on a lane 2.5 m inside the walls, after the selected station.
- **Goal stations:** at most one in front of each goal. They have a throw spot and a run path that you can bend.
- **Catalog with 43 stations:** dribbling, ball feeling, passing, throwing, defence and movement. The stations follow common F-Jugend exercises, for example from the BWHV/HVW Kinderhandball catalog.
- **Places (Plätze):** more places repeat a station's set-up side by side or one after another. The equipment list counts every place.
- **Free editing:** drag stations, equipment and number badges. Rotate with Ctrl+drag or the ↻ handle, or by 90° with the R key. Delete with Del. You can also add extra equipment.
- **Checks:** the app shows the time until the last child starts, stations with queue risk, and stations that no longer fit.
- **Output:**
  - Print on A4 portrait: the court, one description per station, and the equipment list.
  - The same page as a PNG.
  - Save and load the parcours as a JSON file.
- **Templates:** a movement parcours and a ball parcours for the F-Jugend.
- **Your own stations:** save a changed station as your own (☆). The browser keeps your stations and the current draft.

## Use it

The app is static: HTML, CSS and JavaScript modules, with no build step and no server code. The browser blocks JavaScript modules from `file://`, so serve the folder over HTTP:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

Quick start:
1. Pick a station in the list on the left. It goes onto the lane.
2. Click a station on the court or in the list to select it. Drag to move it, use the square handle to change its length, and the ↻ handle to rotate it.
3. Change the name, task text, length and places below the court.
4. Use **PNG** or **Drucken** (print) to share the plan. **JSON speichern** saves it as a file, and **Importieren** loads one.

### Keyboard

| Key | Action |
|-----|--------|
| Del / Backspace | Delete the selected equipment or station |
| R | Rotate the selection by 90° |
| Ctrl + drag (Cmd on a Mac) | Rotate freely in 15° steps |
| Ctrl+Z / Ctrl+Y | Undo / redo |
| Esc | Clear the selection |
| ? | Open the help (also the **?** button at the top) |

## Deploy

All paths are relative, so you can serve the folder from any web server:

- **GitHub Pages:** the workflow `.github/workflows/ci.yml` runs the tests on every push and pull request. It deploys `main` to Pages only when the tests pass. In Settings → Pages, set the source to **GitHub Actions**.
- **nginx (for example on a Raspberry Pi):** copy the files into the web root, or point a `location` at the folder. No other set-up is necessary.

## Development

| File | Content |
|------|---------|
| `index.html`, `style.css`, `app.js` | Editor UI, events, undo, storage, export |
| `model.js` | Lane layout, coordinates, places, rotation, material count, import validation. It does not use the DOM. |
| `court.js` | SVG drawing of the court and the A4 print page |
| `stations.js` | Station catalog |
| `i18n.js` | German and English UI texts |
| `templates/*.json` | Ready-made parcours |
| `test.js`, `test.html` | Logic checks |
| `PLAN.md` | Design decisions and the data format (schemaVersion 2) |
| `drafts/` | Original research, scripts and design drafts |

To run the tests:

```sh
node test.js        # or open test.html in the browser
```

### Add a station

Add an entry to `CATALOG` in `stations.js`. The comment at the top of the file explains the coordinates:

- `u` is the distance along the running direction.
- `v` is the distance across, towards the centre of the court.
- `f` is a fraction of the station length: an item with `f` moves when the length changes.

Other fields:

| Field | Meaning |
|-------|---------|
| `spots` | `'across'` (default): extra places go side by side. `'along'`: extra places go one after another. |
| `spotStep` | Distance between places side by side, in metres (default 2) |
| `flow: true` | Children follow each other without waiting, so the app shows no queue warning |

Write the texts as `{ de, en }`.

To add an equipment type:
1. Add its size to `ITEM_TYPES` in `model.js`.
2. Add its colour to `COL` in `court.js`.
3. Add its names to `i18n.js`.

## License

© 2026 Sebastian Detert. Licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). The full text is in [`LICENSE`](LICENSE).

- **You may** use, copy, change and share this project for free, for any **non-commercial** purpose. Clubs, coaches, schools and private use are all fine.
- **You must** credit the author and link to the license.
- **Derivatives must stay open:** if you share a changed version, you must publish it under the same license.
- **Not allowed:** use in or as a commercial product or service.

This licence is not an "open source" licence as the OSI defines it, because it does not allow commercial use.
