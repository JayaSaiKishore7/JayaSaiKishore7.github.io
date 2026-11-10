import { Component } from "react";
import { projects } from "../../data/projects";
import { Reveal } from "../Reveal";
import { SectionHeader } from "../ui/SectionHeader";
import { ProjectSplit } from "../ProjectSplit/ProjectSplit";

/** Home page work section: every project in a split view (list + preview). Styles live in ProjectSplit.css. */
export class Projects extends Component {
  render() {
    return (
      <section id="work" className="section">
        <div className="container">
          <Reveal as="div" className="section-rule" aria-hidden="true" />

          <Reveal as="div">
            <SectionHeader id="work" title="what does a model need to survive contact with real data?" />
          </Reveal>

          <Reveal as="div">
            <ProjectSplit projects={projects} />
          </Reveal>
        </div>
      </section>
    );
  }
}
