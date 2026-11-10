const TICK_MS = 30000;

/**
 * Ticks the current 24h time in a given time zone (the site owner's, so
 * visitors see the local time in Nice) every 30 seconds.
 * Framework-agnostic; owned by a component's lifecycle methods. start() ticks
 * once immediately, so the owner can render a placeholder until mounted (the
 * pre-rendered HTML can't know the visitor's current time).
 */
export class Clock {
  constructor({ timeZone, onTick }) {
    this.formatter = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone,
    });
    this.onTick = onTick;
    this.interval = null;
  }

  format(date = new Date()) {
    return this.formatter.format(date);
  }

  start() {
    this.onTick(this.format());
    this.interval = setInterval(() => this.onTick(this.format()), TICK_MS);
  }

  stop() {
    clearInterval(this.interval);
  }
}
