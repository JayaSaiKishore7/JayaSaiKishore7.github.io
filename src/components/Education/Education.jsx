import { Component } from "react";
import { education } from "../../data/experience";
import { Reveal } from "../Reveal";
import { SectionHeader } from "../ui/SectionHeader";
import "./Education.css";

/** Education: one card per degree, side by side, all the same height. */
export class Education extends Component {
  render() {
    return (
      <section id="education" className="section">
        <div className="container">
          <Reveal as="div" className="section-rule" aria-hidden="true" />

          <Reveal as="div">
            {/* No separate title: the "03 · education" label is the section's heading. */}
            <SectionHeader id="education" />
          </Reveal>

          <div className="edu-list">
            {education.map((item, i) => (
              <Reveal as="div" className="edu-slot" key={item.degree} style={{ "--i": i }}>
                <article className="edu-card">
                  <h3>{item.degree}</h3>
                  <p className="edu-meta">{item.meta}</p>
                  <ul>
                    {item.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    );
  }
}
