import { Component, createRef } from "react";
import { projects } from "../../data/projects";
import { Reveal } from "../Reveal";
import { PointerGlow } from "../../utils/PointerGlow";
import "./Projects.css";

export class Projects extends Component {
  constructor(props) {
    super(props);
    this.spreadsRef = createRef();
    this.glow = null;
  }

  componentDidMount() {
    this.glow = new PointerGlow({ container: this.spreadsRef.current, itemSelector: ".spread" });
    this.glow.start();
  }

  componentWillUnmount() {
    this.glow?.stop();
  }

  render() {
    return (
      <section id="work" className="section">
        <div className="container">
          <Reveal as="header" className="work-head">
            <span className="section-label">02 · work</span>
            <h2 className="work-statement">
              what does a model need to survive contact with real data?
            </h2>
          </Reveal>

          <div className="spreads" ref={this.spreadsRef}>
            {projects.map((project, i) => (
              <Reveal
                as="article"
                className={`spread spread--${project.variant || "lead"}`}
                key={project.id}
                style={{ "--i": i }}
              >
                <pre className="frag" aria-hidden="true">
                  <span className="frag-file">{project.frag.file}</span>
                  <code>{project.frag.code}</code>
                </pre>

                <header className="p-head">
                  <p className="idx">{String(i + 1).padStart(2, "0")}</p>
                  <h3>
                    <a href={project.link} target="_blank" rel="noreferrer">
                      <span>{project.title}</span>
                      <span className="p-github">github</span>
                    </a>
                  </h3>
                  <p className="what">{project.what}</p>
                  <p className="meta">{project.meta}</p>
                </header>

                <div className="p-notes">
                  <p>
                    <b>why</b>
                    {project.notes.why}
                  </p>
                  <p>
                    <b>inside</b>
                    {project.notes.inside}
                  </p>
                  <p>
                    <b>learning</b>
                    {project.notes.learning}
                  </p>
                  <p className="proof">
                    <b>proof</b>
                    {project.proof}
                  </p>
                </div>

                {project.aside ? <p className="p-aside">{project.aside}</p> : null}
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    );
  }
}
