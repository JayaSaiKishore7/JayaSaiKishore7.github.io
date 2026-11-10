/**
 * Tilts cards toward the pointer in 3D. Like PointerGlow, it only feeds
 * pointer data to CSS: it writes --tilt-x/--tilt-y (angles) onto the card under
 * the pointer and toggles .is-tilting. The .card--tilt rules in index.css turn
 * those into the transform and lift .tilt-layer children toward the viewer.
 *
 * Per card: resting ↔ tilting. Uses event delegation on the container, so any
 * number of cards share two listeners. Does nothing on touch-only devices or
 * when the user prefers reduced motion; the cards then simply stay flat.
 */
export class Tilt3D {
  constructor({ container, itemSelector, maxDeg = 5 }) {
    this.container = container;
    this.itemSelector = itemSelector;
    this.maxDeg = maxDeg;
    this.active = null;
    this._handleMove = this._handleMove.bind(this);
    this._handleLeave = this._handleLeave.bind(this);
  }

  start() {
    if (!this.container) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    this.container.addEventListener("pointermove", this._handleMove);
    this.container.addEventListener("pointerleave", this._handleLeave);
  }

  stop() {
    this.container?.removeEventListener("pointermove", this._handleMove);
    this.container?.removeEventListener("pointerleave", this._handleLeave);
    this._rest();
  }

  _handleMove(event) {
    const item = event.target.closest(this.itemSelector);

    if (item !== this.active) {
      this._rest();
      if (!item) return;
      this.active = item;
      item.classList.add("is-tilting");
    }

    // Pointer offset from the card's centre, from -0.5 to 0.5 on each axis.
    const rect = item.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    // Same direction as the source component: rotateY follows x, rotateX follows y.
    item.style.setProperty("--tilt-y", `${(x * 2 * this.maxDeg).toFixed(2)}deg`);
    item.style.setProperty("--tilt-x", `${(y * 2 * this.maxDeg).toFixed(2)}deg`);
  }

  _handleLeave() {
    this._rest();
  }

  _rest() {
    if (!this.active) return;
    this.active.classList.remove("is-tilting");
    this.active.style.removeProperty("--tilt-x");
    this.active.style.removeProperty("--tilt-y");
    this.active = null;
  }
}
