import {cpSync, mkdirSync} from "node:fs";
import {resolve} from "node:path";

const source = resolve("water-wars/skills/3d-flyover");
const destination = resolve("dist/skills/3d-flyover");

mkdirSync(destination, {recursive: true});
cpSync(source, destination, {recursive: true, force: true});
