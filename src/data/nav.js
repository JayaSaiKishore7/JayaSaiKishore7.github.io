// Page sections in order: the navbar links, and the heading of a section with
// no separate title (education).
export const navLinks = [
  { id: "work", label: "work" },
  { id: "experience", label: "experience" },
  { id: "education", label: "education" },
  { id: "hello", label: "hello" },
  { id: "contact", label: "contact" },
];

export function navLink(id) {
  const link = navLinks.find((item) => item.id === id);
  if (!link) throw new Error(`Unknown section id "${id}" — add it to navLinks in src/data/nav.js`);
  return link;
}
