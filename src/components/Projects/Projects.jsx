import { Component } from "react";
import { projects } from "../../data/projects";
import { caseStudyPath } from "../../routes";
import { Reveal } from "../Reveal";
import { SectionLabel } from "../SectionLabel";
import { ProjectSplit } from "../ProjectSplit/ProjectSplit";
import "./Projects.css";

const featured = projects.filter((project) => project.featured);
const more = projects.filter((project) => !project.featured);

/** Home page work section: the featured projects as a split view, then a short list of the rest. */
export class Projects extends Component {
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

          <Reveal as="div">
            <ProjectSplit projects={featured} />
          </Reveal>

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
