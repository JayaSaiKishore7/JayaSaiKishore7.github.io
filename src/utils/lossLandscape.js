/**
 * The hero's loss landscape: a wireframe surface f(x, y), slowly turning and
 * "breathing", with a ball running momentum SGD down it, run after run.
 * Pure maths and Canvas 2D drawing; the timing, observers and lifecycle live
 * in src/components/LossLandscape/LossLandscape.jsx.
 */

export const DOMAIN = 3.2; // x and y run over [-DOMAIN, DOMAIN]
export const GRID = 57; // f sampled on GRID × GRID points
const STEPS = 300; // SGD steps per run

// Timeline of one run, in seconds.
export const DESCEND = 7;
export const HOLD = 1.4;
export const FADE = 0.6;
export const RUN_LENGTH = DESCEND + HOLD + FADE;

const ELEVATION = 0.62;
const COS_EL = Math.cos(ELEVATION);
const SIN_EL = Math.sin(ELEVATION);

// Line alpha per height bucket (low → high).
const ALPHAS = {
  dark: { desktop: [0.62, 0.42, 0.26, 0.15, 0.08], mobile: [0.5, 0.32, 0.2, 0.11, 0.06] },
  light: { desktop: [0.55, 0.38, 0.24, 0.14, 0.08], mobile: [0.45, 0.3, 0.18, 0.1, 0.06] },
};

// Sizes that differ between desktop and phones.
const SIZES = {
  desktop: { line: 0.9, trail: 1.6, ball: 8, glow: 140, scale: 0.105, ox: 0.56, oy: 0.6 },
  mobile: { line: 0.7, trail: 1.2, ball: 5.5, glow: 70, scale: 0.14, ox: 0.55, oy: 0.76 },
};

// ---------- the surface ----------

export function f(x, y) {
  return (
    0.16 * (0.8 * x * x + y * y) +
    0.32 * Math.sin(1.7 * x + 0.5) * Math.cos(1.4 * y) +
    0.12 * Math.cos(2.3 * y - 1)
  );
}

function gradient(x, y) {
  const s = Math.sin(1.7 * x + 0.5);
  const c = Math.cos(1.7 * x + 0.5);
  return [
    0.256 * x + 0.544 * c * Math.cos(1.4 * y),
    0.32 * y - 0.448 * s * Math.sin(1.4 * y) - 0.276 * Math.sin(2.3 * y - 1),
  ];
}

/** The breathing: a small travelling wave added to the drawn height only. */
export function wave(x, y, t) {
  return 0.05 * Math.sin(1.2 * x + 0.6 * t) * Math.cos(1.1 * y - 0.5 * t);
}

/**
 * f on the grid, its range, and the grid lines (every 2nd row and column)
 * as segments already sorted into 5 height buckets for colouring.
 */
export function buildSurface() {
  const coords = new Float32Array(GRID);
  for (let i = 0; i < GRID; i++) coords[i] = -DOMAIN + (2 * DOMAIN * i) / (GRID - 1);

  const values = new Float32Array(GRID * GRID);
  let fmin = Infinity;
  let fmax = -Infinity;
  for (let j = 0; j < GRID; j++) {
    for (let i = 0; i < GRID; i++) {
      const v = f(coords[i], coords[j]);
      values[j * GRID + i] = v;
      fmin = Math.min(fmin, v);
      fmax = Math.max(fmax, v);
    }
  }

  const buckets = [[], [], [], [], []];
  const add = (a, b) => {
    const q = ((values[a] + values[b]) / 2 - fmin) / (fmax - fmin);
    buckets[Math.min(4, Math.floor(q * 5))].push(a, b);
  };
  for (let k = 0; k < GRID; k += 2) {
    for (let m = 0; m < GRID - 1; m++) {
      add(k * GRID + m, k * GRID + m + 1); // along x
      add(m * GRID + k, (m + 1) * GRID + k); // along y
    }
  }

  return {
    coords,
    values,
    fmin,
    fmax,
    buckets: buckets.map((list) => Uint16Array.from(list)),
    screen: new Float32Array(GRID * GRID * 2), // projected points, refilled every frame
  };
}

// ---------- the runs ----------

/** A small seeded random generator (mulberry32): the same runs every visit. */
export function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v) => Math.max(-DOMAIN, Math.min(DOMAIN, v));

/** One descent: a start on a ring of radius 2.4–3.0, then 300 noisy momentum steps. */
export function makeRun(random) {
  const angle = random() * Math.PI * 2;
  const radius = 2.4 + random() * 0.6;
  let x = radius * Math.cos(angle);
  let y = radius * Math.sin(angle);
  let vx = 0;
  let vy = 0;

  const path = new Float32Array((STEPS + 1) * 2);
  path[0] = x;
  path[1] = y;
  let fMin = f(x, y);
  let minIndex = 0;
  for (let k = 1; k <= STEPS; k++) {
    const [gx, gy] = gradient(x, y);
    vx = 0.88 * vx - 0.045 * (gx + (random() - 0.5) * 0.25);
    vy = 0.88 * vy - 0.045 * (gy + (random() - 0.5) * 0.25);
    x = clamp(x + vx);
    y = clamp(y + vy);
    path[k * 2] = x;
    path[k * 2 + 1] = y;
    const v = f(x, y);
    if (v < fMin) {
      fMin = v;
      minIndex = k;
    }
  }
  return { path, fStart: f(path[0], path[1]), fMin, minIndex };
}

/** Where the ball is along a run's path at progress e (0–1), interpolated. */
export function pointAt(run, e) {
  const at = Math.min(STEPS, Math.max(0, e * STEPS));
  const k = Math.min(STEPS - 1, Math.floor(at));
  const u = at - k;
  const p = run.path;
  return [p[k * 2] + (p[k * 2 + 2] - p[k * 2]) * u, p[k * 2 + 1] + (p[k * 2 + 3] - p[k * 2 + 1]) * u];
}

/** The status line's numbers: epoch 0–50 and a loss scaled to 0.92 → 0.03. */
export function status(run, e, x, y) {
  const span = run.fStart - run.fMin || 1;
  const loss = 0.03 + Math.max(0, (f(x, y) - run.fMin) / span) * 0.89;
  return { epoch: Math.round(e * 50), loss };
}

// ---------- colours ----------

function parseColour(value) {
  const v = value.trim();
  if (v.startsWith("#")) {
    const hex = v.length === 4 ? [...v.slice(1)].map((c) => c + c).join("") : v.slice(1, 7);
    return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  }
  const nums = v.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
  return nums.slice(0, 3);
}

const rgba = ([r, g, b], a) => `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;

/** The same hue and saturation at another HSL lightness. */
function withLightness([r, g, b], lightness) {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d) {
    if (max === R) h = ((G - B) / d) % 6;
    else if (max === G) h = (B - R) / d + 2;
    else h = (R - G) / d + 4;
  }
  h *= 60;
  const c = (1 - Math.abs(2 * lightness - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lightness - c / 2;
  const [r1, g1, b1] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [(r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255];
}

/** The theme's colours as the drawing needs them (read from the CSS variables). */
export function readPalette(root) {
  const css = getComputedStyle(root);
  const accent = parseColour(css.getPropertyValue("--accent"));
  const neutral = parseColour(css.getPropertyValue("--neutral"));
  const text = parseColour(css.getPropertyValue("--text"));
  const middle = accent.map((c, i) => (c + neutral[i]) / 2);
  return {
    dark: root.dataset.theme === "dark",
    accent,
    accentLight: withLightness(accent, 0.6),
    text,
    bucketColours: [accent, accent, middle, neutral, neutral],
  };
}

// ---------- drawing ----------

/** The view for a canvas of this size: projection origin and scale. */
export function makeView(width, height, yaw) {
  const mobile = width < 1000;
  const size = mobile ? SIZES.mobile : SIZES.desktop;
  return {
    mobile,
    size,
    sc: width * size.scale,
    ox: width * size.ox,
    oy: height * size.oy,
    cosYaw: Math.cos(yaw),
    sinYaw: Math.sin(yaw),
  };
}

function project(view, x, y, z, out, i) {
  const xr = x * view.cosYaw - y * view.sinYaw;
  const yr = x * view.sinYaw + y * view.cosYaw;
  const zz = 1.15 * z;
  const d = yr * COS_EL + zz * SIN_EL;
  const s = (9 / (9 - 0.9 * d)) * view.sc;
  out[i] = view.ox + xr * s;
  out[i + 1] = view.oy + (yr * SIN_EL - zz * COS_EL) * s;
}

const scratch = new Float32Array(2);

/**
 * One frame. `t` drives the breathing (0 = still); `ball` is { x, y, e, fade }
 * where e is the run's progress (0–1) and fade 1 → 0 at the end of a run.
 */
export function drawFrame(ctx, width, height, surface, palette, { yaw, t, run, ball }) {
  const view = makeView(width, height, yaw);
  const { size } = view;
  ctx.clearRect(0, 0, width, height);

  // Surface: project every grid point, then one path per height bucket.
  const { coords, values, screen } = surface;
  for (let j = 0; j < GRID; j++) {
    for (let i = 0; i < GRID; i++) {
      const n = j * GRID + i;
      project(view, coords[i], coords[j], values[n] + wave(coords[i], coords[j], t), screen, n * 2);
    }
  }
  const alphas = ALPHAS[palette.dark ? "dark" : "light"][view.mobile ? "mobile" : "desktop"];
  ctx.lineWidth = size.line;
  surface.buckets.forEach((segments, b) => {
    ctx.beginPath();
    for (let s = 0; s < segments.length; s += 2) {
      const a = segments[s] * 2;
      const c = segments[s + 1] * 2;
      ctx.moveTo(screen[a], screen[a + 1]);
      ctx.lineTo(screen[c], screen[c + 1]);
    }
    ctx.strokeStyle = rgba(palette.bucketColours[b], alphas[b]);
    ctx.stroke();
  });

  if (!run || !ball) return;
  const fade = ball.fade;
  const height3d = (x, y, lift = 0) => f(x, y) + wave(x, y, t) + lift;
  project(view, ball.x, ball.y, height3d(ball.x, ball.y), scratch, 0);
  const bx = scratch[0];
  const by = scratch[1];

  // Glow under the ball.
  const glow = ctx.createRadialGradient(bx, by, 0, bx, by, size.glow);
  glow.addColorStop(0, rgba(palette.accent, (0.12 + 0.25 * ball.e) * fade));
  glow.addColorStop(1, rgba(palette.accent, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(bx - size.glow, by - size.glow, size.glow * 2, size.glow * 2);

  // Trail: the path so far, just above the surface.
  const steps = Math.floor(ball.e * (run.path.length / 2 - 1));
  ctx.save();
  ctx.beginPath();
  for (let k = 0; k <= steps; k++) {
    const x = run.path[k * 2];
    const y = run.path[k * 2 + 1];
    project(view, x, y, height3d(x, y, 0.02), scratch, 0);
    if (k === 0) ctx.moveTo(scratch[0], scratch[1]);
    else ctx.lineTo(scratch[0], scratch[1]);
  }
  ctx.lineTo(bx, by);
  ctx.setLineDash([3, 4]);
  ctx.lineWidth = size.trail;
  ctx.strokeStyle = rgba(palette.text, 0.85 * fade);
  ctx.shadowColor = rgba(palette.accent, fade);
  ctx.shadowBlur = 8;
  ctx.stroke();
  ctx.restore();

  // The ball.
  const r = size.ball;
  const body = ctx.createRadialGradient(bx - r * 0.35, by - r * 0.35, 0, bx, by, r);
  body.addColorStop(0, rgba([255, 255, 255], fade));
  body.addColorStop(0.45, rgba(palette.accentLight, fade));
  body.addColorStop(1, rgba(palette.accent, fade));
  ctx.save();
  ctx.shadowColor = rgba(palette.accent, fade);
  ctx.shadowBlur = 22;
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(bx, by, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
