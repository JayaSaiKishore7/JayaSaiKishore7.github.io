/**
 * Drawing logic for the 3D "plexus depth" neural network (used by NeuralNet.jsx).
 * Plain functions, no React and no libraries: build the scene once, then draw
 * a frame for a given time onto a 2D canvas.
 *
 *   Layer B (behind): a plexus field of slowly drifting particles, joined when close.
 *   Layer A (front):  a 5-layer network of neuron rings, with a propagation wave
 *                     and dots running along its connections.
 *
 * "3D" is a small hand-rolled projection: rotate around Y, tilt around X, then
 * perspective (scale = CAMERA / (CAMERA + z)).
 */

// ---------- timing ----------

/** One full forward + backward propagation, in ms. */
export const CYCLE_MS = 30000;
const HALF_MS = CYCLE_MS / 2;

// ---------- the network (layer A) ----------

const LAYERS = [
  { x: -1.6, count: 5, radius: 0.55 },
  { x: -0.8, count: 8, radius: 0.9 },
  { x: 0, count: 8, radius: 0.9 },
  { x: 0.8, count: 8, radius: 0.9 },
  { x: 1.6, count: 4, radius: 0.45 },
];
const LINKS_PER_NEURON = 3;
const SEED = 20261120; // fixed: the same network and field on every visit
const WAVE_WIDTH = 0.55; // Gaussian sigma, in layers
const DOT_COUNT = 14;
const DOT_EDGE_MS = 2400; // time for a dot to travel one connection

// ---------- the plexus field (layer B) ----------

const PARTICLES = 70;
const PARTICLES_SMALL = 40; // screens narrower than 768px
const FIELD = { x: 2.5, y: 1.4, z: 1.5 }; // half-sizes of the box
const LINK_DISTANCE = 0.6;
const DRIFT_PER_MS = 0.00004; // very slow
const FIELD_ROTATION = 0.6; // the field turns at 0.6× the camera: it feels farther away

// ---------- camera ----------

const TILT = 0.3; // rad, around X
const SWAY_CENTRE = 0.55; // rad, around Y
const SWAY_AMOUNT = 0.45;
const SWAY_PERIOD_MS = 50000;
const CAMERA = 4;

/** Small, fast, seeded random generator (mulberry32). */
function seededRandom(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Builds the network, the plexus particles and the moving dots. `small`: fewer particles. */
export function buildScene({ small = false } = {}) {
  const random = seededRandom(SEED);

  const neurons = [];
  const byLayer = LAYERS.map((layer, li) =>
    Array.from({ length: layer.count }, (_, i) => {
      const angle = (i / layer.count) * Math.PI * 2 + li * 0.4; // rings offset so they don't line up
      neurons.push({ layer: li, x: layer.x, y: layer.radius * Math.cos(angle), z: layer.radius * Math.sin(angle), out: [], in: [] });
      return neurons.length - 1;
    })
  );

  const edges = [];
  for (let li = 0; li < LAYERS.length - 1; li++) {
    for (const from of byLayer[li]) {
      const next = [...byLayer[li + 1]]; // seeded shuffle, then the first 3: 3 different neurons
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
      }
      for (const to of next.slice(0, LINKS_PER_NEURON)) {
        neurons[from].out.push(edges.length);
        neurons[to].in.push(edges.length);
        edges.push({ from, to });
      }
    }
  }

  const particles = Array.from({ length: small ? PARTICLES_SMALL : PARTICLES }, () => {
    // A random direction, all at the same slow speed.
    const a = random() * Math.PI * 2;
    const b = Math.acos(random() * 2 - 1);
    return {
      x: (random() * 2 - 1) * FIELD.x,
      y: (random() * 2 - 1) * FIELD.y,
      z: (random() * 2 - 1) * FIELD.z,
      vx: Math.sin(b) * Math.cos(a) * DRIFT_PER_MS,
      vy: Math.sin(b) * Math.sin(a) * DRIFT_PER_MS,
      vz: Math.cos(b) * DRIFT_PER_MS,
    };
  });

  const dots = Array.from({ length: DOT_COUNT }, (_, i) => ({
    edge: Math.floor(random() * edges.length),
    start: -(i / DOT_COUNT) * DOT_EDGE_MS, // staggered, so they never move in step
    forward: true,
  }));

  return {
    neurons,
    edges,
    particles,
    dots,
    firstLayer: byLayer[0],
    lastLayer: byLayer[LAYERS.length - 1],
    lastTime: 0,
    tiltX: 0, // parallax, eased toward the target each frame
    tiltY: 0,
  };
}

// ---------- colours ----------

function parseColour(value) {
  const v = value.trim();
  if (v.startsWith("#")) {
    const hex = v.length === 4 ? [...v.slice(1)].map((c) => c + c).join("") : v.slice(1, 7);
    return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  }
  return (v.match(/[\d.]+/g) ?? [0, 0, 0]).slice(0, 3).map(Number);
}

/** Reads the theme's colours from its CSS variables (src/theme/theme.js → virtual:theme.css). */
export function readColours(element = document.documentElement) {
  const style = getComputedStyle(element);
  const get = (name) => parseColour(style.getPropertyValue(name));
  return { bg: get("--bg"), base: get("--border-strong"), forward: get("--accent"), backward: get("--muted") };
}

const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;

// ---------- the calm area behind the text ----------

/**
 * A soft-edged rectangle (white, blurred edges) for the area behind the text,
 * drawn once per resize. drawFrame erases the scene through it
 * ("destination-out"), so the text sits on calm background.
 */
export function makeCalmMask(width, height, rect, dpr) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext("2d");
  const pad = 24;
  const blur = 48;
  // Only the shadow of a rectangle drawn far off-canvas lands in view: a rectangle with soft edges.
  const off = canvas.width + blur * 4;
  ctx.shadowColor = "#000";
  ctx.shadowBlur = blur * dpr;
  ctx.shadowOffsetX = off;
  ctx.fillStyle = "#000";
  ctx.fillRect((rect.x - pad) * dpr - off, (rect.y - pad) * dpr, (rect.width + pad * 2) * dpr, (rect.height + pad * 2) * dpr);
  return canvas;
}

// ---------- one frame ----------

/**
 * Draws the scene at `time` (ms of animation time).
 * options: width/height (CSS px; the context is already scaled for the DPR),
 * colours, still (reduced motion: no drift, rotation, wave or dots),
 * pointer (target parallax, -1…1 on each axis, or null), calm ({ mask,
 * field, network, extras }: how much of each layer to erase behind the text
 * block, plus extra masks behind single lines that need more).
 */
export function drawFrame(ctx, scene, { width, height, time, colours, still = false, pointer = null, calm = null }) {
  ctx.clearRect(0, 0, width, height);

  // ----- camera -----
  if (!still && pointer) {
    scene.tiltY += (pointer.x * 0.35 - scene.tiltY) * 0.04; // eased, ~4% per frame
    scene.tiltX += (pointer.y * 0.25 - scene.tiltX) * 0.04;
  }
  const sway = still ? SWAY_CENTRE : SWAY_CENTRE + SWAY_AMOUNT * Math.sin((time / SWAY_PERIOD_MS) * Math.PI * 2);
  const yaw = sway + (still ? 0 : scene.tiltY);
  const pitch = TILT + (still ? 0 : scene.tiltX);

  // Fit: fill the height on wide screens; on tall narrow screens let the outer layers
  // run past the sides, so the network doesn't shrink to a thin strip.
  const portrait = height > width;
  const unit = Math.min(height / 2.6, width / (portrait ? 2.6 : 4));
  const cx = width / 2;
  const cy = height / 2;

  const projector = (yawAngle, pitchAngle) => {
    const cosY = Math.cos(yawAngle), sinY = Math.sin(yawAngle);
    const cosX = Math.cos(pitchAngle), sinX = Math.sin(pitchAngle);
    return (x, y, z) => {
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;
      const scale = CAMERA / (CAMERA + z2);
      return { sx: cx + x1 * scale * unit, sy: cy - y2 * scale * unit, z: z2, scale };
    };
  };
  // Depth fade: far things fainter (scale ~0.75 far … ~1.35 near).
  const depth = (scale) => Math.min(1, Math.max(0.25, (scale - 0.7) / 0.55));

  // ----- layer B: plexus field -----
  const step = still ? 0 : Math.min(time - scene.lastTime, 100);
  scene.lastTime = time;
  const fieldProject = projector(yaw * FIELD_ROTATION, pitch * FIELD_ROTATION);
  const wrap = (v, half) => (v > half ? v - 2 * half : v < -half ? v + 2 * half : v);
  const pts = scene.particles.map((p) => {
    p.x = wrap(p.x + p.vx * step, FIELD.x);
    p.y = wrap(p.y + p.vy * step, FIELD.y);
    p.z = wrap(p.z + p.vz * step, FIELD.z);
    return fieldProject(p.x, p.y, p.z);
  });

  ctx.strokeStyle = rgb(colours.base);
  ctx.lineWidth = 1;
  const limit2 = LINK_DISTANCE * LINK_DISTANCE;
  const ps = scene.particles;
  for (let i = 0; i < ps.length; i++) {
    for (let j = i + 1; j < ps.length; j++) {
      const dx = ps[i].x - ps[j].x, dy = ps[i].y - ps[j].y, dz = ps[i].z - ps[j].z;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 >= limit2) continue; // only close pairs need the (slower) square root
      ctx.globalAlpha = 0.6 * (1 - Math.sqrt(d2) / LINK_DISTANCE) * depth((pts[i].scale + pts[j].scale) / 2);
      ctx.beginPath();
      ctx.moveTo(pts[i].sx, pts[i].sy);
      ctx.lineTo(pts[j].sx, pts[j].sy);
      ctx.stroke();
    }
  }
  ctx.fillStyle = rgb(colours.base);
  for (const p of pts) {
    ctx.globalAlpha = 0.8 * depth(p.scale);
    ctx.beginPath();
    ctx.arc(p.sx, p.sy, 1.7 * p.scale, 0, Math.PI * 2);
    ctx.fill();
  }

  // The field almost disappears behind the text.
  if (calm) erase(ctx, calm.mask, calm.field, width, height);

  // ----- layer A: the network -----
  const project = projector(yaw, pitch);
  const nodes = scene.neurons.map((n) => project(n.x, n.y, n.z));

  const phase = time % CYCLE_MS;
  const forward = phase < HALF_MS;
  const progress = (forward ? phase : phase - HALF_MS) / HALF_MS;
  const span = LAYERS.length + 1; // the wave enters before the first layer and leaves after the last
  const wave = forward ? -1 + progress * span : LAYERS.length - progress * span;
  const glow = forward ? colours.forward : colours.backward;
  const intensity = scene.neurons.map((n) =>
    still ? 0 : Math.exp(-((n.layer - wave) ** 2) / (2 * WAVE_WIDTH * WAVE_WIDTH))
  );

  // Lines
  ctx.lineCap = "round";
  for (const { from, to } of scene.edges) {
    const a = nodes[from], b = nodes[to];
    const i = (intensity[from] + intensity[to]) / 2;
    ctx.globalAlpha = (0.4 + 0.6 * i) * depth((a.scale + b.scale) / 2);
    ctx.strokeStyle = mix(colours.base, glow, i);
    ctx.lineWidth = 1.2 + 0.8 * i; // 1.2 px at rest, 2 px as the wave passes
    ctx.beginPath();
    ctx.moveTo(a.sx, a.sy);
    ctx.lineTo(b.sx, b.sy);
    ctx.stroke();
  }

  // Dots travelling along the connections, in the wave's direction (drawn under the neurons)
  if (!still) {
    for (const dot of scene.dots) {
      advanceDot(scene, dot, time, forward);
      const t = (time - dot.start) / DOT_EDGE_MS;
      if (t < 0) continue; // staggered start
      const { from, to } = scene.edges[dot.edge];
      const [a, b] = dot.forward ? [nodes[from], nodes[to]] : [nodes[to], nodes[from]];
      const x = a.sx + (b.sx - a.sx) * t;
      const y = a.sy + (b.sy - a.sy) * t;
      const s = a.scale + (b.scale - a.scale) * t;
      const alpha = Math.sin(Math.PI * t) * depth(s); // fades in and out along the line
      ctx.fillStyle = rgb(glow);
      ctx.globalAlpha = alpha * 0.25; // soft halo
      ctx.beginPath();
      ctx.arc(x, y, 7.2 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = alpha; // core
      ctx.beginPath();
      ctx.arc(x, y, 2.9 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Neurons, far → near: hollow rings (--bg inside); the centre fills as the wave passes.
  const order = nodes.map((_, i) => i).sort((p, q) => nodes[q].z - nodes[p].z);
  for (const idx of order) {
    const p = nodes[idx];
    const i = intensity[idx];
    const r = (4.2 + 1.4 * i) * p.scale;
    const d = depth(p.scale);
    ctx.globalAlpha = d;
    ctx.fillStyle = rgb(colours.bg);
    ctx.beginPath();
    ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = mix(colours.base, glow, i);
    ctx.lineWidth = 1.2;
    ctx.stroke();
    if (i > 0.02) {
      ctx.globalAlpha = d * i;
      ctx.fillStyle = rgb(glow);
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, r * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // The network fades behind the text block too.
  if (calm) erase(ctx, calm.mask, calm.network, width, height);
  // And extra, behind single lines that need it (both layers).
  for (const extra of calm?.extras ?? []) erase(ctx, extra.mask, extra.amount, width, height);

  ctx.globalAlpha = 1;
}

/** Erases `amount` (0…1) of what's drawn, through the soft mask. */
function erase(ctx, mask, amount, width, height) {
  if (!mask || amount <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.globalAlpha = amount;
  ctx.drawImage(mask, 0, 0, width, height);
  ctx.restore();
}

/** When a dot reaches the end of its connection, it continues from that neuron in the current direction. */
function advanceDot(scene, dot, time, forward) {
  while (time - dot.start >= DOT_EDGE_MS) {
    const { from, to } = scene.edges[dot.edge];
    const at = dot.forward ? to : from;
    const choices = forward ? scene.neurons[at].out : scene.neurons[at].in;
    if (choices.length) {
      dot.edge = choices[Math.floor(Math.random() * choices.length)];
    } else {
      // End of the network: start again on the side the wave comes from.
      const side = forward ? scene.firstLayer : scene.lastLayer;
      const neuron = scene.neurons[side[Math.floor(Math.random() * side.length)]];
      const fresh = forward ? neuron.out : neuron.in;
      dot.edge = fresh[Math.floor(Math.random() * fresh.length)];
    }
    dot.forward = forward;
    dot.start += DOT_EDGE_MS;
  }
}
