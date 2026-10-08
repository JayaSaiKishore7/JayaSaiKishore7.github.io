import { useEffect, useState } from "react";

export function useActiveSection(sectionIds, offset = 140) {
  const [active, setActive] = useState(sectionIds[0]);

  useEffect(() => {
    function onScroll() {
      let current = sectionIds[0];
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (window.scrollY >= el.offsetTop - offset) {
          current = id;
        }
      }
      setActive(current);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [sectionIds, offset]);

  return active;
}
