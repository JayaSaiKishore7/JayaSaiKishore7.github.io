import { Component, createRef } from "react";
import { proofStats } from "../../data/profile";
import { Reveal } from "../Reveal";
import "./ProofStrip.css";

const COUNT_MS = 1400;

const format = ({ prefix = "", suffix = "", decimals = 0 }, value) => `${prefix}${value.toFixed(decimals)}${suffix}`;

/**
 * A row of short stats under the hero that count up once, when they first
 * scroll into view. The real numbers are in the HTML from the start; counting
 * only rewrites them for a moment, so if animation never runs (reduced motion,
 * background tab, no JavaScript) the final figures are simply shown.
 */
export class ProofStrip extends Component {
  constructor(props) {
    super(props);
    this.rootRef = createRef();
    this.valueEls = [];
    this.frame = null;
    this.observer = null;
  }

  componentDidMount() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        this.observer.disconnect();
        this.countUp();
      },
      { threshold: 0.4 }
    );
    this.observer.observe(this.rootRef.current);
  }

  componentWillUnmount() {
    this.observer?.disconnect();
    cancelAnimationFrame(this.frame);
  }

  countUp() {
    let start = null;
    const step = (now) => {
      if (start === null) start = now;
      const t = Math.min((now - start) / COUNT_MS, 1);
      const eased = 1 - (1 - t) ** 3; // fast start, gentle finish
      proofStats.forEach((stat, i) => {
        const el = this.valueEls[i];
        if (el) el.textContent = format(stat, stat.value * eased);
      });
      if (t < 1) this.frame = requestAnimationFrame(step);
    };
    this.frame = requestAnimationFrame(step);
  }

  render() {
    return (
      <div ref={this.rootRef} className="container">
        <dl className="proof-strip">
          {proofStats.map((stat, i) => (
            <Reveal as="div" className="proof-stat" key={stat.label} style={{ "--i": i }}>
              <dt>{stat.label}</dt>
              <dd
                ref={(el) => {
                  this.valueEls[i] = el;
                }}
              >
                {format(stat, stat.value)}
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    );
  }
}
