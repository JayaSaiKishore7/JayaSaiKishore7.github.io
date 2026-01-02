// Footer year
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Typing effect text
const roles = [
  "a Data Science Student",
  "a Machine Learning Engineer",
  "interested in model development",
  "exploring evaluation & scaling"
];

let roleIndex = 0;
let charIndex = 0;
const typingSpeed = 90;
const deletingSpeed = 55;
const pauseAfterWord = 1200;

function type() {
  const el = document.getElementById("typing-text");
  if (!el) return;

  const text = roles[roleIndex];
  if (charIndex < text.length) {
    el.textContent += text.charAt(charIndex);
    charIndex++;
    setTimeout(type, typingSpeed);
  } else {
    setTimeout(erase, pauseAfterWord);
  }
}

function erase() {
  const el = document.getElementById("typing-text");
  if (!el) return;

  const text = roles[roleIndex];
  if (charIndex > 0) {
    el.textContent = text.substring(0, charIndex - 1);
    charIndex--;
    setTimeout(erase, deletingSpeed);
  } else {
    roleIndex = (roleIndex + 1) % roles.length;
    setTimeout(type, 350);
  }
}

// start typing after small delay with settimeout
setTimeout(type, 600);

// Mobile menu toggle
const menuBtn = document.getElementById("menu-btn");
const navWrapper = document.getElementById("nav-wrapper");

if (menuBtn && navWrapper) {
  menuBtn.addEventListener("click", () => {
    navWrapper.classList.toggle("active");
  });
}

// Active nav link on scroll
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {
  let current = "home";

  sections.forEach(section => {
    const top = section.offsetTop;
    if (window.scrollY >= top - 140) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href").includes(current)) {
      link.classList.add("active");
    }
  });
});

// Scroll reveal for elements with .fade-up
const fadeEls = document.querySelectorAll(".fade-up");

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

fadeEls.forEach(el => observer.observe(el));
