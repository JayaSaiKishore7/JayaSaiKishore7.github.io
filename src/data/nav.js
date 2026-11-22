// Page sections in order: the navbar links, and the heading of a section with
// no separate title (education). "about" was called "hello"; its section keeps
// a #hello anchor for old links.
export const navLinks = [
  { id: "work", label: "work" },
  { id: "experience", label: "experience" },
  { id: "about", label: "about" },
  { id: "education", label: "education" },
  { id: "contact", label: "contact" },
];

export function navLink(id) {
  const link = navLinks.find((item) => item.id === id);
  if (!link) throw new Error(`Unknown section id "${id}" — add it to navLinks in src/data/nav.js`);
  return link;
}
