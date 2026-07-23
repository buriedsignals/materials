---
name: cesium-flyover
description: Create deterministic Remotion videos of real geography with CesiumJS. Use for cinematic flyovers or fly-throughs using either satellite-draped 3D terrain or textured 3D cities and landmarks. Covers MapTiler quantized-mesh terrain, Google Photorealistic 3D Tiles, Cesium OSM Buildings comparison renders, camera paths, tile settling, attribution, and headless WebGL rendering.
---

# Cesium flyovers

Use CesiumJS as the renderer and Remotion as the deterministic frame driver. Choose the data stack
before building the camera path.

## Choose one flyover option

| Option | Data stack | Use for |
| --- | --- | --- |
| `terrain-satellite` | MapTiler quantized-mesh terrain + MapTiler satellite imagery | Mountains, gorges, coastlines, river corridors, long rural routes |
| `buildings` | Google Photorealistic 3D Tiles by default | Cities, landmarks, recognizable architecture |

CesiumJS is not the terrain or imagery source. It renders the selected provider data.

For `buildings`, use `buildingsProvider: "google-photorealistic"` for final visual quality. Google
provides one textured photogrammetric mesh containing terrain, buildings, and imagery; hide Cesium's
globe and do not add MapTiler underneath it.

Use `buildingsProvider: "cesium-osm"` only for a low-cost comparison or when photorealism is not
needed. It adds Cesium OSM Buildings over the MapTiler terrain/satellite ground. These are
OpenStreetMap-derived building forms, not textured photogrammetry. MapTiler's Buildings product is a
vector-footprint tileset for extrusion in a vector-map renderer, not a drop-in photorealistic
CesiumJS mesh.

Read `references/data-sources.md` before choosing a buildings provider.

## Google usage constraint

Enforce all of the following for `google-photorealistic`:

- Keep the composition at **30 seconds or less**. The component rejects longer compositions.
- Keep `showCreditsOnScreen: true`; never hide or crop the Cesium credit display.
- Keep the visible “For promotional purposes only” marker.
- Use it only for a promotional video about the application. Google's current Map Tiles policy does
  not grant general documentary/editorial video use.
- Do not cache, prefetch, extract, or derive data from the tiles.

## Required environment

```text
REMOTION_MAPTILER_KEY=...          # terrain-satellite; also cesium-osm ground
REMOTION_GOOGLE_MAPS_API_KEY=...   # Google Map Tiles API key
REMOTION_CESIUM_ION_TOKEN=...      # cesium-osm production use
```

Use an unrestricted MapTiler key for local headless rendering. Restrict the Google key to the Map
Tiles API; local Remotion rendering must be permitted by its application restriction.

## Build

1. Copy `assets/CesiumFlythrough.tsx`, the relevant path JSON, and `assets/example-Root.tsx` into the
   Remotion project, or import the component directly.
2. For terrain, generate a smoothed path with `scripts/prep-cesium-path.mjs`.
3. For a city, create a short `[longitude, latitude][]` path passing the subject and set lower
   absolute camera altitudes.
4. Select `mode` and, for buildings, `buildingsProvider`.
5. Render a middle-frame still and inspect subject framing, mesh refinement, credits, and blur.
6. Render with one browser:

```bash
npx remotion still src/index.ts <Comp> out.png --frame=N --gl=angle --timeout=180000
npx remotion render src/index.ts <Comp> out.mp4 --gl=angle --concurrency=1 --timeout=180000
```

## Non-negotiable render mechanics

- Set `viewer.useDefaultRenderLoop = false`.
- Call `viewer.render()`, never `scene.render()`, while settling each frame.
- Use `preserveDrawingBuffer: true`.
- Gate initialization and every frame with `delayRender(..., {timeoutInMilliseconds: ...})`.
- For terrain, settle on `globe.tilesLoaded`.
- For buildings, settle on `tileset.tilesLoaded`.
- Keep provider attribution visible.

Read `references/architecture.md` for camera math and `references/troubleshooting.md` when a frame is
blank, coarse, unauthorized, or times out.

## Assets

- `assets/CesiumFlythrough.tsx` — reusable two-option component.
- `assets/example-Root.tsx` — terrain and Google buildings compositions.
- `assets/cesium-path.json` — proven Yarlung Tsangpo terrain path.
- `assets/city-path.json` — urban example path.
- `assets/sample-river.geojson` — input for the path generator.
- `assets/preview.png` — terrain reference still.
- `scripts/prep-cesium-path.mjs` — dependency-free route smoother.
