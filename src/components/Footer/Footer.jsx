import { Component } from "react";
import "./Footer.css";

export class Footer extends Component {
  render() {
    return (
      <footer className="footer">
        <div className="container footer-in">
          <span>
            © {new Date().getFullYear()} jaya sai kishore neerukonda &middot; written, built and
            debugged in france
          </span>
          <span className="footer-sign">thanks for scrolling.</span>
        </div>
      </footer>
    );
  }
}
