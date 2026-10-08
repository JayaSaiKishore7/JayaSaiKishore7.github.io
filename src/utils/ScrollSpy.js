/**
 * Watches window scroll position and reports which of the given section ids
 * is currently active, based on each section's offsetTop. Framework-agnostic
 * so it can be owned by a class component's lifecycle methods.
 */
export class ScrollSpy {
  constructor({ sectionIds, offset = 140, onChange }) {
    this.sectionIds = sectionIds;
    this.offset = offset;
    this.onChange = onChange;
    this._handleScroll = this._handleScroll.bind(this);
  }

  start() {
    window.addEventListener("scroll", this._handleScroll, { passive: true });
    this._handleScroll();
  }

  stop() {
    window.removeEventListener("scroll", this._handleScroll);
  }

  _handleScroll() {
    let current = this.sectionIds[0];

    for (const id of this.sectionIds) {
      const el = document.getElementById(id);
      if (!el) continue;
      if (window.scrollY >= el.offsetTop - this.offset) {
        current = id;
      }
    }

    this.onChange(current);
  }
}
