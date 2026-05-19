# DRI avatars

Images in this folder are served at **`/assets/avatars/<filename>`** (Vite copies `public/` to the site root).

The roadmap wires `Workstream.avatar` in `src/data/ganttData.ts` via the `avatar()` helper. **If a file is missing**, the Gantt falls back to initials on the status-colored circle.

## Bundled placeholders (SVG)

These load without extra setup:

- `andrey.svg` — grabelnikov
- `courtney.svg` — courtneyb
- `tracey.svg` — traceyv
- `cameron.svg` — cameronsagey
- `placeholder.svg` — unknown / TBD DRI

Replace any SVG with a real **`png` / `jpg`** (same basename or update `ganttData.ts`) when you have photos.
