import { Component } from "react";
import { education } from "../../data/experience";
import { Reveal } from "../Reveal";
import { SectionHeader } from "../ui/SectionHeader";
import "./Education.css";

/** One card per degree. (The certification and open-source work live in the about section.) */
const CARDS = education.map(({ kind, degree, meta, points }) => ({ kind, title: degree, meta, points }));

/**
 * Education: one card per degree, side by side on wider screens and stacked
 * on phones. Static: no carousel, no rotation, nothing clipped.
 */
export class Education extends Component {
  render() {
    return (
      <section id="education" className="section">
        <div className="container">
          <Reveal as="div" className="section-rule" aria-hidden="true" />

          <Reveal as="div">
            {/* No separate title: the word "education" is the section's heading. */}
            <SectionHeader id="education" />
          </Reveal>

          <div className="edu-grid">
            {CARDS.map((card, i) => (
              // The Reveal wraps the card: the card's own hover transition would
              // otherwise replace the reveal's fade.
              <Reveal as="div" className="edu-cell" key={card.title} style={{ "--i": i + 1 }}>
                <article className="edu-card">
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
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    );
  }
}
