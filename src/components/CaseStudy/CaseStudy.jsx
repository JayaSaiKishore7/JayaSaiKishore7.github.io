import { Component } from "react";
import { projects } from "../../data/projects";
import { caseStudyPath } from "../../routes";
import { ProjectThumb } from "../Project/ProjectThumb";
import { TechList } from "../Project/TechList";
import "./CaseStudy.css";

const NOTE_LABELS = [
  ["why", "why"],
  ["inside", "how it works"],
  ["learning", "what i learned"],
];

/** A project's case study page (/work/<id>/): the decisions behind it, the results and the code. */
export class CaseStudy extends Component {
  render() {
    const { project } = this.props;
    const index = projects.indexOf(project);
    const next = projects[(index + 1) % projects.length];

    return (
      <main id="case-study" className="section case">
        <div className="container">
          <a href="/#work" className="case-back">
            ← all work
          </a>

          <header className="case-head">
            <p className="section-label">
              case study {String(index + 1).padStart(2, "0")}
              {project.team ? " · team project" : ""}
            </p>
            <h1 className="case-title">{project.title}</h1>
            <p className="case-what">{project.what}</p>
            <TechList items={project.tech} />
            <p className="case-links">
              <a href={project.link} target="_blank" rel="noreferrer">
                github ↗
              </a>
              {project.demo ? (
                <a href={project.demo} target="_blank" rel="noreferrer">
                  live demo ↗
                </a>
              ) : null}
            </p>
          </header>

          <figure className="case-figure">
            <ProjectThumb project={project} eager />
            {project.thumbnail ? <figcaption>{project.thumbnail.alt}</figcaption> : null}
          </figure>

          <dl className="case-notes">
            {NOTE_LABELS.map(([key, label]) => (
              <div className="case-note" key={key}>
                <dt>{label}</dt>
                <dd>{project.notes[key]}</dd>
              </div>
            ))}
            <div className="case-note case-note--proof">
              <dt>results</dt>
              <dd>{project.proof}</dd>
            </div>
          </dl>

          {project.aside ? <p className="case-aside">{project.aside}</p> : null}

          {/* Projects without a screenshot already show their code as the figure. */}
          {project.thumbnail ? (
            <figure className="case-code">
              <figcaption>{project.frag.file}</figcaption>
              <pre>
                <code>{project.frag.code}</code>
              </pre>
            </figure>
          ) : null}

          <nav className="case-next" aria-label="Next case study">
            <span className="k">next</span>
            <a href={caseStudyPath(next.id)}>{next.title} →</a>
          </nav>
        </div>
      </main>
    );
  }
}
