# Cesium Flyover — architecture reference

Deep detail behind `SKILL.md`: terrain/imagery loading, the camera-path pipeline, the per-frame camera
math, the proven "feel" values, and the complete component. Values are from the operator-approved
water-wars render (24 s helicopter glide through the Yarlung Tsangpo gorge).

## 1. Terrain & imagery (MapTiler in Cesium)

```ts
const viewer = new Cesium.Viewer(container, {
  baseLayer: false,                 // no Cesium-ion default imagery; add our own
  baseLayerPicker: false, geocoder: false, homeButton: false, sceneModePicker: false,
  navigationHelpButton: false, animation: false, timeline: false, fullscreenButton: false,
  infoBox: false, selectionIndicator: false,
  contextOptions: { webgl: { preserveDrawingBuffer: true } },   // Remotion screenshot needs this
});
viewer.imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
  url: `https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=${KEY}`,
  maximumLevel: 20, credit: "MapTiler",
}));
viewer.useDefaultRenderLoop = false;       // we drive frames by hand (see §5 / troubleshooting)
viewer.scene.skyAtmosphere.show = true;    // blue horizon, not a void at high pitch
viewer.scene.fog.enabled = true;           // distance haze
viewer.scene.globe.enableLighting = false; // imagery already lit → even, neutral look
viewer.scene.verticalExaggeration = 1.1;   // 1.0 = true scale; 1.1 = subtle drama
viewer.cesiumWidget.creditContainer.style.display = "none";
viewer.terrainProvider = await Cesium.CesiumTerrainProvider.fromUrl(
  `https://api.maptiler.com/tiles/terrain-quantized-mesh-v2/?key=${KEY}`,
  { requestVertexNormals: true },          // normals = correct silhouette shading
);
```

No Cesium-ion token needed — MapTiler provides both terrain and imagery. Load Cesium from CDN (set
`window.CESIUM_BASE_URL` to the CDN before injecting `Cesium.js`, so its Web Workers load from the CDN
too); pin a version (`1.124` shipped water-wars).

## 2. The camera path — structure & generation

Three properties matter, in order:

1. **Continuous curvature** — the camera must flow through curves, never "fly straight, snap to a new
   heading, fly straight." This rules out aggressive Douglas-Peucker (`turf.simplify`): few sparse
   control points → a spline that's near-straight between them with all bend at each point → snap-to-
   corner. **Resample → moving-average smooth instead** (a moving average is inherently continuous).
2. **Minimized amplitude** — gentle leans, not weaving. **Dampen the smoothed path toward its straight
   start→end chord** by a fixed fraction `DAMP` (0 = dead straight, 1 = full river). The single swerve knob.
3. **Enough length** — `PATHKM ≥ TRAVEL_KM + 2·LOOK_AHEAD_KM` so the look-ahead aim never clamps.

`scripts/prep-cesium-path.mjs` does: clip a window of the source centerline → resample to even
arc-length spacing (0.1 km) → moving-average smooth (±2.8 km window, 2 passes) → dampen toward the chord
(`DAMP=0.45`). Validate with the heading-delta probe it prints — deltas should be small and change
*gradually* (water-wars: `3,0,-1,-3,-4,1,7,9,5,-5,-12,-7,…`). Big jumps = corners = bad.

**Source data:** OSM via Overpass (~0.3 km vertex spacing) — Natural Earth is too coarse for inner
gorges. overpass-api.de is often busy → mirror `overpass.kumi.systems`.

## 3. Camera animation per frame (position, heading, pitch, bank)

Walk the path by **arc length** (precompute cumulative distances once). Every frame:

- **Position** = the point at `dCam` km along the path, altitude `lerp(ALT_START, ALT_END, prog)`.
- **Heading** = bearing from the camera point to a **real point `LOOK_AHEAD_KM` further along the same
  path**. A far aim averages wiggle → smooth heading; on a curved path it leads into the bend, so the
  heading turns gently with the path. (A local-tangent aim spins the camera at every kink — don't.)
- **Pitch** = constant. We keep a MapLibre-style param `PITCH_FROM_NADIR` (90 = horizon), then convert:
  **Cesium pitch = `-(90 - PITCH_FROM_NADIR)`** (Cesium: 0 = horizon, -90 = straight down). 76° → -14°.
- **Bank (roll)** = lean *into* the turn — the helicopter tell. Measure turn rate as the bearing change
  between `aim` and a point `2·LOOK_AHEAD_KM` ahead; `roll = clamp(dH · BANK_GAIN, ±MAX_BANK)`. Because
  the path is smooth, `dH` changes gradually → the bank eases in and out, never jerks.

```ts
const setCamera = (C, viewer, prog) => {
  const dCam = Math.min(TRAVEL_KM, PATHKM - LOOK_AHEAD_KM * 2) * prog;
  const cam  = alongPath(dCam);                    // arc-length point
  const aim  = alongPath(dCam + LOOK_AHEAD_KM);     // heading target (real point on the path)
  const aim2 = alongPath(dCam + LOOK_AHEAD_KM * 2); // turn-rate probe → bank
  const heading = bearing(cam, aim);
  let dH = bearing(aim, aim2) - heading; while (dH > Math.PI) dH -= 2*Math.PI; while (dH < -Math.PI) dH += 2*Math.PI;
  viewer.camera.setView({
    destination: C.Cartesian3.fromDegrees(cam[0], cam[1], lerp(ALT_START, ALT_END, prog)),
    orientation: { heading, pitch: C.Math.toRadians(-(90 - PITCH_FROM_NADIR)), roll: clamp(dH * BANK_GAIN, -MAX_BANK, MAX_BANK) },
  });
};
```

> **Cesium vs MapLibre conventions (gotcha):** Cesium heading is radians, 0 = north, clockwise. Pitch
> 0 = horizon, negative = down (MapLibre is the inverse). Roll positive = bank right; tune the sign by eye.

## 4. The feel — proven water-wars values

| Param | Value | Meaning |
| --- | --- | --- |
| `TRAVEL_KM` | 13 | How far the camera travels. **Speed = `TRAVEL_KM / durationSeconds`.** |
| duration | 24 s (720 f @30) | 13 km / 24 s ≈ **0.54 km/s** — a slow, peaceful glide. 8 s felt "extremely rushed". |
| `ALT_START → ALT_END` | 4600 → 4300 m ASL | Absolute (terrain-independent). Inside the corridor walls → fly *through*, not over. |
| `LOOK_AHEAD_KM` | 1.5 | Heading smoothness vs responsiveness. |
| `PITCH_FROM_NADIR` | 76° | Stare-ahead down the corridor (90 = level). → Cesium -14°. |
| `MAX_BANK` / `BANK_GAIN` | 0.13 rad (~7.5°) / 0.6 | Helicopter lean into turns. |
| `verticalExaggeration` | 1.1 | Subtle terrain drama. |
| `DAMP` (prep) | 0.45 | Swerve amount: higher = weavier, lower = straighter. |

**A slow camera renders fast.** At 0.54 km/s the camera moves ~18 m/frame, so tiles stay cached and each
`settle()` returns almost immediately; the 720-frame render completed in one pass (no chunk-rendering).

## 5. The complete component

The full, runnable component is `../assets/CesiumFlythrough.tsx` — read it directly. Its shape:

- `loadCesium()` — inject `CESIUM_BASE_URL` + the CDN `Cesium.js`, resolve when loaded.
- init effect — build the Viewer (§1), `setCamera(…, 0)`, `await settle(viewer)`, `continueRender`.
- `settle(viewer)` — the per-frame tile gate: loop `viewer.render()` until `globe.tilesLoaded` is stable
  for ~8 ticks (cap ~600), then resolve. **`viewer.render()`, never `scene.render()`** (the latter skips
  frame-init, so tiles never advance — see `troubleshooting.md`).
- per-frame effect — `delayRender({timeout: 60000})` → `setCamera(prog)` → `settle()` → `continueRender`.

## 6. Render

```bash
npx remotion still   src/index.ts <Comp> out.png --frame=N --gl=angle --timeout=180000   # validate framing/bank first
npx remotion render  src/index.ts <Comp> out.mp4  --gl=angle --concurrency=1 --timeout=180000
```

`--gl=angle` is mandatory (WebGL globe). `--concurrency=1` — one browser; `settle()` already serializes
tile loading. Unlike a MapLibre raster-DEM drape, the Cesium stare-ahead render does **not** accumulate
terrain memory into a late-frame stall (720 frames, one pass).
