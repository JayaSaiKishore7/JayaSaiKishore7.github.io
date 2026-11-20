import { Component, createRef } from "react";
import { achievements, education } from "../../data/experience";
import { Reveal } from "../Reveal";
import { SectionHeader } from "../ui/SectionHeader";
import "./Education.css";

/** The 4 cards: both degrees, then the certification and the open-source work. */
const CARDS = [
  ...education.map(({ kind, degree, meta, points }) => ({ kind, title: degree, meta, points })),
  ...achievements,
];
const LAST = CARDS.length - 1;

const SWIPE_PX = 50; // a release past this many pixels moves one card
const CLICK_PX = 5; // a pointer that moved more than this was dragging, not clicking
const END_STRETCH = 0.35; // how far (in cards) you can pull past the first or last card

/**
 * Where one card sits in the coverflow. d is its distance from the centre in
 * cards (fractional while dragging). The step is a CSS value (68% of the card
 * width), so nothing is measured and the pre-rendered page is already in place.
 */
function cardPlacement(d) {
  const away = Math.abs(d);
  const hidden = away > 1.6;
  return {
    hidden,
    style: {
      transform:
        `translateX(calc(${d.toFixed(4)} * var(--edu-step))) ` +
        `translateZ(${(-away * 120).toFixed(2)}px) ` +
        `rotateY(${(-Math.max(-1, Math.min(1, d)) * 38).toFixed(2)}deg)`,
      opacity: hidden ? 0 : Math.max(0, 1 - away * 0.3),
      visibility: hidden ? "hidden" : "visible",
      zIndex: 10 - Math.round(away * 3),
    },
  };
}

const Chevron = ({ path }) => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d={path} />
  </svg>
);

/**
 * Education as a swipeable 3D coverflow: the active card faces you, its
 * neighbours turn away in depth. Drag/swipe, click a side card, the arrow
 * buttons, the dots or the arrow keys change the card; no wrap-around.
 */
export class Education extends Component {
  constructor(props) {
    super(props);
    this.state = { active: 0, dragOffset: 0, dragging: false, announcement: "" };
    this.stageRef = createRef();
    this.drag = null; // { id, startX, cardWidth, moved, dx } while a pointer is down
  }

  goTo(index) {
    const active = Math.max(0, Math.min(LAST, index));
    if (active === this.state.active) return;
    this.setState({
      active,
      announcement: `card ${active + 1} of ${CARDS.length}: ${CARDS[active].title}`,
    });
  }

  handleKeyDown = (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      this.goTo(this.state.active + (event.key === "ArrowRight" ? 1 : -1));
    }
  };

  handlePointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const card = this.stageRef.current.querySelector(".edu-slide");
    this.drag = { id: event.pointerId, startX: event.clientX, cardWidth: card.offsetWidth, moved: false, dx: 0 };
  };

  handlePointerMove = (event) => {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.id) return;
    drag.dx = event.clientX - drag.startX;
    if (!drag.moved) {
      if (Math.abs(drag.dx) <= CLICK_PX) return;
      drag.moved = true;
      // From here it's a drag: keep the pointer even if it leaves the carousel.
      this.stageRef.current.setPointerCapture(drag.id);
      window.getSelection()?.removeAllRanges();
    }
    // Dragging left brings the next card in. Past the ends it only stretches a little.
    const { active } = this.state;
    const position = active - drag.dx / (drag.cardWidth * 0.75);
    const clamped = Math.max(-END_STRETCH, Math.min(LAST + END_STRETCH, position));
    this.setState({ dragging: true, dragOffset: clamped - active });
  };

  handlePointerUp = (event) => {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.id) return;
    this.drag = null;

    if (drag.moved) {
      const step = Math.abs(drag.dx) > SWIPE_PX ? (drag.dx < 0 ? 1 : -1) : 0;
      this.setState({ dragging: false, dragOffset: 0 });
      this.goTo(this.state.active + step);
      return;
    }
    // A click (not a drag): a side card becomes the active one.
    const slide = event.target.closest?.("[data-index]");
    if (slide) this.goTo(Number(slide.dataset.index));
  };

  handlePointerCancel = () => {
    // The browser took over (for example, vertical page scrolling): settle back.
    this.drag = null;
    if (this.state.dragging || this.state.dragOffset) this.setState({ dragging: false, dragOffset: 0 });
  };

  render() {
    const { active, dragOffset, dragging, announcement } = this.state;
    const atStart = active === 0;
    const atEnd = active === LAST;

    return (
      <section id="education" className="section">
        <div className="container">
          <Reveal as="div" className="section-rule" aria-hidden="true" />

          <Reveal as="div">
            {/* No separate title: the word "education" is the section's heading. */}
            <SectionHeader id="education" />
          </Reveal>

          <Reveal as="div" className="edu-reveal">
            <div
              className="edu-carousel"
              role="region"
              aria-roledescription="carousel"
              aria-label="education"
              tabIndex={0}
              onKeyDown={this.handleKeyDown}
            >
              <div
                ref={this.stageRef}
                className={dragging ? "edu-stage is-dragging" : "edu-stage"}
                onPointerDown={this.handlePointerDown}
                onPointerMove={this.handlePointerMove}
                onPointerUp={this.handlePointerUp}
                onPointerCancel={this.handlePointerCancel}
              >
                {CARDS.map((card, i) => {
                  const { hidden, style } = cardPlacement(i - active - dragOffset);
                  const classes = ["edu-slide", i === active ? "is-active" : ""].filter(Boolean).join(" ");
                  return (
                    <article
                      key={card.title}
                      className={classes}
                      style={style}
                      data-index={i}
                      role="group"
                      aria-roledescription="slide"
                      aria-label={`${i + 1} of ${CARDS.length}`}
                      aria-hidden={hidden ? "true" : undefined}
                    >
                      {/* The inner card floats; the outer slide only holds the coverflow transform. */}
                      <div className="edu-card">
                        <p className="edu-kind">{card.kind}</p>
                        <h3>{card.title}</h3>
                        <p className="edu-meta">{card.meta}</p>
                        {card.points?.length > 0 && (
                          <ul>
                            {card.points.map((point) => (
                              <li key={point}>{point}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="edu-controls">
                <button
                  type="button"
                  className="edu-arrow"
                  aria-label="previous card"
                  aria-disabled={atStart ? "true" : undefined}
                  onClick={() => this.goTo(active - 1)}
                >
                  <Chevron path="M10 3 5 8l5 5" />
                </button>

                <div className="edu-dots">
                  {CARDS.map((card, i) => (
                    <button
                      type="button"
                      key={card.title}
                      className="edu-dot"
                      aria-label={`card ${i + 1} of ${CARDS.length}`}
                      aria-current={i === active ? "true" : undefined}
                      onClick={() => this.goTo(i)}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="edu-arrow"
                  aria-label="next card"
                  aria-disabled={atEnd ? "true" : undefined}
                  onClick={() => this.goTo(active + 1)}
                >
                  <Chevron path="m6 3 5 5-5 5" />
                </button>
              </div>

              <p className="sr-only" aria-live="polite">
                {announcement}
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    );
  }
}
