/**
 * The brain tumor case study's header visual: "brain through the CNN", in the
 * same brushed metal, lights and colours as the hero network (neuralNet3dGL.js).
 *
 * Left to right: a see-through metal brain (built from geometry: two folded
 * hemispheres, cerebellum, brainstem) slowly spinning, with an MRI plane that
 * sweeps down through it and lights up the tumour when it reaches it; then the
 * model's real shape, 4 conv/pool blocks, each glowing as a pulse passes; then
 * four class bars where meningioma rises. A 9 s loop; the scene sways slowly.
 *
 * Illustration only (the caption on the page says so). Same API as the other
 * case-study scenes; loaded on demand by CaseVisual.jsx, only where
 * webglWanted() says the device has a real GPU.
 */
import {
  ACESFilmicToneMapping,
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PMREMGenerator,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SphereGeometry,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// ---------- colours (the hero's palette) ----------

const PALETTE = {
  light: { metal: "#8C8C88", accent: "#A84300", brainOpacity: 0.62, glassOpacity: 0.16, lineOpacity: 0.6, glow: 0.22, pulse: 1 },
  dark: { metal: "#5E7286", accent: "#FF8A3D", brainOpacity: 0.55, glassOpacity: 0.14, lineOpacity: 0.55, glow: 0.35, pulse: 1.4 },
};
const ENV_INTENSITY = 0.45;

// ---------- layout ----------

const BRAIN = { x: -1.55, scale: 0.62 };
const TUMOUR = { x: 0.36, y: 0.22, z: 0.28, radius: 0.15, glowRadius: 0.24 };
const TUMOUR_Y = TUMOUR.y * BRAIN.scale; // in the scene group, where the MRI plane moves
const MRI = { width: 0.95, depth: 1.25, from: 0.5, to: -0.45 };
const BLOCKS = [
  { x: -0.75, size: 1.1 },
  { x: -0.3, size: 0.86 },
  { x: 0.12, size: 0.65 },
  { x: 0.5, size: 0.46 },
];
const BLOCK_DEPTH = 0.035;
const BARS = { x: 1.15, z0: -0.39, step: 0.26, floor: -0.65, width: 0.13, scale: 1.3 };
const CLASSES = [0.03, 0.94, 0.01, 0.02]; // glioma, MENINGIOMA, no tumour, pituitary
const MENINGIOMA = 1;

// ---------- motion (seconds within the 9 s loop) ----------

const LOOP_S = 9;
const SWEEP = { end: 2.5, hiddenFrom: 2.56, near: 0.18 };
const FOUND = { from: 2.56, fadeStart: 4.17, fadeEnd: 4.72 };
const PULSE = { start: 2.6, end: 4.8, fromX: -1.25, toX: 1.05, peaks: [2.8, 3.3, 3.8, 4.3], half: 0.3, peak: 0.9 };
const GROW = { start: 4.8, end: 5.6, stagger: 0.05 };
const SHRINK = { start: 8.2, end: 8.8 };
const SPIN_MS = 40000; // the brain's own turn
const STILL_SPIN = 0.6;
const SWAY = { base: 0.55, amount: 0.2, periodMs: 56000 }; // rad around Y
const TILT_X = 0.14;
const PARALLAX = { y: 0.12, x: 0.08, ease: 0.04 };
// Framing in the 16:10 box, measured on the first still render: the scene sat
// ~89 px left and ~15 px low in the 880×550 picture (≈165 px per unit), and the
// brain read small. So 10% larger, then 0.6 right and 0.1 up.
const FIT = { scale: 1.1, x: 0.6, y: 0.1 };

// ---------- camera ----------

const FOV = 30;
const CAMERA = { y: 0.45, z: 6.2, zNarrow: 7.4, narrowBelow: 1.3 };

const clamp01 = (t) => Math.min(1, Math.max(0, t));
const smooth = (t) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};
/** 0 → 1 → 0 around `at`, over ± `half` seconds. */
const bump = (t, at, half) => smooth(1 - Math.abs(t - at) / half);

/** One hemisphere (side -1 left, +1 right): a squashed sphere with a flat inner face and folds. */
function hemisphere(side) {
  const geometry = new SphereGeometry(1, 120, 90);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    let x = position.getX(i) * 0.5;
    let y = position.getY(i) * 0.62;
    let z = position.getZ(i) * 0.95;
    if (side * x < 0) x *= 0.25; // flat inner face at the midline
    if (y < 0) y *= 0.8; // flatter underside
    if (z < 0) z -= 0.06 * (1 - y); // a little longer at the back
    // Folds (gyri): pushed outward along the direction from the centre, not on the inner face.
    const X = x * 1.4 + side;
    const Y = y * 1.4;
    const Z = z * 1.4;
    const n = Math.sin(9 * X + 2.1 * Y) * Math.sin(8.5 * Y - 1.3 * Z) * Math.sin(9.5 * Z + 1.7 * X) + 0.5 * Math.sin(17 * X + 5 * Z) * Math.sin(16 * Y + 3 * X);
    const f = 0.045 * n * clamp01((side * x + 0.05) * 4);
    const length = Math.hypot(x, y, z) || 1;
    x += (x / length) * f;
    y += (y / length) * f;
    z += (z / length) * f;
    position.setXYZ(i, x + side * 0.27, y, z); // the gap between the hemispheres
  }
  geometry.computeVertexNormals();
  return geometry;
}

/** The cerebellum: a flat ellipsoid with small ridges, under the back of the brain. */
function cerebellum() {
  const geometry = new SphereGeometry(1, 80, 60);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const vy = position.getY(i);
    const x = position.getX(i) * 0.55;
    const y = vy * 0.24;
    const z = position.getZ(i) * 0.3;
    const length = Math.hypot(x, y, z) || 1;
    const ridge = 0.02 * Math.sin(vy * 40);
    position.setXYZ(i, x + (x / length) * ridge, y + (y / length) * ridge - 0.48, z + (z / length) * ridge - 0.62);
  }
  geometry.computeVertexNormals();
  return geometry;
}

export class BrainCnnGL {
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
    const glass = () => standard({ metalness: 0.3, roughness: 0.35, transparent: true, side: DoubleSide, depthWrite: false });
    this.materials = {
      brain: standard({ metalness: 0.7, roughness: 0.5, transparent: true, depthWrite: false }),
      tumour: standard({ metalness: 0.2, roughness: 0.35 }),
      glow: new MeshBasicMaterial({ transparent: true, toneMapped: false, depthWrite: false }),
      mri: glass(),
      mriEdge: new LineBasicMaterial({ transparent: true, opacity: 0.7 }),
      blocks: BLOCKS.map(glass), // one each: every block glows on its own
      line: new LineBasicMaterial({ transparent: true }),
      metal: standard({ metalness: 0.85, roughness: 0.45 }),
      accent: standard({ metalness: 0.3, roughness: 0.4, emissiveIntensity: 0.35 }),
      pulse: new MeshBasicMaterial({ toneMapped: false }),
    };
    this.geometries = [];
    this.colour = { metal: new Color(), accent: new Color() };

    this.group = new Group();
    this.group.rotation.x = TILT_X;
    this.group.scale.setScalar(FIT.scale);
    this.group.position.set(FIT.x, FIT.y, 0);
    this.scene.add(this.group);
    this.tilt = { x: 0, y: 0 };
    this.build();
    this.setTheme(dark);
  }

  keep(geometry) {
    this.geometries.push(geometry);
    return geometry;
  }

  build() {
    const { materials, group } = this;

    // 1. The brain, in its own group so it can spin on its own.
    this.brain = new Group();
    this.brain.scale.setScalar(BRAIN.scale);
    this.brain.position.x = BRAIN.x;
    const stem = new Mesh(this.keep(new CylinderGeometry(0.11, 0.08, 0.55, 24)), materials.brain);
    stem.position.set(0, -0.72, -0.32);
    stem.rotation.x = 0.35;
    this.brain.add(
      new Mesh(this.keep(hemisphere(-1)), materials.brain),
      new Mesh(this.keep(hemisphere(1)), materials.brain),
      new Mesh(this.keep(cerebellum()), materials.brain),
      stem
    );
    this.tumour = new Mesh(this.keep(new SphereGeometry(TUMOUR.radius, 40, 30)), materials.tumour);
    this.tumour.position.set(TUMOUR.x, TUMOUR.y, TUMOUR.z);
    this.glow = new Mesh(this.keep(new SphereGeometry(TUMOUR.glowRadius, 24, 18)), materials.glow);
    this.glow.position.copy(this.tumour.position);
    this.brain.add(this.tumour, this.glow);
    group.add(this.brain);

    // 2. The MRI plane, in the scene group (it doesn't spin with the brain).
    const mriGeometry = this.keep(new PlaneGeometry(MRI.width, MRI.depth).rotateX(-Math.PI / 2));
    this.mri = new Group();
    this.mri.add(new Mesh(mriGeometry, materials.mri), new LineSegments(this.keep(new EdgesGeometry(mriGeometry)), materials.mriEdge));
    this.mri.position.x = BRAIN.x;
    group.add(this.mri);

    // 3. The four conv/pool blocks, their outlines, and corner lines between them.
    const corners = [];
    BLOCKS.forEach(({ x, size }, i) => {
      const geometry = this.keep(new BoxGeometry(BLOCK_DEPTH, size, size));
      const block = new Mesh(geometry, materials.blocks[i]);
      const outline = new LineSegments(this.keep(new EdgesGeometry(geometry)), materials.line);
      block.position.x = outline.position.x = x;
      group.add(block, outline);
      const next = BLOCKS[i + 1];
      if (next) {
        const a = size / 2;
        const b = next.size / 2;
        for (const [sy, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) corners.push(x, sy * a, sz * a, next.x, sy * b, sz * b);
      }
    });
    const cornerGeometry = this.keep(new BufferGeometry());
    cornerGeometry.setAttribute("position", new Float32BufferAttribute(corners, 3));
    group.add(new LineSegments(cornerGeometry, materials.line));

    // 4. The class bars, grown from the floor.
    const barGeometry = this.keep(new BoxGeometry(BARS.width, 1, BARS.width).translate(0, 0.5, 0));
    this.bars = CLASSES.map((p, i) => {
      const mesh = new Mesh(barGeometry, i === MENINGIOMA ? materials.accent : materials.metal);
      mesh.position.set(BARS.x, BARS.floor, BARS.z0 + i * BARS.step);
      group.add(mesh);
      return { mesh, height: Math.max(0.04, p * BARS.scale) };
    });

    // 5. The pulse.
    this.pulse = new Mesh(this.keep(new SphereGeometry(0.05, 16, 12)), materials.pulse);
    group.add(this.pulse);
  }

  setTheme(dark) {
    this.mode = dark ? "dark" : "light";
    const p = PALETTE[this.mode];
    const { metal, accent } = this.colour;
    metal.set(p.metal);
    accent.set(p.accent);
    const m = this.materials;
    m.brain.color.copy(metal);
    m.brain.opacity = p.brainOpacity;
    m.tumour.color.copy(accent);
    m.tumour.emissive.copy(accent);
    m.glow.color.copy(accent);
    for (const glass of [m.mri, ...m.blocks]) {
      glass.color.copy(metal);
      glass.emissive.copy(accent);
      glass.opacity = p.glassOpacity;
    }
    m.mriEdge.color.copy(accent);
    m.line.color.copy(metal);
    m.line.opacity = p.lineOpacity;
    m.metal.color.copy(metal);
    m.accent.color.copy(accent);
    m.accent.emissive.copy(accent);
    m.pulse.color.copy(accent).multiplyScalar(p.pulse);
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
   * (plane hidden, tumour lit, bars full, no pulse, brain at its resting
   * angle, no sway). pointer: parallax target (-1…1), or null.
   */
  render(time, { still = false, pointer = null } = {}) {
    const t = (time / 1000) % LOOP_S; // seconds into the loop
    const m = this.materials;
    const p = PALETTE[this.mode];

    this.brain.rotation.y = still ? STILL_SPIN : (time / SPIN_MS) * Math.PI * 2;

    // The MRI plane sweeps down; the tumour lights up as the plane reaches it, then stays found for a while.
    const planeOn = !still && t < SWEEP.hiddenFrom;
    const planeY = MRI.from + (MRI.to - MRI.from) * smooth(t / SWEEP.end);
    this.mri.visible = planeOn;
    this.mri.position.y = planeY;
    const near = planeOn ? Math.max(0, 1 - Math.abs(planeY - TUMOUR_Y) / SWEEP.near) : 0;
    const found = t >= FOUND.from ? 1 - smooth((t - FOUND.fadeStart) / (FOUND.fadeEnd - FOUND.fadeStart)) : 0;
    const lit = still ? 1 : Math.max(near, found);
    m.tumour.emissiveIntensity = 0.4 + lit * 1.2;
    m.glow.opacity = lit * p.glow;
    this.glow.scale.setScalar(1 + lit * 0.25);
    this.glow.visible = lit > 0.001;

    // The pulse runs through the four blocks; each glows as it passes.
    const pulseOn = !still && t >= PULSE.start && t < PULSE.end;
    this.pulse.visible = pulseOn;
    if (pulseOn) this.pulse.position.set(PULSE.fromX + (PULSE.toX - PULSE.fromX) * smooth((t - PULSE.start) / (PULSE.end - PULSE.start)), 0, 0);
    m.blocks.forEach((material, i) => {
      material.emissiveIntensity = still ? 0 : bump(t, PULSE.peaks[i], PULSE.half) * PULSE.peak;
    });

    // The class bars grow one after another, and shrink together before the loop restarts.
    const growFor = GROW.end - GROW.start - GROW.stagger * (CLASSES.length - 1);
    const shrink = still ? 1 : 1 - smooth((t - SHRINK.start) / (SHRINK.end - SHRINK.start));
    this.bars.forEach(({ mesh, height }, i) => {
      const grow = still ? 1 : smooth((t - GROW.start - i * GROW.stagger) / growFor) * shrink;
      mesh.scale.y = Math.max(0.001, height * grow);
    });

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
    const { blocks, ...rest } = this.materials;
    [...blocks, ...Object.values(rest)].forEach((material) => material.dispose());
    this.envTarget.dispose();
    this.pmrem.dispose();
    this.scene.environment = null;
    this.canvas.removeEventListener("webglcontextlost", this.onContextLost);
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
