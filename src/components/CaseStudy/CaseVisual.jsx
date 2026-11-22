import { PureComponent, createRef } from "react";
import { webglWanted, whenIdleAfterLoader } from "../../utils/webglUpgrade";
import { VISUALS } from "./caseVisuals";
import "./CaseVisual.css";

const FRAME_MS = 1000 / 30; // slow motion: 30 fps is plenty
const MAX_STEP_MS = 100; // after a stall, don't jump ahead
// Slow-device guard, as for the hero: back to the still picture if WebGL can't keep up.
const GUARD = {
  skip: 2, // the first frames are slow everywhere (uploads, warm-up): not timed
  quick: { frames: 3, maxMs: 48 },
  settled: { frames: 15, maxMs: 16 },
};

const isDark = () => document.documentElement.dataset.theme === "dark";

/**
 * A case study's 3D header visual (only projects listed in caseVisuals.js).
 *
 * It starts as a still picture of the scene (light and dark versions, switched
 * by CSS with the theme), so something is there at once and nothing loads
 * early. Once the loading screen is gone and the browser is idle, devices with
 * a real GPU (webglUpgrade.js) load three.js and the scene as their own chunk;
 * the live 3D version fades in over the picture. Reduced motion, data saver,
 * no real GPU, too slow, a lost context or any error: the picture stays.
 *
 * Decorative (aria-hidden); the caption below it says what it shows.
 * The loop runs at 30 fps and stops while paused, off screen or in a hidden tab.
 */
export class CaseVisual extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { live: false, paused: false };
    this.canvasRef = createRef();
    this.boxRef = createRef();
    this.gl = null;
    this.off = false; // set once the live version was dropped: the picture stays
    this.frame = null;
    this.time = 0; // animation time: only moves while running, so pausing freezes it
    this.last = null;
    this.inView = false;
    this.pointer = null;
    this.size = { width: 0, height: 0 };
    this.unmounted = false;
    for (const name of ["loop", "resize", "updatePlayback", "handleMotionChange", "handleTheme", "handlePointer", "toggle", "drop", "upgrade"]) {
      this[name] = this[name].bind(this);
    }
  }

  componentDidMount() {
    this.motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (this.motionQuery.matches) return; // the still picture is the whole visual
    this.motionQuery.addEventListener("change", this.handleMotionChange);

    if (window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener("pointermove", this.handlePointer, { passive: true });
    }
    this.resizer = new ResizeObserver(this.resize);
    this.resizer.observe(this.boxRef.current);
    this.visibility = new IntersectionObserver(([entry]) => {
      this.inView = entry.isIntersecting;
      this.updatePlayback();
    });
    this.visibility.observe(this.boxRef.current);
    document.addEventListener("visibilitychange", this.updatePlayback);
    this.themeWatcher = new MutationObserver(this.handleTheme);
    this.themeWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    this.cancelUpgrade = whenIdleAfterLoader(this.upgrade);
  }

  componentDidUpdate() {
    this.updatePlayback();
  }

  componentWillUnmount() {
    this.unmounted = true;
    this.cancelUpgrade?.();
    this.motionQuery?.removeEventListener("change", this.handleMotionChange);
    window.removeEventListener("pointermove", this.handlePointer);
    this.resizer?.disconnect();
    this.visibility?.disconnect();
    this.themeWatcher?.disconnect();
    document.removeEventListener("visibilitychange", this.updatePlayback);
    this.drop();
  }

  async upgrade() {
    this.cancelUpgrade = null;
    const stillWanted = () => !this.unmounted && !this.off && !this.motionQuery.matches;
    if (!stillWanted() || !webglWanted()) return;
    let gl = null;
    try {
      const Scene = await VISUALS[this.props.project.id].load();
      if (!stillWanted()) return;
      gl = new Scene({ canvas: this.canvasRef.current, dark: isDark(), onContextLost: this.drop });
      await gl.init(this.size.width, this.size.height); // compiles every shader before the first frame
      if (!stillWanted()) {
        gl.dispose();
        return;
      }
      gl.resize(this.size.width, this.size.height); // in case the box changed size meanwhile
      this.gl = gl;
      this.guard = { seen: 0, timed: 0, totalMs: 0 };
      this.draw();
      this.setState({ live: true }); // the canvas fades in over the picture (CSS)
    } catch {
      try {
        gl?.dispose();
      } catch {
        // already gone
      }
      this.off = true;
    }
  }

  /** Back to the still picture for good (reduced motion, lost context, too slow, unmount). */
  drop() {
    this.off = true;
    cancelAnimationFrame(this.frame);
    this.frame = null;
    const gl = this.gl;
    this.gl = null;
    try {
      gl?.dispose();
    } catch {
      // a lost context can't free anything more
    }
    if (!this.unmounted) this.setState({ live: false });
  }

  /** Only turning reduced motion ON drops the live version (turning it off changes nothing). */
  handleMotionChange({ matches }) {
    if (matches) this.drop();
  }

  /** New theme colours, and one frame at once, so a paused scene shows them too. */
  handleTheme() {
    if (!this.gl) return;
    this.gl.setTheme(isDark());
    this.draw();
  }

  handlePointer(event) {
    this.pointer = { x: (event.clientX / window.innerWidth) * 2 - 1, y: (event.clientY / window.innerHeight) * 2 - 1 };
  }

  resize() {
    const { width, height } = this.boxRef.current.getBoundingClientRect();
    this.size = { width, height };
    if (this.gl) {
      this.gl.resize(width, height);
      this.draw();
    }
  }

  draw() {
    if (!this.gl) return;
    const started = performance.now();
    this.gl.render(this.time, { pointer: this.pointer });
    this.checkSpeed(performance.now() - started);
  }

  /** The slow-device guard: a few frames to warm up, then back to the picture if it can't keep up. */
  checkSpeed(ms) {
    const g = this.guard;
    if (!g || g.done) return;
    g.seen += 1;
    if (g.seen <= GUARD.skip) return;
    g.timed += 1;
    g.totalMs += ms;
    const average = g.totalMs / g.timed;
    if (g.timed === GUARD.quick.frames && average > GUARD.quick.maxMs) this.drop();
    else if (g.timed === GUARD.settled.frames) {
      if (average > GUARD.settled.maxMs) this.drop();
      else g.done = true;
    }
  }

  /** Runs the loop only when it should: live, not paused, on screen, tab visible. */
  updatePlayback() {
    const run = Boolean(this.gl) && !this.state.paused && this.inView && !document.hidden;
    if (run && this.frame === null) {
      this.last = null;
      this.frame = requestAnimationFrame(this.loop);
    } else if (!run && this.frame !== null) {
      cancelAnimationFrame(this.frame);
      this.frame = null;
    }
  }

  loop(now) {
    this.frame = requestAnimationFrame(this.loop);
    if (this.last !== null && now - this.last < FRAME_MS) return;
    this.time += this.last === null ? 0 : Math.min(now - this.last, MAX_STEP_MS);
    this.last = now;
    this.draw();
  }

  toggle() {
    this.setState(({ paused }) => ({ paused: !paused }));
  }

  render() {
    const visual = VISUALS[this.props.project.id];
    if (!visual) return null;
    const { live, paused } = this.state;

    return (
      <figure className={`case-visual${live ? " is-live" : ""}`}>
        {/* The frame holds the picture and its pause button (bottom-right corner). */}
        <div className="case-visual-frame">
          {/* Decoration: the caption below describes the illustration. */}
          <div ref={this.boxRef} className="case-visual-box" aria-hidden="true">
            <img className="case-visual-still case-visual-still--light" src={visual.still.light} alt="" width="880" height="550" decoding="async" />
            <img className="case-visual-still case-visual-still--dark" src={visual.still.dark} alt="" width="880" height="550" decoding="async" />
            <canvas ref={this.canvasRef} className="case-visual-canvas" />
          </div>
          {/* WCAG 2.2.2: motion that runs for more than 5 s can be paused. Only while it moves. */}
          {live ? (
            <button
              type="button"
              className="case-visual-toggle"
              aria-label={paused ? "play animation" : "pause animation"}
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
          ) : null}
        </div>
        <figcaption>{visual.caption}</figcaption>
      </figure>
    );
  }
}
