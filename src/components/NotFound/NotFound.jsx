import { Component } from "react";
import { ArrowLink } from "../ui/ArrowLink";
import { HeadlineBox } from "../ui/HeadlineBox";
import "./NotFound.css";

/** The 404 page (pre-rendered as dist/404.html; served for every unknown URL). */
export class NotFound extends Component {
  render() {
    return (
      <main id="not-found" className="section not-found">
        <div className="container">
          <h1 className="not-found-title">
            <HeadlineBox label="404">this page didn't make it out of the notebook.</HeadlineBox>
          </h1>
          <p className="not-found-sub">the link might be old, or the url has a typo.</p>
          <ArrowLink href="/" className="not-found-home" arrow="←">
            back home
          </ArrowLink>
        </div>
      </main>
    );
  }
}
