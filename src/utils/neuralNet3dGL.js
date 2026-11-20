/**
 * The hero network in real 3D (three.js, WebGL), with brushed-metal neurons.
 * Loaded on demand by NeuralNet.jsx (dynamic import, its own chunk), which
 * copies each frame onto its visible 2D canvas and adds the calm area behind
 * the text there. No React here.
 *
 * Same network idea as the 2D version (src/utils/neuralNet3d.js, whose
 * builder, wave and dot paths it reuses): layers of neurons along X, each a
 * ring, seeded links, a wave running forward then back, dots riding the wave.
 * Here the network spans the hero's full width and spins around its own long
 * axis (X).
 *
 * Drawn into an OFFSCREEN canvas with a transparent background. No
 * post-processing (bloom would break the transparency and shift colours):
 * the glow is soft sprites.
 */
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  AmbientLight,
  CanvasTexture,
  Color,
  DirectionalLight,
  Fog,
  Group,
  LineCurve3,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  NormalBlending,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { CYCLE_MS, DOT_FADE, ROTATION_PERIOD_MS, START_ANGLE, WAVE_WIDTH, buildScene, pickPaths } from "./neuralNet3d";

// ---------- look (fixed values, same lighting in light and dark) ----------

const PALETTE = {
  dark: { neuron: "#5E7286", tube: "#2E3E50", forward: "#4FC7D6", backward: "#8796A4", fogNear: 7, fogFar: 13 },
  light: { neuron: "#7F90A1", tube: "#A9B4BF", forward: "#0C6E7A", backward: "#536373", fogNear: 7.5, fogFar: 14 },
};
const GLOW = {
  dark: { emissive: 1.0, sprite: 0.45, dot: 1.3, blending: AdditiveBlending },
  light: { emissive: 0.55, sprite: 0.15, dot: 1.0, blending: NormalBlending },
};
const ENV_INTENSITY = 0.45;
const ACTIVE_GROW = 0.15; // active neurons grow by up to 15%
const DOT_OPACITY = 0.85;

// ---------- layout ----------

const FOV = 34;
const CAMERA_Z = 7.4;
const OUTER_TURN = 0.24; // rad around Y: the network seen slightly from the side
const WIDE_ASPECT = 1.4;
const WIDE_LAYERS = [5, 8, 8, 9, 8, 8, 4];
const NARROW_LAYERS = [5, 8, 8, 8, 4];
const REBUILD_ASPECT_CHANGE = 0.05;

const NEURON_RADIUS = 0.1;
const TUBE_RADIUS = 0.009;
const DOT_RADIUS = 0.03;
const NEURON_GLOW_SIZE = 4 * NEURON_RADIUS * 2; // sprite ≈ 4× the neuron diameter
const DOT_GLOW_SIZE = 3 * DOT_RADIUS * 2; // sprite ≈ 3× the dot diameter

// ---------- motion ----------

const PARALLAX = { y: 0.2, x: 0.15, ease: 0.04 }; // mouse only; eased ~4% per frame
const HALF_MS = CYCLE_MS / 2;

/** Relative luminance (0…1) of an [r, g, b] colour (0…255). */
function luminance([r, g, b]) {
  const lin = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** One shared soft glow: white centre → transparent edge. */
function makeGlowTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.45)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new CanvasTexture(canvas);
}

export class NeuralNetGL {
  /**
   * colours: from readColours() (only `background` is used: fog + light/dark).
   * onContextLost: called if the browser drops the WebGL context.
   * Throws if WebGL can't start (the caller then stays on 2D).
   */
  constructor({ colours, onContextLost }) {
    this.canvas = document.createElement("canvas"); // offscreen, never in the page
    this.onContextLost = (event) => {
      event.preventDefault();
      onContextLost?.();
    };
    this.canvas.addEventListener("webglcontextlost", this.onContextLost);

    const renderer = new WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
      failIfMajorPerformanceCaveat: true,
    });
    renderer.setClearColor(0x000000, 0); // transparent: the page background shows through
    renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.82;
    this.renderer = renderer;

    this.scene = new Scene();
    this.pmrem = new PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    this.envTarget = this.pmrem.fromScene(room, 0.04);
    room.dispose();
    this.scene.environment = this.envTarget.texture;
    this.scene.fog = new Fog(0x000000, 7, 13);

    const key = new DirectionalLight(0xffffff, 0.9);
    key.position.set(3, 4, 5);
    const rim = new DirectionalLight(0x4fc7d6, 0.55);
    rim.position.set(-4, 2, -5);
    this.scene.add(key, rim, new AmbientLight(0xffffff, 0.35));

    this.camera = new PerspectiveCamera(FOV, 1, 0.1, 50);
    this.camera.position.set(0, 0, CAMERA_Z);
    this.camera.lookAt(0, 0, 0);

    // outer: the fixed side view + mouse parallax; spin: the turn around X.
    this.outer = new Group();
    this.spin = new Group();
    this.outer.add(this.spin);
    this.scene.add(this.outer);
    this.tilt = { x: 0, y: 0 };

    // Kept for the whole life of the scene; everything per network is in this.built.
    this.neuronGeometry = new SphereGeometry(NEURON_RADIUS, 24, 16);
    this.dotGeometry = new SphereGeometry(DOT_RADIUS, 12, 8);
    this.glowTexture = makeGlowTexture();
    this.built = null;
    this.aspect = 0;

    this.colour = { wave: new Color() };
    this.setColours(colours);
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
    this.camera.updateProjectionMatrix();
    if (!this.built || Math.abs(aspect - this.aspect) > REBUILD_ASPECT_CHANGE) this.build(aspect);
  }

  /** The network for this aspect ratio: as wide as the view (see the spec in the header). */
  build(aspect) {
    this.disposeBuilt();
    this.aspect = aspect;

    const halfH = Math.tan(((FOV / 2) * Math.PI) / 180) * CAMERA_Z;
    const halfW = halfH * aspect;
    const span = Math.max(1.65, (halfW * 1.08) / Math.cos(OUTER_TURN));
    const counts = aspect > WIDE_ASPECT ? WIDE_LAYERS : NARROW_LAYERS;
    const ring = Math.min(1.4, halfH * 0.6);
    const last = counts.length - 1;
    const layers = counts.map((count, li) => ({
      x: -span + (li * 2 * span) / last,
      count,
      radius: li === 0 || li === last ? ring * 0.55 : ring,
    }));
    const net = buildScene(layers, counts.length > 5 ? 14 : 10);

    const built = { net, geometries: [], materials: [], layerMaterials: [], layerSprites: [], gapMaterials: [], neurons: [], dots: [] };
    const group = new Group();
    built.group = group;

    // One material (and one glow material) per layer: a whole layer lights up together.
    for (let li = 0; li < layers.length; li++) {
      const metal = new MeshStandardMaterial({ metalness: 0.85, roughness: 0.45, envMapIntensity: ENV_INTENSITY });
      const glow = new SpriteMaterial({ map: this.glowTexture, transparent: true, depthWrite: false, toneMapped: false, opacity: 0 });
      built.layerMaterials.push(metal);
      built.layerSprites.push(glow);
      built.materials.push(metal, glow);
    }
    for (const n of net.neurons) {
      const mesh = new Mesh(this.neuronGeometry, built.layerMaterials[n.layer]);
      mesh.position.set(n.x, n.y, n.z);
      const sprite = new Sprite(built.layerSprites[n.layer]);
      sprite.position.copy(mesh.position);
      sprite.scale.setScalar(NEURON_GLOW_SIZE);
      group.add(mesh, sprite);
      built.neurons.push({ mesh, sprite, layer: n.layer });
    }

    // Tubes: one merged mesh per gap between layers, with its own material.
    for (let gap = 0; gap < layers.length - 1; gap++) {
      const tubes = net.edges
        .filter(({ from }) => net.neurons[from].layer === gap)
        .map(({ from, to }) => {
          const a = net.neurons[from], b = net.neurons[to];
          return new TubeGeometry(new LineCurve3(new Vector3(a.x, a.y, a.z), new Vector3(b.x, b.y, b.z)), 1, TUBE_RADIUS, 6, false);
        });
      const geometry = mergeGeometries(tubes);
      tubes.forEach((tube) => tube.dispose());
      const material = new MeshStandardMaterial({ metalness: 0, roughness: 0.7, envMapIntensity: ENV_INTENSITY });
      group.add(new Mesh(geometry, material));
      built.geometries.push(geometry);
      built.materials.push(material);
      built.gapMaterials.push(material);
    }

    // Dots: their own materials (each fades on its own).
    for (let i = 0; i < net.dots.length; i++) {
      const material = new MeshBasicMaterial({ transparent: true, toneMapped: false, depthWrite: false, opacity: 0 });
      const glowMaterial = new SpriteMaterial({ map: this.glowTexture, transparent: true, depthWrite: false, toneMapped: false, opacity: 0 });
      const mesh = new Mesh(this.dotGeometry, material);
      const sprite = new Sprite(glowMaterial);
      sprite.scale.setScalar(DOT_GLOW_SIZE);
      group.add(mesh, sprite);
      built.materials.push(material, glowMaterial);
      built.dots.push({ mesh, sprite, material, glowMaterial });
    }

    this.spin.add(group);
    this.built = built;
    this.applyColours();
  }

  /** Light/dark from the luminance of the site's --bg; fog takes --bg itself. */
  setColours(colours) {
    this.mode = luminance(colours.background) < 0.4 ? "dark" : "light";
    const [r, g, b] = colours.background;
    this.scene.fog.color.setRGB(r / 255, g / 255, b / 255, "srgb");
    this.scene.fog.near = PALETTE[this.mode].fogNear;
    this.scene.fog.far = PALETTE[this.mode].fogFar;
    this.applyColours();
  }

  applyColours() {
    if (!this.built) return;
    const palette = PALETTE[this.mode];
    const { blending } = GLOW[this.mode];
    for (const material of this.built.layerMaterials) material.color.set(palette.neuron);
    for (const material of this.built.gapMaterials) material.color.set(palette.tube);
    for (const material of [...this.built.layerSprites, ...this.built.dots.map((d) => d.glowMaterial)]) {
      if (material.blending !== blending) {
        material.blending = blending;
        material.needsUpdate = true;
      }
    }
  }

  /**
   * Draws the frame for `time` (ms of animation time, so pausing freezes it).
   * pointer: parallax target (-1…1 each axis) or null.
   */
  render(time, pointer) {
    if (!this.built) return;
    const { net, layerMaterials, layerSprites, gapMaterials, neurons, dots } = this.built;
    const glow = GLOW[this.mode];

    // ----- camera: fixed side view + eased parallax; the spin around X -----
    if (pointer) {
      this.tilt.y += (pointer.x * PARALLAX.y - this.tilt.y) * PARALLAX.ease;
      this.tilt.x += (pointer.y * PARALLAX.x - this.tilt.x) * PARALLAX.ease;
    }
    this.outer.rotation.set(this.tilt.x, OUTER_TURN + this.tilt.y, 0);
    this.spin.rotation.x = START_ANGLE + ((time % ROTATION_PERIOD_MS) / ROTATION_PERIOD_MS) * Math.PI * 2;

    // ----- the wave (same as the 2D version) -----
    const layerCount = net.layerCount;
    const phase = time % CYCLE_MS;
    const forward = phase < HALF_MS;
    const progress = (forward ? phase : phase - HALF_MS) / HALF_MS;
    const wave = forward ? -1 + progress * (layerCount + 1) : layerCount - progress * (layerCount + 1);
    const waveColour = this.colour.wave.set(forward ? PALETTE[this.mode].forward : PALETTE[this.mode].backward);
    const active = layerMaterials.map((_, li) => Math.exp(-((li - wave) ** 2) / (2 * WAVE_WIDTH * WAVE_WIDTH)));

    // ----- neurons and their glow -----
    layerMaterials.forEach((material, li) => {
      material.emissive.copy(waveColour);
      material.emissiveIntensity = active[li] * glow.emissive;
      layerSprites[li].color.copy(waveColour);
      layerSprites[li].opacity = active[li] * glow.sprite;
    });
    for (const { mesh, sprite, layer } of neurons) {
      const grow = 1 + ACTIVE_GROW * active[layer];
      mesh.scale.setScalar(grow);
      sprite.scale.setScalar(NEURON_GLOW_SIZE * grow);
    }
    gapMaterials.forEach((material, gap) => {
      material.emissive.copy(waveColour);
      material.emissiveIntensity = ((active[gap] + active[gap + 1]) / 2) * glow.emissive * 0.5;
    });

    // ----- dots: full paths along real links, riding the wave -----
    const pass = Math.floor(time / HALF_MS);
    if (pass !== net.pass) {
      pickPaths(net, forward);
      net.pass = pass;
    }
    const steps = layerCount - 1;
    net.dots.forEach((dot, i) => {
      const { mesh, sprite, material, glowMaterial } = dots[i];
      const along = (forward ? wave : steps - wave) + dot.offset;
      const visible = along >= 0 && along <= steps && dot.path.length > 0;
      mesh.visible = sprite.visible = visible;
      if (!visible) return;
      const k = Math.min(steps - 1, Math.floor(along));
      const t = along - k;
      const a = net.neurons[dot.path[k]], b = net.neurons[dot.path[k + 1]];
      mesh.position.set(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t);
      sprite.position.copy(mesh.position);
      const fade = Math.min(1, along / DOT_FADE, (steps - along) / DOT_FADE);
      material.color.copy(waveColour).multiplyScalar(glow.dot);
      material.opacity = fade * DOT_OPACITY;
      glowMaterial.color.copy(waveColour);
      glowMaterial.opacity = fade * glow.sprite;
    });

    this.renderer.render(this.scene, this.camera);
  }

  disposeBuilt() {
    if (!this.built) return;
    this.spin.remove(this.built.group);
    this.built.geometries.forEach((geometry) => geometry.dispose());
    this.built.materials.forEach((material) => material.dispose());
    this.built = null;
  }

  /** Frees everything on the GPU and the context itself. */
  dispose() {
    this.disposeBuilt();
    this.neuronGeometry.dispose();
    this.dotGeometry.dispose();
    this.glowTexture.dispose();
    this.envTarget.dispose();
    this.pmrem.dispose();
    this.scene.environment = null;
    this.canvas.removeEventListener("webglcontextlost", this.onContextLost);
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
