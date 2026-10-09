import { Component } from "react";
import { education } from "../../data/experience";
import { Reveal } from "../Reveal";
import "./Education.css";

export class Education extends Component {
  render() {
    return (
      <section id="education" className="section">
        <div className="container">
          <Reveal as="div">
            <p className="section-label">04 · education</p>
          </Reveal>

          <div className="edu-list">
            {education.map((item, i) => (
              <Reveal as="article" className="edu-card" key={item.degree} style={{ "--i": i }}>
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
