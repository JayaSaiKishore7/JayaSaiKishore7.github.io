const TICK_MS = 30000;

/**
 * Ticks a 24h local time string plus a short time-of-day remark every 30
 * seconds. Framework-agnostic; owned by a component's lifecycle methods.
 * The owner seeds its initial state with Clock.format(), so start() only
 * schedules the ticks.
 */
export class Clock {
  constructor({ onTick }) {
    this.onTick = onTick;
    this.interval = null;
  }

  static format(date = new Date()) {
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const time = `${String(hours).padStart(2, "0")}:${minutes}`;

    let remark;
    if (hours < 5) remark = "it's late.";
    else if (hours < 12) remark = "good morning.";
    else if (hours < 18) remark = "good afternoon.";
    else if (hours < 22) remark = "good evening.";
    else remark = "it's late.";

    return { time, remark };
  }

  start() {
    this.interval = setInterval(() => this.onTick(Clock.format()), TICK_MS);
  }

  stop() {
    clearInterval(this.interval);
  }
}
