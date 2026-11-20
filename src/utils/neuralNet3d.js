/**
 * Drawing logic for the 3D "rotating layers" neural network (used by NeuralNet.jsx).
 * Plain functions, no React and no libraries: build the scene once, then draw
 * a frame for a given time onto a 2D canvas.
 *
 * The scene: 5 layers of neurons along X, each a ring in the Y–Z plane, every
 * neuron linked to 3 neurons of the next layer (seeded, so the same network on
 * every visit). A propagation wave runs forward then backward through it, with
 * dots travelling the whole network along with the wave. The network turns
 * slowly around Y, one full turn a minute (and tilts a little toward the mouse).
 *
 * "3D" is a small hand-rolled projection: rotate around Y, tilt around X, then
 * perspective (scale = CAMERA / (CAMERA + z)).
 */

// ---------- timing ----------

/** One full forward + backward propagation, in ms. */
export const CYCLE_MS = 30000;
const HALF_MS = CYCLE_MS / 2;

// ---------- the network ----------

const LAYERS = [
  { x: -1.6, count: 5, radius: 0.55 },
  { x: -0.8, count: 8, radius: 0.9 },
  { x: 0, count: 8, radius: 0.9 },
  { x: 0.8, count: 8, radius: 0.9 },
  { x: 1.6, count: 4, radius: 0.45 },
];
const LINKS_PER_NEURON = 3;
const SEED = 20261120; // fixed: the same network on every visit
const WAVE_WIDTH = 0.55; // Gaussian sigma, in layers
const DOT_COUNT = 14;
const DOT_SPREAD = 0.35; // dots run up to ± this many layers ahead of / behind the wave
const DOT_FADE = 0.5; // in layers: fade in after leaving the first neuron, out before the last

// ---------- camera ----------

const TILT = 0.3; // rad, around X
/** One full turn around Y, in ms. Driven by animation time, so pausing freezes it. */
export const ROTATION_PERIOD_MS = 60000;
const START_ANGLE = 0.55; // rad around Y: where the turn starts, and the reduced-motion still picture
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

/** Builds the network (neurons, seeded connections) and the moving dots. */
export function buildScene() {
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

  // Each dot rides the wave along a full path through the network (picked anew
  // for every forward and every backward pass); the offset keeps them a loose group.
  const dots = Array.from({ length: DOT_COUNT }, () => ({
    offset: (random() * 2 - 1) * DOT_SPREAD,
    path: [], // neuron indices, one per layer, in travel order
  }));

  return {
    neurons,
    edges,
    dots,
    firstLayer: byLayer[0],
    lastLayer: byLayer[LAYERS.length - 1],
    pass: -1, // which half-cycle the dots' paths were picked for
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
  return {
    neuron: get("--border-strong"), // neurons at rest
    line: get("--muted"), // connections at rest
    forward: get("--accent"), // the wave going forward
    backward: get("--muted"), // the wave going back
  };
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
 * colours, still (reduced motion: no rotation, wave or dots),
 * pointer (target parallax, -1…1 on each axis, or null), calm ({ mask,
 * network, extras }: how much to erase behind the text block, plus extra
 * masks behind single lines that need more).
 */
export function drawFrame(ctx, scene, { width, height, time, colours, still = false, pointer = null, calm = null }) {
  ctx.clearRect(0, 0, width, height);

  // ----- camera -----
  if (!still && pointer) {
    scene.tiltY += (pointer.x * 0.35 - scene.tiltY) * 0.04; // eased, ~4% per frame
    scene.tiltX += (pointer.y * 0.25 - scene.tiltX) * 0.04;
  }
  // A continuous turn: `time` only advances while the animation runs, so a pause
  // freezes the angle and play continues from it, with no jump.
  const turn = still ? START_ANGLE : START_ANGLE + ((time % ROTATION_PERIOD_MS) / ROTATION_PERIOD_MS) * Math.PI * 2;
  const yaw = turn + (still ? 0 : scene.tiltY);
  const pitch = TILT + (still ? 0 : scene.tiltX);

  // Fit (sized for the side view, the widest moment of the turn): fill the height on
  // wide screens; on tall narrow screens let the outer layers run past the sides, so
  // the network doesn't shrink to a thin strip.
  const portrait = height > width;
  const unit = Math.min(height / 2.6, width / (portrait ? 2.6 : 4));
  const cx = width / 2;
  const cy = height / 2;

  const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
  const cosX = Math.cos(pitch), sinX = Math.sin(pitch);
  const nodes = scene.neurons.map(({ x, y, z }) => {
    const x1 = x * cosY + z * sinY;
    const z1 = -x * sinY + z * cosY;
    const y2 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;
    const scale = CAMERA / (CAMERA + z2);
    return { sx: cx + x1 * scale * unit, sy: cy - y2 * scale * unit, z: z2, scale };
  });
  // Depth fade: far things fainter (scale ~0.75 far … ~1.35 near).
  const depth = (scale) => Math.min(1, Math.max(0.25, (scale - 0.7) / 0.55));

  // ----- the wave -----
  const phase = time % CYCLE_MS;
  const forward = phase < HALF_MS;
  const progress = (forward ? phase : phase - HALF_MS) / HALF_MS;
  const span = LAYERS.length + 1; // the wave enters before the first layer and leaves after the last
  const wave = forward ? -1 + progress * span : LAYERS.length - progress * span;
  const glow = forward ? colours.forward : colours.backward;
  const intensity = scene.neurons.map((n) =>
    still ? 0 : Math.exp(-((n.layer - wave) ** 2) / (2 * WAVE_WIDTH * WAVE_WIDTH))
  );

  // ----- 1. connections: brighter and thicker near the wave -----
  ctx.lineCap = "round";
  for (const { from, to } of scene.edges) {
    const a = nodes[from], b = nodes[to];
    const i = (intensity[from] + intensity[to]) / 2;
    ctx.globalAlpha = (0.4 + 0.6 * i) * depth((a.scale + b.scale) / 2);
    ctx.strokeStyle = mix(colours.line, glow, i);
    ctx.lineWidth = 1.2 + 0.8 * i; // 1.2 px at rest, 2 px as the wave passes
    ctx.beginPath();
    ctx.moveTo(a.sx, a.sy);
    ctx.lineTo(b.sx, b.sy);
    ctx.stroke();
  }

  // ----- 2. dots travelling with the wave along whole paths: first layer → last
  // going forward, last → first going back (drawn under the neurons) -----
  if (!still) {
    const pass = Math.floor(time / HALF_MS);
    if (pass !== scene.pass) {
      pickPaths(scene, forward);
      scene.pass = pass;
    }
    const steps = LAYERS.length - 1; // connections along a path
    for (const dot of scene.dots) {
      // How far along its path the dot is, in layers (0 = first neuron of the path).
      const along = (forward ? wave : steps - wave) + dot.offset;
      if (along < 0 || along > steps || !dot.path.length) continue; // not in the network now
      const k = Math.min(steps - 1, Math.floor(along));
      const t = along - k;
      const a = nodes[dot.path[k]];
      const b = nodes[dot.path[k + 1]];
      const x = a.sx + (b.sx - a.sx) * t;
      const y = a.sy + (b.sy - a.sy) * t;
      const s = a.scale + (b.scale - a.scale) * t;
      // Fades in as it leaves its first neuron and out as it reaches its last: no pops.
      const alpha = Math.min(1, along / DOT_FADE, (steps - along) / DOT_FADE) * depth(s);
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

  // ----- 3. neurons, far → near: solid dots, blending toward the wave colour
  // and growing slightly as it passes; far ones smaller and fainter -----
  const order = nodes.map((_, i) => i).sort((p, q) => nodes[q].z - nodes[p].z);
  for (const idx of order) {
    const p = nodes[idx];
    const i = intensity[idx];
    ctx.globalAlpha = (0.7 + 0.3 * i) * depth(p.scale);
    ctx.fillStyle = mix(colours.neuron, glow, i);
    ctx.beginPath();
    ctx.arc(p.sx, p.sy, (3.6 + 1.6 * i) * p.scale, 0, Math.PI * 2);
    ctx.fill();
  }

  // ----- calm behind the text -----
  if (calm) erase(ctx, calm.mask, calm.network, width, height);
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

/**
 * Gives every dot a full path for the coming pass: from a first-layer neuron to
 * the last layer (forward), or from a last-layer neuron back to the first
 * (backward), following real connections one layer at a time.
 */
function pickPaths(scene, forward) {
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const tryPath = () => {
    let neuron = pick(forward ? scene.firstLayer : scene.lastLayer);
    const path = [neuron];
    for (let step = 0; step < LAYERS.length - 1; step++) {
      // Going back, a neuron may have no incoming connection: that route is a dead end.
      const choices = forward ? scene.neurons[neuron].out : scene.neurons[neuron].in;
      if (!choices.length) return null;
      const edge = scene.edges[pick(choices)];
      neuron = forward ? edge.to : edge.from;
      path.push(neuron);
    }
    return path;
  };
  for (const dot of scene.dots) {
    let path = null;
    for (let attempt = 0; attempt < 20 && !path; attempt++) path = tryPath();
    dot.path = path ?? []; // an empty path: this dot sits out this pass
  }
}
