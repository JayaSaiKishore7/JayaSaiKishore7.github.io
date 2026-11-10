import { Component, createRef } from "react";
import "./ProjectThumb.css";

/**
 * A project's 16:10 thumbnail: its screenshot when it has one, otherwise its
 * code fragment drawn as a small editor window (nothing faked).
 * `decorative` hides it from screen readers where the title already says it all.
 *
 * Screenshots fade in once loaded (`is-loaded`), so they never pop in.
 */
export class ProjectThumb extends Component {
  constructor(props) {
    super(props);
    this.state = { loaded: false };
    this.imgRef = createRef();
    this.handleLoad = this.handleLoad.bind(this);
  }

  componentDidMount() {
    // On a pre-rendered page the image may finish loading before React takes
    // over, in which case onLoad never fires; check once here as well.
    if (this.imgRef.current?.complete) this.handleLoad();
  }

  handleLoad() {
    if (!this.state.loaded) this.setState({ loaded: true });
  }

  render() {
    const { project, decorative = false, eager = false } = this.props;
    const { thumbnail, frag } = project;

    if (thumbnail) {
      return (
        <img
          ref={this.imgRef}
          className={`project-thumb${this.state.loaded ? " is-loaded" : ""}`}
          src={thumbnail.src}
          alt={decorative ? "" : thumbnail.alt}
          width="960"
          height="600"
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={this.handleLoad}
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
