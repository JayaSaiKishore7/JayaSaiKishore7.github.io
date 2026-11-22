/**
 * Reports which of the given section ids is in view, for the navbar's active
 * link. Framework-agnostic, owned by App's lifecycle methods.
 *
 * An IntersectionObserver watches a thin "activation line" `offset` px below
 * the top of the window: the active section is the last one whose top has
 * passed that line (null while above the first section, on the hero). A second
 * observer watches the page's end: there the last section wins, because a
 * short final section can never scroll up to the line. onChange fires only
 * when the value changes.
 */
export class ScrollSpy {
  constructor({ sectionIds, initial = null, offset = 140, onChange }) {
    this.sectionIds = sectionIds;
    this.active = initial;
    this.offset = offset;
    this.onChange = onChange;
    this.atEnd = false;
    this._update = this._update.bind(this);
    this._observe = this._observe.bind(this);
  }

  start() {
    this.sections = this.sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
    if (!this.sections.length) return;

    // The end of the page: an empty marker after everything else.
    this.endMarker = document.createElement("div");
    this.endMarker.setAttribute("aria-hidden", "true");
    document.body.appendChild(this.endMarker);
    this.endObserver = new IntersectionObserver((entries) => {
      this.atEnd = entries[entries.length - 1].isIntersecting && window.scrollY > 0;
      this._update();
    });
    this.endObserver.observe(this.endMarker);

    this._observe();
    // The line's margin is in pixels of the window height: rebuild on resize.
    window.addEventListener("resize", this._observe, { passive: true });
  }

  stop() {
    this.lineObserver?.disconnect();
    this.endObserver?.disconnect();
    this.endMarker?.remove();
    window.removeEventListener("resize", this._observe);
  }

  _observe() {
    this.lineObserver?.disconnect();
    const below = Math.max(0, window.innerHeight - this.offset - 1);
    this.lineObserver = new IntersectionObserver(this._update, {
      rootMargin: `-${this.offset}px 0px -${below}px 0px`,
    });
    this.sections.forEach((el) => this.lineObserver.observe(el));
  }

  /** Each call re-reads the positions: the observers only say when to look. */
  _update() {
    let current = null;
    if (this.atEnd) {
      current = this.sections[this.sections.length - 1].id;
    } else {
      for (const el of this.sections) {
        if (el.getBoundingClientRect().top <= this.offset) current = el.id;
      }
    }
    if (current === this.active) return;
    this.active = current;
    this.onChange(current);
  }
}
