import { Component, createRef } from "react";
import { projects } from "../../data/projects";
import { Reveal } from "../Reveal";
import { SectionLabel } from "../SectionLabel";
import { Tilt3D } from "../../utils/Tilt3D";
import "./Projects.css";

export class Projects extends Component {
  constructor(props) {
    super(props);
    this.spreadsRef = createRef();
    this.tilt = null;
  }

  componentDidMount() {
    this.tilt = new Tilt3D({ container: this.spreadsRef.current, itemSelector: ".card--tilt" });
    this.tilt.start();
  }

  componentWillUnmount() {
    this.tilt?.stop();
  }

  render() {
    return (
      <section id="work" className="section">
        <div className="container">
          <Reveal as="div" className="section-rule" aria-hidden="true" />

          <Reveal as="header" className="work-head">
            <SectionLabel id="work" as="span" />
            <h2 className="work-statement">
              what does a model need to survive contact with real data?
            </h2>
          </Reveal>

          <div className="spreads" ref={this.spreadsRef}>
            {projects.map((project, i) => {
              const variant = project.variant || "lead";
              // The lead card tilts in 3D; the rest get the simple hover lift.
              const motion = variant === "lead" ? "card--tilt" : "card--lift";

              return (
                <Reveal as="div" className="card-slot" key={project.id} style={{ "--i": i }}>
                  <article className={`card ${motion} spread spread--${variant}`}>
                    <span className="spread-tag" aria-hidden="true">
                      project {String(i + 1).padStart(2, "0")}
                    </span>

                    <pre className="frag tilt-layer" aria-hidden="true">
                      <span className="frag-file">{project.frag.file}</span>
                      <code>{project.frag.code}</code>
                    </pre>

                    <header className="p-head tilt-layer">
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

                    <div className="p-notes tilt-layer">
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

                    {project.aside ? <p className="p-aside tilt-layer">{project.aside}</p> : null}
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    );
  }
}
