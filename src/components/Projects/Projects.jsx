import { Component, createRef } from "react";
import { projects } from "../../data/projects";
import { caseStudyPath } from "../../routes";
import { Reveal } from "../Reveal";
import { SectionLabel } from "../SectionLabel";
import { ProjectThumb } from "../Project/ProjectThumb";
import { TechList } from "../Project/TechList";
import { Tilt3D } from "../../utils/Tilt3D";
import "./Projects.css";

const featured = projects.filter((project) => project.featured);
const more = projects.filter((project) => !project.featured);

/** Home page work section: featured project cards, then a short list of the rest. */
export class Projects extends Component {
  constructor(props) {
    super(props);
    this.gridRef = createRef();
    this.tilt = null;
  }

  componentDidMount() {
    this.tilt = new Tilt3D({ container: this.gridRef.current, itemSelector: ".card--tilt" });
    this.tilt.start();
  }

  componentWillUnmount() {
    this.tilt?.stop();
  }

  render() {
    return (
      <section id="work" className="section">
        <div className="container">
          <Reveal as="div" className="section-rule" aria-hidden="true" />

          <Reveal as="header" className="work-head">
            <SectionLabel id="work" as="span" />
            <h2 className="work-statement">
              what does a model need to survive contact with real data?
            </h2>
          </Reveal>

          <div className="project-grid" ref={this.gridRef}>
            {featured.map((project, i) => (
              <Reveal as="div" className="card-slot" key={project.id} style={{ "--i": i }}>
                <article className="card card--tilt project-card">
                  <a
                    href={caseStudyPath(project.id)}
                    className="project-card-thumb tilt-layer"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <ProjectThumb project={project} decorative />
                  </a>

                  <div className="project-card-body tilt-layer">
                    <h3>
                      <a href={caseStudyPath(project.id)}>{project.title}</a>
                    </h3>
                    <p className="project-card-what">{project.what}</p>
                    <TechList items={project.tech} />
                  </div>

                  <p className="project-links tilt-layer">
                    <a href={caseStudyPath(project.id)}>case study →</a>
                    <a href={project.link} target="_blank" rel="noreferrer">
                      github ↗
                    </a>
                    {project.demo ? (
                      <a href={project.demo} target="_blank" rel="noreferrer">
                        live demo ↗
                      </a>
                    ) : null}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>

          {more.length ? (
            <Reveal as="div" className="more-projects">
              <h3 className="k">more projects</h3>
              <ul>
                {more.map((project) => (
                  <li key={project.id}>
                    <a href={caseStudyPath(project.id)} className="more-title">
                      {project.title}
                      {project.team ? <span className="more-team"> · team project</span> : null}
                    </a>
                    <span className="more-what">{project.what}</span>
                    <a href={project.link} target="_blank" rel="noreferrer" className="more-github">
                      github ↗
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}
        </div>
      </section>
    );
  }
}
