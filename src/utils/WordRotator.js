const GLYPHS = "abcdefghijklmnopqrstuvwxyz";

/**
 * Cycles a single word in place, briefly scrambling the letters on the way
 * from one to the next. Framework-agnostic, driven by requestAnimationFrame
 * and owned by a component's lifecycle methods.
 *
 * Honours prefers-reduced-motion by refusing to start: the caller's initial
 * word simply stays put, which is the correct behaviour rather than a
 * degraded version of the effect.
 */
export class WordRotator {
  constructor({ words, onChange, holdMs = 2400, scrambleMs = 420 }) {
    this.words = words;
    this.onChange = onChange;
    this.holdMs = holdMs;
    this.scrambleMs = scrambleMs;

    this.index = 0;
    this.frame = null;
    this.timer = null;
    this._scramble = this._scramble.bind(this);
  }

  static prefersReducedMotion() {
    return (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    );
  }

  start() {
    if (WordRotator.prefersReducedMotion() || this.words.length < 2) return;
    this._queueNext();
  }

  stop() {
    cancelAnimationFrame(this.frame);
    clearTimeout(this.timer);
    this.frame = null;
    this.timer = null;
  }

  _queueNext() {
    this.timer = setTimeout(() => {
      this.index = (this.index + 1) % this.words.length;
      this.target = this.words[this.index];
      this.startedAt = performance.now();
      this.frame = requestAnimationFrame(this._scramble);
    }, this.holdMs);
  }

  _scramble(now) {
    const progress = Math.min((now - this.startedAt) / this.scrambleMs, 1);
    const settled = Math.floor(progress * this.target.length);

    let out = this.target.slice(0, settled);
    for (let i = settled; i < this.target.length; i++) {
      out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    this.onChange(out);

    if (progress < 1) {
      this.frame = requestAnimationFrame(this._scramble);
    } else {
      this.onChange(this.target);
      this._queueNext();
    }
  }
}
