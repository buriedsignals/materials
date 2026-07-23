---
name: cesium-flyover
description: Use when you need a cinematic 3D-terrain fly-over or fly-through of real geography (canyon, gorge, mountain range, coastline, route) rendered to video — a slow drone/helicopter glide over satellite-draped terrain. Keywords cesium, flythrough, flyover, terrain, drone, aerial, gorge, canyon, mountains, quantized-mesh, remotion.
---

# Cesium Flyover — cinematic 3D-terrain fly-throughs

## Overview

**Cesium draws the mountains; Remotion drives the timeline and captures the frames.** Neither alone
works — Cesium won't render reliably headless on its own, and Remotion has no 3D globe. They stack.
Proven on water-wars (Yarlung Tsangpo Grand Canyon) — a slow, peaceful "helicopter" glide with a gentle
bank into the curves.

For 2D explainer maps (river path + country highlights) use the **map-explainer** skill instead; for
plain flat animated maps see remotion's `maps.md` / `maplibre.md`.

## When to use

- A cinematic reveal of real terrain: fly *through* a canyon/gorge, *over* a coastline or mountain range, *along* a route.
- You want Google-Earth-grade terrain (quantized-mesh) draped with satellite imagery, rendered deterministically to mp4.
- **Not** for: flat 2D maps, choropleths, data overlays, or "where is this" explainers → use **map-explainer**.

## The one gotcha that will waste your day (read first)

Cesium's globe **will not draw in a standalone headless Playwright/Chromium** harness — WebGL works
(skybox renders) but the globe produces **zero draw commands** and `tilesLoaded` never goes true. Dead
end. **Render through Remotion instead.** Inside the component: `useDefaultRenderLoop = false`, drive each
frame with **`viewer.render()` (NOT `scene.render()`)**, `preserveDrawingBuffer: true`, and gate every
frame with `delayRender` until `globe.tilesLoaded`. Full story + fixes → `references/troubleshooting.md`.

## Architecture

| Layer | Choice | Why |
| --- | --- | --- |
| 3D engine | **CesiumJS** (loaded from CDN at runtime) | True free camera, renders to the horizon, quantized-mesh terrain. CDN load avoids bundling Cesium's webpack assets. |
| Terrain | MapTiler **terrain-quantized-mesh-v2** (`requestVertexNormals`) | Real 3D geometry, sharp silhouettes; reuses the MapTiler key. |
| Imagery | MapTiler **satellite-v2** raster tiles | Draped on the mesh. |
| Harness | **Remotion** (`remotion render --gl=angle`) | Deterministic frame stepping + `delayRender` = every frame fully tile-loaded before capture. Bundled ffmpeg encodes. |

Env `REMOTION_MAPTILER_KEY`, **unrestricted** (a domain-locked key 403s headless).

## How it works (the shape)

1. **Path** — `scripts/prep-cesium-path.mjs` turns a river/route GeoJSON into a smooth camera path:
   clip a window → resample to even spacing → moving-average smooth (continuous curves, **not**
   Douglas-Peucker, which makes straight-then-corner) → dampen lateral deviation toward the chord
   (the single "how much swerve" knob). Output `cesium-path.json`.
2. **Component** — `assets/CesiumFlythrough.tsx`: walk the path by arc length; aim at a real point
   `LOOK_AHEAD_KM` further along (far aim = smooth heading that follows the curve); constant pitch;
   roll = bank into the turn; per frame `settle()` renders until `tilesLoaded`, then `continueRender`.
3. **Render** — `npx remotion render … --gl=angle --concurrency=1`.

Full per-frame camera math, the path pipeline, the exact feel values (alt 4600→4300 m, 13 km over 24 s ≈
0.54 km/s, pitch 76° from nadir, bank ±7.5°), and the complete component → **`references/architecture.md`**.

## Quick start (adapt to a new location)

1. Copy `assets/CesiumFlythrough.tsx` + `assets/example-Root.tsx` into a Remotion project (`src/components/`
   + `src/Root.tsx`). The Composition (in the scaffold) is where duration/dimensions live — see `assets/README.md` for the layout.
2. Get a centerline GeoJSON for your canyon/route (OSM via Overpass; sample in `assets/sample-river.geojson`).
   `node scripts/prep-cesium-path.mjs` runs against the sample out of the box; for your own: pass `<input> <output>`
   and edit `START`/`WINDOW_KM`.
3. Set `REMOTION_MAPTILER_KEY` (unrestricted). Render with `--gl=angle --timeout=180000`.
4. What's generic vs project-specific (path, key, exaggeration, speed) → `assets/README.md`.

## Tuning knobs (each is one number)

| Want | Knob | Where |
| --- | --- | --- |
| Slower / more peaceful | composition duration (seconds) | `<Composition>` |
| More / less swerve | `DAMP` (0.45) | `scripts/prep-cesium-path.mjs` |
| Longer / shorter journey | `TRAVEL_KM` (13) + `WINDOW_KM` | component + script |
| Higher / lower camera | `ALT_START` / `ALT_END` (4600 / 4300 m) | component |
| More horizon | `PITCH_FROM_NADIR` (76°) | component |
| Stronger / weaker bank | `MAX_BANK` / `BANK_GAIN` | component |
| Terrain drama | `verticalExaggeration` (1.1) | component |

## Files

- `assets/CesiumFlythrough.tsx` — the one excellent runnable example (the real component).
- `assets/example-Root.tsx` — minimal Remotion `<Composition>` scaffold (duration = the speed knob).
- `assets/sample-river.geojson` — small OSM gorge centerline; the script's default input.
- `assets/cesium-path.json` — the path the script produces; the component imports it.
- `assets/preview.png` — a still from the proven render.
- `scripts/prep-cesium-path.mjs` — the camera-path generator.
- `references/architecture.md` — full camera math, path pipeline, feel values, complete component.
- `references/troubleshooting.md` — the headless dead-end + every symptom → fix.
