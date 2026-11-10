import { Component } from "react";
import { experience } from "../../data/experience";
import { Reveal } from "../Reveal";
import { TechList } from "../Project/TechList";
import { SectionHeader } from "../ui/SectionHeader";
import "./Resume.css";

const VISIBLE_POINTS = 3; // bullets shown before "show more"

/**
 * The experience section as a timeline. Each role is a row: date and role on
 * the left (sticky on desktop), the details on the right. A vertical line runs
 * between the columns and fills with the accent as you scroll (CSS, see
 * Resume.css); each role's dot turns accent once it passes the middle of the
 * screen. Bullets after the third sit behind a "show more" button.
 *
 * State: `open` = which roles show all their bullets.
 */
export class Resume extends Component {
  constructor(props) {
    super(props);
    this.state = { open: {} };
    this.roleEls = [];
    this.observer = null;
  }

  componentDidMount() {
    // A dot is "reached" once its role's top has passed the middle of the screen.
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-reached", entry.boundingClientRect.top < window.innerHeight / 2);
        });
      },
      { rootMargin: "0px 0px -50% 0px" }
    );
    this.roleEls.forEach((el) => el && this.observer.observe(el));
  }

  componentWillUnmount() {
    this.observer?.disconnect();
  }

  toggle(index) {
    this.setState((state) => ({ open: { ...state.open, [index]: !state.open[index] } }));
  }

  render() {
    const { open } = this.state;

    return (
      <section id="experience" className="section">
        <div className="container">
          <Reveal as="div" className="section-rule" aria-hidden="true" />

          <Reveal as="div">
            <SectionHeader
              id="experience"
              title="where i've worked"
              sub="software engineering and data science roles, contributing to ML workflows, automation, and production inference."
            />
          </Reveal>

          {/* The wrapper holds the line; the <ol> holds only the roles. */}
          <div className="tl">
            <span className="tl-line" aria-hidden="true">
              <span className="tl-fill" />
            </span>

            <ol>
            {experience.map((item, i) => {
              const first = item.points.slice(0, VISIBLE_POINTS);
              const rest = item.points.slice(VISIBLE_POINTS);
              const moreId = `tl-more-${i}`;

              return (
                <li
                  key={item.company + item.date}
                  ref={(el) => {
                    this.roleEls[i] = el;
                  }}
                  className="tl-role"
                >
                  <div className="tl-when">
                    <time>{item.date}</time>
                    <p>{item.role}</p>
                  </div>

                  <span className="tl-dot" aria-hidden="true" />

                  <div className="tl-main">
                    <h3 className="tl-company">{item.company}</h3>
                    {item.location ? <p className="tl-location">{item.location}</p> : null}
                    <p className="tl-summary">{item.summary}</p>

                    <ul className="tl-points">
                      {first.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>

                    {rest.length ? (
                      <>
                        {/* Collapsed only while the app runs (html.js); otherwise all bullets show. */}
                        <div id={moreId} className={`tl-more${open[i] ? " is-open" : ""}`}>
                          <div className="tl-more-inner">
                            <ul className="tl-points">
                              {rest.map((point) => (
                                <li key={point}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="tl-toggle"
                          aria-expanded={Boolean(open[i])}
                          aria-controls={moreId}
                          onClick={() => this.toggle(i)}
                        >
                          {open[i] ? "show less" : `show more (${rest.length})`}
                        </button>
                      </>
                    ) : null}

                    {item.stack ? (
                      <div className="tl-stack">
                        <TechList items={item.stack} label="stack" />
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
            </ol>
          </div>
        </div>
      </section>
    );
  }
}
