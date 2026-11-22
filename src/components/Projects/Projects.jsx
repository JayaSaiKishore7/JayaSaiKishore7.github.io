import { Component } from "react";
import { projects } from "../../data/projects";
import { Reveal } from "../Reveal";
import { SectionHeader } from "../ui/SectionHeader";
import { WorkList } from "../WorkList/WorkList";

/**
 * Home page work section (#work): a terminal eyebrow ("$ mlflow runs list
 * --runs N", N = the project count), the heading, then the filter chips and
 * every project as a card (WorkList, styles in WorkList.css).
 */
export class Projects extends Component {
  render() {
    return (
      <section id="work" className="section section--ruled section--gap-after">
        <div className="container">
          <Reveal as="div">
            <p className="work-eyebrow">
              <span className="work-eyebrow-prompt">$</span> mlflow runs list{" "}
              <span className="work-eyebrow-flag">--runs {projects.length}</span>
            </p>
            <SectionHeader id="work" title="models that made it out of the notebook." />
          </Reveal>

          <Reveal as="div">
            <WorkList projects={projects} />
          </Reveal>
        </div>
      </section>
    );
  }
}
