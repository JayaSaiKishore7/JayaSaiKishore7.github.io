import { createRef, PureComponent } from "react";
import { footerInfo } from "../../data/profile";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import "./Footer.css";

// ---------- the loss curve (an SVG 120 × 40) ----------
const WIDTH = 120;
const POINTS = 24;
// The finished curve: shown before JavaScript runs and with reduced motion.
const STATIC_POINTS = "0,4 12,12 24,10 36,20 48,22 60,27 72,29 84,32 96,33 108,34 120,35";
const STATIC_DOT = [120, 35];

// One run: draw 5 s, hold 1.6 s, fade 0.6 s (≈ 7.2 s), then a new run.
const DRAW_S = 5;
const HOLD_S = 1.6;
const FADE_S = 0.6;
const CYCLE_S = DRAW_S + HOLD_S + FADE_S;
const MAX_STEP_S = 0.1; // returning to the tab never jumps ahead
const BLINK_MS = 5000; // the exit line's cursor blinks this long the first time

/** A small seeded pseudo-random generator (mulberry32): same seed, same run. */
function random(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A new training curve: loss starting high (y = 4, the top) and settling low
 * (y ≈ 35), with noise that calms down as training goes on.
 */
function makeCurve(seed) {
  const rand = random(seed);
  return Array.from({ length: POINTS }, (_, i) => {
    const x = (i / (POINTS - 1)) * WIDTH;
    if (i === 0) return [x, 4];
    const settle = 31 * (1 - Math.exp(-i / (POINTS * 0.28)));
    const noise = (rand() - 0.5) * 5 * (1 - i / POINTS);
    return [x, Math.min(37, Math.max(3, 4 + settle + noise))];
  });
}

/** Epoch 1 → 2026 and loss 0.92 → 0.03, in step with the drawing (e = 0..1). */
const epochAt = (e) => Math.round(1 + e * 2025);
const lossAt = (e) => (0.03 + (0.89 * (Math.exp(-3.6 * e) - Math.exp(-3.6))) / (1 - Math.exp(-3.6))).toFixed(2);

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The "training log" footer: a dark panel like the contact card, with a loss
 * curve that keeps training in a loop. The pre-rendered page (and reduced
 * motion) shows the finished curve; the loop updates the SVG and the numbers
 * directly (no re-render per frame). It pauses off screen, in a hidden tab,
 * and while the pointer or keyboard focus is inside the footer.
 */
export class Footer extends PureComponent {
  footerRef = createRef();
  curveRef = createRef();
  lineRef = createRef();
  dotRef = createRef();
  epochRef = createRef();
  lossRef = createRef();
  cursorRef = createRef();

  frame = null;
  last = null;
  t = 0; // seconds into the current run
  run = 0;
  curve = null;
  onScreen = false;
  hovered = false;
  focused = false;

  componentDidMount() {
    const footer = this.footerRef.current;
    if (!footer || reducedMotion()) return; // reduced motion: keep the finished curve, no blinking

    this.observer = new IntersectionObserver(([entry]) => {
      this.onScreen = entry.isIntersecting;
      if (this.onScreen && !this.blinked) this.blinkCursor();
      this.sync();
    });
    this.observer.observe(footer);
    document.addEventListener("visibilitychange", this.sync);
    footer.addEventListener("pointerenter", this.handleEnter);
    footer.addEventListener("pointerleave", this.handleLeave);
    footer.addEventListener("focusin", this.handleFocus);
    footer.addEventListener("focusout", this.handleBlur);
  }

  componentWillUnmount() {
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    clearTimeout(this.blinkTimer);
    this.observer?.disconnect();
    document.removeEventListener("visibilitychange", this.sync);
    const footer = this.footerRef.current;
    footer?.removeEventListener("pointerenter", this.handleEnter);
    footer?.removeEventListener("pointerleave", this.handleLeave);
    footer?.removeEventListener("focusin", this.handleFocus);
    footer?.removeEventListener("focusout", this.handleBlur);
  }

  handleEnter = () => {
    this.hovered = true;
    this.sync();
  };

  handleLeave = () => {
    this.hovered = false;
    this.sync();
  };

  handleFocus = () => {
    this.focused = true;
    this.sync();
  };

  handleBlur = (event) => {
    this.focused = this.footerRef.current.contains(event.relatedTarget);
    this.sync();
  };

  /** The first time the footer is seen: the cursor blinks for 5 s, then stays still. */
  blinkCursor() {
    this.blinked = true;
    const cursor = this.cursorRef.current;
    cursor.classList.add("is-blinking");
    this.blinkTimer = setTimeout(() => cursor.classList.remove("is-blinking"), BLINK_MS);
  }

  sync = () => {
    const run = this.onScreen && document.visibilityState === "visible" && !this.hovered && !this.focused;
    if (run && this.frame === null) {
      this.last = null; // resume where it left off
      this.frame = requestAnimationFrame(this.tick);
    } else if (!run && this.frame !== null) {
      cancelAnimationFrame(this.frame);
      this.frame = null;
    }
  };

  tick = (now) => {
    this.frame = requestAnimationFrame(this.tick);
    const step = this.last === null ? 0 : Math.min((now - this.last) / 1000, MAX_STEP_S);
    this.last = now;

    if (!this.curve) this.curve = makeCurve(++this.run); // the first run starts from an empty chart
    this.t += step;
    if (this.t >= CYCLE_S) {
      this.t = 0;
      this.curve = makeCurve(++this.run); // a new seed: a slightly different curve each run
    }
    this.draw();
  };

  draw() {
    const { t, curve } = this;
    const p = Math.min(t / DRAW_S, 1);
    const e = 1 - (1 - p) ** 2; // ease-out
    const fade = t > DRAW_S + HOLD_S ? 1 - (t - DRAW_S - HOLD_S) / FADE_S : 1;

    // The curve up to its tip at x = e · width (the last segment cut where the tip is).
    const tipX = e * WIDTH;
    const shown = [];
    for (let i = 0; i < curve.length; i++) {
      const [x, y] = curve[i];
      if (x <= tipX) {
        shown.push([x, y]);
        continue;
      }
      const [px, py] = curve[i - 1];
      shown.push([tipX, py + ((y - py) * (tipX - px)) / (x - px)]);
      break;
    }
    const [dotX, dotY] = shown[shown.length - 1];

    this.lineRef.current.setAttribute("points", shown.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" "));
    this.dotRef.current.setAttribute("cx", dotX.toFixed(1));
    this.dotRef.current.setAttribute("cy", dotY.toFixed(1));
    this.curveRef.current.style.opacity = Math.max(0, fade).toFixed(3);
    this.epochRef.current.textContent = epochAt(e);
    this.lossRef.current.textContent = lossAt(e);
  }

  render() {
    const year = new Date().getFullYear();
    return (
      // id="contact": the navbar's "contact" link lands here (the footer holds the contact links).
      <footer id="contact" className="footer" ref={this.footerRef}>
        <div className="container">
          <div className="footer-panel">
            {/* The terminal run: the command and its result (decoration), then the exit line. */}
            <div className="footer-terminal" aria-hidden="true">
              <p>
                <span className="footer-muted">$ {footerInfo.command}</span>
              </p>
              <p className="footer-accent">{footerInfo.result}</p>
            </div>

            {/* Row 1: the exit line. "$" and the cursor are decoration. */}
            <p className="footer-exit">
              <span className="footer-muted" aria-hidden="true">
                ${" "}
              </span>
              {footerInfo.exitLine} <span className="footer-accent">0</span>
              <span className="footer-cursor" ref={this.cursorRef} aria-hidden="true">
                {" "}▋
              </span>
            </p>

            {/* Row 2: the loss curve and the log. */}
            <div className="footer-run">
              <svg className="footer-curve" width="120" height="40" viewBox="0 0 120 40" aria-hidden="true">
                <line className="footer-curve-base" x1="0" y1="39" x2="120" y2="39" />
                <g ref={this.curveRef}>
                  <polyline className="footer-curve-line" ref={this.lineRef} points={STATIC_POINTS} />
                  <circle className="footer-curve-dot" ref={this.dotRef} cx={STATIC_DOT[0]} cy={STATIC_DOT[1]} r="2.8" />
                </g>
              </svg>
              <div className="footer-log">
                {/* The numbers change many times a second: screen readers get the final values once. */}
                <p aria-hidden="true">
                  <span className="footer-muted">epoch </span>
                  <span className="footer-value" ref={this.epochRef}>
                    2026
                  </span>
                  <span className="footer-muted"> · loss </span>
                  <span className="footer-accent" ref={this.lossRef}>
                    0.03
                  </span>
                </p>
                <p className="sr-only">epoch 2026, loss 0.03</p>
                <p className="footer-tagline">{footerInfo.tagline}</p>
              </div>
            </div>

            {/* Row 3: copyright and links. */}
            <div className="footer-bar">
              {/* The year comes from the build; the browser may disagree right after New Year. */}
              <p className="footer-copy" suppressHydrationWarning>
                {footerInfo.copyright(year)}
              </p>
              {/* The links, then the theme toggle: on every page, including case studies and 404. */}
              <div className="footer-bar-end">
                <ul className="footer-links">
                  {footerInfo.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }
}
