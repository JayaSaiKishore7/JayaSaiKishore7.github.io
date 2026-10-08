import { Component } from "react";
import "./Footer.css";

export class Footer extends Component {
  render() {
    return (
      <footer className="footer">
        <p>
          © {new Date().getFullYear()} jaya sai kishore neerukonda &middot; built in nice, france
        </p>
      </footer>
    );
  }
}
