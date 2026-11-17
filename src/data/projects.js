// Projects, in display order. Each one appears in the home page's split view
// (ProjectSplit) and gets a case study page (/work/<id>/, see src/routes.js)
// built from `notes`, `proof` and `aside`.
//
// Every case study answers four points:
//   notes.problem   what problem it solves
//   notes.built     what i personally built (for team projects, only my part)
//   notes.decision  one technical decision and why
//   proof           the headline result (also the page's meta description)
//   notes.tested    what testing showed: surprises, failures, what changed
//
// Fields: featured = listed under "featured" in the split view (the rest under
// "more"); what = the one-line description; tech = tools shown as tags;
// thumbnail = image in public/projects/ (960×600 WebP), or null to draw one
// from `frag`; demo = live demo URL, if any; team = built as a team.
//
// Style: sentences start lowercase; names of tools, datasets and organisations keep their capitals.
export const projects = [
  {
    id: "air-quality",
    featured: true,
    title: "Air Quality Forecasting Platform",
    what: "forecasts the next 24 hours from live government data every morning, then scores itself against what actually happened.",
    tech: ["Python", "XGBoost", "Evidently", "FastAPI", "GitHub Actions", "Hugging Face"],
    thumbnail: {
      src: "/projects/air-quality.webp",
      alt: "the live forecast page: a station map of Provence-Alpes-Côte d'Azur and a chart of measured vs. forecast NO₂",
    },
    link: "https://github.com/JayaSaiKishore7/AirQuality_AnalysisFR",
    demo: "https://huggingface.co/spaces/JayaSaiKishore/airquality-paca",
    notes: {
      problem:
        "a forecasting model trained once and left alone quietly goes stale, and nobody notices until its forecasts are wrong. PACA's air quality needed a forecaster that keeps running on fresh data and reports when it stops being trustworthy.",
      built:
        "the whole system, solo: a daily GitHub Actions job that pulls Geod'Air measurements for ~90 station/pollutant series, leakage-safe features, an XGBoost model that forecasts 24 h ahead recursively, scoring of every past forecast against what was measured, Evidently drift checks that open a GitHub issue, and a static page on Hugging Face. plus a FastAPI service, a Streamlit dashboard and 41 pytest tests that run on every push.",
      decision:
        "i shipped XGBoost, not the Random Forest, even though the forest scored slightly better (1-hour MAE 3.66 vs 3.69). the forest is 278 MB and XGBoost is 4.8 MB, small enough to run in a free daily job and deploy without paid hosting.",
      tested:
        "two numbers misled me. my first score was too good: the 3-hour average included the hour being predicted. using only past hours raised the 1-hour error (MAE 3.42 → 3.69) but made training match live forecasting. then the drift alarm fired every day, because live data was compared with the whole year, including stations that weren't reporting. comparing the same season and stations cut the drift share from 0.67 to 0.56.",
    },
    proof:
      "in all 19 daily checks (17 Oct – 4 Nov 2026), its 24-hour forecasts beat persistence, by 22–56%. over the latest week: 26% lower error on O₃ and NO₂ and 34% on PM10, across 14,468 scored values.",
    aside: "PM2.5 and CO still only match persistence, and the README says so.",
    // Drawn by ArchitectureDiagram on the case study page. Nodes sit on a grid
    // (col, row); edges are [from, to, options] and run along a row or a column.
    architecture: {
      caption:
        "top: the daily pipeline on GitHub Actions. bottom: training and serving, run locally with Docker Compose. hover or tab through the steps for details.",
      groups: [
        { label: "daily · GitHub Actions, 04:30 UTC", from: [1, 0], to: [4, 0] },
        { label: "local · Docker Compose", from: [1, 2], to: [4, 2] },
      ],
      nodes: [
        { id: "geodair", col: 0, row: 0, title: "Geod'Air", sub: "hourly measurements", detail: "the French national air quality database: hourly values for ~90 station/pollutant series in PACA." },
        { id: "fetch", col: 1, row: 0, title: "fetch", sub: "download + clean", detail: "fetch_geodair.py downloads the latest days of measurements and cleans them." },
        { id: "forecast", col: 2, row: 0, title: "forecast", sub: "XGBoost, 24 h", detail: "make_forecasts.py predicts the next 24 hours recursively, one hour at a time, feeding each prediction back in as the next hour's input." },
        { id: "monitor", col: 3, row: 0, title: "monitor", sub: "drift + skill", detail: "monitor_drift.py scores past forecasts against what was measured, and Evidently compares live data with a same-season, same-station reference." },
        { id: "site", col: 4, row: 0, title: "build page", sub: "static HTML", detail: "build_site.py renders the station map and charts (Plotly) into one static page." },
        { id: "hf", col: 5, row: 0, title: "Hugging Face", sub: "live page", detail: "the page is published to a free Hugging Face Space: this is the live demo." },
        { id: "issue", col: 3, row: 1, title: "GitHub issue", sub: "on drift", detail: "when drift is detected, the job opens a GitHub issue automatically." },
        { id: "repo", col: 4, row: 1, title: "git history", sub: "data + monitoring", detail: "observations, forecasts and the monitoring history are committed back to the repository every day." },
        { id: "train", col: 1, row: 2, title: "train", sub: "MLflow runs", detail: "preprocess_data.py and train_model.py compare Random Forest and XGBoost on a chronological 80/20 split, logging runs to MLflow." },
        { id: "model", col: 2, row: 2, title: "model", sub: "XGBoost, 4.8 MB", detail: "the deployed model: XGBoost, chosen over a slightly better but 278 MB Random Forest because it is small enough to ship." },
        { id: "api", col: 3, row: 2, title: "FastAPI", sub: "/forecast/24h", detail: "the API serves 24-hour forecasts from the same model and shared feature code." },
        { id: "ui", col: 4, row: 2, title: "Streamlit", sub: "dashboard", detail: "a local dashboard for exploring history and forecasts; it works with or without the API." },
      ],
      edges: [
        ["geodair", "fetch"],
        ["fetch", "forecast"],
        ["forecast", "monitor"],
        ["monitor", "site"],
        ["site", "hf"],
        ["monitor", "issue", { dashed: true, label: "drift" }],
        ["site", "repo"],
        ["train", "model"],
        ["model", "forecast"],
        ["model", "api"],
        ["api", "ui"],
      ],
    },
    frag: {
      file: "air-quality / airquality/features.py",
      code: `past = v.shift(1)
g["lag_1"] = past
g["lag_24"] = v.shift(24)
g["rolling_3"] = past.rolling(3, min_periods=3).mean()`,
    },
  },
  {
    id: "emotion-rag",
    featured: true,
    title: "Emotion-Aware Insight Generator",
    what: "reads the emotion on a face, then finds the customer reviews that explain it and scores their sentiment.",
    tech: ["ResNet-50", "OpenCV", "FAISS", "LangChain", "RoBERTa", "Streamlit"],
    thumbnail: {
      src: "/projects/emotion-rag.webp",
      alt: "the Streamlit app: a photo of a smiling face uploaded for emotion detection",
    },
    link: "https://github.com/JayaSaiKishore7/Emotion_RAG_Application",
    demo: "https://emotionragapp-2.streamlit.app/",
    notes: {
      problem:
        "an emotion label on its own doesn't say why someone feels that way. the app connects a detected emotion to the customer feedback behind it.",
      built:
        "all of it, solo: a ResNet-50 fine-tuned on FER-2013, an OpenCV face crop so the model sees the largest face, a FAISS index of 500 reviews (via LangChain) that returns the 4 closest to the detected emotion, RoBERTa sentiment scores for each review, and the Streamlit app that ties it together.",
      decision:
        "i fine-tuned ResNet-50 rather than a vision transformer: with ~28,700 training images, a proven CNN trains faster and needs less data than a ViT. the vector search stays local in FAISS, because 500 reviews don't need a hosted database.",
      tested:
        "testing changed two things. Flan-T5 was meant to summarize the retrieved reviews, but under every prompt i tried it copied them word for word, and larger models don't fit in Streamlit Cloud's memory, so i replaced it with a plain sentiment count. and the 62% headline hid the weak classes: disgust, the rarest class, was right only 2 times out of 55. per-class results told me more than the overall score.",
    },
    proof: "62.2% accuracy on the 3,589-image FER-2013 test set (happiness 89%), with a live Streamlit demo.",
    aside: "disgust and fear are still the weak classes, and the README says so.",
    frag: {
      file: "emotion-rag / core/models.py",
      code: `docs = db.similarity_search(query, k=4)
context = "\\n\\n".join([doc.page_content for doc in docs])
prompt = PROMPT_TEMPLATE.format(context=context, question=query)
answer = llm.invoke(prompt)`,
    },
  },
  {
    id: "brain-tumor",
    featured: true,
    title: "Brain Tumor MRI Classifier",
    what: "97.53% test accuracy, after augmentation first made it worse.",
    tech: ["TensorFlow", "Keras", "CNN", "Flask"],
    thumbnail: {
      src: "/projects/brain-tumor.webp",
      alt: "confusion matrix on the test set: nearly all scans fall on the diagonal for glioma, meningioma, no tumor and pituitary",
    },
    link: "https://github.com/JayaSaiKishore7/brain-tumor-classifier",
    notes: {
      problem:
        "sorting brain MRI slices into glioma, meningioma, pituitary tumor or no tumor, using a small dataset (7,023 images) and a CNN trained from scratch, with no pretrained weights to lean on.",
      built:
        "everything, solo: the CNN (four conv/pool blocks, 1.3M parameters, trains on a CPU), augmentation tuned for MRI, training with early stopping and checkpointing, and a Flask site that shows the training report and classifies uploaded scans without ever saving them to disk.",
      decision:
        "i put augmentation and rescaling inside the model as Keras layers. Keras switches augmentation off outside training, and the Flask /predict endpoint runs exactly the same preprocessing as training, so predictions can't drift from training through mismatched preprocessing (train/serve skew).",
      tested:
        "my first augmentation pass dropped accuracy from 95.83% to 92.50%, because MRI orientation and intensity carry diagnostic signal. i checked whether it just needed longer training (it didn't: still 92.50%), then cut rotation, zoom and brightness to roughly a third (±18° → ±7°), which beat the no-augmentation baseline on every class.",
    },
    proof: "97.53% test accuracy on 1,054 held-out scans and 95.6% meningioma F1. the most common error: a glioma read as meningioma (9 of 243).",
    aside: "limitations are documented in the README, not claiming clinical validity.",
    frag: {
      file: "brain-tumor-classifier / src/train.py",
      code: `layers.RandomRotation(0.02),
layers.RandomZoom(0.05),
layers.RandomBrightness(0.05),
layers.Rescaling(1.0 / 255),`,
    },
  },
  {
    id: "rag-pdf",
    featured: true,
    title: "PDF Question Answering with RAG",
    what: "answers questions about an uploaded PDF from the passages it retrieves, not from memory.",
    tech: ["LangChain", "ChromaDB", "MiniLM", "Gemini", "Flask"],
    thumbnail: null,
    link: "https://github.com/JayaSaiKishore7/RagPdfSummarizer",
    notes: {
      problem:
        "long PDFs overflow an LLM's context window, and an LLM answering from memory drifts away from the source. answers need to come from the actual pages.",
      built:
        "the whole app, solo: a Flask upload flow, text extraction with pypdf, 1,000-character chunks with 200 overlap, MiniLM embeddings in ChromaDB, retrieval of the 3 closest chunks, and a Gemini 2.0 Flash prompt that answers from that context only.",
      decision:
        "i gave each browser session its own upload folder and vector store, so one visitor's document can never show up in another visitor's answers. chunks are hashed (MD5), so duplicates are only embedded once.",
      tested:
        "chunk size and overlap mattered more to answer quality than which LLM wrote the answer. testing also showed that scanned PDFs return nothing, because pypdf only reads a text layer; the README lists this as a limitation.",
    },
    proof: "served through a Flask app with a separate vector store per session, PDF-only uploads and a 16 MB size limit.",
    aside: "chunk size and overlap are still the main levers being tuned.",
    frag: {
      file: "rag-pdf-summarizer / app.py",
      code: `text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len
)
results = vector_store.similarity_search(query, k=3)`,
    },
  },
  {
    id: "electricity-forecast",
    title: "Electricity Load Forecasting (Time Series)",
    what: "forecasts a full day of 15-minute load (96 steps), and rebuilds a research algorithm as an R package.",
    tech: ["scikit-learn", "XGBoost", "SARIMA", "LSTM", "R"],
    thumbnail: null,
    link: "https://github.com/JayaSaiKishore7/Time_Series_Electricity_Forecasting",
    notes: {
      problem:
        "a building's next day of electricity use, in 15-minute steps (96 of them). most demos stop at one-step-ahead forecasts, which hide how errors build up over a long horizon.",
      built:
        "all of it, solo: lag, rolling and calendar features; a benchmark from naive baselines through ETS, SARIMA, random forest, XGBoost, SVR, MLP and LSTM under TimeSeriesSplit; the final 96-step forecast; and the weighted nearest neighbours method (Talavera-Llames et al., 2016), rebuilt from the paper as an installable R package with roxygen docs and a vignette.",
      decision:
        "alongside the trained models, i implemented weighted nearest neighbours. instead of fitting parameters, it finds the past windows that most resemble the latest 96 readings and averages what came next, weighted by closeness (k = 10), so every forecast traces back to real past days.",
      tested:
        "recursive multi-step forecasting punishes small early errors, so feature engineering mattered more than model choice. SVR had the lowest validation MAE (6.80 kW) and SARIMA the highest (15.96), but not every model was scored on the same folds, so the ranking is only rough.",
    },
    proof: "a final 96-step forecast, plus the wnnforecast R package with roxygen docs and a vignette.",
    aside: "still testing how far the recursive horizon can stretch before error compounds too much.",
    frag: {
      file: "time-series-electricity-forecasting / WNN_Package/R/wnn_forecast.R",
      code: `dists <- apply(model$X, 1, function(row) euclidean_distance(row, window))
idx <- order(dists)[1:model$k]
weights <- 1/(dists[idx] + 1e-8)
weights <- weights / sum(weights)
sum(weights * model$y[idx])`,
    },
  },
  {
    id: "diabetes",
    team: true,
    title: "Machine Learning for Diabetes Risk Prediction",
    what: "96% accuracy, 0.993 AUC, and a web form to act on it.",
    tech: ["XGBoost", "Random Forest", "FastAPI"],
    thumbnail: null,
    link: "https://github.com/JayaSaiKishore7/diabetes_prediction",
    notes: {
      problem:
        "predicting whether a patient is diabetic from eight clinical measurements. a model sitting in a notebook doesn't help anyone, so the prediction had to be one form-submit away.",
      built:
        "team project. my part: the random forest and XGBoost models trained on the team's cleaned data (15,000 records cleaned down to 10,471), the comparison between them, and the FastAPI web form that returns a diabetes probability.",
      decision:
        "i saved the scaler next to the model and run every form input through it before predicting, exactly as in training, so the web form sees the same features the model learned from. the app won't start if either file is missing.",
      tested:
        "XGBoost beat the random forest: 0.993 vs 0.983 AUC, and 0.926 vs 0.906 F1 on the diabetic class. the two notebooks split the data differently, though, so the comparison is close rather than exact.",
    },
    proof: "0.993 AUC and 96.1% accuracy on 2,095 held-out records.",
    aside: "the FastAPI endpoint returns a diabetes probability from the saved XGBoost model.",
    frag: {
      file: "diabetes-prediction / models/XGBClassifier.ipynb",
      code: `xgb_model = XGBClassifier()
xgb_model.fit(X_train, y_train)
y_proba = xgb_model.predict_proba(X_test)[:, 1]
# test AUC: 0.993`,
    },
  },
];
