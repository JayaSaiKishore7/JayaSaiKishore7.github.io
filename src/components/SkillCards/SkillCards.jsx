import { createRef, PureComponent } from "react";
import { MotionBudget } from "../../utils/MotionBudget";
import { Chip } from "../ui/Chip";
import "./SkillCards.css";

// Each card's chips drift on their own 12 s cycle; a different negative delay
// per card keeps them from moving together.
const DRIFT_STAGGER_S = 1.7;

/**
 * The skills in the about section: one card per skill group on a belt that
 * slides slowly left in an endless loop (pure CSS), the chips inside each card
 * drifting a little against it. The cards are rendered twice so moving the
 * track by -50% (one set) loops without a jump; the copy is aria-hidden, so
 * screen readers hear every skill once.
 *
 * Motion budget (MotionBudget): it moves for its first 6 s in view, then only
 * while hovered or focused (`moving`); the rest of the time it rests where it
 * is. The button pauses it altogether (WCAG 2.2.2). Without JavaScript it
 * simply stands still. Reduced motion: one still set, wrapping.
 */
export class SkillCards extends PureComponent {
  state = { paused: false, moving: false };
  rootRef = createRef();

  componentDidMount() {
    this.budget = new MotionBudget({ element: this.rootRef.current, onChange: this.handleBudget });
    this.budget.start();
  }

  /** From the motion budget: whether the belt may move right now. */
  handleBudget = (moving) => this.setState({ moving });

  componentWillUnmount() {
    this.budget?.stop();
  }

  toggle = () => this.setState(({ paused }) => ({ paused: !paused }));

  renderSet(copy) {
    const { groups } = this.props;
    return (
      <div className={copy ? "skill-cards-set skill-cards-set--copy" : "skill-cards-set"} aria-hidden={copy ? "true" : undefined}>
        {groups.map((group, i) => (
          <div className="skill-card" key={group.name} style={{ "--drift-delay": `${(-i * DRIFT_STAGGER_S).toFixed(1)}s` }}>
            <h4 className="skill-card-name">{group.name}</h4>
            <ul className="skill-card-chips" aria-label={copy ? undefined : group.name}>
              {group.items.map((item) => (
                <li key={item}>
                  <Chip>{item}</Chip>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  render() {
    const { paused, moving } = this.state;
    const classes = ["skill-cards", moving && !paused ? "is-moving" : "", paused ? "is-paused" : ""];
    return (
      <section ref={this.rootRef} className={classes.filter(Boolean).join(" ")} aria-label="skills">
        <div className="skill-cards-viewport">
          <div className="skill-cards-track">
            {this.renderSet(false)}
            {this.renderSet(true)}
          </div>
        </div>

        {/* Under the belt, at its bottom-right corner: this animation's own control. */}
        <button
          type="button"
          className="skill-cards-toggle"
          aria-label={paused ? "play skills animation" : "pause skills animation"}
          aria-pressed={paused}
          onClick={this.toggle}
        >
          {paused ? (
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M5 3.5v9l7.5-4.5z" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M5 3.5v9M11 3.5v9" />
            </svg>
          )}
        </button>
      </section>
    );
  }
}
