export const experience = [
  {
    role: "Data Science Intern",
    company: "STMicroelectronics",
    location: "Rousset, France",
    date: "Apr 2026 – Oct 2026",
    summary:
      "Part of the Quality, Manufacturing & Technology (QMT) – Data Science team. Improved production-line efficiency by developing a deep learning object detection solution that replaces manual operator inspection of solder-ball defects in semiconductor packages.",
    points: [
      "Used SAM3 segmentation to automatically crop the region of interest from raw X-ray images, and generated training labels with a grid-based annotation method.",
      "Fine-tuned a YOLO11 object detection model to locate defective solder balls, and tracked experiments with MLflow.",
      "Developed and deployed a modular Python pipeline that automatically processes new images as they arrive and outputs annotated images with the precise location of each defect.",
      "Pushed inference results to a MariaDB database, with processed images stored on a network storage server (NAS).",
      "Built a FastAPI backend and a Vue.js web dashboard that display each inspection result in real time.",
      "Collaborated with data engineering and manufacturing teams to align the solution with production requirements.",
    ],
    stack: ["Python", "SAM3", "YOLO11", "MLflow", "FastAPI", "Vue.js", "MariaDB"],
  },
  {
    role: "Sr. Software Engineer",
    company: "Capgemini Technologies Pvt Ltd",
    location: "Hyderabad, India",
    date: "Dec 2021 – Dec 2022",
    summary: "Supported ML-driven and data-intensive features within production-grade systems.",
    points: [
      "Supported data pipelines used for analytics and machine learning workflows.",
      "Collaborated with data scientists to operationalize preprocessing and feature generation logic.",
      "Worked on containerized services and CI/CD pipelines to enable consistent and reliable deployments.",
      "Assisted with monitoring, logging, and debugging of data-driven services in production.",
    ],
  },
  {
    role: "Data Science Intern",
    company: "Digital Lync",
    location: "Hyderabad, India",
    date: "Jun 2019 – Apr 2020",
    summary: "Supported end-to-end ML experiments from datasets to model evaluation.",
    points: [
      "Prepared datasets through cleaning, normalization, and feature extraction.",
      "Trained and evaluated classical ML models using metrics such as accuracy, precision, recall, and AUC.",
      "Performed exploratory data analysis and error analysis to guide model improvements.",
      "Documented experiments and results to support iterative model development.",
    ],
  },
];

export const education = [
  {
    degree: "Master's in Data Science & Artificial Intelligence",
    meta: "DataScienceTech Institute • 2024 – 2026 • Sophia Antipolis, France",
    points: [
      "Advanced coursework in machine learning, deep learning, data engineering and MLOps.",
      "Hands-on projects in forecasting, computer vision and LLM/RAG-based applications.",
      "Focus on designing end-to-end ML workflows, from experimentation to reliable delivery.",
    ],
  },
  {
    degree: "Bachelor's in Electronics and Communication Engineering",
    meta: "Gudlavalleru Engineering College • 2015 – 2019 • Andhra Pradesh, India",
    points: [
      "Built strong foundations in mathematics, signal processing and communication systems.",
      "Developed core programming, problem-solving and engineering skills.",
      "Academic projects that sparked interest in data-driven systems and ML.",
    ],
  },
];
