import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        mapExplainer: resolve(root, 'skills/map-explainer/index.html'),
        threeDFlyover: resolve(root, 'skills/3d-flyover/index.html'),
        chartAnimations: resolve(root, 'skills/newsroom-chart-animations/index.html'),
        arMap: resolve(root, 'skills/ar-map/index.html'),
      },
    },
  },
});
