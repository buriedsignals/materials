import "../../../src/components/materials-nav.js";

const key = import.meta.env.VITE_MAPTILER_API_KEY;
const status = document.querySelector(".status");
const launch = document.querySelector(".ar-launch");
const exit = document.querySelector(".ar-exit");
const rotatePrompt = document.querySelector(".rotate-prompt");
if (!key) {
  status.textContent = "Map unavailable: VITE_MAPTILER_API_KEY is not configured.";
  launch.disabled = true;
  throw new Error("VITE_MAPTILER_API_KEY is required for the AR map");
}

window.maptilersdk.config.apiKey = key;

const isMobile = () =>
  window.innerWidth <= 1024 ||
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const map = new window.maptilersdk.Map({
  container: "map",
  style: window.maptilersdk.MapStyle.SATELLITE,
  zoom: isMobile() ? 9.8 : 10.5,
  center: [94.954562, 29.35115],
  pitch: 58,
  minPitch: 0,
  maxPitch: 85,
  bearing: -18,
  maxZoom: 20,
  navigationControl: false,
  geolocateControl: false,
  attributionControl: true,
  maptilerLogo: true,
  pixelRatio: Math.min(window.devicePixelRatio || 1, 3),
  maxTileCacheZoomLevels: 5,
  preserveDrawingBuffer: true,
});

let arControl;
let previousPortrait = window.innerHeight > window.innerWidth;

const openAR = async () => {
  if (!arControl) return;
  try {
    status.textContent = "Opening AR…";
    const session = arControl.run();
    document.body.classList.add("ar-active");
    exit.hidden = false;
    status.textContent = "AR active · Q closes the experience";
    await session;
  } catch (error) {
    document.body.classList.remove("ar-active");
    exit.hidden = true;
    status.textContent = "AR could not start on this device.";
    console.error(error);
  }
};

const closeAR = async () => {
  if (!arControl) return;
  document.body.classList.remove("ar-active");
  exit.hidden = true;
  status.textContent = "Map ready";
  try {
    await arControl.close();
  } catch {
    // The control may already be closed.
  }
};

launch.addEventListener("click", openAR);
exit.addEventListener("click", closeAR);

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "a") openAR();
  if (event.key.toLowerCase() === "q") closeAR();
});

const updateOrientation = () => {
  const portrait = window.innerHeight > window.innerWidth;
  rotatePrompt.hidden = !(isMobile() && portrait);
  if (isMobile() && previousPortrait && !portrait && arControl) {
    window.setTimeout(openAR, 350);
  }
  previousPortrait = portrait;
};

window.addEventListener("resize", updateOrientation);
window.addEventListener("orientationchange", () => window.setTimeout(updateOrientation, 100));
updateOrientation();

map.on("load", async () => {
  map.addSource("terrain", {
    type: "raster-dem",
    url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${key}`,
    tileSize: 512,
  });
  map.setTerrain({source: "terrain", exaggeration: 1});

  map.addSource("maptiler-planet", {
    type: "vector",
    url: `https://api.maptiler.com/tiles/v3/tiles.json?key=${key}`,
  });

  const riverFilter = [
    "all",
    ["==", ["get", "class"], "river"],
    [
      "match",
      ["coalesce", ["get", "name_en"], ["get", "name"], ""],
      ["Yarlung Tsangpo", "Brahmaputra", "Brahmaputra River", "Jamuna River"],
      true,
      false,
    ],
  ];

  map.addLayer({
    id: "yarlung-glow",
    type: "line",
    source: "maptiler-planet",
    "source-layer": "waterway",
    filter: riverFilter,
    layout: {"line-join": "round", "line-cap": "round"},
    paint: {
      "line-color": "#49C6FF",
      "line-width": 11,
      "line-opacity": 0.32,
      "line-blur": 6,
    },
  });
  map.addLayer({
    id: "yarlung-core",
    type: "line",
    source: "maptiler-planet",
    "source-layer": "waterway",
    filter: riverFilter,
    layout: {"line-join": "round", "line-cap": "round"},
    paint: {
      "line-color": "#E8F7FF",
      "line-width": 3.2,
    },
  });

  try {
    const loadGeoJSON = async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Could not load ${url}: ${response.status}`);
      }
      return response.json();
    };

    const border = await loadGeoJSON("/water-wars/geo/china-india-border.geojson");

    map.addSource("china-india-border", {type: "geojson", data: border});
    map.addLayer({
      id: "china-india-border",
      type: "line",
      source: "china-india-border",
      layout: {"line-join": "round", "line-cap": "round"},
      paint: {
        "line-color": "#49C6FF",
        "line-width": 6,
        "line-dasharray": [1.5, 1.1],
      },
    });
  } catch (error) {
    console.error("Editorial map layers could not load.", error);
  }

  map.addSource("medog-tunnel", {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {name: "Proposed Medog tunnel"},
      geometry: {
        type: "LineString",
        coordinates: [
          [94.85654865507848, 29.517405915061474],
          [95.05257692670521, 29.184895093913187],
        ],
      },
    },
  });

  const layers = [
    {id: "tunnel-glow-outer", color: "#d4a853", width: 18, blur: 12, opacity: 0.22},
    {id: "tunnel-glow", color: "#d4a853", width: 10, blur: 6, opacity: 0.42},
    {id: "tunnel-line", color: "#f1cc78", width: 4, blur: 0, opacity: 0.98},
    {id: "tunnel-highlight", color: "#fff4d4", width: 1.4, blur: 0, opacity: 0.95},
  ];

  layers.forEach((layer) => {
    map.addLayer({
      id: layer.id,
      type: "line",
      source: "medog-tunnel",
      layout: {"line-join": "round", "line-cap": "round"},
      paint: {
        "line-color": layer.color,
        "line-width": layer.width,
        "line-blur": layer.blur,
        "line-opacity": layer.opacity,
      },
    });
  });

  map.addSource("medog-sites", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Point",
            coordinates: [94.85654865507848, 29.517405915061474],
          },
        },
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Point",
            coordinates: [95.05238459624796, 29.184932965305112],
          },
        },
      ],
    },
  });
  map.addLayer({
    id: "medog-sites-halo",
    type: "circle",
    source: "medog-sites",
    paint: {
      "circle-color": "#101613",
      "circle-radius": 11,
      "circle-opacity": 0.72,
      "circle-blur": 0.18,
    },
  });
  map.addLayer({
    id: "medog-sites",
    type: "circle",
    source: "medog-sites",
    paint: {
      "circle-color": "#D4A853",
      "circle-radius": 7,
      "circle-stroke-color": "#FFF9EB",
      "circle-stroke-width": 1.6,
    },
  });

  map.addSource("medog-tunnel-label", {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {name: "MEDOG TUNNEL"},
      geometry: {
        type: "Point",
        coordinates: [94.9447, 29.3678],
      },
    },
  });
  map.addLayer({
    id: "medog-tunnel-label",
    type: "symbol",
    source: "medog-tunnel-label",
    layout: {
      "text-field": ["get", "name"],
      "text-size": 14,
      "text-offset": [0, 0],
      "text-anchor": "center",
      "text-allow-overlap": true,
      "text-pitch-alignment": "viewport",
      "text-rotation-alignment": "viewport",
    },
    paint: {
      "text-color": "#D4A853",
      "text-halo-color": "#101613",
      "text-halo-width": 2,
    },
  });

  arControl = new window.maptilerarcontrol.MaptilerARControl({activateAR: true});
  map.addControl(arControl, "top-left");
  status.textContent = "Map ready";
  launch.disabled = false;
});

map.on("error", (event) => {
  console.error(event.error || event);
  status.textContent = "Some map resources could not load.";
});
