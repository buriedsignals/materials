# cesium-flyover assets

The one excellent, runnable example. Copy into a Remotion project and adapt.

## Files

| File | What |
| --- | --- |
| `CesiumFlythrough.tsx` | The Remotion component (the technique). → your project's `src/components/`. |
| `example-Root.tsx` | Minimal Remotion scaffold showing the `<Composition>` (where duration/dimensions live). → your project's `src/Root.tsx`. |
| `sample-river.geojson` | A small OSM gorge centerline (Yarlung Tsangpo) — the default input for the path script. |
| `cesium-path.json` | The camera path the script produces from the sample → the component imports this. |
| `preview.png` | A still from the proven render. |
| `../scripts/prep-cesium-path.mjs` | Generates the camera path from a centerline GeoJSON. |

## Project layout (how the pieces wire up)

The component does `import cesiumPath from "../geo/cesium-path.json"`. In a Remotion project that means:

```
your-remotion-project/
  src/
    index.ts                  # registerRoot(RemotionRoot)
    Root.tsx                  # from example-Root.tsx — registers the <Composition>
    components/CesiumFlythrough.tsx
    geo/cesium-path.json      # the generated path the component imports (../geo from components/)
  .env                        # REMOTION_MAPTILER_KEY=...
```

So: run the path script, then put its output at `src/geo/cesium-path.json` (or point the script's 2nd arg there).

## Generic (works anywhere as-is)

The camera math (arc-length walk, look-ahead aim, pitch, bank), the `settle()` tile gate, the MapTiler
terrain/imagery providers, the Cesium-via-Remotion render pattern, and the path pipeline (clip → resample
→ smooth → dampen).

## Project-specific — change these for a new location

| In | Change |
| --- | --- |
| `prep-cesium-path.mjs` | `START` (a point **on** your centerline where the corridor opens), `WINDOW_KM`, `DAMP` (swerve). |
| `CesiumFlythrough.tsx` | `ALT_START/ALT_END` (altitudes for **your** terrain's elevation — e.g. Grand Canyon ~1200→1000 m, not Tibet's 4600), `TRAVEL_KM`, `PITCH_FROM_NADIR`, `verticalExaggeration`. |
| `example-Root.tsx` | `durationInFrames` (the speed knob), `width`/`height`, the Composition `id`. |
| env | `REMOTION_MAPTILER_KEY` — **unrestricted** MapTiler key (a domain-locked key 403s headless). |
| CDN | Cesium version in the CDN URL (`CESIUM_VER`, pinned `1.124`). |

## Run

```bash
# 1. generate the camera path (works out of the box against sample-river.geojson)
node ../scripts/prep-cesium-path.mjs                       # → cesium-path.json
#    for your own river:  node ../scripts/prep-cesium-path.mjs my-river.geojson src/geo/cesium-path.json

# 2. from the Remotion project root — validate a still, then render
npx remotion still   src/index.ts CesiumFlyover out.png --frame=N --gl=angle --timeout=180000
npx remotion render  src/index.ts CesiumFlyover out.mp4  --gl=angle --concurrency=1 --timeout=180000
```

Dependencies: `remotion` (4.0.x) for the component. The prep script is **dependency-free** (plain Node —
it hand-rolls haversine/resampling). Cesium loads from CDN at render time (needs network). See
`../references/troubleshooting.md` if the globe won't draw.
