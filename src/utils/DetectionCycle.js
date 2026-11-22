/**
 * One "detection" box that hops from phrase to phrase, like an object
 * detector's output moving over the text. The phrases are the container's
 * elements matching `selector`, visited in document order and looping
 * forever; each one's `data-label` shows in the tag on the box's top-left.
 * The glide itself is a CSS transition (.det-box in Hero.css).
 *
 * `still: true` (reduced motion) parks the box on the first phrase instead.
 * reposition() puts it back on its current phrase after the layout changes.
 */
const PAD_X = 5;
const PAD_Y = 2;

export class DetectionCycle {
  constructor({ container, selector = ".det", interval = 1350, still = false }) {
    this.container = container;
    this.selector = selector;
    this.interval = interval;
    this.still = still;
    this.index = 0;
    this.timer = null;
    this.reposition = this.reposition.bind(this);
  }

  start() {
    if (!this.container || this.box) return;
    this.targets = [...this.container.querySelectorAll(this.selector)];
    if (!this.targets.length) return;

    this.box = document.createElement("div");
    this.box.className = "det-box";
    this.box.setAttribute("aria-hidden", "true");
    this.tag = document.createElement("span");
    this.tag.className = "det-tag";
    this.box.appendChild(this.tag);
    this.container.appendChild(this.box);

    // The first placement jumps straight there; later ones glide.
    this._place(false);
    this.box.classList.add("is-shown");

    this.resizeObserver = new ResizeObserver(this.reposition);
    this.resizeObserver.observe(this.container);
    document.fonts?.ready.then(() => this.box && this.reposition());

    if (!this.still) {
      this.timer = setInterval(() => {
        this.index = (this.index + 1) % this.targets.length;
        this._place(true);
      }, this.interval);
    }
  }

  stop() {
    clearInterval(this.timer);
    this.timer = null;
    this.resizeObserver?.disconnect();
    this.box?.remove();
    this.box = null;
  }

  /** Back onto the current phrase at once (no glide), e.g. after a resize. */
  reposition() {
    if (this.box) this._place(false);
  }

  _place(glide) {
    const el = this.targets[this.index];
    const box = this.box;
    const rect = el.getBoundingClientRect();
    const home = this.container.getBoundingClientRect();

    if (!glide) box.style.transition = "none";
    box.style.left = `${rect.left - home.left - PAD_X}px`;
    box.style.top = `${rect.top - home.top - PAD_Y}px`;
    box.style.width = `${rect.width + PAD_X * 2}px`;
    box.style.height = `${rect.height + PAD_Y * 2}px`;
    this.tag.textContent = el.dataset.label ?? "";
    if (!glide) {
      void box.offsetWidth; // apply the jump before turning the glide back on
      box.style.transition = "";
    }
  }
}
