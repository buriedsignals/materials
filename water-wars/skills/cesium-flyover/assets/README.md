# cesium-flyover assets

Runnable terrain and buildings examples. Copy into a Remotion project and adapt.

## Files

| File | What |
| --- | --- |
| `CesiumFlythrough.tsx` | Two-option Remotion component: terrain/satellite or buildings. |
| `example-Root.tsx` | Terrain and Google Photorealistic 3D Tiles compositions. |
| `city-path.json` | Example urban camera path. |
| `sample-river.geojson` | A small OSM gorge centerline (Yarlung Tsangpo) — the default input for the path script. |
| `cesium-path.json` | The camera path the script produces from the sample → the component imports this. |
| `preview.png` | A still from the proven render. |
| `../scripts/prep-cesium-path.mjs` | Generates the camera path from a centerline GeoJSON. |

## Project layout (how the pieces wire up)

The component imports its default terrain path from the same asset directory. It also accepts a
serializable `path` prop, which is the preferred way to supply a project path.

```
your-remotion-project/
  src/
    index.ts                  # registerRoot(RemotionRoot)
    Root.tsx                  # from example-Root.tsx — registers the <Composition>
    components/CesiumFlythrough.tsx
    components/cesium-path.json
  .env
```

Set `REMOTION_MAPTILER_KEY` for terrain or `REMOTION_GOOGLE_MAPS_API_KEY` for Google buildings.

## Generic (works anywhere as-is)

The camera math, provider selection, per-provider tile gate, Cesium-via-Remotion render pattern, and
terrain path pipeline.

## Project-specific — change these for a new location

| In | Change |
| --- | --- |
| `prep-cesium-path.mjs` | `START` (a point **on** your centerline where the corridor opens), `WINDOW_KM`, `DAMP` (swerve). |
| `CesiumFlythrough.tsx` | `ALT_START/ALT_END` (altitudes for **your** terrain's elevation — e.g. Grand Canyon ~1200→1000 m, not Tibet's 4600), `TRAVEL_KM`, `PITCH_FROM_NADIR`, `verticalExaggeration`. |
| `example-Root.tsx` | `durationInFrames` (the speed knob), `width`/`height`, the Composition `id`. |
| env | MapTiler key for terrain; Google Map Tiles key for photorealistic buildings. |
| CDN | Cesium version in the CDN URL (`CESIUM_VER`, pinned `1.143`). |

## Run

```bash
# 1. generate the camera path (works out of the box against sample-river.geojson)
node ../scripts/prep-cesium-path.mjs                       # → cesium-path.json
#    for your own river:  node ../scripts/prep-cesium-path.mjs my-river.geojson src/geo/cesium-path.json

# 2. from the Remotion project root — validate a still, then render
npx remotion still   src/index.ts CesiumFlyover out.png --frame=N --gl=angle --timeout=180000
npx remotion render  src/index.ts CesiumFlyover out.mp4  --gl=angle --concurrency=1 --timeout=180000
```

Google compositions are hard-limited to 30 seconds and must retain all visible attribution and the
promotional-use marker. See `../references/data-sources.md`.
