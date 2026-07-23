# Buried Signals materials

Public investigation materials, reusable newsroom skills, and experimental
companions published at [materials.buriedsignals.com](https://materials.buriedsignals.com/).

## Repository map

- `projects/` — one self-contained folder per published investigation, including
  its manifest, data, geographic files, and media.
- `skills/` — canonical, downloadable skill packages.
- `skill-docs/` — public pages that explain and demonstrate those skills.
- `lab/` — experimental interactive companions, nested under their originating
  project.
- `src/` — shared website code and components.
- `public/` — global deployment files only.

The build publishes canonical project pages at `/<project>/`, copies each skill
into its documentation page, creates downloadable ZIPs under `/downloads/`, and
retains compatibility aliases for previously published URLs.
