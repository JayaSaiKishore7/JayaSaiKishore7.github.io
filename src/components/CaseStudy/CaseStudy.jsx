import { Component } from "react";
import { projects } from "../../data/projects";
import { caseStudyPath } from "../../routes";
import { ScrollSpy } from "../../utils/ScrollSpy";
import { ArchitectureDiagram } from "../ArchitectureDiagram/ArchitectureDiagram";
import { CaseVisual } from "./CaseVisual";
import { hasCaseVisual } from "./caseVisuals";
import { ProjectThumb } from "../Project/ProjectThumb";
import { TechList } from "../Project/TechList";
import { HeadlineBox } from "../ui/HeadlineBox";
import "./CaseStudy.css";

// The 8 sections every case study has, in order (ids double as anchors).
const SECTIONS = ["problem", "users", "solution", "architecture", "decisions", "evaluation", "limitations", "outcome"];
const number = (i) => String(i + 1).padStart(2, "0");

/**
 * A project's case study page (/work/<id>/). The header (title, summary,
 * tags, links, 3D visual) stays as it was; the body is 8 numbered sections
 * built from `caseStudy` in src/data/projects.js: problem, users, solution,
 * architecture, decisions, evaluation, limitations, outcome.
 *
 * Desktop (≥1100px): a sticky table of contents on the left, the active
 * section in the accent (ScrollSpy). Phones/tablets: the same links as a row
 * of chips under the header.
 *
 * Figures: a screenshot sits in "solution" (or "evaluation" when it's a
 * result, `thumbnail.section`); a project without one shows its code fragment
 * there instead. The code fragment of a project with a screenshot follows it.
 *
 * State: `active`, the section in view (null above the first one).
 */
export class CaseStudy extends Component {
  constructor(props) {
    super(props);
    this.state = { active: null };
    this.handleActive = this.handleActive.bind(this);
  }

  componentDidMount() {
    this.spy = new ScrollSpy({ sectionIds: SECTIONS, offset: 160, onChange: this.handleActive });
    this.spy.start();
  }

  componentWillUnmount() {
    this.spy?.stop();
  }

  handleActive(active) {
    this.setState({ active });
  }

  renderToc(className) {
    const { active } = this.state;
    return (
      <nav className={className} aria-label="case study sections">
        <ol>
          {SECTIONS.map((id, i) => (
            <li key={id}>
              <a href={`#${id}`} aria-current={active === id ? "location" : undefined}>
                <span className="case-toc-num">{number(i)}</span> {id}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    );
  }

  /** The screenshot (or, without one, the code window), and the code fragment after a screenshot. */
  renderFigures(where) {
    const { project } = this.props;
    const shotHere = (project.thumbnail?.section ?? "solution") === where;
    const figures = [];
    if (shotHere) {
      figures.push(
        <figure className="case-figure" key="shot">
          <ProjectThumb project={project} eager={where === "solution"} />
          {project.thumbnail ? <figcaption>{project.thumbnail.alt}</figcaption> : null}
        </figure>,
      );
    }
    if (where === "solution" && project.thumbnail) {
      figures.push(
        <figure className="case-code" key="code">
          <figcaption>{project.frag.file}</figcaption>
          <pre>
            <code>{project.frag.code}</code>
          </pre>
        </figure>,
      );
    }
    return figures;
  }

  renderArchitecture() {
    const { project } = this.props;
    if (project.architecture) {
      return (
        <ArchitectureDiagram id={`${project.id}-architecture`} title={`${project.title} architecture`} diagram={project.architecture} />
      );
    }
    return (
      <ol className="case-flow">
        {project.caseStudy.architecture.steps.map((step, i) => (
          <li key={step.name}>
            {i > 0 ? (
              <span className="case-flow-arrow" aria-hidden="true">
                ↓
              </span>
            ) : null}
            <div className="case-flow-step">
              <p className="case-flow-name">{step.name}</p>
              <p className="case-flow-detail">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    );
  }

  renderEvaluation() {
    const { project } = this.props;
    const { summary, points } = project.caseStudy.evaluation;
    return (
      <>
        {project.highlights?.length ? (
          <div className="case-stats">
            {project.highlights.map((stat) => (
              <div className="case-stat" key={stat.label}>
                <p className="case-stat-value">{stat.value}</p>
                <p className="case-stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        ) : null}
        <p className="case-lead">{summary}</p>
        <ul className="case-points">
          {points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        {this.renderFigures("evaluation")}
      </>
    );
  }

  renderSection(id, i) {
    const { caseStudy } = this.props.project;
    let body;
    if (id === "architecture") body = this.renderArchitecture();
    else if (id === "evaluation") body = this.renderEvaluation();
    else if (id === "limitations") {
      body = (
        <ul className="case-limits">
          {caseStudy.limitations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    } else if (id === "outcome") {
      body = <p className="case-outcome">{caseStudy.outcome}</p>;
    } else {
      body = (
        <>
          <p className="case-text">{caseStudy[id]}</p>
          {id === "solution" ? this.renderFigures("solution") : null}
        </>
      );
    }

    return (
      <section id={id} className="case-part" aria-labelledby={`${id}-title`} key={id}>
        <h2 id={`${id}-title`} className="case-part-title">
          <span className="case-part-num">{number(i)}</span> {id}
        </h2>
        {body}
      </section>
    );
  }

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
                case study {number(index)}
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

          {/* Phones and tablets: the sections as a scrollable row of chips. */}
          {this.renderToc("case-toc case-toc--chips")}

          <div className="case-body">
            {/* Desktop: the sticky table of contents. */}
            <aside className="case-toc-rail">{this.renderToc("case-toc case-toc--rail")}</aside>
            <div className="case-content">{SECTIONS.map((id, i) => this.renderSection(id, i))}</div>
          </div>

          <nav className="case-next" aria-label="Next case study">
            <span className="k">next</span>
            <a href={caseStudyPath(next.id)}>{next.title} →</a>
          </nav>
        </div>
      </main>
    );
  }
}
