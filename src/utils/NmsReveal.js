const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

/**
 * Non-max suppression, as a reveal. When a heading scrolls into view, several
 * jittered "candidate" boxes appear around it, then collapse onto one clean box
 * (the winner keeps its label), which holds and fades. Plays once per heading.
 */
export class NmsReveal {
  constructor({ selector, label = "heading", count = 5, jitter = 14, pad = 8, settle = 650 }) {
    this.selector = selector;
    this.label = label;
    this.count = count;
    this.jitter = jitter;
    this.pad = pad;
    this.settle = settle;
    this.timers = [];
    this.observer = null;
    this.boxes = [];
  }

  start() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          this.observer.unobserve(entry.target);
          // Wait for the heading's own fade-up to finish, so we measure where it lands.
          this.timers.push(setTimeout(() => this._play(entry.target), this.settle));
        });
      },
      { threshold: 0.6 }
    );

    document.querySelectorAll(this.selector).forEach((el) => this.observer.observe(el));
  }

  stop() {
    this.observer?.disconnect();
    this.observer = null;
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.boxes.forEach((box) => box.remove());
    this.boxes = [];
  }

  _play(el) {
    const range = document.createRange();
    range.selectNodeContents(el);
    const rect = range.getBoundingClientRect();
    const pad = this.pad;

    const final = {
      left: `${rect.left + window.scrollX - pad}px`,
      top: `${rect.top + window.scrollY - pad}px`,
      width: `${rect.width + pad * 2}px`,
      height: `${rect.height + pad * 2}px`,
    };

    for (let i = 0; i < this.count; i++) {
      const isWinner = i === 0;
      const j = () => (Math.random() * 2 - 1) * this.jitter;

      const start = isWinner
        ? final
        : {
            left: `${rect.left + window.scrollX - pad + j()}px`,
            top: `${rect.top + window.scrollY - pad + j()}px`,
            width: `${rect.width + pad * 2 + j() * 2}px`,
            height: `${rect.height + pad * 2 + j()}px`,
          };

      const box = document.createElement("div");
      box.className = isWinner ? "nms-box nms-box--winner" : "nms-box";
      box.setAttribute("aria-hidden", "true");

      const tag = document.createElement("span");
      tag.className = "nms-tag";
      tag.textContent = isWinner
        ? `${this.label} 0.97`
        : (0.42 + Math.random() * 0.4).toFixed(2);
      box.appendChild(tag);

      document.body.appendChild(box);
      this.boxes.push(box);

      const shown = isWinner ? 1 : 0.6;
      const animation = box.animate(
        [
          { ...start, opacity: 0 },
          { ...start, opacity: shown, offset: 0.2 },
          { ...start, opacity: shown, offset: 0.4 },
          { ...final, opacity: isWinner ? 1 : 0, offset: 0.62 },
          { ...final, opacity: isWinner ? 1 : 0, offset: 0.85 },
          { ...final, opacity: 0 },
        ],
        { duration: 1900, delay: i * 45, easing: EASE, fill: "both" }
      );

      animation.onfinish = () => {
        box.remove();
        this.boxes = this.boxes.filter((b) => b !== box);
      };
    }
  }
}
