/**
 * A subtle "magnetic" hover: while the pointer is over the element, it leans
 * up to `strength` px toward the pointer, and springs back when it leaves.
 * Uses the CSS `translate` property, so it never fights the element's own
 * `transform`. Desktop pointers only, and off with reduced motion.
 */
export class Magnetic {
  constructor({ element, strength = 6 }) {
    this.element = element;
    this.strength = strength;
    this.active = false;
    this._move = this._move.bind(this);
    this._leave = this._leave.bind(this);
  }

  start() {
    if (!this.element) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    this.element.addEventListener("pointermove", this._move);
    this.element.addEventListener("pointerleave", this._leave);
    this.active = true;
  }

  stop() {
    if (!this.active) return;
    this.element.removeEventListener("pointermove", this._move);
    this.element.removeEventListener("pointerleave", this._leave);
    this.element.style.translate = "";
    this.active = false;
  }

  _move(event) {
    const rect = this.element.getBoundingClientRect();
    // Pointer offset from the centre, from -1 to 1 on each axis.
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    this.element.style.translate = `${(x * this.strength).toFixed(1)}px ${(y * this.strength).toFixed(1)}px`;
  }

  _leave() {
    this.element.style.translate = "";
  }
}
