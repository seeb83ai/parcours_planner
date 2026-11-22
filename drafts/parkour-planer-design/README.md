# Parkour-Planer – Website design draft

Design draft for a static website that creates and changes gym parcours. Live canvas: https://claude.ai/artifact/RkiGBJnwPz28SYamZP7cjj

## Contents

| Path | Content |
| --- | --- |
| `preview/start.html` | Start screen: new parcours, templates, recent parcours, exercise library. |
| `preview/editor.html` | Editor: tools, equipment palette, court, checks, station list, station form, material list. |
| `preview/mobile.html` | Phone view for the gym: plan, setup checklist, station tasks (390 × 844 px). |
| `canvas/` | Source files of the Claude Design canvas (`*.dc.html` and `canvas.json`). |
| `generator/ui.py` | Builds the three screens. |
| `generator/court.py` | Draws a parcours JSON file as one SVG. |
| `generator/data/` | The two parcours in the data model from the handover. |

## Preview

Open the files in `preview/` in a browser. The links between the screens work. Buttons and fields are not connected to any logic.

## Rebuild the canvas files

1. Install Python 3.8 or newer.
2. Run `python3 generator/ui.py`.
3. The script writes the files into `canvas/`.

## Design decisions

- UI language: German.
- Editing on a desktop. The phone view is for viewing and setup only.
- Colors: light ground `#f5f5f2`, white cards, accent teal `#0f766e`, orange `#c2410c` for passes, throws and warnings.
- Fonts: Space Grotesk for headings, Inter for text (Google Fonts).
- Court: 22 px per metre in the SVG viewBox. The SVG scales with the page width.
- Accessibility: real buttons, links, labels and inputs. Icons are inline SVG with `aria-hidden`.

## Open points

- Must coaches edit on the phone? If yes, the phone view needs an edit mode.
- The checks in the editor (queue warning, throw crossing) show the planned behavior. The logic does not exist yet.
