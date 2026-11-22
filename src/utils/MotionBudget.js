/**
 * Decides when a decorative animation may move: only for the first `budgetMs`
 * after its element first comes into view (once per page load), and after
 * that only while the pointer is over it or focus is inside it. The rest of
 * the time it rests. Framework-agnostic; owned by a component's lifecycle.
 *
 * `ready()` can hold the first window back (e.g. until the loading screen is
 * gone); call `check()` when it may have become true. `onChange(active)` fires
 * only when the answer changes.
 */
export class MotionBudget {
  constructor({ element, budgetMs = 6000, ready = () => true, onChange }) {
    this.element = element;
    this.budgetMs = budgetMs;
    this.ready = ready;
    this.onChange = onChange;
    this.onScreen = false;
    this.inWindow = false; // inside the first budgetMs
    this.used = false; // the first window has started (it never comes back)
    this.hovered = false;
    this.focused = false;
    this.active = false;
    this.check = this.check.bind(this);
    this.handleEnter = () => this.set("hovered", true);
    this.handleLeave = () => this.set("hovered", false);
    this.handleFocusIn = () => this.set("focused", true);
    this.handleFocusOut = (event) => this.set("focused", this.element.contains(event.relatedTarget));
  }

  start() {
    const el = this.element;
    if (!el) return;
    this.observer = new IntersectionObserver(([entry]) => {
      this.onScreen = entry.isIntersecting;
      this.check();
    });
    this.observer.observe(el);
    el.addEventListener("pointerenter", this.handleEnter);
    el.addEventListener("pointerleave", this.handleLeave);
    el.addEventListener("focusin", this.handleFocusIn);
    el.addEventListener("focusout", this.handleFocusOut);
  }

  stop() {
    clearTimeout(this.timer);
    this.observer?.disconnect();
    const el = this.element;
    el?.removeEventListener("pointerenter", this.handleEnter);
    el?.removeEventListener("pointerleave", this.handleLeave);
    el?.removeEventListener("focusin", this.handleFocusIn);
    el?.removeEventListener("focusout", this.handleFocusOut);
  }

  set(key, value) {
    this[key] = value;
    this.check();
  }

  /** Re-evaluate: maybe open the first window, then report any change. */
  check() {
    if (!this.used && this.onScreen && this.ready()) {
      this.used = true;
      this.inWindow = true;
      this.timer = setTimeout(() => {
        this.inWindow = false;
        this.check();
      }, this.budgetMs);
    }
    const active = this.inWindow || this.hovered || this.focused;
    if (active !== this.active) {
      this.active = active;
      this.onChange(active);
    }
  }
}
