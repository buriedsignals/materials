import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import {basename, resolve} from "node:path";

const projectsRoot = resolve("projects");
const distRoot = resolve("dist");
const shellPath = resolve(distRoot, "index.html");
const shell = readFileSync(shellPath, "utf8");

const copyDirectory = (source, destination) => {
  if (!existsSync(source)) return;
  mkdirSync(destination, {recursive: true});
  cpSync(source, destination, {recursive: true, force: true});
};

const copyFlatDirectory = (source, destination) => {
  if (!existsSync(source)) return;
  mkdirSync(destination, {recursive: true});
  for (const entry of readdirSync(source, {withFileTypes: true})) {
    cpSync(
      resolve(source, entry.name),
      resolve(destination, entry.name),
      {recursive: true, force: true},
    );
  }
};

const redirectDocument = (target) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="0; url=${target}">
  <link rel="canonical" href="${target}">
  <title>Moved — Buried Signals Materials</title>
</head>
<body>
  <p>This page has moved to <a href="${target}">${target}</a>.</p>
  <script>location.replace(${JSON.stringify(target)} + location.search + location.hash)</script>
</body>
</html>
`;

const writeRedirect = (relativePath, target) => {
  const destination = resolve(distRoot, relativePath);
  mkdirSync(destination, {recursive: true});
  writeFileSync(resolve(destination, "index.html"), redirectDocument(target));
};

const projectDirectories = readdirSync(projectsRoot, {withFileTypes: true})
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

mkdirSync(resolve(distRoot, "investigations"), {recursive: true});

for (const slug of projectDirectories) {
  const source = resolve(projectsRoot, slug);
  const manifestPath = resolve(source, "project.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  if (manifest.id !== slug) {
    throw new Error(`Project folder "${slug}" does not match manifest id "${manifest.id}"`);
  }

  const published = resolve(distRoot, slug);
  mkdirSync(published, {recursive: true});
  cpSync(manifestPath, resolve(published, "project.json"));
  writeFileSync(resolve(published, "index.html"), shell);

  for (const directory of ["data", "geo", "media"]) {
    copyDirectory(resolve(source, directory), resolve(published, directory));
  }

  // Compatibility aliases for URLs published before the project-first layout.
  cpSync(manifestPath, resolve(distRoot, "investigations", `${slug}.json`));
  copyDirectory(resolve(source, "data"), resolve(distRoot, "data", slug));
  copyFlatDirectory(resolve(source, "geo"), resolve(distRoot, "geo"));
  copyFlatDirectory(resolve(source, "media"), resolve(distRoot, "media"));
}

const skillSlugs = readdirSync(resolve("skills"), {withFileTypes: true})
  .filter((entry) => entry.isDirectory())
  .map((entry) => basename(entry.name));

for (const slug of skillSlugs) {
  writeRedirect(`skills/${slug}`, `/skill-docs/${slug}/`);
}

writeRedirect("skills/ar-map", "/lab/water-wars/ar-map/");
writeRedirect("lab/ar-map", "/lab/water-wars/ar-map/");
