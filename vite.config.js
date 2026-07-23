import { defineConfig } from 'vite';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const projectSlugs = new Set(
  readdirSync(resolve(root, 'projects'), {withFileTypes: true})
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name),
);

export default defineConfig({
  plugins: [{
    name: 'project-materials-dev-routes',
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        const url = new URL(request.url, 'http://materials.local');
        const [slug, assetType] = url.pathname.split('/').filter(Boolean);
        const isProjectAsset =
          projectSlugs.has(slug) &&
          ['project.json', 'data', 'geo', 'media'].includes(assetType);
        if (isProjectAsset) {
          request.url = `/projects${url.pathname}${url.search}`;
        }
        next();
      });
    },
  }],
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        mapExplainer: resolve(root, 'skill-docs/map-explainer/index.html'),
        threeDFlyover: resolve(root, 'skill-docs/3d-flyover/index.html'),
        chartAnimations: resolve(root, 'skill-docs/newsroom-chart-animations/index.html'),
        arMap: resolve(root, 'lab/water-wars/ar-map/index.html'),
      },
    },
  },
});
