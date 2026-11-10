import { Component } from "react";
import "./ArchitectureDiagram.css";

// Grid geometry, in SVG units (the drawing scales to its container).
const CELL_W = 176;
const CELL_H = 104;
const NODE_W = 148;
const NODE_H = 56;
const PAD = 14;
const TOP = 14;

const nodeBox = ({ col, row }) => ({
  x: PAD + col * CELL_W + (CELL_W - NODE_W) / 2,
  y: TOP + row * CELL_H + (CELL_H - NODE_H) / 2,
});

/** A line from `a` to `b` along a shared row or column, ending at the edge of each box. */
function edgeLine(a, b) {
  const p = nodeBox(a);
  const q = nodeBox(b);
  if (a.row === b.row) {
    const forward = q.x > p.x;
    return {
      x1: forward ? p.x + NODE_W : p.x,
      x2: forward ? q.x - 6 : q.x + NODE_W + 6,
      y1: p.y + NODE_H / 2,
      y2: q.y + NODE_H / 2,
    };
  }
  const down = q.y > p.y;
  return {
    x1: p.x + NODE_W / 2,
    x2: q.x + NODE_W / 2,
    y1: down ? p.y + NODE_H : p.y,
    y2: down ? q.y - 6 : q.y + NODE_H + 6,
  };
}

/**
 * An interactive system diagram, drawn from data (see `architecture` in
 * src/data/projects.js). Hovering or focusing a step highlights it and its
 * connections and shows its description below.
 *
 * State: idle (no step selected) ↔ a step id. Exposed as data-active.
 */
export class ArchitectureDiagram extends Component {
  constructor(props) {
    super(props);
    this.state = { active: null };
    this.clear = this.clear.bind(this);
  }

  select(id) {
    this.setState({ active: id });
  }

  clear() {
    this.setState({ active: null });
  }

  render() {
    const { id, title, diagram } = this.props;
    const { active } = this.state;
    const byId = new Map(diagram.nodes.map((node) => [node.id, node]));
    const cols = Math.max(...diagram.nodes.map((node) => node.col)) + 1;
    const rows = Math.max(...diagram.nodes.map((node) => node.row)) + 1;
    const width = PAD * 2 + cols * CELL_W;
    const height = TOP + rows * CELL_H + PAD;

    const touches = (edge) => active !== null && (edge[0] === active || edge[1] === active);
    const related = new Set(
      active === null ? [] : [active, ...diagram.edges.filter(touches).flatMap(([from, to]) => [from, to])]
    );
    const activeNode = active === null ? null : byId.get(active);

    return (
      <figure className="arch" data-active={active ?? "none"}>
        <div className="arch-scroll">
          <svg
            className={`arch-svg${active === null ? "" : " has-active"}`}
            viewBox={`0 0 ${width} ${height}`}
            role="group"
            aria-label={title}
            onMouseLeave={this.clear}
          >
            <defs>
              <marker id={`${id}-arrow`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M0 0 L8 4 L0 8 z" className="arch-arrow" />
              </marker>
              <marker id={`${id}-arrow-on`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M0 0 L8 4 L0 8 z" className="arch-arrow arch-arrow--on" />
              </marker>
            </defs>

            {diagram.groups.map((group) => {
              const a = nodeBox({ col: group.from[0], row: group.from[1] });
              const b = nodeBox({ col: group.to[0], row: group.to[1] });
              return (
                <g key={group.label} className="arch-group">
                  <rect x={a.x - 10} y={a.y - 30} width={b.x + NODE_W - a.x + 20} height={b.y + NODE_H - a.y + 40} rx="6" />
                  <text x={a.x - 2} y={a.y - 14}>
                    {group.label}
                  </text>
                </g>
              );
            })}

            {diagram.edges.map(([from, to, options = {}]) => {
              const line = edgeLine(byId.get(from), byId.get(to));
              const on = touches([from, to]);
              return (
                <g key={`${from}-${to}`} className={`arch-edge${on ? " is-on" : ""}${options.dashed ? " is-dashed" : ""}`}>
                  <line {...line} markerEnd={`url(#${id}-arrow${on ? "-on" : ""})`} />
                  {options.label ? (
                    <text x={(line.x1 + line.x2) / 2 + 6} y={(line.y1 + line.y2) / 2 + 4}>
                      {options.label}
                    </text>
                  ) : null}
                </g>
              );
            })}

            {diagram.nodes.map((node) => {
              const { x, y } = nodeBox(node);
              const state = node.id === active ? " is-active" : related.has(node.id) ? " is-related" : "";
              return (
                <g
                  key={node.id}
                  className={`arch-node${state}`}
                  tabIndex={0}
                  role="img"
                  aria-label={`${node.title}, ${node.sub}: ${node.detail}`}
                  onMouseEnter={() => this.select(node.id)}
                  onFocus={() => this.select(node.id)}
                  onBlur={this.clear}
                >
                  <rect x={x} y={y} width={NODE_W} height={NODE_H} rx="4" />
                  <text x={x + 12} y={y + 23} className="arch-title">
                    {node.title}
                  </text>
                  <text x={x + 12} y={y + 41} className="arch-sub">
                    {node.sub}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <figcaption aria-live="polite">
          {activeNode ? (
            <>
              <b>{activeNode.title}</b> {activeNode.detail}
            </>
          ) : (
            diagram.caption
          )}
        </figcaption>
      </figure>
    );
  }
}
