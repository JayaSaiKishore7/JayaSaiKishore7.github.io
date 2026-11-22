import { createRef, PureComponent } from "react";
import { whenIdleAfterLoader } from "../../utils/webglUpgrade";
import "./AboutLayers.css";

// ---------- the network (3D model units) ----------
const LAYER_X = [-1.6, -0.55, 0.55, 1.6];
const GRID = [3, 4, 4, 2]; // n × n neurons per layer, in the y-z plane
const SPACING = 0.42;
const PANEL_MARGIN = 0.24; // the outline panel reaches this far past the outer neurons

// The fixed 3D angle (nothing ever rotates): computed once.
const YAW = 0.72;
const PITCH = -0.3;
const COS_YAW = Math.cos(YAW);
const SIN_YAW = Math.sin(YAW);
const COS_PITCH = Math.cos(PITCH);
const SIN_PITCH = Math.sin(PITCH);
const CAMERA = 4.6;

const SIGNALS = 26;
const STILL_T = 2; // the frame shown with reduced motion (and after the slow-device guard)
const EDGE_PX = 10; // free space kept at the canvas edges (glow + rounding)

// Slow-device guard: this many frames in a row over SLOW_MS → stop and keep a still frame.
const SLOW_MS = 50;
const SLOW_STREAK = 5;
const SKIP_FRAMES = 2; // the first frames are often slow while the page settles

/** Rotate around Y (yaw), then X (pitch), then perspective. */
function project({ x, y, z }) {
  const x1 = x * COS_YAW + z * SIN_YAW;
  const z1 = -x * SIN_YAW + z * COS_YAW;
  const y2 = y * COS_PITCH - z1 * SIN_PITCH;
  const z2 = y * SIN_PITCH + z1 * COS_PITCH;
  const s = CAMERA / (CAMERA + z2);
  return { x: x1 * s, y: -y2 * s, s, depth: z2 }; // screen y grows downwards
}

/** Each layer's neurons and panel corners, projected (unit scale, centred on 0). */
const LAYERS = LAYER_X.map((x, i) => {
  const n = GRID[i];
  const half = ((n - 1) / 2) * SPACING;
  const nodes = [];
  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) nodes.push(project({ x, y: a * SPACING - half, z: b * SPACING - half }));
  }
  const edge = half + PANEL_MARGIN;
  const corners = [
    [-edge, -edge],
    [edge, -edge],
    [edge, edge],
    [-edge, edge],
  ].map(([y, z]) => project({ x, y, z }));
  return { nodes, corners };
});

// The drawing's extent at unit scale, so it can be centred and kept inside the canvas.
const ALL = LAYERS.flatMap((layer) => [...layer.nodes, ...layer.corners]);
const BOUNDS = {
  minX: Math.min(...ALL.map((p) => p.x)),
  maxX: Math.max(...ALL.map((p) => p.x)),
  minY: Math.min(...ALL.map((p) => p.y)),
  maxY: Math.max(...ALL.map((p) => p.y)),
};

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The about section's visual: a 3D "signal flow" network drawn with Canvas 2D.
 * Four outline-only layer panels at a fixed angle, faint connections, and
 * glowing signals flowing from the input layer to the output layer. Each
 * layer drifts on its own, only left/right and up/down; nothing rotates.
 * Decoration (aria-hidden). Animates only on screen, with the tab visible,
 * after the loading screen and when not paused (WCAG 2.2.2); reduced motion
 * and slow devices get one still frame. Nothing runs during pre-rendering.
 */
export class AboutLayers extends PureComponent {
  state = { paused: false, still: false };

  canvasRef = createRef();
  frame = null;
  timeBase = null;
  onScreen = false;
  started = false;
  slowStreak = 0;
  frameCount = 0;
  lastTime = 0;

  componentDidMount() {
    const canvas = this.canvasRef.current;
    this.ctx = canvas?.getContext("2d");
    if (!this.ctx) return;

    this.readColours();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);

    // Theme switch: data-theme on <html> changes → new colours, redraw.
    this.themeObserver = new MutationObserver(() => {
      this.readColours();
      this.drawCurrent();
    });
    this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    this.motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.motionQuery.addEventListener("change", this.handleMotionChange);

    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.onScreen = entry.isIntersecting;
      this.sync();
    });
    this.intersectionObserver.observe(canvas);
    document.addEventListener("visibilitychange", this.sync);

    // Like the hero: nothing moves until the loading screen is gone and the browser is idle.
    this.cancelStart = whenIdleAfterLoader(() => {
      this.started = true;
      this.sync();
    });
  }

  componentWillUnmount() {
    this.stopLoop();
    this.cancelStart?.();
    this.resizeObserver?.disconnect();
    this.themeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    this.motionQuery?.removeEventListener("change", this.handleMotionChange);
    document.removeEventListener("visibilitychange", this.sync);
  }

  componentDidUpdate() {
    this.sync();
  }

  handleMotionChange = () => {
    this.drawCurrent();
    this.sync();
  };

  toggle = () => this.setState(({ paused }) => ({ paused: !paused }));

  readColours() {
    const css = getComputedStyle(document.documentElement);
    this.colours = { accent: css.getPropertyValue("--accent").trim(), node: css.getPropertyValue("--muted").trim() };
  }

  resize() {
    const canvas = this.canvasRef.current;
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Scale: the spec's k, made smaller if the drifting layers would touch an edge.
    const amp = Math.min(width, height) * 0.045;
    const fitX = (width - 2 * (amp + EDGE_PX)) / (BOUNDS.maxX - BOUNDS.minX);
    const fitY = (height - 2 * (amp * 0.8 + EDGE_PX)) / (BOUNDS.maxY - BOUNDS.minY);
    const k = Math.min(width * 0.25, height * 0.4, fitX, fitY);
    this.view = {
      width,
      height,
      k,
      amp,
      // centre the drawing's own bounding box, not its origin
      cx: width / 2 - ((BOUNDS.minX + BOUNDS.maxX) / 2) * k,
      cy: height / 2 - ((BOUNDS.minY + BOUNDS.maxY) / 2) * k,
    };
    this.drawCurrent();
  }

  /** Whether the loop should run right now. */
  shouldAnimate() {
    return (
      this.started &&
      this.onScreen &&
      document.visibilityState === "visible" &&
      !this.state.paused &&
      !this.state.still &&
      !reducedMotion()
    );
  }

  sync = () => {
    if (!this.ctx) return;
    if (this.shouldAnimate()) {
      if (this.frame === null) {
        this.timeBase = null; // the next tick continues from the frame on screen (no jump)
        this.lastTime = 0;
        this.frameCount = 0;
        this.slowStreak = 0;
        this.frame = requestAnimationFrame(this.tick);
      }
    } else this.stopLoop();
  };

  stopLoop() {
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = null;
  }

  tick = (now) => {
    this.frame = null;
    // Slow-device guard (skip the first frames, then stop after a run of slow ones).
    if (this.lastTime && ++this.frameCount > SKIP_FRAMES) {
      this.slowStreak = now - this.lastTime > SLOW_MS ? this.slowStreak + 1 : 0;
      if (this.slowStreak >= SLOW_STREAK) {
        this.setState({ still: true }); // hides the button; componentDidUpdate stops the loop
        this.draw(STILL_T, false);
        return;
      }
    }
    this.lastTime = now;
    if (this.timeBase === null) this.timeBase = now / 1000 - (this.time ?? STILL_T);
    this.time = now / 1000 - this.timeBase;
    this.draw(this.time, true);
    this.frame = requestAnimationFrame(this.tick);
  };

  /** Redraw what should be on screen now (after a resize, theme change or pause). */
  drawCurrent() {
    if (!this.view) return;
    const moving = !reducedMotion() && !this.state.still;
    if (moving && this.time !== undefined) this.draw(this.time, true);
    else this.draw(STILL_T, moving);
  }

  draw(t, float) {
    const { ctx, view, colours } = this;
    if (!view) return;
    const { width, height, k, amp, cx, cy } = view;
    ctx.clearRect(0, 0, width, height);

    // Each layer's own drift, in screen pixels: x and y only.
    const offsets = LAYERS.map((_, i) =>
      float ? [amp * Math.sin(t * 0.55 + i * 1.7), amp * 0.8 * Math.cos(t * 0.45 + i * 1.1)] : [0, 0]
    );
    const at = (p, i) => [cx + p.x * k + offsets[i][0], cy + p.y * k + offsets[i][1]];

    // 1. panels: outline only
    ctx.globalAlpha = 0.38;
    ctx.strokeStyle = colours.accent;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    LAYERS.forEach((layer, i) => {
      layer.corners.forEach((p, c) => {
        const [x, y] = at(p, i);
        if (c === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
    });
    ctx.stroke();

    // 2. connections between neighbouring layers, one path
    ctx.globalAlpha = 0.17;
    ctx.strokeStyle = colours.node;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    for (let g = 0; g < LAYERS.length - 1; g++) {
      for (const a of LAYERS[g].nodes) {
        const [ax, ay] = at(a, g);
        for (const b of LAYERS[g + 1].nodes) {
          ctx.moveTo(ax, ay);
          ctx.lineTo(...at(b, g + 1));
        }
      }
    }
    ctx.stroke();

    // 3. neurons, back to front
    ctx.globalAlpha = 1;
    ctx.fillStyle = colours.node;
    LAYERS.flatMap((layer, i) => layer.nodes.map((p) => [p, i]))
      .sort(([a], [b]) => b.depth - a.depth)
      .forEach(([p, i]) => {
        const [x, y] = at(p, i);
        ctx.beginPath();
        ctx.arc(x, y, 2.2 * p.s, 0, Math.PI * 2);
        ctx.fill();
      });

    // 4. signals: glowing dots flowing forward, fading in and out
    ctx.fillStyle = colours.accent;
    ctx.shadowColor = colours.accent;
    ctx.shadowBlur = 8;
    for (let s = 0; s < SIGNALS; s++) {
      const g = s % 3;
      const from = LAYERS[g].nodes[(s * 7) % LAYERS[g].nodes.length];
      const to = LAYERS[g + 1].nodes[(s * 11) % LAYERS[g + 1].nodes.length];
      const f = (t * 0.3 + s * 0.173) % 1;
      const [x1, y1] = at(from, g);
      const [x2, y2] = at(to, g + 1);
      ctx.globalAlpha = Math.sin(f * Math.PI);
      ctx.beginPath();
      ctx.arc(x1 + (x2 - x1) * f, y1 + (y2 - y1) * f, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  render() {
    const { paused, still } = this.state;
    return (
      <div className="about-layers">
        <div className="about-layers-canvas" aria-hidden="true">
          <canvas ref={this.canvasRef} />
        </div>
        {/* WCAG 2.2.2: endless motion can be paused. Hidden with reduced motion (nothing moves). */}
        {still ? null : (
          <button
            type="button"
            className="about-layers-toggle"
            aria-label={paused ? "play about animation" : "pause about animation"}
            aria-pressed={paused}
            onClick={this.toggle}
          >
            {paused ? (
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M5 3.5v9l7.5-4.5z" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M5 3.5v9M11 3.5v9" />
              </svg>
            )}
          </button>
        )}
      </div>
    );
  }
}
