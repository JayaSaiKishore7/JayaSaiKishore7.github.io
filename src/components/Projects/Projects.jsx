import { Component } from "react";
import { projects } from "../../data/projects";
import { Reveal } from "../Reveal";
import { SectionLabel } from "../SectionLabel";
import { ProjectSplit } from "../ProjectSplit/ProjectSplit";
import "./Projects.css";

/** Home page work section: every project in a split view (list + preview). */
export class Projects extends Component {
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

          <Reveal as="div">
            <ProjectSplit projects={projects} />
          </Reveal>
        </div>
      </section>
    );
  }
}
