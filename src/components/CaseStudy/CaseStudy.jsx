import { Component } from "react";
import { projects } from "../../data/projects";
import { caseStudyPath } from "../../routes";
import { ArchitectureDiagram } from "../ArchitectureDiagram/ArchitectureDiagram";
import { CaseVisual } from "./CaseVisual";
import { hasCaseVisual } from "./caseVisuals";
import { ProjectThumb } from "../Project/ProjectThumb";
import { TechList } from "../Project/TechList";
import { HeadlineBox } from "../ui/HeadlineBox";
import "./CaseStudy.css";

// The first three of the four points every case study answers; the fourth,
// "result", is the full-width row below them (`proof` plus `notes.tested`).
const NOTE_LABELS = [
  ["problem", "the problem"],
  ["built", "what i built"],
  ["decision", "key decision"],
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

          <div className={hasCaseVisual(project) ? "case-top case-top--visual" : "case-top"}>
            <header className="case-head">
              <p className="section-label">
                case study {String(index + 1).padStart(2, "0")}
                {project.team ? " · team project" : ""}
              </p>
              <h1 className="case-title">
                <HeadlineBox label="project">{project.title}</HeadlineBox>
              </h1>
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
                {project.huggingface ? (
                  <a href={project.huggingface} target="_blank" rel="noreferrer">
                    hugging face ↗
                  </a>
                ) : null}
              </p>
            </header>
            {hasCaseVisual(project) ? <CaseVisual key={project.id} project={project} /> : null}
          </div>

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
              <dt>result</dt>
              <dd>
                <p>{project.proof}</p>
                <p className="case-tested">{project.notes.tested}</p>
              </dd>
            </div>
          </dl>

          {project.aside ? <p className="case-aside">{project.aside}</p> : null}

          {project.architecture ? (
            <section className="case-section" aria-labelledby="case-architecture">
              <h2 id="case-architecture" className="case-section-title">
                architecture
              </h2>
              <ArchitectureDiagram
                id={`${project.id}-architecture`}
                title={`${project.title} architecture`}
                diagram={project.architecture}
              />
            </section>
          ) : null}

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
