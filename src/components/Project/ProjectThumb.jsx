import { Component } from "react";
import "./ProjectThumb.css";

/**
 * A project's 16:10 thumbnail: its screenshot when it has one, otherwise its
 * code fragment drawn as a small editor window (nothing faked).
 * `decorative` hides it from screen readers where the title already says it all.
 */
export class ProjectThumb extends Component {
  render() {
    const { project, decorative = false, eager = false } = this.props;
    const { thumbnail, frag } = project;

    if (thumbnail) {
      return (
        <img
          className="project-thumb"
          src={thumbnail.src}
          alt={decorative ? "" : thumbnail.alt}
          width="960"
          height="600"
          loading={eager ? "eager" : "lazy"}
          decoding="async"
        />
      );
    }

    return (
      <div className="project-thumb project-thumb--code" aria-hidden={decorative ? "true" : undefined}>
        <span className="project-thumb-file">{frag.file}</span>
        <pre>
          <code>{frag.code}</code>
        </pre>
      </div>
    );
  }
}
