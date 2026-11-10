// Page sections in order. The navbar and each section's label ("01 · work")
// are both numbered from this list, so reordering here renumbers everything.
export const navLinks = [
  { id: "work", label: "work" },
  { id: "experience", label: "experience" },
  { id: "education", label: "education" },
  { id: "hello", label: "hello" },
  { id: "contact", label: "contact" },
];

export function navLink(id) {
  const index = navLinks.findIndex((link) => link.id === id);
  if (index === -1) throw new Error(`Unknown section id "${id}" — add it to navLinks in src/data/nav.js`);
  return { ...navLinks[index], number: String(index + 1).padStart(2, "0") };
}
