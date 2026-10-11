import { Component, createRef } from "react";
import { projects } from "../../data/projects";
import { Reveal } from "../Reveal";
import { PointerGlow } from "../../utils/PointerGlow";
import "./Projects.css";

export class Projects extends Component {
  constructor(props) {
    super(props);
    // Cards open independently rather than as an accordion, so comparing
    // two projects does not mean losing the one you just opened.
    this.state = { open: {} };
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

  toggle(id) {
    this.setState((state) => ({ open: { ...state.open, [id]: !state.open[id] } }));
  }

  render() {
    const { open } = this.state;

    return (
      <section id="work" className="section" aria-label="Work">
        <div className="container">
          <Reveal as="div" className="section-rule" variant="wipe" aria-hidden="true" />

          <header className="work-head">
            <Reveal as="span" className="section-label">
              01 · work
            </Reveal>
            <Reveal as="h2" className="work-statement" variant="mask">
              <span>what does a model need to survive contact with real data?</span>
            </Reveal>
          </header>

          <div className="spreads" ref={this.spreadsRef}>
            {projects.map((project, i) => {
              const isOpen = !!open[project.id];
              const panelId = `${project.id}-details`;

              return (
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

                  <div className="p-body">
                    <p className="proof">
                      <b>proof</b>
                      {project.proof}
                    </p>

                    <div className="p-collapse" data-open={isOpen} id={panelId}>
                      <div className="p-collapse-in">
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
                        </div>
                        {project.aside ? <p className="p-aside">{project.aside}</p> : null}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="p-toggle"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => this.toggle(project.id)}
                    >
                      <span className="p-toggle-sign" aria-hidden="true" />
                      {isOpen ? "less" : "how it works"}
                    </button>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    );
  }
}
