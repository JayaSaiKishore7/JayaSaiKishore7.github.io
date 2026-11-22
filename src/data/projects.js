// Projects, in display order. Each one is a row in the home page's work list
// (WorkList) and gets a case study page (/work/<id>/, see src/routes.js)
// whose body is built from `caseStudy`, in 8 sections:
//   caseStudy.problem       what problem it solves
//   caseStudy.users         who it's for
//   caseStudy.solution      what i personally built (for team projects, only my part)
//   caseStudy.architecture  { steps: [{ name, detail }] }; air-quality uses its
//                           interactive diagram (`architecture`) instead
//   caseStudy.decisions     the key technical decision and why
//   caseStudy.evaluation    { summary, points: [] }; `highlights` (max 2 stat
//                           cards) sit at its top
//   caseStudy.limitations   [] what doesn't work (yet)
//   caseStudy.outcome       where it ended up
// `proof` is the headline result for the page's meta description (head.js).
//
// Fields: domain = the small mono line above the title in the work list;
// listLine = the work list's one-line description (no metrics or percentages);
// runsOn = how it's deployed (after the domain); filters = the work list's
// filter chips it belongs to (cv, rag, forecasting, classic; see WorkList);
// pipeline = its steps from data to deployment (the work list's pipeline/);
// what = the one-line description on the case study page; tech = tools shown as tags;
// thumbnail = image in public/projects/ (960×600 WebP), or null to draw one
// from `frag`; demo = live demo URL, if any; huggingface = the project's page on
// Hugging Face (a Space, model or dataset), if any; team = built as a team.
//
// Style: sentences start lowercase; names of tools, datasets and organisations keep their capitals.
export const projects = [
  {
    id: "air-quality",
    domain: "forecasting · mlops",
    listLine: "forecasts the next 24 hours from live government data every morning, then scores itself against what actually happened.",
    runsOn: "daily · github actions",
    filters: ["forecasting"],
    pipeline: ["Geod'Air", "features", "XGBoost", "drift check", "live page"],
    title: "Air Quality Forecasting Platform",
    what: "forecasts the next 24 hours from live government data every morning, then scores itself against what actually happened.",
    tech: ["Python", "XGBoost", "Evidently", "FastAPI", "GitHub Actions", "Hugging Face", "MLflow", "Docker", "Streamlit", "LSTM", "GRU"],
    thumbnail: {
      src: "/projects/air-quality.webp",
      alt: "the live forecast page: a station map of Provence-Alpes-Côte d'Azur and a chart of measured vs. forecast NO₂",
    },
    link: "https://github.com/JayaSaiKishore7/AirQuality_AnalysisFR",
    demo: "https://jayasaikishore-airquality-paca.static.hf.space/",
    huggingface: "https://huggingface.co/spaces/JayaSaiKishore/airquality-paca",
    caseStudy: {
      problem:
        "a forecasting model trained once and left alone quietly goes stale, and nobody notices until its forecasts are wrong. PACA's air quality needed a forecaster that keeps running on fresh data and reports when it stops being trustworthy.",
      solution:
        "the whole system, solo: a daily GitHub Actions job (with a backup runner on my PC) that runs the tests first, pulls Geod'Air measurements for ~90 station/pollutant series, builds leakage-safe features and forecasts 24 h ahead recursively with XGBoost. it scores every past forecast against what was measured, runs Evidently drift checks that open a GitHub issue, publishes a static page on Hugging Face and checks that the live page shows the new forecast. plus a FastAPI service, a Streamlit dashboard and 51 pytest tests, with CI and a protected main branch.",
      decisions:
        "i compared Random Forest and XGBoost on a chronological 80/20 split, so the model is always tested on days after the ones it learned from, and tried LSTM and GRU in a separate notebook. i shipped XGBoost, not the Random Forest, even though the forest scored slightly better (1-hour MAE 3.66 vs 3.69). the forest is 278 MB and XGBoost is 4.8 MB, small enough to run in a free daily job and deploy without paid hosting.",
      users:
        "people in provence-alpes-côte d'azur who plan time outdoors around pollution, and analysts who need a forecast they can trust day after day, not just on the day it was trained.",
      // architecture: this project's interactive diagram (`architecture` below).
      evaluation: {
        summary: "scored against what was actually measured, every day.",
        points: [
          "over 20 daily forecasts (16 oct – 4 nov 2026, 40,871 scored values), 24-hour forecasts had 26% lower error than persistence, and beat it on 18 of the 20 days.",
          "by pollutant: 30% lower error on pm10, 29% on no₂, 27% on o₃.",
          "leakage-free 1-hour mae of 3.69 after fixing a feature that included the hour being predicted (3.42 was too good to be true).",
          "51 pytest tests run before every daily forecast.",
        ],
      },
      limitations: [
        "pm2.5 gains only 10%, and on 2 of the 20 days the forecast did worse than persistence.",
        "the drift alarm fired every day at first, because live data was compared with the whole year; a same-season, same-station reference cut the drift share from 0.67 to 0.56.",
        "a 12-day gap with no forecasts (5–16 nov) showed the pipeline needed failure alerts; it now opens an issue, falls back to a backup runner and warns visitors when a forecast is over 36 hours old.",
      ],
      outcome:
        "a forecast that publishes itself every morning on a free hugging face page, grades itself in public and raises an issue when data drifts or a run fails, at no hosting cost.",
    },
    // Top of the evaluation section: at most 2 headline results.
    highlights: [
      { value: "26%", label: "lower error than persistence, 24-hour forecasts" },
      { value: "18 / 20", label: "days better than persistence" },
    ],
    // The page's meta description (head.js).
    proof:
      "over 20 daily forecasts (16 Oct – 4 Nov 2026, 40,871 scored values), its 24-hour forecasts had 26% lower error than persistence (30% on PM10, 29% on NO₂, 27% on O₃) and beat it on 18 of the 20 days.",
    // Drawn by ArchitectureDiagram on the case study page. Nodes sit on a grid
    // (col, row); edges are [from, to, options] and run along a row or a column.
    architecture: {
      caption:
        "top: the daily pipeline on GitHub Actions. bottom: training and serving, run locally with Docker Compose. hover or tab through the steps for details.",
      groups: [
        { label: "daily · GitHub Actions, 04:30 UTC (PC backup)", from: [1, 0], to: [4, 0] },
        { label: "local · Docker Compose", from: [1, 2], to: [4, 2] },
      ],
      nodes: [
        { id: "geodair", col: 0, row: 0, title: "Geod'Air", sub: "hourly measurements", detail: "the French national air quality database: hourly values for ~90 station/pollutant series in PACA." },
        { id: "fetch", col: 1, row: 0, title: "fetch", sub: "tests, then download", detail: "the run starts with the test suite; if it passes, fetch_geodair.py downloads the latest measurements, backfills any missed days and cleans them." },
        { id: "forecast", col: 2, row: 0, title: "forecast", sub: "XGBoost, 24 h", detail: "make_forecasts.py predicts the next 24 hours recursively, one hour at a time, feeding each prediction back in as the next hour's input." },
        { id: "monitor", col: 3, row: 0, title: "monitor", sub: "drift + skill", detail: "monitor_drift.py scores past forecasts against what was measured, and Evidently compares live data with a same-season, same-station reference." },
        { id: "site", col: 4, row: 0, title: "build page", sub: "static HTML", detail: "build_site.py renders the station map and charts (Plotly) into one static page." },
        { id: "hf", col: 5, row: 0, title: "Hugging Face", sub: "live page", detail: "the page is published to a free Hugging Face Space: this is the live demo." },
        { id: "issue", col: 3, row: 1, title: "GitHub issue", sub: "on drift or failure", detail: "detected drift, or any failure in the daily run, opens a GitHub issue automatically. a failed run leaves the previous page online." },
        { id: "verify", col: 5, row: 1, title: "verify", sub: "live page = new build", detail: "check_deployed_page.py confirms the live page really shows the new forecast. the page itself shows an out-of-date banner if its forecast is more than 36 hours old." },
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
        ["hf", "verify"],
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
    domain: "computer vision · rag",
    listLine: "detects the emotion on a face, then retrieves the closest matching reviews and scores their sentiment.",
    runsOn: "streamlit cloud",
    filters: ["cv", "rag"],
    pipeline: ["face", "OpenCV crop", "ResNet-50", "FAISS", "reviews"],
    title: "Emotion-Aware Insight Generator",
    what: "reads the emotion on a face, then finds the customer reviews that explain it and scores their sentiment.",
    tech: ["ResNet-50", "OpenCV", "FAISS", "LangChain", "RoBERTa", "Streamlit"],
    thumbnail: {
      src: "/projects/emotion-rag.webp",
      alt: "the Streamlit app: a photo of a smiling face uploaded for emotion detection",
    },
    link: "https://github.com/JayaSaiKishore7/Emotion_RAG_Application",
    demo: "https://emotionragapplication-dmj76csbefwfku6hgnchkt.streamlit.app/",
    caseStudy: {
      problem:
        "an emotion label on its own doesn't say why someone feels that way. the app connects a detected emotion to the customer feedback behind it.",
      solution:
        "all of it, solo: a ResNet-50 fine-tuned on FER-2013, an OpenCV face crop so the model sees the largest face, a FAISS index of 500 reviews (via LangChain) that returns the 4 closest to the detected emotion, RoBERTa sentiment scores for each review, and the Streamlit app that ties it together. CI lints and smoke-tests every push and only then promotes it to the live app, so a broken commit never goes live.",
      decisions:
        "i fine-tuned ResNet-50 rather than a vision transformer: with ~28,700 training images, a proven CNN trains faster and needs less data than a ViT. the vector search stays local in FAISS, because 500 reviews don't need a hosted database.",
      users:
        "product and customer-experience teams who want to see what customers actually say when they feel a certain way, instead of an emotion label on its own.",
      architecture: {
        steps: [
          { name: "upload", detail: "the visitor uploads a photo in the streamlit app." },
          { name: "face crop", detail: "opencv finds the largest face and crops it." },
          { name: "emotion", detail: "a resnet-50 fine-tuned on fer-2013 predicts one of 7 emotions." },
          { name: "retrieval", detail: "langchain queries a local faiss index of 500 reviews and returns the 4 closest to the emotion." },
          { name: "sentiment", detail: "roberta scores the sentiment of each retrieved review." },
          { name: "app + ci", detail: "ci lints and smoke-tests every push and only then promotes it to the live app." },
        ],
      },
      evaluation: {
        summary: "measured per class, not only overall.",
        points: [
          "62.2% accuracy on the 3,589-image fer-2013 test set.",
          "happiness is the strongest class at 89%.",
          "disgust, the rarest class, was right only 2 times out of 55.",
        ],
      },
      limitations: [
        "disgust and fear remain weak classes.",
        "flan-t5 copied the reviews word for word under every prompt tried, and larger models don't fit in streamlit cloud's memory, so summaries were replaced with a plain sentiment count.",
        "a rebuild once broke with no code change because a loosely pinned dependency stopped installing; all ~120 packages are now locked.",
      ],
      outcome:
        "a live demo that links a face's emotion to real customer feedback, deployed so that a broken commit never reaches users.",
    },
    highlights: [
      { value: "62.2%", label: "accuracy on the fer-2013 test set" },
      { value: "89%", label: "accuracy on happiness" },
    ],
    proof: "62.2% accuracy on the 3,589-image FER-2013 test set (happiness 89%), with a live Streamlit demo.",
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
    domain: "computer vision",
    listLine: "a CNN that runs in your browser, so scans never leave your device.",
    runsOn: "hugging face · in-browser",
    filters: ["cv"],
    pipeline: ["MRI scan", "augment", "CNN", "ONNX", "browser"],
    title: "Brain Tumor MRI Classifier",
    what: "97.53% test accuracy, after augmentation first made it worse. it runs in your browser, so scans never leave your device.",
    tech: ["TensorFlow", "Keras", "ONNX Runtime Web", "Flask", "Playwright", "Hugging Face"],
    thumbnail: {
      src: "/projects/brain-tumor.webp",
      alt: "confusion matrix on the test set: nearly all scans fall on the diagonal for glioma, meningioma, no tumor and pituitary",
      // A result, not a screenshot: shown in the case study's evaluation section.
      section: "evaluation",
    },
    link: "https://github.com/JayaSaiKishore7/brain-tumor-classifier",
    demo: "https://jayasaikishore-brain-tumor-classifier.static.hf.space/",
    huggingface: "https://huggingface.co/spaces/JayaSaiKishore/brain-tumor-classifier",
    caseStudy: {
      problem:
        "sorting brain MRI slices into glioma, meningioma, pituitary tumor or no tumor, using a small dataset (7,023 images) and a CNN trained from scratch, with no pretrained weights to lean on.",
      solution:
        "everything, solo: the CNN (four conv/pool blocks, 1.3M parameters, trains on a CPU), augmentation tuned for MRI, and training with early stopping and checkpointing. the public site is a free static Hugging Face Space where the model runs in the visitor's browser, plus a Flask version with a JSON API and Grad-CAM support. CI runs lint, tests and real predictions in a headless browser on every pull request, and the live site is checked every 6 hours.",
      decisions:
        "i run the model in the visitor's browser (ONNX Runtime Web) instead of on a server: hosting is free, there's no cold start, and scans never leave the device. the risk was train/serve skew, so i ported Pillow's resize to JavaScript: on 30 full-size scans the browser's model inputs are pixel-identical to Python's, and the predictions match. i also tried transfer learning: EfficientNetB0 with ImageNet weights, on the same split, was slightly better on validation (96.96%) and slightly worse on test (96.77% vs 97.53%). every gap is a handful of images, within run-to-run noise, so there's no evidence it's better, and the simpler CNN stays.",
      users:
        "students and researchers exploring mri classification, and anyone who wants to try a scan without uploading it anywhere. it is a learning project, not a clinical tool.",
      architecture: {
        steps: [
          { name: "upload", detail: "the scan is chosen in the browser and never leaves the device." },
          { name: "preprocess", detail: "pillow's resize, ported to javascript, so browser inputs match python's pixel for pixel." },
          { name: "cnn", detail: "a 1.3m-parameter cnn (four conv/pool blocks) runs in onnx runtime web." },
          { name: "prediction", detail: "probabilities for glioma, meningioma, pituitary tumor or no tumor." },
          { name: "flask version", detail: "a separate flask app offers a json api and grad-cam." },
          { name: "checks", detail: "ci runs real predictions in a headless browser on every pull request; the live site is checked every 6 hours." },
        ],
      },
      evaluation: {
        summary: "tested on scans the model never saw.",
        points: [
          "97.53% test accuracy on 1,054 held-out scans.",
          "95.6% meningioma f1; the most common error is a glioma read as meningioma (9 of 243).",
          "efficientnetb0 with imagenet weights reached 96.77% on the same split, a gap within run-to-run noise, so the simpler cnn stays.",
          "on 30 full-size scans, browser inputs are pixel-identical to python's and the predictions match.",
        ],
      },
      limitations: [
        "not clinically validated, and not meant for diagnosis.",
        "the first augmentation pass hurt accuracy (95.83% → 92.50%) because mri orientation and intensity carry signal; augmentation had to be cut to about a third.",
        "a small dataset (7,023 images) trained from scratch, so small differences between models are not meaningful.",
      ],
      outcome:
        "a free, private classifier that runs entirely in the browser, with no server, no cold start and automated checks on every change.",
    },
    highlights: [
      { value: "97.53%", label: "test accuracy on 1,054 held-out scans" },
      { value: "95.6%", label: "meningioma f1" },
    ],
    proof: "97.53% test accuracy on 1,054 held-out scans and 95.6% meningioma F1. the most common error: a glioma read as meningioma (9 of 243).",
    frag: {
      file: "brain-tumor-classifier / web/static/js/preprocess.js",
      code: `const w = bicubic((x + xmin - center + 0.5) * ss);
k[x] = w;
ww += w;`,
    },
  },
  {
    id: "rag-pdf",
    domain: "llms · rag",
    listLine: "answers questions about an uploaded PDF from the passages it retrieves, not from memory.",
    runsOn: "flask",
    filters: ["rag"],
    pipeline: ["PDF", "chunks", "MiniLM", "ChromaDB", "answer"],
    title: "PDF Question Answering with RAG",
    what: "answers questions about an uploaded PDF from the passages it retrieves, not from memory.",
    tech: ["LangChain", "ChromaDB", "MiniLM", "Gemini", "Flask"],
    thumbnail: null,
    link: "https://github.com/JayaSaiKishore7/RagPdfSummarizer",
    caseStudy: {
      problem:
        "long PDFs overflow an LLM's context window, and an LLM answering from memory drifts away from the source. answers need to come from the actual pages.",
      solution:
        "the whole app, solo: a Flask upload flow, text extraction with pypdf, 1,000-character chunks with 200 overlap, MiniLM embeddings in ChromaDB, retrieval of the 3 closest chunks, and a Gemini 2.0 Flash prompt that answers from that context only.",
      decisions:
        "i gave each browser session its own upload folder and vector store, so one visitor's document can never show up in another visitor's answers. chunks are hashed (MD5), so duplicates are only embedded once.",
      users:
        "students, researchers and anyone who needs answers from a long pdf with the source passages behind them, not a model's memory.",
      architecture: {
        steps: [
          { name: "upload", detail: "flask accepts pdf files only, up to 16 mb, into a per-session folder." },
          { name: "extract", detail: "pypdf reads the text layer." },
          { name: "chunk", detail: "1,000-character chunks with 200 overlap; md5 hashes skip duplicates." },
          { name: "embed + store", detail: "minilm embeddings in a chromadb store that belongs to that session only." },
          { name: "retrieve", detail: "the 3 closest chunks to the question." },
          { name: "answer", detail: "gemini 2.0 flash answers from that context only." },
        ],
      },
      evaluation: {
        summary: "no formal benchmark yet.",
        points: [
          "answers were checked by hand against the retrieved source passages.",
          "chunk size and overlap changed answer quality more than which llm wrote the answer.",
        ],
      },
      limitations: [
        "scanned pdfs return nothing: pypdf only reads a text layer, so ocr is needed.",
        "there is no evaluation set yet, so quality is not measured with a number.",
        "chunk size and overlap are still being tuned.",
      ],
      outcome: "a private document q&a app where each visitor's pdf stays isolated from everyone else's.",
    },
    highlights: [], // no measured result yet
    proof: "served through a Flask app with a separate vector store per session, PDF-only uploads and a 16 MB size limit.",
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
    domain: "forecasting",
    listLine: "forecasts a full day of 15-minute load (96 steps), and rebuilds a research algorithm as an R package.",
    runsOn: "python + R",
    filters: ["forecasting"],
    pipeline: ["load data", "features", "SARIMA · LSTM", "96 steps", "R package"],
    title: "Electricity Load Forecasting (Time Series)",
    what: "forecasts a full day of 15-minute load (96 steps), and rebuilds a research algorithm as an R package.",
    tech: ["scikit-learn", "XGBoost", "SARIMA", "LSTM", "R"],
    thumbnail: null,
    link: "https://github.com/JayaSaiKishore7/Time_Series_Electricity_Forecasting",
    caseStudy: {
      problem:
        "a building's next day of electricity use, in 15-minute steps (96 of them). most demos stop at one-step-ahead forecasts, which hide how errors build up over a long horizon.",
      solution:
        "all of it, solo: lag, rolling and calendar features; a benchmark from naive baselines through ETS, SARIMA, random forest, XGBoost, SVR, MLP and LSTM under TimeSeriesSplit; the final 96-step forecast; and the weighted nearest neighbours method (Talavera-Llames et al., 2016), rebuilt from the paper as an installable R package with roxygen docs and a vignette.",
      decisions:
        "alongside the trained models, i implemented weighted nearest neighbours. instead of fitting parameters, it finds the past windows that most resemble the latest 96 readings and averages what came next, weighted by closeness (k = 10), so every forecast traces back to real past days.",
      users:
        "building and energy managers who plan a day ahead, and forecasters who need to see how errors grow over a long horizon.",
      architecture: {
        steps: [
          { name: "data", detail: "a building's electricity load in 15-minute steps." },
          { name: "features", detail: "lags, rolling statistics and calendar features." },
          { name: "benchmark", detail: "naive baselines, ets, sarima, random forest, xgboost, svr, mlp and lstm under timeseriessplit." },
          { name: "forecast", detail: "a recursive 96-step (one day) forecast." },
          { name: "wnn package", detail: "weighted nearest neighbours (talavera-llames et al., 2016) rebuilt as an installable r package with docs and a vignette." },
        ],
      },
      evaluation: {
        summary: "a wide benchmark, with an honest caveat.",
        points: [
          "svr had the lowest validation mae (6.80 kw); sarima the highest (15.96 kw).",
          "feature engineering mattered more than the choice of model for the 96-step horizon.",
        ],
      },
      limitations: [
        "not every model was scored on the same folds, so the ranking is only rough.",
        "recursive forecasting compounds small early errors over 96 steps.",
        "how far the horizon can stretch before errors grow too much is still being tested.",
      ],
      outcome: "a working day-ahead forecast and a reusable, documented r package that others can install.",
    },
    highlights: [
      { value: "6.80 kW", label: "lowest validation mae (svr)" },
      { value: "96", label: "steps forecast ahead (one day)" },
    ],
    proof: "a final 96-step forecast, plus the wnnforecast R package with roxygen docs and a vignette.",
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
    domain: "classic ml",
    listLine: "risk prediction with a web form to act on it.",
    runsOn: "fastapi",
    filters: ["classic"],
    pipeline: ["records", "features", "XGBoost", "FastAPI", "web form"],
    team: true,
    title: "Machine Learning for Diabetes Risk Prediction",
    what: "96% accuracy, 0.993 AUC, and a web form to act on it.",
    tech: ["XGBoost", "Random Forest", "FastAPI"],
    thumbnail: null,
    link: "https://github.com/JayaSaiKishore7/diabetes_prediction",
    caseStudy: {
      problem:
        "predicting whether a patient is diabetic from eight clinical measurements. a model sitting in a notebook doesn't help anyone, so the prediction had to be one form-submit away.",
      solution:
        "team project. my part: the random forest and XGBoost models trained on the team's cleaned data (15,000 records cleaned down to 10,471), the comparison between them, and the FastAPI web form that returns a diabetes probability.",
      decisions:
        "i saved the scaler next to the model and run every form input through it before predicting, exactly as in training, so the web form sees the same features the model learned from. the app won't start if either file is missing.",
      users:
        "health-screening teams who want a quick risk estimate from routine measurements, as a decision aid, not a diagnosis.",
      architecture: {
        steps: [
          { name: "data", detail: "15,000 records, cleaned by the team down to 10,471." },
          { name: "models", detail: "random forest and xgboost trained and compared (my part)." },
          { name: "artifacts", detail: "the scaler is saved next to the model; the app refuses to start without both." },
          { name: "web form", detail: "fastapi runs every input through the same scaler and returns a diabetes probability." },
        ],
      },
      evaluation: {
        summary: "two models compared on held-out records.",
        points: [
          "xgboost: 0.993 auc and 96.1% accuracy on 2,095 held-out records.",
          "xgboost beat the random forest: 0.993 vs 0.983 auc, and 0.926 vs 0.906 f1 on the diabetic class.",
        ],
      },
      limitations: [
        "the two notebooks split the data differently, so the model comparison is close rather than exact.",
        "a team project: my part was the models, their comparison and the web app.",
        "not clinically validated.",
      ],
      outcome:
        "a working web form that turns eight clinical measurements into a diabetes probability, with exactly the preprocessing used in training.",
    },
    highlights: [
      { value: "0.993", label: "auc on 2,095 held-out records" },
      { value: "96.1%", label: "accuracy" },
    ],
    proof: "0.993 AUC and 96.1% accuracy on 2,095 held-out records.",
    frag: {
      file: "diabetes-prediction / models/XGBClassifier.ipynb",
      code: `xgb_model = XGBClassifier()
xgb_model.fit(X_train, y_train)
y_proba = xgb_model.predict_proba(X_test)[:, 1]`,
    },
  },
];
