---
name: newsroom-chart-animations
description: Use for designing, building, reviewing, or revising evidence-led
  charts, graphs, timelines, counters, rankings, ledgers, and other data
  animations for Buried Signals. Load alongside the project Remotion skill;
  includes Newpress reference research, newsroom visual standards, motion
  grammar, sourcing, and multi-format QA.
---
# Newsroom Chart Animations

Use this skill together with the project `remotion` skill. The Remotion skill governs frame-accurate React implementation; this skill governs reference research, editorial design, data integrity, and chart-specific motion.

## Editorial standard

Treat every chart as an evidence-bearing news document, not an illustration, dashboard, or decorative interlude.

Every visible layer must encode data, supply context, establish hierarchy, support verification, or direct attention to the narrator's current claim. If removing a layer does not reduce comprehension, remove it.

A map can use terrain, contours, rivers, and administrative lines because those features may be evidence. A chart must not borrow that vocabulary merely to resemble the map. The rejected Water Wars direction used sand relief, contour lines, river traces, particles, and ambient parallax; it felt decorative and weakened the evidence. The successful version used a flat warm field, explicit scale, sparse dates, neutral history, one semantic accent, direct annotation, and visible sourcing.

Visual interest comes from sequencing, comparison, annotation, and the arrival of evidence—not ornamental motion.

## Required research before design

Before coding a substantial chart or establishing a new chart family:

1. Read the exact narration. State what the chart must prove, what it merely contextualizes, and what it cannot establish.
2. Inspect the data: categories, years, units, denominators, missing values, revisions, and effective dates. Independently recalculate highlighted totals, differences, percentages, and records.
3. Find three to six concrete news or documentary examples. Start with Newpress-network work when relevant, then other rigorous newsroom graphics. Search for the same chart type or argument structure, not vague aesthetic terms.
4. Use `yt-dlp` for metadata or a low-resolution internal reference copy and FFmpeg for exact-frame extraction. Record channel, title, URL, timestamp, and transferable lesson. Never reuse reference media in production.
5. Write a short brief before implementation: evidence hierarchy, annotation logic, reveal order, source placement, transferable rules, and explicit anti-patterns.
6. Translate editorial logic; do not imitate another channel's brand surface.

```bash
yt-dlp --no-update --skip-download --print '%(title)s | %(channel)s | %(webpage_url)s' '<url>'
yt-dlp --no-update -f 'bestvideo[height<=720]/best[height<=720]' -o '<reference-dir>/%(id)s.%(ext)s' '<url>'
ffmpeg -ss '<timestamp>' -i '<reference-video>' -frames:v 1 '<reference-dir>/<label>.jpg'
```

For the Water Wars example, review `production/water-wars/motion/references/newpress/reference-notes.md` and its extracted stills.

## Information architecture

Build the frame in this order:

1. A precise title stating what is measured. Do not insert unsupported causality.
2. A readable unit or descriptor.
3. A visible source immediately below the header—not a tiny footer.
4. The plot, with an honest baseline and enough scale to interpret magnitude.
5. Sparse axes and dates that supply context without becoming wallpaper.
6. Direct annotations for the one or two findings used by the narration.

Do not duplicate information. If `2024` is on the x-axis, a callout should give the value or finding, not repeat `2024`. If a highlighted bar carries its value, do not repeat it in a detached legend.

For long timelines, prefer start, meaningful midpoint, and end labels unless every interval matters. A literal midpoint such as 2012 between 2000 and 2024 clarifies the span. Axis years must survive video compression.

For bars and columns, show zero and a visible y-scale. Sparse grid lines are evidence, not clutter. State the unit.

## Visual system

- Default to a flat warm paper/off-white field or a flat dark editorial field.
- Use neutral colors for history or comparison. Reserve one semantic accent for the subject, anomaly, current period, or conclusion.
- Keep fills flat. Use gradients only when they encode quantity, range, or uncertainty.
- Use restrained grid lines with adequate contrast.
- Make the title strongest, axis labels readable, the source legible, and annotations direct.
- Let brand colors serve chart semantics; never paint every mark with the accent.
- Prefer endpoint labels and direct annotations over detached legends.

## Motion grammar

1. Establish title, source, unit, grid, and axes.
2. Reveal historical or comparison data in chronological or argumentative order.
3. Pause so the baseline can be read.
4. Introduce the subject, anomaly, current period, or second series as a distinct event.
5. Add the conclusion only after its evidence is visible.
6. Hold the completed chart stable for roughly 0.5–1 second or longer while narration continues.

Data entering the frame is the motion event. The background generally remains still. Do not animate every layer at once. Bar growth originates at the baseline; line drawing follows the data path; annotation motion stays quieter than the data reveal.

Use clamped `interpolate()` or restrained `spring()` timing. Reveals must follow time/category order rather than arbitrary bounce.

## Chart-type rules

### Bars and columns

- Start at zero unless a clearly disclosed exception is essential.
- Use flat fills and consistent widths/gaps.
- Direct-label highlighted values. Label all values only when exact comparison requires it.
- Make a final or record bar a distinct event rather than merely the last item in a uniform cascade.

### Lines

- Never smooth a line in a way that invents intermediate values.
- Prefer endpoint labels over legends.
- Reveal series in narration order and annotate only source-supported changes.

### Timelines

- Keep year anchors sparse, stable, and large.
- Reveal events chronologically.
- If years are not equally spaced, position them proportionally or disclose the simplification.

### Totals and counters

- Derive values from the dataset in code where possible.
- State period and denominator.
- Verify independently; motion must not obscure the final exact value.

### Rankings and ledgers

- Keep rows and rules stable while values or highlights change.
- Include the effective date.
- Use one highlighted row or pointer to guide attention.

## Multi-format composition

Use one data model and visual system, but recompose each ratio. Never treat 9:16 as a center crop of 16:9.

- In portrait, enlarge axes, reduce simultaneous annotations, and stack header/plot/callout deliberately.
- Recalculate plot bounds, bar widths, gaps, and label density from `useVideoConfig()`.
- Keep source text and highlighted values title-safe.
- Render and inspect both formats at actual output size.

## Anti-patterns

- Decorative terrain, contours, river traces, particles, ambient parallax, glow, or vignette
- Fake paper texture, ornamental frames, glassmorphism, dashboard chrome, or gratuitous cards
- Gradients without quantitative meaning
- Repeated years/values, dense labels, detached legends, or tiny footer sources
- Missing scale, unit, source, or honest baseline
- Accent color on every mark
- Background motion added merely for energy
- Titles or callouts that claim more than the source
- Copying reference styling instead of extracting information logic

## Verification

Before design, confirm the claim, dataset version, units, source, effective date, calculations, and what deserves the single accent.

After implementation:

- Run TypeScript and the project's standard Remotion checks.
- Render early, middle, climax, and final-hold frames.
- Render 16:9 and 9:16 at actual output size.
- Inspect pixels rather than relying on code or Studio playback.

Final checks: honest scale; source-traceable values; visible source/unit; no overclaim; no duplicate labels; one semantic accent; compression-safe axes; narration-aligned reveal; readable final hold; static background; actual registered-composition renders.

## Newpress reference set

| Reference | Moment | Transferable lesson |
| --- | ---: | --- |
| Search Party — [How Brazilian football hit rock bottom](https://www.youtube.com/watch?v=ZI4XtCyf5mc&t=66s) | 1:06 | Stable dated ranking, restrained rules, one pointer, no decorative set. |
| Christophe — [Prediction markets are a trap](https://www.youtube.com/watch?v=E_V7m_lnybY&t=221s) | 3:41 | Establish the distribution first; add the conclusion after the evidence is readable. |
| Max Fisher — [America's job market is collapsing](https://www.youtube.com/watch?v=aUM4kv0HnG0&t=48s) | 0:48 | Warm paper field, source under title, stable timeline. |
| Max Fisher — [America's job market is collapsing](https://www.youtube.com/watch?v=aUM4kv0HnG0&t=78s) | 1:18 | The comparison series is the visual event; ambient motion is unnecessary. |
| Johnny Harris — [1955 vs 2025, who had it better?](https://www.youtube.com/watch?v=J4qqIJ312zI&t=331s) | 5:31 | Direct endpoint labels eliminate legend hunting. |
| Max Fisher — [China quietly saved the world last month](https://www.youtube.com/watch?v=BkA0bkb6ZO0&t=842s) | 14:02 | Neutral comparisons plus one red subject and direct values create a clear argument. |

The shared pattern is evidence first: near-plain backgrounds, visible sourcing, one comparison, and annotation that arrives only when earned.

## Compact Remotion pattern

```tsx
const tickStep = 25;
const maxValue = Math.max(...data.map((d) => d.value));
const scaleMax = Math.ceil(maxValue / tickStep) * tickStep;

const reveal = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const gridProgress = reveal(frame, 8, 24);
const historyProgress = reveal(frame, 28, 88);
const subjectProgress = reveal(frame, 102, 118);
const annotationProgress = reveal(frame, 120, 132);
```

Calculate mark delays from the data index, grow bars from the baseline, and derive the highlighted subject from data or props rather than hard-coding a year.