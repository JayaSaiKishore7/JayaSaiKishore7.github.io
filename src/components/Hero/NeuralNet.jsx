import { PureComponent, createRef } from "react";
import { applyCalm, buildScene, drawFrame, makeCalmMask, readColours } from "../../utils/neuralNet3d";
import { webglWanted, whenIdleAfterLoader } from "../../utils/webglUpgrade";
import "./NeuralNet.css";

const FRAME_MS = 1000 / 30; // ~30 fps is plenty for slow motion, and halves the work
const MAX_STEP_MS = 100; // after a stall (busy tab), don't jump ahead

// The WebGL upgrade (hero only): cross-fade length, and the slow-device guard.
const WEBGL_FADE_MS = 600; // of animation time, so a pause freezes the fade too
const GUARD = {
  skip: 2, // the first frames are slow everywhere (uploads, warm-up): not timed
  quick: { frames: 3, maxMs: 48 }, // clearly too slow: back to 2D almost at once
  settled: { frames: 15, maxMs: 16 }, // not keeping up with 60 fps: back to 2D
};

// How much of the network to erase behind the hero's text block (0…1), so the
// name, tagline, note and meta line keep at least 4.5:1 contrast (measured).
const CALM = { network: 0.85 };
// Extra fade behind single lines of text that need it, measured:
// the muted note line was the only one under 4.5:1 at full network strength.
const CALM_EXTRA = [{ selector: ".hero-note", amount: 0.85 }];

const VARIANTS = {
  // Faint, behind the whole hero, calm behind its text, with a pause button,
  // upgraded to real 3D (WebGL) where the device can take it.
  hero: { calmSelector: ".hero-main", button: true, webgl: true },
  // Stronger, behind the loading screen. Always the 2D canvas.
  loader: { calmSelector: null, button: false, webgl: false },
};

/**
 * The 3D "rotating layers" neural network on a canvas (drawing logic in
 * src/utils/neuralNet3d.js). Decorative: aria-hidden.
 *
 * Performance: one requestAnimationFrame loop drawing straight to the canvas,
 * no React state per frame. Its props never change, so (as a PureComponent)
 * it doesn't re-render when the Hero's clock ticks. The loop stops while
 * paused, off screen or in a hidden tab; with reduced motion it draws one
 * still frame.
 *
 * WebGL upgrade (hero only): once the loading screen is gone and the browser
 * is idle, and only on devices with a real GPU (src/utils/webglUpgrade.js),
 * three.js and the WebGL scene (src/utils/neuralNet3dGL.js) load as their own
 * chunk. The scene draws offscreen; each frame is copied onto this same canvas
 * and the calm area is erased as before, cross-fading from the 2D picture.
 * Too slow, reduced motion, a lost context or any error: back to 2D for good.
 */
export class NeuralNet extends PureComponent {
  static defaultProps = { variant: "hero" };

  constructor(props) {
    super(props);
    this.state = { paused: false, reducedMotion: false };
    this.rootRef = createRef();
    this.canvasRef = createRef();
    this.frame = null;
    this.time = 0; // animation time: only moves while running, so pausing freezes it
    this.last = null;
    this.inView = false; // until the IntersectionObserver says otherwise (a hidden loader never runs)
    this.size = { width: 0, height: 0, dpr: 1 };
    this.pointer = null; // parallax target, only on devices with a mouse
    this.calm = null;
    this.gl = null; // the WebGL scene while it's in use
    this.glOff = false; // set once WebGL was dropped (or never wanted): stays 2D
    this.cancelUpgrade = null;
    this.unmounted = false;
    for (const name of ["loop", "resize", "updatePlayback", "handleMotionChange", "handlePointer", "toggle", "upgrade", "dropWebGL"]) {
      this[name] = this[name].bind(this);
    }
  }

  componentDidMount() {
    const root = this.rootRef.current;
    const { calmSelector } = VARIANTS[this.props.variant];
    this.calmTarget = calmSelector ? root.parentElement.querySelector(calmSelector) : null;
    this.ctx = this.canvasRef.current.getContext("2d");
    this.colours = readColours();

    this.motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.motionQuery.addEventListener("change", this.handleMotionChange);

    // Parallax only where there's a mouse; touch screens get none.
    if (window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener("pointermove", this.handlePointer, { passive: true });
    }

    // Redraw on resize, and when the text block changes size (fonts loading).
    this.resizer = new ResizeObserver(this.resize);
    this.resizer.observe(root);
    if (this.calmTarget) this.resizer.observe(this.calmTarget);

    this.visibility = new IntersectionObserver(([entry]) => {
      this.inView = entry.isIntersecting;
      this.updatePlayback();
    });
    this.visibility.observe(root);
    document.addEventListener("visibilitychange", this.updatePlayback);

    // Light/dark: the toggle changes data-theme on <html>; re-read the colours then.
    this.themeWatcher = new MutationObserver(() => {
      this.colours = readColours();
      this.gl?.setColours(this.colours);
      this.draw();
    });
    this.themeWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    this.handleMotionChange(this.motionQuery);

    if (VARIANTS[this.props.variant].webgl) this.cancelUpgrade = whenIdleAfterLoader(this.upgrade);
  }

  componentDidUpdate() {
    this.updatePlayback();
  }

  componentWillUnmount() {
    this.unmounted = true; // a WebGL load still in flight is thrown away when it lands
    this.cancelUpgrade?.();
    this.dropWebGL();
    cancelAnimationFrame(this.frame);
    this.motionQuery?.removeEventListener("change", this.handleMotionChange);
    window.removeEventListener("pointermove", this.handlePointer);
    this.resizer?.disconnect();
    this.visibility?.disconnect();
    this.themeWatcher?.disconnect();
    document.removeEventListener("visibilitychange", this.updatePlayback);
  }

  handleMotionChange({ matches }) {
    if (matches) this.dropWebGL(); // reduced motion: the still 2D picture
    this.setState({ reducedMotion: matches }, () => {
      this.draw(); // with reduced motion: the one still picture
      this.updatePlayback();
    });
  }

  handlePointer(event) {
    this.pointer = { x: (event.clientX / window.innerWidth) * 2 - 1, y: (event.clientY / window.innerHeight) * 2 - 1 };
  }

  /** Sharp on every screen (devicePixelRatio), and the calm area follows the text block. */
  resize() {
    const root = this.rootRef.current;
    const { width, height } = root.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const canvas = this.canvasRef.current;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.size = { width, height, dpr };
    if (!this.scene) this.scene = buildScene();

    if (this.calmTarget) {
      // Layout position (offset*), so the hero's entrance transform doesn't shift it.
      const layoutRect = (target) => {
        const rect = { x: 0, y: 0, width: target.offsetWidth, height: target.offsetHeight };
        for (let el = target; el && el !== root.offsetParent; el = el.offsetParent) {
          rect.x += el.offsetLeft;
          rect.y += el.offsetTop;
        }
        return rect;
      };
      const hero = root.parentElement;
      this.calm = {
        mask: makeCalmMask(width, height, layoutRect(this.calmTarget), dpr),
        ...CALM,
        extras: CALM_EXTRA.flatMap(({ selector, amount }) => {
          const el = hero.querySelector(selector);
          return el ? [{ mask: makeCalmMask(width, height, layoutRect(el), dpr), amount }] : [];
        }),
      };
    }
    this.gl?.resize(width, height);
    this.draw();
  }

  draw() {
    if (!this.scene || !this.size.width) return;
    if (this.gl) {
      this.drawWebGL();
      return;
    }
    this.drawCanvas2D(this.calm);
  }

  drawCanvas2D(calm) {
    drawFrame(this.ctx, this.scene, {
      ...this.size,
      time: this.time,
      colours: this.colours,
      still: this.state.reducedMotion,
      pointer: this.pointer,
      calm,
    });
  }

  // ---------- the WebGL upgrade ----------

  /** Loads and starts the WebGL scene, if this device should have it. Any failure: stays 2D. */
  async upgrade() {
    this.cancelUpgrade = null;
    const stillWanted = () => !this.unmounted && !this.glOff && !this.state.reducedMotion;
    if (!stillWanted() || !webglWanted()) return;
    let gl = null;
    try {
      const { NeuralNetGL } = await import("../../utils/neuralNet3dGL.js");
      if (!stillWanted()) return;
      gl = new NeuralNetGL({ colours: this.colours, onContextLost: this.dropWebGL });
      await gl.init(this.size.width, this.size.height); // compiles every shader before the first frame
      if (!stillWanted()) {
        gl.dispose();
        return;
      }
      gl.resize(this.size.width, this.size.height); // in case the hero changed size meanwhile
      this.gl = gl;
      this.fadeFrom = this.time;
      this.guard = { seen: 0, timed: 0, totalMs: 0 };
      this.draw();
    } catch {
      try {
        gl?.dispose();
      } catch {
        // already gone: nothing more to free
      }
      this.glOff = true;
    }
  }

  /** Back to the 2D canvas for good (slow device, reduced motion, lost context, unmount). */
  dropWebGL() {
    this.glOff = true;
    const gl = this.gl;
    if (!gl) return;
    this.gl = null;
    try {
      gl.dispose();
    } catch {
      // a lost context can't free anything more
    }
    if (!this.unmounted) this.draw();
  }

  /**
   * One WebGL frame onto the visible canvas: render offscreen, copy it over,
   * then the calm area as before. During the first WEBGL_FADE_MS, the 2D
   * picture (without calm) fades out underneath while the WebGL one fades in.
   */
  drawWebGL() {
    const { ctx, gl } = this;
    const { width, height } = this.size;
    const fade = Math.min(1, (this.time - this.fadeFrom) / WEBGL_FADE_MS);
    const started = performance.now();

    gl.render(this.time, this.pointer);
    if (fade < 1) {
      this.drawCanvas2D(null);
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = fade;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    } else {
      ctx.clearRect(0, 0, width, height);
    }
    ctx.globalAlpha = fade;
    ctx.drawImage(gl.canvas, 0, 0, width, height);
    ctx.globalAlpha = 1;
    applyCalm(ctx, this.calm, width, height);

    this.checkSpeed(performance.now() - started);
  }

  /** The slow-device guard: average frame time (render + copy) after 3 and after 15 timed frames. */
  checkSpeed(ms) {
    const guard = this.guard;
    if (guard.timed >= GUARD.settled.frames) return; // passed: no more timing
    if (++guard.seen <= GUARD.skip) return;
    guard.timed += 1;
    guard.totalMs += ms;
    const average = guard.totalMs / guard.timed;
    const tooSlow =
      (guard.timed === GUARD.quick.frames && average > GUARD.quick.maxMs) ||
      (guard.timed === GUARD.settled.frames && average > GUARD.settled.maxMs);
    if (tooSlow) this.dropWebGL();
  }

  /** Runs the loop only when it should: not paused, on screen, tab visible, motion allowed. */
  updatePlayback() {
    const run = !this.state.paused && !this.state.reducedMotion && this.inView && !document.hidden;
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
    const { variant } = this.props;
    const { paused, reducedMotion } = this.state;

    return (
      <>
        <div ref={this.rootRef} className={`nn nn--${variant}`} aria-hidden="true">
          <canvas ref={this.canvasRef} className="nn-canvas" />
        </div>
        {/* WCAG 2.2.2: motion that runs for more than 5 s can be paused. No button when nothing moves. */}
        {VARIANTS[variant].button && !reducedMotion ? (
          <button
            type="button"
            className="nn-toggle"
            aria-label={paused ? "play background animation" : "pause background animation"}
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
      </>
    );
  }
}
