const STORAGE_KEY = "boot-played";
const SKIP_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart"];

export class BootSequence {
  constructor({ container, lines, lineGap = 230, onDone }) {
    this.container = container;
    this.lines = lines;
    this.lineGap = lineGap;
    this.onDone = onDone;
    this.timers = [];
    this.terminal = null;
    this.finished = false;
    this.skip = this.skip.bind(this);
  }

  start() {
    if (!this.container || !this._shouldPlay()) {
      this._finish();
      return;
    }

    this.terminal = document.createElement("div");
    this.terminal.className = "boot";
    this.terminal.setAttribute("aria-hidden", "true");
    this.container.appendChild(this.terminal);

    SKIP_EVENTS.forEach((type) => window.addEventListener(type, this.skip, { passive: true }));

    this.lines.forEach((line, i) => {
      this.timers.push(setTimeout(() => this._printLine(line), i * this.lineGap));
    });

    const end = this.lines.length * this.lineGap + 250;
    this.timers.push(setTimeout(() => this.terminal?.classList.add("is-leaving"), end));
    this.timers.push(setTimeout(() => this._finish(), end + 300));
  }

  skip() {
    this._finish();
  }

  stop() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    SKIP_EVENTS.forEach((type) => window.removeEventListener(type, this.skip));
    this.terminal?.remove();
    this.terminal = null;
  }

  _shouldPlay() {
    try {
      return sessionStorage.getItem(STORAGE_KEY) !== "yes";
    } catch {
      return false;
    }
  }

  _printLine(line) {
    const row = document.createElement("div");
    row.className = "boot-line";
    row.innerHTML = line;
    this.terminal?.appendChild(row);
  }

  _finish() {
    if (this.finished) return;
    this.finished = true;
    this.stop();
    try {
      sessionStorage.setItem(STORAGE_KEY, "yes");
    } catch {
      // Storage blocked: the boot simply plays again next time.
    }
    this.onDone?.();
  }
}
