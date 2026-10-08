import { Component } from "react";
import { education } from "../../data/experience";
import { Reveal } from "../Reveal";
import "./Education.css";

export class Education extends Component {
  render() {
    return (
      <section id="education" className="section">
        <div className="container">
          <p className="section-label">03 — education</p>
          <h2 className="section-heading">how i got here</h2>

          <div className="edu-list">
            {education.map((item) => (
              <Reveal as="article" className="edu-card" key={item.degree}>
                <h3>{item.degree}</h3>
                <p className="edu-meta">{item.meta}</p>
                <ul>
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
