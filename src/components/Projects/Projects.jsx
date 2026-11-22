import { Component } from "react";
import { projects } from "../../data/projects";
import { Reveal } from "../Reveal";
import { SectionHeader } from "../ui/SectionHeader";
import { WorkList } from "../WorkList/WorkList";

/**
 * Home page work section (#work): a terminal eyebrow ("$ mlflow runs list"),
 * the heading, then every project as a row (WorkList, styles in WorkList.css).
 */
export class Projects extends Component {
  render() {
    return (
      <section id="work" className="section section--ruled section--gap-after">
        <div className="container">
          <Reveal as="div">
            <p className="work-eyebrow">
              <span className="work-eyebrow-prompt">$</span> mlflow runs list
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
