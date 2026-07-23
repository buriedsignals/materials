// Minimal Remotion scaffold for the flyover. In a Remotion project (`npx create-video@latest`, blank
// template), this is `src/Root.tsx`; `src/index.ts` is just `registerRoot(RemotionRoot)`.
//
// The Composition is where you set DURATION (the primary speed knob) and dimensions. The component reads
// durationInFrames / width / height from useVideoConfig(). Speed = TRAVEL_KM / (durationInFrames / fps).
// Render with: npx remotion render src/index.ts CesiumFlyover out.mp4 --gl=angle --concurrency=1 --timeout=180000

import React from "react";
import { Composition } from "remotion";
import { CesiumFlythrough } from "./CesiumFlythrough"; // → src/components/CesiumFlythrough.tsx in your project

export const RemotionRoot: React.FC = () => (
  <Composition
    id="CesiumFlyover"
    component={CesiumFlythrough}
    durationInFrames={24 * 30} // 24 s @ 30 fps — the proven, peaceful pace; raise for slower
    fps={30}
    width={1920}
    height={1080}
  />
);
