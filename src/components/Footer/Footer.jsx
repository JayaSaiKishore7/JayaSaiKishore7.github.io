import { profile } from "../../data/profile";
import "./Footer.css";

export function Footer() {
  return (
    <footer className="footer">
      <p>
        © {new Date().getFullYear()} {profile.fullName}
      </p>
    </footer>
  );
}
