/**
 * Lines `target` (a one-line element) up with `anchor` (another one-line
 * element) by moving `shifted`, the block that carries the target: it writes
 * a CSS variable on the container that the CSS uses as `shifted`'s margin-top.
 * The two lines' centres are matched, so they sit level even when their
 * fonts and line heights differ.
 *
 * Measures layout positions (offsetTop), not getBoundingClientRect, so a
 * reveal animation's transform mid-flight can't skew the result. Each run
 * corrects the margin in use (the CSS fallback at first) by the gap still
 * left, so the fallback only has to be close. Re-measures on resize (of the
 * container and anything in `observe`), fonts loading and theme changes, at
 * most once per frame; outside `media`, the variable is removed.
 */
export class AlignToAnchor {
  constructor({ container, target, anchor, shifted, observe = [], variable, media, onChange }) {
    this.container = container;
    this.target = target; // the line that moves
    this.anchor = anchor; // the line it moves to meet
    this.shifted = shifted; // the block that moves, carrying the target
    this.observe = observe;
    this.variable = variable;
    this.media = window.matchMedia(media);
    this.onChange = onChange;
    this.frame = 0;
    this.schedule = this.schedule.bind(this);
  }

  start() {
    if (!this.container || !this.target || !this.anchor || !this.shifted) return;

    this.resizeObserver = new ResizeObserver(this.schedule);
    [this.container, ...this.observe].forEach((el) => el && this.resizeObserver.observe(el));

    // Light/dark: the toggle changes data-theme on <html>.
    this.themeObserver = new MutationObserver(this.schedule);
    this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    this.media.addEventListener("change", this.schedule);
    document.fonts?.ready.then(() => this.resizeObserver && this.schedule());

    this.schedule();
  }

  stop() {
    cancelAnimationFrame(this.frame);
    this.resizeObserver?.disconnect();
    this.themeObserver?.disconnect();
    this.resizeObserver = null;
    this.media.removeEventListener("change", this.schedule);
  }

  /** Coalesce bursts of events into one measurement on the next frame. */
  schedule() {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => this.measure());
  }

  measure() {
    const style = this.container.style;
    const before = style.getPropertyValue(this.variable);

    if (!this.media.matches) {
      style.removeProperty(this.variable);
    } else {
      // The margin in use now: the one set here earlier, or the CSS fallback.
      const current = parseFloat(getComputedStyle(this.shifted).marginTop) || 0;
      const gap = this._middle(this.anchor) - this._middle(this.target);
      style.setProperty(this.variable, `${Math.max(0, Math.round(current + gap))}px`);
    }

    if (style.getPropertyValue(this.variable) !== before) this.onChange?.();
  }

  /** The vertical middle of an element's (first) line, inside the container. */
  _middle(el) {
    const line = parseFloat(getComputedStyle(el).lineHeight) || el.offsetHeight;
    return this._top(el) + line / 2;
  }

  /** An element's top inside the container, from layout (ignores transforms). */
  _top(el) {
    let top = 0;
    for (let node = el; node && node !== this.container; node = node.offsetParent) {
      top += node.offsetTop;
      if (!this.container.contains(node.offsetParent)) break;
    }
    return top;
  }
}
