import { PureComponent } from "react";
import "./BallGrid.css";

// The grid's geometry, in SVG units. Everything is derived from these four
// numbers, so the panel scales as one picture (viewBox) at any size.
const COLS = 10;
const ROWS = 8;
const PITCH = 10; // centre-to-centre distance between balls, like a BGA's ball pitch
const MARGIN = 8; // from the panel edge to the first ball's centre
const RADIUS = 3.6;

const GRID = {
  width: MARGIN * 2 + PITCH * (COLS - 1), // 106
  height: MARGIN * 2 + PITCH * (ROWS - 1), // 86
};

// One decimal place at most, so the SVG stays small and readable.
const round = (n) => Math.round(n * 10) / 10;

// Computed once when the module loads, never per render.
const BALLS = Array.from({ length: COLS * ROWS }, (_, i) => ({
  key: i,
  cx: round(MARGIN + (i % COLS) * PITCH),
  cy: round(MARGIN + Math.floor(i / COLS) * PITCH),
}));

/**
 * An X-ray-style view of a ball grid array: 10 × 8 solder balls on a regular
 * pitch. Purely decorative (aria-hidden, nothing focusable).
 *
 * Static on purpose: it takes no props and is a PureComponent, so when the
 * Hero re-renders (its clock ticks every 30 s) React compares the (empty)
 * props, sees nothing changed and skips these 80 circles entirely.
 */
export class BallGrid extends PureComponent {
  render() {
    return (
      <div className="ball-grid" aria-hidden="true">
        {/* The inner box always has the SVG's exact proportions, so anything
            positioned inside it in percentages lines up with the balls. */}
        <div className="ball-grid-inner">
          <svg viewBox={`0 0 ${GRID.width} ${GRID.height}`} focusable="false">
            {BALLS.map(({ key, cx, cy }) => (
              <circle key={key} cx={cx} cy={cy} r={RADIUS} />
            ))}
          </svg>
        </div>
      </div>
    );
  }
}
