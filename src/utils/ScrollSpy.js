/**
 * Watches window scroll position and reports which of the given section ids
 * is currently active. Framework-agnostic, owned by App's lifecycle methods.
 *
 * State: the active section id, or null while above the first section (on the
 * hero). At the very bottom of the page the last section wins, because a short
 * final section can never scroll up to the activation line. onChange fires
 * only when the value changes, so owners don't re-render on every scroll event.
 */
export class ScrollSpy {
  constructor({ sectionIds, initial = null, offset = 140, onChange }) {
    this.sectionIds = sectionIds;
    this.active = initial;
    this.offset = offset;
    this.onChange = onChange;
    this._handleScroll = this._handleScroll.bind(this);
  }

  start() {
    window.addEventListener("scroll", this._handleScroll, { passive: true });
    window.addEventListener("resize", this._handleScroll, { passive: true });
    this._handleScroll();
  }

  stop() {
    window.removeEventListener("scroll", this._handleScroll);
    window.removeEventListener("resize", this._handleScroll);
  }

  _current() {
    const sections = this.sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return null;

    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (atBottom && window.scrollY > 0) return sections[sections.length - 1].id;

    let current = null;
    for (const el of sections) {
      if (window.scrollY >= el.offsetTop - this.offset) current = el.id;
    }
    return current;
  }

  _handleScroll() {
    const current = this._current();
    if (current === this.active) return;
    this.active = current;
    this.onChange(current);
  }
}
