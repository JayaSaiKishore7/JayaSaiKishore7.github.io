import { Component } from "react";
import { demoOnline, demoStatus } from "../../data/demoStatus";
import { caseStudyPath } from "../../routes";
import { ProjectThumb } from "../Project/ProjectThumb";
import { TechList } from "../Project/TechList";
import "./WorkList.css";

const TECH_MAX = 3; // tags per row

// The filter chips; `key` matches the projects' `filters` (and the URL hash #work-<key>).
const FILTERS = [
  { key: "all", label: "all" },
  { key: "cv", label: "computer vision" },
  { key: "rag", label: "llms / rag" },
  { key: "forecasting", label: "forecasting" },
  { key: "classic", label: "classic ml" },
];
const HASH = /^#work-(all|cv|rag|forecasting|classic)$/;

const matches = (project, filter) => filter === "all" || project.filters?.includes(filter);

/** A row's tree, in order: pipeline/, then the case study, live demo, github and hugging face where they exist. */
function rowLinks(project) {
  return [
    { label: "case_study/", arrow: "→", href: caseStudyPath(project.id) },
    project.demo && { label: "live_demo", arrow: "↗", href: project.demo, external: true, demo: true },
    project.link && { label: "github", arrow: "↗", href: project.link, external: true },
    project.huggingface && { label: "hugging_face", arrow: "↗", href: project.huggingface, external: true },
  ].filter(Boolean);
}

/**
 * The home page's work section: filter chips, then one card per project in
 * the order of src/data/projects.js. Each card: domain · where it runs, the
 * title (links to its case study), a one-line description with no metrics,
 * up to three tech tags and a file tree (pipeline/ opens the project's steps
 * from data to deployment; then its links). Beside it, the project's real
 * picture in a window frame: its screenshot, or its code fragment
 * (ProjectThumb). Desktop: text left, picture right. Phones: picture first.
 *
 * "● online" beside live_demo only when the last check (npm run check-demos)
 * found it answering, within the last 7 days.
 *
 * State
 *   filter    the chosen chip ("all" by default; kept in the URL as #work-<key>)
 *   open      { [project id]: true } for the rows whose pipeline/ is open
 *   now       null until mounted (the prerendered page trusts the build's
 *             check), then the time the 7-day window is measured from
 *   announce  the aria-live line after a filter change ("2 projects shown")
 */
export class WorkList extends Component {
  constructor(props) {
    super(props);
    this.state = { filter: "all", open: {}, now: null, announce: "", filtered: false };
    this.readHash = this.readHash.bind(this);
  }

  componentDidMount() {
    // After hydration: re-check the 7-day window against this visit's clock.
    this.frame = requestAnimationFrame(this.startClock);
    this.readHash(true);
    window.addEventListener("hashchange", this.readHash);
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.frame);
    window.removeEventListener("hashchange", this.readHash);
  }

  /** The "online" marks now use this visit's clock instead of the build's check. */
  startClock = () => this.setState({ now: Date.now() });

  /** #work-<key> in the URL picks the filter (and, on first load, scrolls the section into view). */
  readHash(firstLoad = false) {
    const match = HASH.exec(window.location.hash);
    if (!match) return;
    this.setFilter(match[1], false);
    if (firstLoad === true) document.getElementById("work")?.scrollIntoView();
  }

  setFilter(filter, updateHash = true) {
    const { projects } = this.props;
    const count = projects.filter((project) => matches(project, filter)).length;
    this.setState({
      filter,
      filtered: true,
      announce: `${count} ${count === 1 ? "project" : "projects"} shown`,
    });
    if (updateHash) {
      // replaceState: no jump and no extra history entry.
      history.replaceState(null, "", filter === "all" ? "#work" : `#work-${filter}`);
    }
  }

  togglePipeline(id) {
    this.setState(({ open }) => ({ open: { ...open, [id]: !open[id] } }));
  }

  isOnline(id) {
    const { now } = this.state;
    return now === null ? Boolean(demoStatus[id]?.ok) : demoOnline(id, now);
  }

  renderChips() {
    const { projects } = this.props;
    const { filter } = this.state;
    return (
      <div className="work-chips" role="group" aria-label="filter projects">
        {FILTERS.map(({ key, label }) => {
          const count = projects.filter((project) => matches(project, key)).length;
          return (
            <button
              type="button"
              key={key}
              className="work-chip"
              aria-pressed={filter === key}
              onClick={() => this.setFilter(key)}
            >
              {label} <span className="work-chip-count">{count}</span>
            </button>
          );
        })}
      </div>
    );
  }

  renderTree(project) {
    const links = rowLinks(project);
    const open = Boolean(this.state.open[project.id]);
    const stepsId = `pipeline-${project.id}`;
    const last = links.length - 1;

    return (
      <ul className="work-tree" aria-label={`${project.title} links`}>
        <li>
          <span className="work-branch" aria-hidden="true">
            {"├── "}
          </span>
          <button
            type="button"
            className="work-pipeline"
            aria-expanded={open}
            aria-controls={stepsId}
            onClick={() => this.togglePipeline(project.id)}
          >
            <span className="work-chevron" aria-hidden="true">
              ▸
            </span>{" "}
            pipeline/
          </button>
          {/* The steps, from data to deployment. In the HTML, hidden until opened. */}
          <div className="work-steps" id={stepsId} hidden={!open}>
            <span className="work-branch" aria-hidden="true">
              {"│   "}
            </span>
            <ol className="work-step-list" aria-label={`${project.title} pipeline`}>
              {project.pipeline.map((step, i) => (
                <li key={step}>
                  {i > 0 ? (
                    <span className="work-step-arrow" aria-hidden="true">
                      →
                    </span>
                  ) : null}
                  <span className={i === project.pipeline.length - 1 ? "work-step work-step--last" : "work-step"}>
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </li>

        {links.map((link, i) => (
          <li key={link.label}>
            <span className="work-branch" aria-hidden="true">
              {i === last ? "└── " : "├── "}
            </span>
            <a
              href={link.href}
              {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {link.label} <span className="work-arrow">{link.arrow}</span>
              {link.external ? <span className="sr-only"> (opens in a new tab)</span> : null}
            </a>
            {link.demo && this.isOnline(project.id) ? (
              <span className="work-online">
                <span className="work-online-dot" aria-hidden="true">
                  ●
                </span>{" "}
                online
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    );
  }

  render() {
    const { projects } = this.props;
    const { filter, announce, filtered } = this.state;

    return (
      <>
        {this.renderChips()}
        <p className="sr-only" aria-live="polite">
          {announce}
        </p>

        <ul className={filtered ? "work-list has-filtered" : "work-list"}>
          {projects.map((project) => (
            <li className="work-row" key={project.id} hidden={!matches(project, filter)}>
              <div className="work-main">
                <p className="work-domain">
                  {project.domain}
                  <span className="work-runs"> · {project.runsOn}</span>
                </p>
                <h3 className="work-title">
                  <a href={caseStudyPath(project.id)}>{project.title}</a>
                </h3>
                <p className="work-line">{project.listLine}</p>
                <TechList items={project.tech.slice(0, TECH_MAX)} />
                {this.renderTree(project)}
              </div>

              {/* The picture, in a small window frame. A code fragment is hidden
                  from screen readers; a screenshot keeps its description. */}
              <div className="work-frame">
                <span className="work-frame-bar" aria-hidden="true">
                  <span className="work-frame-dot" />
                  <span className="work-frame-dot" />
                  <span className="work-frame-dot" />
                  <span className="work-frame-id">{project.id}</span>
                </span>
                <ProjectThumb project={project} decorative={!project.thumbnail} />
              </div>
            </li>
          ))}
        </ul>
      </>
    );
  }
}
