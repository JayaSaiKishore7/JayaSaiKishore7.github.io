import { PureComponent, createRef } from "react";
import {
  DESCEND,
  FADE,
  HOLD,
  RUN_LENGTH,
  buildSurface,
  drawFrame,
  makeRun,
  pointAt,
  readPalette,
  seededRandom,
  status,
} from "../../utils/lossLandscape";
import "./LossLandscape.css";

const SEED = 20261122;
const SLOW_FRAME = 0.05; // s: a frame slower than this counts as slow
const SLOW_LIMIT = 6; // this many slow frames in a row: stop, keep a still frame
const JITTER_FROM = 0.85; // the ball jitters over the last 15% of the descent and the hold

/**
 * The hero's background: a loss landscape (a wireframe surface in the theme's
 * colours) that keeps turning and breathing, with a ball running gradient
 * descent down it, run after run (drawing: src/utils/lossLandscape.js).
 *
 * Decorative (aria-hidden). It reports each frame's training numbers through
 * `onStatus({ run, epoch, loss })` for the hero's status line.
 *
 * Runs only while the hero is on screen and the tab is visible. Reduced
 * motion, or a device too slow to keep up, gets one still frame with the
 * ball resting at the minimum. Nothing touches window or the canvas until
 * componentDidMount, so prerendering renders just the empty layer.
 */
export class LossLandscape extends PureComponent {
  constructor(props) {
    super(props);
    this.wrapRef = createRef();
    this.canvasRef = createRef();
    this.frame = 0;
    this.running = false;
    this.inView = true;
    this.slowFrames = 0;
    this.tooSlow = false;
    this.elapsed = 0; // seconds of animation, the sum of capped frame times
    this.runTime = 0; // seconds into the current run
    this.runNumber = 1;
    for (const name of ["tick", "handleResize", "handleTheme", "handleVisibility", "handleIntersect"]) {
      this[name] = this[name].bind(this);
    }
  }

  componentDidMount() {
    this.ctx = this.canvasRef.current.getContext("2d");
    if (!this.ctx) return;

    this.still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.surface = buildSurface();
    this.random = seededRandom(SEED);
    this.run = makeRun(this.random);
    this.palette = readPalette(document.documentElement);

    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.resizeObserver.observe(this.wrapRef.current);

    // Light/dark: the toggle changes data-theme on <html>; re-read the colours.
    this.themeObserver = new MutationObserver(this.handleTheme);
    this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    this.intersection = new IntersectionObserver(this.handleIntersect);
    this.intersection.observe(this.wrapRef.current);
    document.addEventListener("visibilitychange", this.handleVisibility);

    this.handleResize();
  }

  componentWillUnmount() {
    this.stop();
    this.resizeObserver?.disconnect();
    this.themeObserver?.disconnect();
    this.intersection?.disconnect();
    document.removeEventListener("visibilitychange", this.handleVisibility);
  }

  // ---------- running or not ----------

  canRun() {
    return !this.still && !this.tooSlow && this.inView && document.visibilityState === "visible";
  }

  update() {
    if (this.canRun()) this.start();
    else this.stop();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = null; // the first frame after a pause doesn't count the pause
    this.frame = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.frame);
  }

  handleIntersect(entries) {
    this.inView = entries[entries.length - 1].isIntersecting;
    this.update();
  }

  handleVisibility() {
    this.update();
  }

  handleTheme() {
    this.palette = readPalette(document.documentElement);
    this.draw();
  }

  /** Match the canvas to its box (device pixels, capped at 2×), then redraw. */
  handleResize() {
    const canvas = this.canvasRef.current;
    const { width, height } = this.wrapRef.current.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.width = width;
    this.height = height;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.draw();
    this.update();
  }

  // ---------- the animation ----------

  tick(now) {
    if (!this.running) return;
    if (this.last !== null) {
      const raw = (now - this.last) / 1000;
      this.slowFrames = raw > SLOW_FRAME ? this.slowFrames + 1 : 0;
      if (this.slowFrames >= SLOW_LIMIT) {
        this.tooSlow = true;
        this.stop();
        this.draw();
        return;
      }
      const dt = Math.min(raw, 0.1);
      this.elapsed += dt;
      this.runTime += dt;
      if (this.runTime >= RUN_LENGTH) {
        this.runTime -= RUN_LENGTH;
        this.runNumber += 1;
        this.run = makeRun(this.random);
      }
    }
    this.last = now;
    this.draw();
    this.frame = requestAnimationFrame(this.tick);
  }

  /** Where the run is now: the ball, its progress and the status numbers. */
  moment() {
    const run = this.run;
    if (this.still || this.tooSlow) {
      // Resting at the minimum, training finished.
      const x = run.path[run.minIndex * 2];
      const y = run.path[run.minIndex * 2 + 1];
      return { ball: { x, y, e: 1, fade: 1 }, epoch: 50, loss: 0.03 };
    }

    const p = Math.min(1, this.runTime / DESCEND);
    const e = 1 - Math.pow(1 - p, 2.2);
    let [x, y] = pointAt(run, e);
    if (p >= JITTER_FROM && this.runTime < DESCEND + HOLD) {
      x += 0.06 * Math.sin(this.elapsed * 9);
      y += 0.06 * Math.cos(this.elapsed * 7.3);
    }
    const fadeStart = DESCEND + HOLD;
    const fade = this.runTime > fadeStart ? Math.max(0, 1 - (this.runTime - fadeStart) / FADE) : 1;
    const numbers = status(run, e, ...pointAt(run, e));
    return { ball: { x, y, e, fade }, ...numbers };
  }

  draw() {
    if (!this.ctx || !this.width || !this.height) return;
    const moving = !this.still && !this.tooSlow;
    const { ball, epoch, loss } = this.moment();
    drawFrame(this.ctx, this.width, this.height, this.surface, this.palette, {
      yaw: 0.7 + (moving ? this.elapsed * 0.06 : 0),
      t: moving ? this.elapsed : 0,
      run: this.run,
      ball,
    });
    this.props.onStatus?.({ run: this.runNumber, epoch, loss });
  }

  render() {
    return (
      <div ref={this.wrapRef} className="loss" aria-hidden="true">
        <canvas ref={this.canvasRef} className="loss-canvas" />
      </div>
    );
  }
}
