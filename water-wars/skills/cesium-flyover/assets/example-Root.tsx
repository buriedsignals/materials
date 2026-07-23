import React from "react";
import {Composition} from "remotion";
import cityPath from "./city-path.json";
import {
  CesiumFlythrough,
  type CesiumFlythroughProps,
} from "./CesiumFlythrough";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="TerrainSatelliteFlyover"
      component={CesiumFlythrough}
      defaultProps={{mode: "terrain-satellite"} satisfies CesiumFlythroughProps}
      durationInFrames={24 * 30}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="GooglePhotorealisticFlyover"
      component={CesiumFlythrough}
      defaultProps={
        {
          mode: "buildings",
          buildingsProvider: "google-photorealistic",
          path: cityPath as [number, number][],
          altitudeStart: 700,
          altitudeEnd: 500,
          lookAheadKm: 0.7,
          travelKm: 4.5,
          pitchFromNadir: 72,
          verticalExaggeration: 1,
          maximumScreenSpaceError: 6,
        } satisfies CesiumFlythroughProps
      }
      durationInFrames={18 * 30}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
