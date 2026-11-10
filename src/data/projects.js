// Projects, in display order. Each one appears in the home page's split view
// (ProjectSplit) and gets a case study page (/work/<id>/, see src/routes.js)
// built from `notes`, `proof` and `aside`.
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
      why: "a model trained once and left alone quietly goes stale. i wanted a forecaster that keeps running on fresh data and reports when it stops being trustworthy.",
      inside:
        "a daily GitHub Actions job pulls Geod'Air measurements for ~90 station/pollutant series in PACA, XGBoost forecasts 24 h ahead recursively, every past forecast is scored against the real measurements, Evidently checks for drift and opens an issue, and a static page goes out to Hugging Face. 41 pytest tests run on every push.",
      learning:
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
    what: "reads the emotion on a face, then finds and summarizes the reviews that explain it.",
    tech: ["ResNet-50", "FAISS", "LangChain", "Flan-T5", "RoBERTa", "Streamlit"],
    thumbnail: {
      src: "/projects/emotion-rag.webp",
      alt: "the Streamlit app: a photo of a smiling face uploaded for emotion detection",
    },
    link: "https://github.com/JayaSaiKishore7/Emotion_RAG_Application",
    demo: "https://emotionragapp-2.streamlit.app/",
    notes: {
      why: "an emotion label on its own doesn't say why someone feels that way. i wanted to connect a detected emotion to the feedback behind it.",
      inside:
        "a ResNet-50 fine-tuned on FER-2013 labels the face, the emotion becomes a query, FAISS pulls the 4 closest of 500 reviews, Flan-T5 summarizes them and RoBERTa scores each review's sentiment, all in a Streamlit app.",
      learning:
        "the overall score hid the weak classes: 62% accuracy, but disgust, the rarest class, was right only 2 times out of 55, and none of the reviews ended up labelled disgust. per-class results told me more than the headline number.",
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
    what: "97.15% test accuracy, after augmentation first made it worse.",
    tech: ["TensorFlow", "Keras", "CNN", "Flask"],
    thumbnail: {
      src: "/projects/brain-tumor.webp",
      alt: "confusion matrix on the test set: nearly all scans fall on the diagonal for glioma, meningioma, no tumor and pituitary",
    },
    link: "https://github.com/JayaSaiKishore7/brain-tumor-classifier",
    notes: {
      why: "a basic CNN trained from scratch needed augmentation to generalize, but natural-photo-strength augmentation distorted the exact regions MRI diagnosis depends on.",
      inside:
        "four conv/pool blocks, mild rotation/zoom/brightness augmentation tuned specifically for MRI, trained with early stopping and checkpointing.",
      learning:
        "the first augmentation pass dropped accuracy to 92.5%. turning the strength down to roughly a third fixed it and beat the no-augmentation baseline on every class.",
    },
    proof: "97.15% test accuracy, 94.3% meningioma F1, documented end to end in the README.",
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
      why: "long PDFs blow past context windows, and an LLM answering from memory drifts from the source. i wanted answers grounded in the actual pages.",
      inside:
        "the PDF is split into 1,000-character chunks with 200 overlap, embedded with MiniLM into a ChromaDB store per user session, and the 3 closest chunks go to Gemini 2.0 Flash, which answers from that context only.",
      learning: "chunk size and overlap mattered more to answer quality than which LLM wrote the answer.",
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
      why: "most demos stop at one-step-ahead forecasts, which hide how error compounds. i wanted a model that still held up 96 steps out.",
      inside:
        "exponential smoothing, SARIMA, random forest, XGBoost, SVR, MLP and LSTM are compared with TimeSeriesSplit on lag, rolling and calendar features. the weighted nearest neighbours method (Talavera-Llames et al., 2016) is implemented from the paper as an installable R package.",
      learning: "recursive multi-step forecasting punishes small early errors, feature engineering mattered more than model choice.",
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
      why: "a model sitting in a notebook doesn't help anyone. i wanted the prediction to be one form-submit away.",
      inside:
        "15,000 clinical records are cleaned down to 10,471, then random forest and XGBoost are compared; XGBoost won (0.993 vs 0.983 AUC) and ships behind a FastAPI endpoint.",
      learning: "the feature-engineering pass moved the needle more than swapping algorithms did.",
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
