import {spawnSync} from "node:child_process";
import {cpSync, mkdirSync, rmSync} from "node:fs";
import {resolve} from "node:path";

const skills = [
  "map-explainer",
  "3d-flyover",
  "newsroom-chart-animations",
];
const skillsRoot = resolve("water-wars/skills");
const publishedRoot = resolve("dist/skills");
const downloadsRoot = resolve("dist/downloads");

mkdirSync(publishedRoot, {recursive: true});
mkdirSync(downloadsRoot, {recursive: true});

for (const skill of skills) {
  const source = resolve(skillsRoot, skill);
  const published = resolve(publishedRoot, skill);
  const archive = resolve(downloadsRoot, `${skill}.zip`);

  rmSync(archive, {force: true});
  mkdirSync(published, {recursive: true});
  cpSync(source, published, {recursive: true, force: true});

  const result = spawnSync("zip", ["-rq", archive, skill], {
    cwd: skillsRoot,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    throw new Error(`Failed to create ${skill}.zip`);
  }
}
