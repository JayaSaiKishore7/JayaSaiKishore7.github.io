/**
 * Tracks pointer position over a container and writes it as --mx/--my CSS
 * custom properties onto whichever matching item is under the cursor, so a
 * card's hover glow (a radial-gradient positioned at var(--mx) var(--my))
 * follows the pointer. Uses event delegation on the container, so it works
 * for any number of items without per-item listeners.
 */
export class PointerGlow {
  constructor({ container, itemSelector }) {
    this.container = container;
    this.itemSelector = itemSelector;
    this._handleMove = this._handleMove.bind(this);
  }

  start() {
    this.container?.addEventListener("pointermove", this._handleMove);
  }

  stop() {
    this.container?.removeEventListener("pointermove", this._handleMove);
  }

  _handleMove(event) {
    const item = event.target.closest(this.itemSelector);
    if (!item) return;

    const rect = item.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    item.style.setProperty("--mx", `${x}%`);
    item.style.setProperty("--my", `${y}%`);
  }
}
