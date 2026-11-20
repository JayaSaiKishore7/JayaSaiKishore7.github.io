/**
 * The emotion case study's header visual: the "whole pipeline", in the same
 * brushed metal, lights and colours as the hero network (neuralNet3dGL.js).
 *
 * Left to right: a 16×16 pixel face (a FER-2013-style input, drawn from a
 * formula, not a photo) as columns of metal; one feature map that glows as a
 * pulse passes through; seven emotion bars (happy wins, in teal); then a cloud
 * of review embeddings, where a query leaves the happy bar, flies to the happy
 * cluster and links its 4 nearest reviews. A 9 s loop; the scene sways slowly.
 *
 * Illustration only (the caption on the page says so). Same API as
 * forecastCurtainsGL.js; loaded on demand by CaseVisual.jsx, only where
 * webglWanted() says the device has a real GPU.
 */
import {
  ACESFilmicToneMapping,
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PMREMGenerator,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// ---------- colours (the hero's palette) ----------

const PALETTE = {
  light: { metal: "#8C8C88", accent: "#A84300", faceDark: 0.45, mapOpacity: 0.16, lineOpacity: 0.6, pulse: 1 },
  dark: { metal: "#5E7286", accent: "#FF8A3D", faceDark: 0.35, mapOpacity: 0.14, lineOpacity: 0.55, pulse: 1.4 },
};
const ENV_INTENSITY = 0.45;
const WHITE = new Color(0xffffff);

// ---------- layout ----------

const FACE = { cells: 16, tile: 0.95, x: -2.05 };
const CELL = FACE.tile / FACE.cells;
const HALF_TILE = FACE.tile / 2;
const MAP = { x: -1.45, size: 0.8, depth: 0.035 };
const BARS = { x: -0.85, spread: 0.95, floor: -0.55, width: 0.12 };
const EMOTIONS = [0.03, 0.01, 0.02, 0.89, 0.02, 0.02, 0.01]; // angry, disgust, fear, HAPPY, sad, surprise, neutral
const HAPPY = 3;
const CLOUD = { points: 210, clusters: 7, x: 1.15, spread: [0.85, 0.62, 0.7], radius: 0.026, seed: 5, neighbours: 4 };

// ---------- motion (seconds within the 9 s loop) ----------

const LOOP_S = 9;
const PULSE = { start: 0, end: 1.6, glowAt: 0.8, glowHalf: 0.3, glowPeak: 0.9 };
const GROW = { start: 1.6, end: 2.4, stagger: 0.04 };
const QUERY = { start: 2.6, travel: 1.4, linksAfter: 1.5, link: 0.6, linkStagger: 0.15, gone: 5.3 };
const SHRINK = { start: 8.2, end: 8.7 };
const SWAY = { base: 0.5, amount: 0.2, periodMs: 56000 }; // rad around Y
const TILT_X = 0.14;
const PARALLAX = { y: 0.12, x: 0.08, ease: 0.04 };
// Framing in the 16:10 box (from the rendered still pictures: centred, clear of the edges).
// Measured on the first render: the scene sat ~88 px left and ~32 px low in the
// 880×550 picture (≈165 px per unit here), so it moves 0.5 right and 0.18 up.
const FIT = { scale: 1, x: 0.5, y: 0.18 };

// ---------- camera ----------

const FOV = 30;
const CAMERA = { y: 0.45, z: 6.2, zNarrow: 7.4, narrowBelow: 1.3 };

const clamp01 = (t) => Math.min(1, Math.max(0, t));
const smooth = (t) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

/** Pixel intensity (0…1) of the illustrated face at u, v (both -1…1). */
function face(u, v) {
  const oval = (u / 0.82) ** 2 + (v / 0.98) ** 2;
  if (oval > 1) return 0.06;
  let I = 0.66 - 0.14 * oval;
  const eye = Math.min(Math.hypot(u - 0.34, v - 0.28), Math.hypot(u + 0.34, v - 0.28));
  if (eye < 0.12) I = 0.1;
  else if (eye < 0.19) I -= 0.14;
  if (Math.abs(v - (0.52 + 0.08 * Math.abs(u))) < 0.05 && Math.abs(u) > 0.14 && Math.abs(u) < 0.56) I = 0.22; // brows
  if (Math.abs(u) < 0.07 && v > -0.12 && v < 0.16) I += 0.14; // nose
  if (Math.abs(u) < 0.52 && Math.abs(v - (-0.46 + 0.62 * u * u)) < 0.07) I = 0.08; // smile
  const cheek = Math.min(Math.hypot(u - 0.47, v + 0.12), Math.hypot(u + 0.47, v + 0.12));
  if (cheek < 0.2) I += 0.14 * (1 - cheek / 0.2);
  return clamp01(I);
}

/** The seeded generator from the spec: s = (s·9301 + 49297) % 233280. */
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export class EmotionPipelineGL {
  /**
   * canvas: the visible canvas to draw into (transparent background).
   * onContextLost: called if the browser drops the WebGL context.
   * Throws if WebGL can't start (the caller keeps the still picture).
   */
  constructor({ canvas, dark, onContextLost }) {
    this.canvas = canvas;
    this.onContextLost = (event) => {
      event.preventDefault();
      onContextLost?.();
    };
    canvas.addEventListener("webglcontextlost", this.onContextLost);

    const renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
      failIfMajorPerformanceCaveat: true,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); // small canvas: full sharpness is cheap
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.82;
    this.renderer = renderer;

    // Same light set as the hero.
    this.scene = new Scene();
    this.pmrem = new PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    this.envTarget = this.pmrem.fromScene(room, 0.04);
    room.dispose();
    this.scene.environment = this.envTarget.texture;
    const key = new DirectionalLight(0xffffff, 0.9);
    key.position.set(3, 4, 5);
    const rim = new DirectionalLight(0xff8a3d, 0.55);
    rim.position.set(-4, 2, -5);
    this.scene.add(key, rim, new AmbientLight(0xffffff, 0.35));

    this.camera = new PerspectiveCamera(FOV, 1, 0.1, 50);

    const standard = (options) => new MeshStandardMaterial({ envMapIntensity: ENV_INTENSITY, ...options });
    this.materials = {
      face: standard({ color: 0xffffff, metalness: 0.6, roughness: 0.45 }),
      map: standard({ metalness: 0.3, roughness: 0.35, transparent: true, side: DoubleSide, depthWrite: false }),
      metal: standard({ metalness: 0.85, roughness: 0.45 }),
      accent: standard({ metalness: 0.3, roughness: 0.4, emissiveIntensity: 0.35 }),
      cloud: standard({ color: 0xffffff, metalness: 0.85, roughness: 0.45 }),
      line: new LineBasicMaterial({ transparent: true }),
      link: new LineBasicMaterial(),
      pulse: new MeshBasicMaterial({ toneMapped: false }),
    };
    this.geometries = [];
    this.colour = { metal: new Color(), accent: new Color(), low: new Color(), high: new Color(), tmp: new Color() };

    this.group = new Group();
    this.group.rotation.x = TILT_X;
    this.group.scale.setScalar(FIT.scale);
    this.group.position.set(FIT.x, FIT.y, 0);
    this.scene.add(this.group);
    this.tilt = { x: 0, y: 0 };
    this.lit = -1; // how many neighbours are lit (cloud colours are redone when it changes)
    this.build();
    this.setTheme(dark);
  }

  keep(geometry) {
    this.geometries.push(geometry);
    return geometry;
  }

  build() {
    const { materials, group } = this;
    const matrix = new Matrix4();

    // 1. The pixel face: one column per cell, longer where the pixel is brighter.
    this.intensity = [];
    this.face = new InstancedMesh(this.keep(new BoxGeometry(1, CELL * 0.9, CELL * 0.9)), materials.face, FACE.cells ** 2);
    for (let i = 0; i < FACE.cells; i++) {
      for (let j = 0; j < FACE.cells; j++) {
        const u = ((j + 0.5) / FACE.cells) * 2 - 1;
        const v = 1 - ((i + 0.5) / FACE.cells) * 2;
        const I = face(u, v);
        const h = 0.03 + I * 0.95 * 0.22;
        matrix.makeScale(h, 1, 1).setPosition(FACE.x - h / 2, v * HALF_TILE, u * HALF_TILE);
        this.face.setMatrixAt(this.intensity.length, matrix);
        this.intensity.push(I);
      }
    }
    group.add(this.face);

    // 2. One feature map, its outline, and the four corner lines from the face tile.
    const mapGeometry = this.keep(new BoxGeometry(MAP.depth, MAP.size, MAP.size));
    const map = new Mesh(mapGeometry, materials.map);
    map.position.x = MAP.x;
    const outline = new LineSegments(this.keep(new EdgesGeometry(mapGeometry)), materials.line);
    outline.position.x = MAP.x;
    const m = MAP.size / 2;
    const corners = [];
    for (const [sy, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      corners.push(FACE.x, sy * HALF_TILE, sz * HALF_TILE, MAP.x, sy * m, sz * m);
    }
    const cornerGeometry = this.keep(new BufferGeometry());
    cornerGeometry.setAttribute("position", new Float32BufferAttribute(corners, 3));
    group.add(map, outline, new LineSegments(cornerGeometry, materials.line));

    // 3. The emotion bars, grown from the floor.
    const barGeometry = this.keep(new BoxGeometry(BARS.width, 1, BARS.width));
    this.bars = EMOTIONS.map((p, i) => {
      const mesh = new Mesh(barGeometry, i === HAPPY ? materials.accent : materials.metal);
      mesh.position.set(BARS.x, 0, -BARS.spread / 2 + (i * BARS.spread) / (EMOTIONS.length - 1));
      group.add(mesh);
      return { mesh, height: Math.max(0.04, p * 1.0) };
    });

    // 4. The review cloud: seven seeded clusters.
    const random = seeded(CLOUD.seed);
    const [sx, sy, sz] = CLOUD.spread;
    const centres = Array.from({ length: CLOUD.clusters }, () => {
      const x = CLOUD.x + (random() - 0.5) * sx * 1.4;
      const y = (random() - 0.5) * sy * 1.4;
      const z = (random() - 0.5) * sz * 1.4;
      return new Vector3(x, y, z);
    });
    const g = () => (random() + random() + random() - 1.5) / 1.5;
    this.points = Array.from({ length: CLOUD.points }, (_, i) => {
      const c = centres[i % CLOUD.clusters];
      const x = c.x + g() * sx * 0.32;
      const y = c.y + g() * sy * 0.32;
      const z = c.z + g() * sz * 0.32;
      return new Vector3(x, y, z);
    });
    this.cloud = new InstancedMesh(this.keep(new SphereGeometry(CLOUD.radius, 12, 8)), materials.cloud, CLOUD.points);
    this.points.forEach((p, i) => this.cloud.setMatrixAt(i, matrix.makeTranslation(p.x, p.y, p.z)));
    group.add(this.cloud);

    // The happy cluster's 4 nearest reviews (skipping the very closest).
    this.target = centres[HAPPY];
    this.neighbours = this.points
      .map((p, i) => ({ i, d: p.distanceTo(this.target) }))
      .sort((a, b) => a.d - b.d)
      .slice(1, 1 + CLOUD.neighbours)
      .map(({ i }) => i);

    // 5. The query and its links.
    this.query = new Mesh(this.keep(new SphereGeometry(0.06, 20, 14)), materials.accent);
    const happyBar = this.bars[HAPPY];
    this.queryFrom = new Vector3(BARS.x, BARS.floor + happyBar.height, happyBar.mesh.position.z);
    this.linkPositions = new Float32Array(CLOUD.neighbours * 6);
    const linkGeometry = this.keep(new BufferGeometry());
    linkGeometry.setAttribute("position", new Float32BufferAttribute(this.linkPositions, 3));
    this.links = new LineSegments(linkGeometry, materials.link);
    group.add(this.query, this.links);

    // 6. The pulse.
    this.pulse = new Mesh(this.keep(new SphereGeometry(0.045, 16, 12)), materials.pulse);
    group.add(this.pulse);
  }

  setTheme(dark) {
    this.mode = dark ? "dark" : "light";
    const p = PALETTE[this.mode];
    const { metal, accent, low, high } = this.colour;
    metal.set(p.metal);
    accent.set(p.accent);
    const m = this.materials;
    m.map.color.copy(metal);
    m.map.emissive.copy(accent);
    m.map.opacity = p.mapOpacity;
    m.metal.color.copy(metal);
    m.accent.color.copy(accent);
    m.accent.emissive.copy(accent);
    m.line.color.copy(metal);
    m.line.opacity = p.lineOpacity;
    m.link.color.copy(accent);
    m.pulse.color.copy(accent).multiplyScalar(p.pulse);

    // Face columns: dark metal for dark pixels, pale metal for bright ones.
    low.copy(metal).multiplyScalar(p.faceDark);
    high.copy(metal).lerp(WHITE, 0.55);
    this.intensity.forEach((I, i) => this.face.setColorAt(i, this.colour.tmp.copy(low).lerp(high, I)));
    this.face.instanceColor.needsUpdate = true;

    this.lit = -1; // redo the cloud's colours on the next frame
  }

  /** Cloud colours: metal, with the first `lit` neighbours in the accent. */
  colourCloud(lit) {
    if (lit === this.lit) return;
    this.lit = lit;
    for (let i = 0; i < CLOUD.points; i++) this.cloud.setColorAt(i, this.colour.metal);
    for (let k = 0; k < lit; k++) this.cloud.setColorAt(this.neighbours[k], this.colour.accent);
    this.cloud.instanceColor.needsUpdate = true;
  }

  /** Sizes the drawing (CSS px), then compiles every shader before the first frame. */
  async init(width, height) {
    this.resize(width, height);
    await this.renderer.compileAsync(this.scene, this.camera);
  }

  resize(width, height) {
    if (!width || !height) return;
    this.renderer.setSize(width, height, false);
    const aspect = width / height;
    this.camera.aspect = aspect;
    this.camera.position.set(0, CAMERA.y, aspect < CAMERA.narrowBelow ? CAMERA.zNarrow : CAMERA.z);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();
  }

  /**
   * Draws the scene at `time` (ms of animation time). still: the final state
   * (bars full, query at the cluster, neighbours lit and linked, no pulse, no
   * sway). pointer: parallax target (-1…1), or null.
   */
  render(time, { still = false, pointer = null } = {}) {
    const t = still ? LOOP_S : (time / 1000) % LOOP_S; // seconds into the loop

    // Pulse through the face and the feature map; the map glows as it passes.
    const pulseOn = !still && t < PULSE.end;
    this.pulse.visible = pulseOn;
    if (pulseOn) this.pulse.position.set(FACE.x + (BARS.x - FACE.x) * smooth((t - PULSE.start) / (PULSE.end - PULSE.start)), 0, 0);
    const glow = still ? 0 : smooth(1 - Math.abs(t - PULSE.glowAt) / PULSE.glowHalf);
    this.materials.map.emissiveIntensity = glow * PULSE.glowPeak;

    // Bars grow one after another, and shrink together before the loop restarts.
    const growFor = GROW.end - GROW.start - GROW.stagger * (EMOTIONS.length - 1);
    const shrink = still ? 1 : 1 - smooth((t - SHRINK.start) / (SHRINK.end - SHRINK.start));
    this.bars.forEach(({ mesh, height }, i) => {
      const grow = still ? 1 : smooth((t - GROW.start - i * GROW.stagger) / growFor) * shrink;
      const h = Math.max(0.001, height * grow);
      mesh.scale.y = h;
      mesh.position.y = BARS.floor + h / 2;
    });

    // The query flies from the happy bar to the happy cluster and links its neighbours.
    const q = still ? QUERY.gone - 0.01 : t - QUERY.start;
    const queryOn = q >= 0 && q < QUERY.gone;
    this.query.visible = queryOn;
    this.links.visible = queryOn;
    let lit = 0;
    if (queryOn) {
      this.query.position.lerpVectors(this.queryFrom, this.target, smooth(q / QUERY.travel));
      this.neighbours.forEach((n, k) => {
        const start = QUERY.linksAfter + k * QUERY.linkStagger;
        const grow = smooth((q - start) / QUERY.link);
        if (q >= start) lit = k + 1;
        // Each link grows from the cluster centre out to its neighbour.
        const p = this.points[n];
        const c = this.target;
        this.linkPositions.set(
          [c.x, c.y, c.z, c.x + (p.x - c.x) * grow, c.y + (p.y - c.y) * grow, c.z + (p.z - c.z) * grow],
          k * 6
        );
      });
      this.links.geometry.attributes.position.needsUpdate = true;
    }
    this.colourCloud(lit);

    // Slow sway, plus the mouse.
    if (pointer && !still) {
      this.tilt.y += (pointer.x * PARALLAX.y - this.tilt.y) * PARALLAX.ease;
      this.tilt.x += (pointer.y * PARALLAX.x - this.tilt.x) * PARALLAX.ease;
    }
    const sway = still ? 0 : Math.sin((time / SWAY.periodMs) * Math.PI * 2) * SWAY.amount;
    const tilt = still ? { x: 0, y: 0 } : this.tilt;
    this.group.rotation.y = SWAY.base + sway + tilt.y;
    this.group.rotation.x = TILT_X + tilt.x;

    this.renderer.render(this.scene, this.camera);
  }

  /** Frees everything on the GPU and the context itself. */
  dispose() {
    this.geometries.forEach((geometry) => geometry.dispose());
    Object.values(this.materials).forEach((material) => material.dispose());
    this.face.dispose();
    this.cloud.dispose();
    this.envTarget.dispose();
    this.pmrem.dispose();
    this.scene.environment = null;
    this.canvas.removeEventListener("webglcontextlost", this.onContextLost);
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
