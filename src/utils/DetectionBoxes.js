/** Rough height of a label tag, used to predict overlaps before drawing. */
const LABEL_HEIGHT = 19;

/**
 * Plays a one-off "object detector" intro over the hero: thin bounding
 * boxes lock onto a few elements in sequence, each tagged with a class
 * name and confidence, then fade out.
 *
 * The confidence figures are decorative, not model output.
 *
 * Framework-agnostic, following the PointerGlow pattern: constructor
 * takes config, start() and stop() are the only controls.
 */
export class DetectionBoxes {
  constructor({ container, targets, startDelay = 1300, gap = 180 }) {
    this.container = container;
    this.targets = targets;
    this.startDelay = startDelay;
    this.gap = gap;
    this.timers = [];
    // Rects already placed, so a later label can avoid sitting on them.
    this.drawn = [];
  }

  start() {
    if (!this.container) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    this.targets.forEach((target, i) => {
      const id = setTimeout(() => this._drawBox(target), this.startDelay + i * this.gap);
      this.timers.push(id);
    });
  }

  stop() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.drawn = [];
    // Boxes self-remove on animationend, so any still present were
    // interrupted mid-animation and will never fire that event.
    this.container?.querySelectorAll(".detect-box").forEach((el) => el.remove());
  }

  _measure(target) {
    const el = this.container.querySelector(target.selector);
    if (!el) return null;

    let rect;
    if (target.tight) {
      // A block element is as wide as its column; a Range is as wide as
      // the text actually painted inside it.
      const range = document.createRange();
      range.selectNodeContents(el);
      rect = range.getBoundingClientRect();
    } else {
      rect = el.getBoundingClientRect();
    }

    if (!rect.width || !rect.height) return null;

    // getBoundingClientRect answers in viewport coordinates, but the box is
    // positioned against the container, so shift to container-relative.
    const base = this.container.getBoundingClientRect();
    const pad = 8;

    return {
      left: rect.left - base.left - pad,
      top: rect.top - base.top - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    };
  }

  _drawBox(target) {
    const box = this._measure(target);
    if (!box) return;

    const el = document.createElement("div");
    el.className = "detect-box";
    el.setAttribute("aria-hidden", "true");
    el.style.left = `${box.left}px`;
    el.style.top = `${box.top}px`;
    el.style.width = `${box.width}px`;
    el.style.height = `${box.height}px`;

    // Targets run top to bottom, so only the box directly above can be
    // under this one's label. If it would collide, flip the label under.
    const prev = this.drawn[this.drawn.length - 1];
    if (prev && box.top - LABEL_HEIGHT < prev.top + prev.height) {
      el.classList.add("detect-box--label-below");
    }

    const label = document.createElement("span");
    label.className = "detect-label";
    label.textContent = target.label;
    el.appendChild(label);

    el.addEventListener("animationend", () => el.remove());
    this.container.appendChild(el);
    this.drawn.push(box);
  }
}
