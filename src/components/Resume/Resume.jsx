import { Component } from "react";
import { experience } from "../../data/experience";
import { Reveal } from "../Reveal";
import "./Resume.css";

export class Resume extends Component {
  render() {
    return (
      <section id="experience" className="section">
        <div className="container">
          <p className="section-label">02 — experience</p>
          <h2 className="section-heading">where i've worked</h2>
          <p className="section-sub">
            software engineering and data science roles, contributing to ML workflows,
            automation, and production inference.
          </p>

          <div className="xp-list">
            {experience.map((item) => (
              <Reveal as="article" className="xp-card" key={item.company + item.date}>
                <div className="xp-head">
                  <h3>
                    {item.role} <span className="xp-at">@</span> {item.company}
                  </h3>
                  <span className="xp-date">{item.date}</span>
                </div>
                <p className="xp-summary">{item.summary}</p>
                <ul className="xp-points">
                  {item.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    );
  }
}
