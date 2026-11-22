/**
 * Draws labelled "detection" boxes around elements (like an object detector's
 * output), one after another, each fading out by itself. The label sits
 * outside the box, above its top-left corner, so it never covers the text.
 */
export class DetectionBoxes {
  constructor({ container, targets, startDelay = 1100, gap = 180 }) {
    this.container = container;
    this.targets = targets;
    this.startDelay = startDelay;
    this.gap = gap;
    this.timers = [];
    this.live = new Map(); // box element → its target, while it is on screen
  }

  start() {
    if (!this.container) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    this.targets.forEach((target, i) => {
      const timer = setTimeout(() => this._drawBox(target), this.startDelay + i * this.gap);
      this.timers.push(timer);
    });
  }

  stop() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.container?.querySelectorAll(".detect-box").forEach((box) => box.remove());
    this.live.clear();
  }

  /** Move any box still on screen back onto its element (after the layout shifts). */
  reposition() {
    this.live.forEach((target, box) => this._place(box, target));
  }

  _drawBox(target) {
    const box = document.createElement("div");
    box.className = "detect-box";
    box.setAttribute("aria-hidden", "true");
    if (!this._place(box, target)) return;

    const tag = document.createElement("span");
    tag.className = "detect-label";
    tag.textContent = target.label;
    box.appendChild(tag);

    box.addEventListener("animationend", () => {
      box.remove();
      this.live.delete(box);
    });
    this.live.set(box, target);
    this.container.appendChild(box);
  }

  /** Size and position a box around its element; false if the element is gone. */
  _place(box, { selector, tight }) {
    const el = this.container.querySelector(selector);
    if (!el) return false;

    let rect;
    if (tight) {
      const range = document.createRange();
      range.selectNodeContents(el);
      rect = range.getBoundingClientRect();
    } else {
      rect = el.getBoundingClientRect();
    }

    const home = this.container.getBoundingClientRect();
    const pad = 8;

    box.style.left = `${rect.left - home.left - pad}px`;
    box.style.top = `${rect.top - home.top - pad}px`;
    box.style.width = `${rect.width + pad * 2}px`;
    box.style.height = `${rect.height + pad * 2}px`;
    return true;
  }
}
