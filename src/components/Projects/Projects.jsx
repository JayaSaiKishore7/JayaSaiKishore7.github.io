import { Component } from "react";
import { projects } from "../../data/projects";
import { Reveal } from "../Reveal";
import "./Projects.css";

export class Projects extends Component {
  render() {
    return (
      <section id="work" className="section">
        <div className="container">
          <p className="section-label">01 — work</p>
          <h2 className="section-heading">things i've built</h2>
          <p className="section-sub">
            a few projects that reflect my interest in forecasting, risk prediction,
            emotion-aware systems and document understanding.
          </p>

          <div className="work-list">
            {projects.map((project, i) => (
              <Reveal as="article" className="work-card" key={project.title}>
                <span className="work-index">{String(i + 1).padStart(2, "0")}</span>
                <div className="work-body">
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="work-stack">
                    stack: {project.tags.join(", ")}
                  </div>
                </div>
                <a href={project.link} target="_blank" rel="noreferrer" className="work-link">
                  view ↗
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    );
  }
}
