# Flyover data-source decision

## Terrain and satellite

MapTiler supplies both layers:

- `terrain-quantized-mesh-v2`: elevation encoded as Cesium quantized-mesh terrain.
- `satellite-v2`: raster satellite imagery draped on that mesh.

CesiumJS renders them. It does not supply either dataset.

Official documentation:

- https://docs.maptiler.com/cesium/
- https://docs.maptiler.com/schema-raster/terrain-3d/

## Buildings

### Google Photorealistic 3D Tiles

Choose for recognizable cities and landmarks. The product is a high-resolution 3D mesh already
textured with imagery, so disable the Cesium globe and do not combine it with MapTiler satellite or
terrain.

Requirements: billing-enabled Google Cloud project, Map Tiles API, API key, visible credits, and
policy-compliant use. Google's current video permission is limited to promotional videos about the
application, no longer than 30 seconds and marked “for promotional purposes only.”

Official documentation:

- https://developers.google.com/maps/documentation/tile/3d-tiles
- https://developers.google.com/maps/documentation/tile/policies

### Cesium OSM Buildings

Choose for global building massing, metadata, or a comparison render. Cesium ion streams a global 3D
Tiles layer derived from OpenStreetMap. It contains hundreds of millions of buildings but normally
renders inferred forms and colors rather than photographic façade/roof textures.

It can sit over MapTiler satellite-draped terrain. This produces plausible ground with geometric
buildings, not a unified photorealistic scene. Use a Cesium ion access token in production.

Official documentation:

- https://cesium.com/platform/cesium-ion/content/cesium-osm-buildings/
- https://cesium.com/learn/cesiumjs/ref-doc/global.html#createOsmBuildingsAsync

### MapTiler Buildings

MapTiler Buildings provides vector building footprints, approximate heights, colors, roof shapes,
and labels. It is useful for stylized `fill-extrusion` maps, but it is not textured photogrammetry
and is not a direct substitute for a Cesium 3D Tiles buildings mesh.

Official documentation:

- https://docs.maptiler.com/schema/buildings/
