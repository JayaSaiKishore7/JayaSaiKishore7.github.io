import { Component } from "react";
import { caseStudyPath } from "../../routes";
import { ProjectThumb } from "../Project/ProjectThumb";
import { TechList } from "../Project/TechList";
import "./WorkList.css";

const TECH_MAX = 3; // tags per row

/**
 * A row's links, in tree order: the case study always, then live demo,
 * github and hugging face where they exist.
 */
function rowLinks(project) {
  return [
    { label: "case_study/", arrow: "→", href: caseStudyPath(project.id) },
    project.demo && { label: "live_demo", arrow: "↗", href: project.demo, external: true },
    project.link && { label: "github", arrow: "↗", href: project.link, external: true },
    project.huggingface && { label: "hugging_face", arrow: "↗", href: project.huggingface, external: true },
  ].filter(Boolean);
}

/**
 * The home page's work section as a plain list: one row per project, in the
 * order of src/data/projects.js. Each row: the text (domain, title linking to
 * the case study, a one-line description with no metrics, up to three tech
 * tags) and a file tree of its links; beside it, the project's real picture in
 * a small window frame: its screenshot (`thumbnail`) or, without one, its code
 * fragment, exactly as ProjectThumb draws them. A screenshot added later shows
 * up here by itself. Desktop: text left, picture right. Phones: picture first.
 */
export class WorkList extends Component {
  render() {
    const { projects } = this.props;
    return (
      <ul className="work-list">
        {projects.map((project) => {
          const links = rowLinks(project);
          return (
            <li className="work-row" key={project.id}>
              <div className="work-main">
                <p className="work-domain">{project.domain}</p>
                <h3 className="work-title">
                  <a href={caseStudyPath(project.id)}>{project.title}</a>
                </h3>
                <p className="work-line">{project.listLine}</p>
                <TechList items={project.tech.slice(0, TECH_MAX)} />

                <ul className="work-tree" aria-label={`${project.title} links`}>
                  {links.map((link, i) => (
                    <li key={link.label}>
                      <span className="work-branch" aria-hidden="true">
                        {i === links.length - 1 ? "└── " : "├── "}
                      </span>
                      <a
                        href={link.href}
                        {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        {link.label} <span className="work-arrow">{link.arrow}</span>
                        {link.external ? <span className="sr-only"> (opens in a new tab)</span> : null}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* The picture, in a small window frame. A code fragment is hidden
                  from screen readers; a screenshot keeps its description. */}
              <div className="work-frame">
                <span className="work-frame-bar" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                <ProjectThumb project={project} decorative={!project.thumbnail} />
              </div>
            </li>
          );
        })}
      </ul>
    );
  }
}
