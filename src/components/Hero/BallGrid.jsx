import { PureComponent } from "react";
import "./BallGrid.css";

// The grid's geometry, in SVG units. Everything is derived from these numbers,
// so the panel scales as one picture (viewBox) at any size.
const COLS = 10;
const ROWS = 8;
const PITCH = 10; // centre-to-centre distance between balls, like a BGA's ball pitch
const MARGIN = 8; // from the panel edge to the first ball's centre
const RADIUS = 3.6;
const BOX_HALF = 6; // half the detection box's side: the ball plus a small gap

const WIDTH = MARGIN * 2 + PITCH * (COLS - 1); // 106
const HEIGHT = MARGIN * 2 + PITCH * (ROWS - 1); // 86

// The two "defective" balls: not neighbours, not on the edge, and in the middle
// rows, so they stay visible when phones crop the grid to a strip.
const DEFECTS = [
  { col: 2, row: 3, label: "defect 0.94" },
  { col: 7, row: 4, label: "defect 0.91" },
];

// One decimal place at most, so the SVG stays small and readable.
const round = (n) => Math.round(n * 10) / 10;
const centre = (index) => round(MARGIN + index * PITCH);
const isDefect = (col, row) => DEFECTS.some((d) => d.col === col && d.row === row);
const percent = (value, total) => `${Math.round((value / total) * 10000) / 100}%`;

// Computed once when the module loads, never per render.
const BALLS = Array.from({ length: COLS * ROWS }, (_, i) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  return { key: i, cx: centre(col), cy: centre(row), defect: isDefect(col, row) };
});

// Each box is placed in percentages of the grid, straight from the ball's
// known centre. The inner box has the SVG's exact proportions, so the boxes
// stay on their balls at every size, with no measuring.
const BOXES = DEFECTS.map(({ col, row, label }, i) => ({
  label,
  style: {
    left: percent(centre(col) - BOX_HALF, WIDTH),
    top: percent(centre(row) - BOX_HALF, HEIGHT),
    width: percent(BOX_HALF * 2, WIDTH),
    height: percent(BOX_HALF * 2, HEIGHT),
    "--d": i, // draw order: one box after the other
  },
}));

/**
 * An X-ray-style view of a ball grid array (10 × 8 solder balls on a regular
 * pitch) with two detection boxes on defective balls: the page's one motion
 * moment. Purely decorative (aria-hidden, nothing focusable).
 *
 * Static on purpose: it takes no props and is a PureComponent, so when the
 * Hero re-renders (its clock ticks every 30 s) React compares the (empty)
 * props, sees nothing changed and skips the grid entirely. The boxes are in
 * the pre-rendered HTML; their entrance is a CSS animation (BallGrid.css).
 */
export class BallGrid extends PureComponent {
  render() {
    return (
      <div className="ball-grid" aria-hidden="true">
        <div className="ball-grid-inner">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} focusable="false">
            {BALLS.map(({ key, cx, cy, defect }) => (
              <circle key={key} cx={cx} cy={cy} r={RADIUS} className={defect ? "is-defect" : undefined} />
            ))}
          </svg>
          {BOXES.map(({ label, style }) => (
            <div key={label} className="grid-detect" style={style}>
              <span className="detect-label">{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
