import { projects } from "../../data/projects";
import { Reveal } from "../Reveal";
import "./Projects.css";

export function Projects() {
  return (
    <section id="projects" className="section">
      <div className="container">
        <p className="section-eyebrow">Selected work</p>
        <h2 className="section-title">Projects</h2>
        <p className="section-text">
          A few projects that reflect my interest in forecasting, risk prediction,
          emotion-aware systems and document understanding.
        </p>

        <div className="projects-grid">
          {projects.map((project) => (
            <Reveal
              as="article"
              className={`project-card ${project.featured ? "featured" : ""}`}
              key={project.title}
            >
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="project-tags">
                {project.tags.map((tag) => (
                  <span className="project-tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
              <a href={project.link} target="_blank" rel="noreferrer">
                GitHub ↗
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
