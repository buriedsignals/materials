const GOLD = "#d4a853";
const INK = "#f5f2ed";
const MUTED = "#7f8a8f";
const GRID = "rgba(245,242,237,.10)";
const PANEL = "#11181c";

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const mix = (a, b, t) => a + (b - a) * t;
const ease = (t) => 1 - Math.pow(1 - clamp(t), 3);

function setupCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(600, Math.round(rect.width));
  const height = Math.round(width * 7 / 16);
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  const context = canvas.getContext("2d");
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  return {context, width, height};
}

function controls(root) {
  const values = {};
  root.querySelectorAll("[data-control]").forEach((input) => {
    values[input.dataset.control] = Number(input.value);
  });
  return values;
}

function output(root, name, text) {
  const element = root.querySelector(`[data-output="${name}"]`);
  if (element) element.textContent = text;
}

function chaikin(points, passes) {
  let result = points;
  for (let pass = 0; pass < passes; pass += 1) {
    const next = [result[0]];
    for (let i = 0; i < result.length - 1; i += 1) {
      const a = result[i];
      const b = result[i + 1];
      next.push(
        {x: mix(a.x, b.x, 0.25), y: mix(a.y, b.y, 0.25)},
        {x: mix(a.x, b.x, 0.75), y: mix(a.y, b.y, 0.75)},
      );
    }
    next.push(result[result.length - 1]);
    result = next;
  }
  return result;
}

function samplePath(points, progress) {
  const lengths = [];
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    lengths.push(total);
  }
  const target = clamp(progress) * total;
  let index = lengths.findIndex((length) => length >= target);
  if (index < 0) index = lengths.length - 1;
  const before = index === 0 ? 0 : lengths[index - 1];
  const span = Math.max(1, lengths[index] - before);
  const t = (target - before) / span;
  return {
    point: {
      x: mix(points[index].x, points[index + 1].x, t),
      y: mix(points[index].y, points[index + 1].y, t),
    },
    total,
  };
}

function trace(context, points, color, width, alpha = 1) {
  context.save();
  context.globalAlpha = alpha;
  context.strokeStyle = color;
  context.lineWidth = width;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();
  points.forEach((point, index) => {
    if (index === 0) context.moveTo(point.x, point.y);
    else context.lineTo(point.x, point.y);
  });
  context.stroke();
  context.restore();
}

function grid(context, width, height) {
  context.fillStyle = PANEL;
  context.fillRect(0, 0, width, height);
  context.strokeStyle = GRID;
  context.lineWidth = 1;
  for (let x = 40; x < width; x += 80) {
    context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height); context.stroke();
  }
  for (let y = 40; y < height; y += 80) {
    context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke();
  }
}

function mountFlight(root) {
  const canvas = root.querySelector("canvas");
  let phase = 0;
  let previous = performance.now();
  const render = (now) => {
    const {context, width, height} = setupCanvas(canvas);
    const value = controls(root);
    output(root, "swerve", `${value.swerve}%`);
    output(root, "lookahead", `${(value.lookahead / 10).toFixed(1)} km`);
    output(root, "smoothing", `${value.smoothing} ${value.smoothing === 1 ? "pass" : "passes"}`);
    output(root, "speed", `${(value.speed / 100).toFixed(1)}×`);
    const dt = Math.min(40, now - previous);
    previous = now;
    phase = (phase + dt * 0.000045 * value.speed) % 1;

    grid(context, width, height);
    const raw = [
      [0.04, .70], [.16, .36], [.28, .65], [.39, .25], [.52, .55],
      [.64, .28], [.76, .66], [.88, .34], [.97, .52],
    ].map(([x, y]) => ({x: x * width, y: y * height}));
    const chord = raw.map((point, index) => ({
      x: point.x,
      y: mix(raw[0].y, raw[raw.length - 1].y, index / (raw.length - 1)),
    }));
    const damp = value.swerve / 100;
    const damped = raw.map((point, index) => ({
      x: point.x,
      y: mix(chord[index].y, point.y, damp),
    }));
    const path = chaikin(damped, value.smoothing);
    trace(context, raw, MUTED, 1.5, .65);
    trace(context, path, GOLD, 3);

    const here = samplePath(path, phase).point;
    const aheadProgress = Math.min(1, phase + value.lookahead / 250);
    const ahead = samplePath(path, aheadProgress).point;
    const before = samplePath(path, Math.max(0, phase - .01)).point;
    const heading = Math.atan2(ahead.y - here.y, ahead.x - here.x);
    const previousHeading = Math.atan2(here.y - before.y, here.x - before.x);
    let delta = heading - previousHeading;
    while (delta > Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;
    const bank = clamp(delta * 80, -1, 1) * 7.5;

    context.strokeStyle = "rgba(212,168,83,.35)";
    context.setLineDash([5, 5]);
    context.beginPath(); context.moveTo(here.x, here.y); context.lineTo(ahead.x, ahead.y); context.stroke();
    context.setLineDash([]);
    context.fillStyle = GOLD;
    context.beginPath(); context.arc(ahead.x, ahead.y, 4, 0, Math.PI * 2); context.fill();
    context.save();
    context.translate(here.x, here.y);
    context.rotate(heading);
    context.fillStyle = INK;
    context.beginPath(); context.moveTo(13, 0); context.lineTo(-9, -7); context.lineTo(-5, 0); context.lineTo(-9, 7); context.closePath(); context.fill();
    context.rotate(bank * Math.PI / 180);
    context.strokeStyle = GOLD; context.lineWidth = 2;
    context.beginPath(); context.moveTo(-14, 15); context.lineTo(14, 15); context.stroke();
    context.restore();
    root.querySelector("[data-demo-status]").textContent = `Bank ${bank >= 0 ? "+" : ""}${bank.toFixed(1)}° · look ${value.lookahead / 10} km`;
    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);
}

function bezierPoint(t, width, height) {
  const p0 = {x: width * .04, y: height * .26};
  const p1 = {x: width * .31, y: height * .12};
  const p2 = {x: width * .55, y: height * .88};
  const p3 = {x: width * .96, y: height * .56};
  const u = 1 - t;
  return {
    x: u ** 3 * p0.x + 3 * u ** 2 * t * p1.x + 3 * u * t ** 2 * p2.x + t ** 3 * p3.x,
    y: u ** 3 * p0.y + 3 * u ** 2 * t * p1.y + 3 * u * t ** 2 * p2.y + t ** 3 * p3.y,
  };
}

function mountMap(root) {
  const canvas = root.querySelector("canvas");
  let elapsed = 0;
  let previous = performance.now();
  const regions = [
    {trigger: 0, name: "UPSTREAM", points: [[.02,.08],[.38,.08],[.34,.68],[.04,.72]]},
    {trigger: .48, name: "MIDDLE", points: [[.34,.12],[.68,.08],[.72,.78],[.34,.68]]},
    {trigger: .78, name: "DELTA", points: [[.68,.08],[.98,.12],[.97,.78],[.72,.78]]},
  ];
  const render = (now) => {
    const {context, width, height} = setupCanvas(canvas);
    const value = controls(root);
    output(root, "pace", `${(value.pace / 100).toFixed(1)}×`);
    output(root, "head", `${value.head}%`);
    output(root, "border", `${(value.border / 10).toFixed(1)} s`);
    output(root, "bloom", `${(value.bloom / 100).toFixed(2)}×`);
    elapsed += Math.min(40, now - previous) * value.pace / 100;
    previous = now;
    const cycle = 8500;
    const progress = (elapsed % cycle) / cycle;
    grid(context, width, height);

    let active = "Drawing river";
    regions.forEach((region, regionIndex) => {
      const age = progress - region.trigger;
      const borderDuration = value.border / 100;
      const borderProgress = clamp(age / borderDuration);
      const fillProgress = clamp((age - borderDuration * .45) / .13);
      const bloom = value.bloom / 100;
      const opacity = fillProgress < .75
        ? mix(0, .24 * bloom, ease(fillProgress / .75))
        : mix(.24 * bloom, .24, ease((fillProgress - .75) / .25));
      const points = region.points.map(([x, y]) => ({x: x * width, y: y * height}));
      context.fillStyle = `rgba(212,168,83,${opacity})`;
      context.beginPath();
      points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
      context.closePath(); context.fill();
      context.save();
      context.strokeStyle = GOLD; context.lineWidth = 2;
      context.setLineDash([800, 800]);
      context.lineDashOffset = 800 * (1 - ease(borderProgress));
      context.stroke(); context.restore();
      if (fillProgress > .35) {
        const centerX = points.reduce((sum, point) => sum + point.x, 0) / points.length;
        const centerY = points.reduce((sum, point) => sum + point.y, 0) / points.length;
        context.globalAlpha = ease((fillProgress - .35) / .65);
        context.fillStyle = INK; context.font = "600 12px Space Grotesk, sans-serif";
        context.textAlign = "center"; context.fillText(region.name, centerX, centerY);
        context.globalAlpha = 1;
      }
      if (age >= 0 && age < .22) active = `${region.name} · ${borderProgress < 1 ? "border" : "fill"}`;
      if (regionIndex === 2 && fillProgress >= 1) active = "Complete frame · hold";
    });

    const samples = Array.from({length: 121}, (_, index) => bezierPoint(index / 120, width, height));
    const drawCount = Math.max(2, Math.round(clamp(progress / .82) * samples.length));
    const visible = samples.slice(0, drawCount);
    trace(context, samples, "rgba(245,242,237,.14)", 1);
    trace(context, visible, GOLD, 4);
    const headCount = Math.max(2, Math.round(samples.length * value.head / 100));
    const head = visible.slice(Math.max(0, visible.length - headCount));
    context.shadowColor = GOLD; context.shadowBlur = 14;
    trace(context, head, INK, 3);
    context.shadowBlur = 0;
    root.querySelector("[data-demo-status]").textContent = active;
    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);
}

function mountChart(root) {
  const canvas = root.querySelector("canvas");
  let elapsed = 0;
  let previous = performance.now();
  const data = [32, 39, 43, 49, 57, 63, 82];
  const render = (now) => {
    const {context, width, height} = setupCanvas(canvas);
    const value = controls(root);
    output(root, "establish", `${(value.establish / 10).toFixed(1)} s`);
    output(root, "history", `${(value.history / 10).toFixed(1)} s`);
    output(root, "subject", `${(value.subject / 10).toFixed(1)} s`);
    output(root, "hold", `${(value.hold / 10).toFixed(1)} s`);
    const durations = [value.establish, value.history, value.subject, 6, value.hold].map((v) => v * 100);
    const total = durations.reduce((sum, duration) => sum + duration, 0);
    elapsed = (elapsed + Math.min(40, now - previous)) % total;
    previous = now;
    const starts = durations.map((_, index) => durations.slice(0, index).reduce((sum, duration) => sum + duration, 0));
    const stageProgress = (index) => ease((elapsed - starts[index]) / durations[index]);
    const establish = stageProgress(0);
    const history = stageProgress(1);
    const subject = stageProgress(2);
    const annotation = stageProgress(3);
    grid(context, width, height);

    const left = width * .11;
    const right = width * .94;
    const top = height * .25;
    const bottom = height * .82;
    context.globalAlpha = establish;
    context.fillStyle = INK; context.textAlign = "left";
    context.font = "500 22px Fraunces, serif"; context.fillText("Recorded water conflicts", left, height * .12);
    context.fillStyle = MUTED; context.font = "11px Space Grotesk, sans-serif";
    context.fillText("Index · illustrative data for timing demonstration", left, height * .18);
    context.textAlign = "right"; context.fillText("SOURCE · DEMO DATA", right, height * .18);
    for (let tick = 0; tick <= 100; tick += 25) {
      const y = mix(bottom, top, tick / 100);
      context.strokeStyle = GRID; context.beginPath(); context.moveTo(left, y); context.lineTo(right, y); context.stroke();
      context.fillStyle = MUTED; context.textAlign = "right"; context.fillText(String(tick), left - 12, y + 4);
    }
    context.globalAlpha = 1;
    const gap = (right - left) / data.length;
    data.forEach((datum, index) => {
      const isSubject = index === data.length - 1;
      const local = isSubject ? subject : clamp(history * (data.length - 1) - index);
      const barHeight = (bottom - top) * datum / 100 * ease(local);
      context.fillStyle = isSubject ? GOLD : "#657176";
      context.fillRect(left + index * gap + gap * .17, bottom - barHeight, gap * .64, barHeight);
      context.fillStyle = MUTED; context.textAlign = "center"; context.font = "10px Space Grotesk, sans-serif";
      context.fillText(String(2018 + index), left + index * gap + gap * .49, bottom + 20);
      if (isSubject && subject > .8) {
        context.fillStyle = INK; context.font = "600 12px Space Grotesk, sans-serif";
        context.fillText("82", left + index * gap + gap * .49, bottom - barHeight - 10);
      }
    });
    if (annotation > 0) {
      context.globalAlpha = annotation;
      const x = left + (data.length - 1) * gap + gap * .49;
      const y = bottom - (bottom - top) * data.at(-1) / 100;
      context.strokeStyle = GOLD; context.beginPath(); context.moveTo(x, y - 24); context.lineTo(x - 70, y - 70); context.stroke();
      context.fillStyle = INK; context.textAlign = "right"; context.font = "600 12px Space Grotesk, sans-serif";
      context.fillText("Highest value in the series", x - 78, y - 73);
      context.globalAlpha = 1;
    }
    const status = elapsed < starts[1] ? "Establishing title, source, unit, and scale"
      : elapsed < starts[2] ? "Revealing neutral history"
      : elapsed < starts[3] ? "Introducing the subject"
      : elapsed < starts[4] ? "Adding the earned annotation"
      : "Completed frame · final hold";
    root.querySelector("[data-demo-status]").textContent = status;
    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);
}

document.querySelectorAll("[data-demo]").forEach((root) => {
  if (root.dataset.demo === "flight") mountFlight(root);
  if (root.dataset.demo === "map") mountMap(root);
  if (root.dataset.demo === "chart") mountChart(root);
});
