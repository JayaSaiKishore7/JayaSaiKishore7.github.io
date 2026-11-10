const STORAGE_KEY = "boot-played";
const SKIP_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart"];

/**
 * The terminal intro shown once per browser session.
 *
 * Phases: idle → playing → leaving → done.
 * skip() (any pointer, key, wheel or touch input) jumps from playing/leaving
 * straight to done. stop() (unmount) also ends in done, but without onDone.
 * If the boot already played this session, or storage is blocked, start()
 * goes straight from idle to done.
 */
export class BootSequence {
  constructor({ container, lines, lineGap = 230, onDone }) {
    this.container = container;
    this.lines = lines;
    this.lineGap = lineGap;
    this.onDone = onDone;
    this.phase = "idle";
    this.timers = [];
    this.terminal = null;
    this.skip = this.skip.bind(this);
  }

  start() {
    if (this.phase !== "idle") return;

    if (!this.container || !this._shouldPlay()) {
      this._finish();
      return;
    }

    this.phase = "playing";
    this.terminal = document.createElement("div");
    this.terminal.className = "boot";
    this.terminal.setAttribute("aria-hidden", "true");
    this.container.appendChild(this.terminal);

    SKIP_EVENTS.forEach((type) => window.addEventListener(type, this.skip, { passive: true }));

    this.lines.forEach((line, i) => {
      this.timers.push(setTimeout(() => this._printLine(line), i * this.lineGap));
    });

    const end = this.lines.length * this.lineGap + 250;
    this.timers.push(
      setTimeout(() => {
        this.phase = "leaving";
        this.terminal?.classList.add("is-leaving");
      }, end)
    );
    this.timers.push(setTimeout(() => this._finish(), end + 300));
  }

  skip() {
    this._finish();
  }

  stop() {
    this._teardown();
    this.phase = "done";
  }

  _teardown() {
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
    if (this.phase === "done") return;
    this._teardown();
    this.phase = "done";
    try {
      sessionStorage.setItem(STORAGE_KEY, "yes");
    } catch {
      // Storage blocked: the boot simply plays again next time.
    }
    this.onDone?.();
  }
}
