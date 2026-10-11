export class DetectionBoxes {
  constructor({ container, targets, startDelay = 1100, gap = 180 }) {
    this.container = container;
    this.targets = targets;
    this.startDelay = startDelay;
    this.gap = gap;
    this.timers = [];
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
  }

  _drawBox({ selector, label, tight, labelInside }) {
    const el = this.container.querySelector(selector);
    if (!el) return;

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

    const box = document.createElement("div");
    box.className = "detect-box";
    box.setAttribute("aria-hidden", "true");
    box.style.left = `${rect.left - home.left - pad}px`;
    box.style.top = `${rect.top - home.top - pad}px`;
    box.style.width = `${rect.width + pad * 2}px`;
    box.style.height = `${rect.height + pad * 2}px`;

    const tag = document.createElement("span");
    tag.className = labelInside ? "detect-label detect-label--inside" : "detect-label";
    tag.textContent = label;
    box.appendChild(tag);

    box.addEventListener("animationend", () => box.remove());
    this.container.appendChild(box);
  }
}
