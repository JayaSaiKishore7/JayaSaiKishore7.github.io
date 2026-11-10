import { Component } from "react";
import { profile } from "../../data/profile";
import "./Footer.css";

export class Footer extends Component {
  render() {
    return (
      <footer className="footer">
        <p>
          © {new Date().getFullYear()} {profile.fullName.toLowerCase()} &middot; written, built and debugged in france
        </p>
      </footer>
    );
  }
}
