import { Component } from "react";
import { profile } from "../../data/profile";
import "./Footer.css";

export class Footer extends Component {
  render() {
    return (
      <footer className="footer">
        {/* The year comes from the build; the browser may disagree right after New Year. */}
        <p suppressHydrationWarning>
          © {new Date().getFullYear()} {profile.fullName.toLowerCase()} &middot; written, built and debugged in france
        </p>
      </footer>
    );
  }
}
