import { useState } from "react";
import { navLinks } from "../../data/nav";
import { useActiveSection } from "../../hooks/useActiveSection";
import "./Navbar.css";

const sectionIds = navLinks.map((link) => link.id);

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const active = useActiveSection(sectionIds);

  return (
    <header className="topbar">
      <div className="container nav-container">
        <a href="#home" className="brand">
          Jaya Sai Kishore
        </a>

        <button
          className="menu-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav className={`nav-wrapper ${menuOpen ? "active" : ""}`}>
          <ul className="nav-links">
            {navLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  className={active === link.id ? "active" : ""}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
