export const profile = {
  name: "Jaya Sai Kishore",
  fullName: "Jaya Sai Kishore Neerukonda",
  role: "machine learning engineer",
  city: "Marseille",
  location: "Marseille, France",
  timeZone: "Europe/Paris",
  email: "jayasaikishoren@gmail.com",
  linkedin: "https://www.linkedin.com/in/jaya-sai-kishore/",
  github: "https://github.com/JayaSaiKishore7",
  resume: "/resume/JayaSaiKishoreN_Resume.pdf",
  siteUrl: "https://jayasaikishore.pages.dev/",
};

// The contact section's "inference terminal" card (Connect.jsx). All lowercase on purpose.
export const contactInfo = {
  // Decoration typed in when the card scrolls into view (echoes the loading screen).
  terminal: ["$ python contact.py", "running inference… match found"],
  heading: "got a model that needs to leave the notebook?",
  intro: "i'm open to data scientist and computer vision roles.",
  email: profile.email,
  emailLabel: "say hi",
  closing: "send me the interesting problem. machine learning, computer vision, mlops, anything worth building",
};

// Page title, description and link-preview data (rendered by src/data/head.js).
export const seo = {
  title: "Jaya Sai Kishore Neerukonda | Machine Learning Engineer",
  jobTitle: "Machine Learning Engineer",
  description:
    "Machine learning engineer in Marseille, France: computer vision, MLOps, forecasting and LLM/RAG. Took a YOLO-based X-ray inspection system at STMicroelectronics from prototype to production, raising its accuracy from 70% to 90%.",
  image: "/og-image.png",
};

export const heroInfo = [
  { label: "focus", value: "ML, DL, computer vision, LLMs/RAG, MLOps." },
  { label: "latest", value: "data science intern, STMicroelectronics." },
  { label: "stack", value: "Python, PyTorch, TensorFlow, OpenCV, Docker, MLflow." },
  { label: "status", value: "open to work.", status: true },
  // `href` renders the value as a link; `download` makes the browser save the file.
  { label: "resume", value: "download ↗", href: profile.resume, download: true },
];

export const aboutInfo = {
  statement: "i build things that have to survive the real world, not just the demo.",
  lead: "a machine learning engineer and data scientist working across computer vision, NLP and LLMs/RAG.",
  sub: [
    "i hold a master's in data science & AI (2026), with a focus on rigorous experimentation, model evaluation, and production-grade MLOps pipelines that scale.",
    "most recently, i took an AI-based X-ray inspection system at STMicroelectronics from prototype to production deployment, fine-tuning its YOLO model from 70% to 90% accuracy.",
  ],
  // Grouped by area, no percentage bars. Matches the resume (public/resume/).
  // `spoken: true` marks human languages: shown as a line of text, not as tool chips.
  skillGroups: [
    { name: "programming", items: ["Python", "SQL"] },
    { name: "machine learning", items: ["scikit-learn", "XGBoost", "Pandas", "NumPy"] },
    { name: "deep learning", items: ["PyTorch", "TensorFlow", "CNN", "ResNet"] },
    { name: "computer vision", items: ["OpenCV", "YOLO", "SAM3"] },
    { name: "LLMs & NLP", items: ["Transformers (Hugging Face)", "LangChain", "ChromaDB"] },
    { name: "web", items: ["FastAPI", "Flask", "WebSockets", "Vue.js"] },
    { name: "databases", items: ["MySQL", "MariaDB"] },
    { name: "MLOps & cloud", items: ["MLflow", "DVC", "Docker", "Git", "CI/CD", "AWS (EC2, S3)"] },
    { name: "languages", spoken: true, items: ["english (C2)", "french (A2, working towards B1)"] },
  ],
  credentials: ["Neo4j Certified Professional (2025)", "Hacktoberfest 2025 contributor (several accepted pull requests)"],
};
