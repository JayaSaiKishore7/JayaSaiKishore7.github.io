/**
 * The air-quality case study's header visual: "pollutant curtains", in the
 * same brushed metal, lights and colours as the hero network (neuralNet3dGL.js).
 *
 * Three 3D area curtains, PM10, NO₂ and O₃, side by side along a time axis:
 * 72 hours measured (metal), a glass panel for "now", then the next 24 hours
 * forecast (teal), drawn hour by hour, again and again. The scene sways
 * slowly so the depth reads.
 *
 * The curves are illustrations shaped like real daily cycles (NO₂'s morning
 * and evening rush hours, O₃'s afternoon peak), not measurements: the caption
 * on the page says so.
 *
 * Loaded on demand by CaseVisual.jsx (dynamic import, its own chunk) and only
 * where webglWanted() says the device has a real GPU. The page shows a still
 * picture of this same scene first, and keeps it when WebGL can't run.
 */
import {
  ACESFilmicToneMapping,
  AmbientLight,
  BufferGeometry,
  CatmullRomCurve3,
  DirectionalLight,
  DoubleSide,
  EdgesGeometry,
  Float32BufferAttribute,
  GridHelper,
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
  TubeGeometry,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// ---------- colours (the hero's palette) ----------

const PALETTE = {
  light: { metal: "#7F90A1", forecast: "#0C6E7A", grid: "#C9D2DB", glass: 0.07 },
  dark: { metal: "#5E7286", forecast: "#4FC7D6", grid: "#22324A", glass: 0.06 },
};
const ENV_INTENSITY = 0.45;

// ---------- time axis ----------

const HOURS = 96; // 72 measured + 24 forecast
const NOW = 72; // first forecast hour
const START_HOUR = 6; // the first value is at 06:00
const X_START = -2.35;
const X_SPAN = 4.7;
const FLOOR = -0.78;
const HANDOFF_HOURS = 4; // the forecast eases from the last measured value into its curve
const SERIES = [
  { kind: "pm10", z: -0.62 },
  { kind: "no2", z: 0 },
  { kind: "o3", z: 0.62 },
];

// ---------- motion ----------

const CYCLE_MS = 14000; // the forecast draws hour by hour...
const DRAW_MS = 9000; // ...over 9 s, then holds the full forecast for 5 s
const SWAY = { base: -0.5, amount: 0.2, periodMs: 56000 }; // rad around Y
const TILT_X = 0.16;
const FIT = { scale: 0.9, lift: 0.14 }; // centred in the 16:10 box
const PARALLAX = { y: 0.12, x: 0.08, ease: 0.04 };

// ---------- camera ----------

const FOV = 30;
const CAMERA = { y: 0.5, z: 6.1, zNarrow: 7.4, narrowBelow: 1.3 }; // framed for the 16:10 box

const x = (hour) => X_START + (hour * X_SPAN) / (HOURS - 1);
const y = (value) => ((value - 20) / 62) * 1.75 - 0.72;

/** A small deterministic wobble, so the "measured" hours look measured. */
function wobble(hour, seed) {
  const v = Math.sin(hour * 12.9898 + seed * 78.233) * 43758.5453;
  return v - Math.floor(v) - 0.5;
}

/** Illustrative hourly value (µg/m³-ish) shaped like each pollutant's daily cycle. */
function value(kind, hour, measured) {
  const h = (hour + START_HOUR) % 24;
  let v;
  if (kind === "no2") v = 34 + 20 * Math.exp(-((h - 8) ** 2) / 5) + 24 * Math.exp(-((h - 19) ** 2) / 7); // rush hours
  else if (kind === "o3") v = 40 + 34 * Math.exp(-((h - 15) ** 2) / 14); // afternoon sun
  else v = 24 + 8 * Math.sin((hour / HOURS) * Math.PI * 2) + 6 * Math.exp(-((h - 9) ** 2) / 10); // slow, plus a morning bump
  return measured ? v + wobble(hour, kind.length) * 9 : v;
}

/** A vertical "curtain" from the floor up to the curve: two vertices per hour, two triangles between hours. */
function curtainGeometry(points, z) {
  const positions = [];
  const index = [];
  points.forEach((p, k) => {
    positions.push(p.x, FLOOR, z, p.x, p.y, z);
    if (k > 0) {
      const a = 2 * (k - 1);
      index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  });
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

export class ForecastCurtainsGL {
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
    const rim = new DirectionalLight(0x4fc7d6, 0.55);
    rim.position.set(-4, 2, -5);
    this.scene.add(key, rim, new AmbientLight(0xffffff, 0.35));

    this.camera = new PerspectiveCamera(FOV, 1, 0.1, 50);

    this.materials = {
      pastCurtain: new MeshStandardMaterial({ metalness: 0.6, roughness: 0.5, envMapIntensity: ENV_INTENSITY, side: DoubleSide, transparent: true, opacity: 0.92 }),
      forecastCurtain: new MeshStandardMaterial({ metalness: 0.2, roughness: 0.45, envMapIntensity: ENV_INTENSITY, side: DoubleSide, transparent: true, opacity: 0.8, emissiveIntensity: 0.25 }),
      pastEdge: new MeshStandardMaterial({ metalness: 0.85, roughness: 0.45, envMapIntensity: ENV_INTENSITY }),
      forecastEdge: new MeshStandardMaterial({ metalness: 0.3, roughness: 0.4, envMapIntensity: ENV_INTENSITY, emissiveIntensity: 0.35 }),
      glass: new MeshBasicMaterial({ color: 0xffffff, transparent: true, side: DoubleSide, depthWrite: false }),
      glassEdge: new LineBasicMaterial({ transparent: true, opacity: 0.55 }),
    };
    this.geometries = [];
    this.forecastParts = []; // geometries drawn hour by hour: { geometry, segments, indicesPerSegment }

    this.group = new Group();
    this.group.rotation.x = TILT_X;
    this.group.scale.setScalar(FIT.scale);
    this.group.position.y = FIT.lift;
    this.scene.add(this.group);
    this.build();
    this.tilt = { x: 0, y: 0 };
    this.setTheme(dark);
  }

  keep(geometry) {
    this.geometries.push(geometry);
    return geometry;
  }

  build() {
    const { materials, group } = this;
    for (const { kind, z } of SERIES) {
      const past = Array.from({ length: NOW + 1 }, (_, h) => new Vector3(x(h), y(value(kind, h, true)), z));
      // The forecast starts exactly where the measurements end, then eases
      // into its smooth curve over the first few hours (no kink, no wiggle).
      const lastMeasured = past[NOW - 1].y;
      const future = Array.from({ length: HOURS - NOW + 1 }, (_, k) => {
        const h = NOW - 1 + k;
        const blend = Math.min(1, k / HANDOFF_HOURS);
        const eased = blend * blend * (3 - 2 * blend);
        return new Vector3(x(h), lastMeasured + (y(value(kind, h, false)) - lastMeasured) * eased, z);
      });

      group.add(new Mesh(this.keep(curtainGeometry(past, z)), materials.pastCurtain));
      group.add(new Mesh(this.keep(new TubeGeometry(new CatmullRomCurve3(past), 200, 0.014, 6)), materials.pastEdge));

      const forecastCurtain = this.keep(curtainGeometry(future, z));
      group.add(new Mesh(forecastCurtain, materials.forecastCurtain));
      this.forecastParts.push({ geometry: forecastCurtain, segments: future.length - 1, indicesPerSegment: 6 });

      const forecastEdge = this.keep(new TubeGeometry(new CatmullRomCurve3(future), 96, 0.018, 6));
      group.add(new Mesh(forecastEdge, materials.forecastEdge));
      this.forecastParts.push({ geometry: forecastEdge, segments: 96, indicesPerSegment: 6 * 6 });
    }

    // The floor grid, and the glass "now" panel across all three curtains.
    this.grid = new GridHelper(1, 10);
    this.grid.scale.set(5.2, 1, 2.2);
    this.grid.position.y = FLOOR;
    this.grid.material.transparent = true;
    this.grid.material.opacity = 0.5;
    group.add(this.grid);

    const panel = this.keep(new PlaneGeometry(1.9, 1.85));
    const now = new Group();
    now.add(new Mesh(panel, materials.glass), new LineSegments(this.keep(new EdgesGeometry(panel)), materials.glassEdge));
    now.rotation.y = Math.PI / 2;
    now.position.set(x(NOW - 1), FLOOR + 0.925, 0);
    group.add(now);
  }

  setTheme(dark) {
    const p = dark ? PALETTE.dark : PALETTE.light;
    const m = this.materials;
    m.pastCurtain.color.set(p.metal);
    m.pastEdge.color.set(p.metal);
    m.forecastCurtain.color.set(p.forecast);
    m.forecastCurtain.emissive.set(p.forecast);
    m.forecastEdge.color.set(p.forecast);
    m.forecastEdge.emissive.set(p.forecast);
    m.glass.opacity = p.glass;
    m.glassEdge.color.set(p.forecast);
    this.grid.material.color.set(p.grid);
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
   * Draws the scene at `time` (ms of animation time). still: the full forecast
   * at the resting angle (the reduced-motion picture). pointer: parallax target
   * (-1…1), or null.
   */
  render(time, { still = false, pointer = null } = {}) {
    const drawn = still ? 1 : Math.min(1, (time % CYCLE_MS) / DRAW_MS);
    for (const { geometry, segments, indicesPerSegment } of this.forecastParts) {
      geometry.setDrawRange(0, Math.round(drawn * segments) * indicesPerSegment);
    }

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
    this.grid.geometry.dispose();
    this.grid.material.dispose();
    Object.values(this.materials).forEach((material) => material.dispose());
    this.envTarget.dispose();
    this.pmrem.dispose();
    this.scene.environment = null;
    this.canvas.removeEventListener("webglcontextlost", this.onContextLost);
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
