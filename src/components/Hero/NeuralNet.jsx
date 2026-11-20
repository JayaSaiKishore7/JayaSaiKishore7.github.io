import { PureComponent, createRef } from "react";
import { buildScene, drawFrame, makeCalmMask, readColours } from "../../utils/neuralNet3d";
import "./NeuralNet.css";

const FRAME_MS = 1000 / 30; // ~30 fps is plenty for slow motion, and halves the work
const MAX_STEP_MS = 100; // after a stall (busy tab), don't jump ahead

// How much of the network to erase behind the hero's text block (0…1), so the
// name, tagline, note and meta line keep at least 4.5:1 contrast (measured).
const CALM = { network: 0.85 };
// Extra fade behind single lines of text that need it, measured:
// the muted note line was the only one under 4.5:1 at full network strength.
const CALM_EXTRA = [{ selector: ".hero-note", amount: 0.85 }];

const VARIANTS = {
  // Faint, behind the whole hero, calm behind its text, with a pause button.
  hero: { calmSelector: ".hero-main", button: true },
  // Stronger, behind the loading screen.
  loader: { calmSelector: null, button: false },
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
    for (const name of ["loop", "resize", "updatePlayback", "handleMotionChange", "handlePointer", "toggle"]) {
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
      this.draw();
    });
    this.themeWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    this.handleMotionChange(this.motionQuery);
  }

  componentDidUpdate() {
    this.updatePlayback();
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.frame);
    this.motionQuery?.removeEventListener("change", this.handleMotionChange);
    window.removeEventListener("pointermove", this.handlePointer);
    this.resizer?.disconnect();
    this.visibility?.disconnect();
    this.themeWatcher?.disconnect();
    document.removeEventListener("visibilitychange", this.updatePlayback);
  }

  handleMotionChange({ matches }) {
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
    this.draw();
  }

  draw() {
    if (!this.scene || !this.size.width) return;
    drawFrame(this.ctx, this.scene, {
      ...this.size,
      time: this.time,
      colours: this.colours,
      still: this.state.reducedMotion,
      pointer: this.pointer,
      calm: this.calm,
    });
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
