import { Component } from "react";
import { caseStudyPath } from "../../routes";
import { TechList } from "../Project/TechList";
import "./WorkList.css";

const TECH_MAX = 3; // tags per row

/** A row's links: the case study always, then live demo, github and hugging face where they exist. */
function rowLinks(project) {
  return [
    { label: "case study →", href: caseStudyPath(project.id) },
    project.demo && { label: "live demo ↗", href: project.demo, external: true },
    project.link && { label: "github ↗", href: project.link, external: true },
    project.huggingface && { label: "hugging face ↗", href: project.huggingface, external: true },
  ].filter(Boolean);
}

/**
 * The home page's work section as a plain list: one row per project, in the
 * order of src/data/projects.js. Each row: the domain, the title (a link to
 * its case study), a one-line description with no metrics (listLine), up to
 * three tech tags, then the links. Phones: everything stacked, the links on
 * one line separated by " · ". Desktop: the links in a column on the right.
 * No images, no carousel, nothing moves.
 */
export class WorkList extends Component {
  render() {
    const { projects } = this.props;
    return (
      <ul className="work-list">
        {projects.map((project) => (
          <li className="work-row" key={project.id}>
            <div className="work-main">
              <p className="work-domain">{project.domain}</p>
              <h3 className="work-title">
                <a href={caseStudyPath(project.id)}>{project.title}</a>
              </h3>
              <p className="work-line">{project.listLine}</p>
              <TechList items={project.tech.slice(0, TECH_MAX)} />
            </div>

            <p className="work-links">
              {rowLinks(project).map((link, i) => (
                <span className="work-link-item" key={link.label}>
                  {i > 0 ? (
                    <span className="work-sep" aria-hidden="true">
                      ·
                    </span>
                  ) : null}
                  <a
                    href={link.href}
                    {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    aria-label={
                      link.label.startsWith("case study") ? `case study: ${project.title}` : undefined
                    }
                  >
                    {link.label}
                    {link.external ? <span className="sr-only"> (opens in a new tab)</span> : null}
                  </a>
                </span>
              ))}
            </p>
          </li>
        ))}
      </ul>
    );
  }
}
