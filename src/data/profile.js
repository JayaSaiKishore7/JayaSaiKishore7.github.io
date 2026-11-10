export const profile = {
  name: "Jaya Sai Kishore",
  fullName: "Jaya Sai Kishore Neerukonda",
  role: "machine learning engineer",
  city: "Nice",
  location: "Nice, France",
  timeZone: "Europe/Paris",
  email: "jayasaikishoren@gmail.com",
  linkedin: "https://www.linkedin.com/in/jaya-sai-kishore/",
  github: "https://github.com/JayaSaiKishore7",
  resume: "/resume/JayaSaiKishoreN_Resume.pdf",
  siteUrl: "https://jayasaikishore7.github.io/",
};

// Page title, description and link-preview data (rendered by src/data/head.js).
export const seo = {
  title: "Jaya Sai Kishore Neerukonda | Machine Learning Engineer",
  jobTitle: "Machine Learning Engineer",
  description:
    "Machine learning engineer in Nice, France: computer vision, MLOps, forecasting and LLM/RAG. Took a YOLO-based X-ray inspection system at STMicroelectronics from prototype to production, raising its accuracy from 70% to 90%.",
  image: "/og-image.png",
};

export const heroInfo = [
  { label: "focus", value: "ML, DL, computer vision, LLMs/RAG, MLOps." },
  { label: "latest", value: "data science intern, STMicroelectronics." },
  { label: "stack", value: "Python, PyTorch, TensorFlow, Computer Vision, MLflow, MLOps." },
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
  // Grouped by area, no percentage bars.
  skillGroups: [
    { name: "programming", items: ["Python", "SQL"] },
    { name: "computer vision", items: ["OpenCV", "YOLO", "SAM3"] },
    { name: "deep learning", items: ["PyTorch", "CNN", "ResNet", "Hugging Face"] },
    { name: "backend", items: ["FastAPI", "Flask", "WebSockets"] },
    { name: "data", items: ["NumPy", "scikit-learn", "XGBoost", "MariaDB", "ChromaDB"] },
    { name: "MLOps", items: ["MLflow", "DVC"] },
  ],
};
