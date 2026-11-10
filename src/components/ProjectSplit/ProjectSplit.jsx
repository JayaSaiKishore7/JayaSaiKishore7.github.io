import { Component } from "react";
import { caseStudyPath } from "../../routes";
import { ProjectThumb } from "../Project/ProjectThumb";
import { TechList } from "../Project/TechList";
import "./ProjectSplit.css";

// Wait this long before a hovered item takes over, so sweeping the mouse
// across the list doesn't flick through every project.
const HOVER_INTENT_MS = 80;

// When each part of an incoming preview starts settling in.
const STEP_DELAYS = { thumb: "0ms", title: "60ms", text: "100ms", chips: "140ms", links: "180ms" };

const previewId = (project) => `ps-preview-${project.id}`;
const accordionId = (project) => `ps-accordion-${project.id}`;

/** One project's preview: thumbnail, title, description, technologies and links. */
class ProjectPreview extends Component {
  render() {
    const { project, active, id } = this.props;
    const href = caseStudyPath(project.id);
    const step = (name) => ({ "--delay": STEP_DELAYS[name] });

    return (
      <article
        id={id}
        className={`ps-preview${active ? " is-active" : ""}`}
        // Hidden previews stay in the page (for the crossfade) but out of reach:
        // screen readers skip them and their links can't be tabbed to.
        aria-hidden={active ? undefined : "true"}
        inert={!active}
      >
        <a href={href} className="ps-frame ps-step" style={step("thumb")} tabIndex={-1} aria-hidden="true">
          <div className="ps-zoom">
            <ProjectThumb project={project} decorative />
          </div>
        </a>

        <div className="ps-heading ps-step" style={step("title")}>
          {project.team ? <p className="ps-team">team project</p> : null}
          <h3>
            <a href={href}>{project.title}</a>
          </h3>
        </div>
        <p className="ps-what ps-step" style={step("text")}>
          {project.what}
        </p>
        <div className="ps-step" style={step("chips")}>
          <TechList items={project.tech} />
        </div>

        <p className="ps-links ps-step" style={step("links")}>
          <a href={href}>case study →</a>
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
    );
  }
}

/**
 * Featured projects as a split view: a list of projects on the left and a
 * sticky preview of the selected one on the right. Under 900px it becomes an
 * accordion, with each preview opening below its own list item.
 *
 * Both layouts are rendered and CSS shows the right one. The page is
 * pre-rendered without knowing the screen size, so switching in JavaScript
 * (matchMedia) would flash the wrong layout on phones first; CSS is right
 * from the first paint and needs no listeners.
 *
 * State: `active`, the index of the selected project (the first by default).
 * Hover (after a short delay), focus or click selects; ArrowUp/ArrowDown move.
 */
export class ProjectSplit extends Component {
  constructor(props) {
    super(props);
    this.state = { active: 0 };
    this.buttons = [];
    this.hoverTimer = null;
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  componentWillUnmount() {
    clearTimeout(this.hoverTimer);
  }

  select(index) {
    clearTimeout(this.hoverTimer);
    if (index !== this.state.active) this.setState({ active: index });
  }

  handleMouseEnter(index) {
    clearTimeout(this.hoverTimer);
    this.hoverTimer = setTimeout(() => this.select(index), HOVER_INTENT_MS);
  }

  handleMouseLeave() {
    clearTimeout(this.hoverTimer);
  }

  handleKeyDown(event) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault(); // don't scroll the page
    const count = this.props.projects.length;
    const next = (this.state.active + (event.key === "ArrowDown" ? 1 : -1) + count) % count;
    this.select(next);
    this.buttons[next]?.focus();
  }

  render() {
    const { projects } = this.props;
    const { active } = this.state;

    return (
      <div className="ps">
        <ul className="ps-list" onKeyDown={this.handleKeyDown}>
          {projects.map((project, i) => {
            const isActive = i === active;
            return (
              <li key={project.id} className={`ps-item${isActive ? " is-active" : ""}`}>
                <button
                  type="button"
                  ref={(el) => {
                    this.buttons[i] = el;
                  }}
                  className="ps-select"
                  aria-pressed={isActive}
                  aria-controls={`${previewId(project)} ${accordionId(project)}`}
                  onMouseEnter={() => this.handleMouseEnter(i)}
                  onMouseLeave={this.handleMouseLeave}
                  onFocus={() => this.select(i)}
                  onClick={() => this.select(i)}
                >
                  <span className="ps-index">{String(i + 1).padStart(2, "0")}</span>
                  <span className="ps-title">{project.title}</span>
                </button>

                {/* Phones only: this project's preview, opening in place below its button. */}
                <div className="ps-accordion" id={accordionId(project)}>
                  <div className="ps-accordion-inner">
                    <ProjectPreview project={project} active={isActive} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Desktop only: every preview stacked in one place; the active one shows. */}
        <div className="ps-stage">
          {projects.map((project, i) => (
            <ProjectPreview key={project.id} id={previewId(project)} project={project} active={i === active} />
          ))}
        </div>
      </div>
    );
  }
}
