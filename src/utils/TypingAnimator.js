/**
 * Framework-agnostic typing/erasing animator. Owns its own timer and word
 * position; callers (e.g. the Hero class component) just provide an
 * onChange callback and call start()/stop() from their lifecycle methods.
 */
export class TypingAnimator {
  constructor({
    words,
    typingSpeed = 90,
    deletingSpeed = 55,
    pauseAfterWord = 1200,
    startDelay = 600,
    onChange,
  }) {
    this.words = words;
    this.typingSpeed = typingSpeed;
    this.deletingSpeed = deletingSpeed;
    this.pauseAfterWord = pauseAfterWord;
    this.startDelay = startDelay;
    this.onChange = onChange;

    this.wordIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;
    this.timer = null;
  }

  start() {
    this.timer = setTimeout(() => this._tick(), this.startDelay);
  }

  stop() {
    clearTimeout(this.timer);
  }

  _tick() {
    const word = this.words[this.wordIndex % this.words.length];
    let delay;

    if (!this.isDeleting && this.charIndex < word.length) {
      this.charIndex += 1;
      delay = this.typingSpeed;
    } else if (!this.isDeleting && this.charIndex === word.length) {
      this.isDeleting = true;
      delay = this.pauseAfterWord;
    } else if (this.isDeleting && this.charIndex > 0) {
      this.charIndex -= 1;
      delay = this.deletingSpeed;
    } else {
      this.isDeleting = false;
      this.wordIndex = (this.wordIndex + 1) % this.words.length;
      delay = 350;
    }

    this.onChange(word.slice(0, this.charIndex));
    this.timer = setTimeout(() => this._tick(), delay);
  }
}
