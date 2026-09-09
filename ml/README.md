# CampusPulse AI - Machine Learning Microservice

Production-grade Machine Learning microservice built with **FastAPI** and **Hugging Face Transformers**. Provides real-time inference for complaint classification, urgency detection, duplicate ticket detection, named entity recognition, sentiment analysis, opinion mining, and executive summarization.

---

## 🧠 Pretrained Hugging Face Models

All models used in this service are 100% open-source pretrained models hosted on Hugging Face (no fine-tuning or custom training required):

| Task | Pretrained Model | Primary Purpose |
| :--- | :--- | :--- |
| **Complaint Classification** | `facebook/bart-large-mnli` | Zero-shot topic classification across campus departments |
| **Urgency Detection** | `facebook/bart-large-mnli` + Rule Booster | NLI-based urgency evaluation (`low`, `medium`, `high`, `critical`) |
| **Duplicate Detection** | `sentence-transformers/all-MiniLM-L6-v2` | Dense 384-d semantic sentence embeddings and cosine similarity |
| **Sentiment Analysis** | `cardiffnlp/twitter-roberta-base-sentiment-latest` | Tri-class polarity classification (`positive`, `neutral`, `negative`) |
| **Named Entity Recognition (NER)**| `dslim/bert-base-NER` | Campus locations, personnel, blocks, and departmental bodies |
| **Executive Summarization** | `facebook/bart-large-cnn` | Abstractive summarization for administrative digests |

---

## 🚀 Key Features

1. **Complaint Category Prediction**: Maps freeform student grievances to campus departments (IT, Hostel, Cafeteria, Sanitation, Academics, etc.) using Zero-Shot NLI.
2. **Urgency Detection**: Detects safety emergencies, hazardous situations (fire, short circuits, water issues), and urgency levels.
3. **Duplicate Complaint Detection**: Computes semantic similarity against existing open complaints to avoid duplicate tickets.
4. **Named Entity Recognition (NER)**: Extracts room numbers, hostel blocks, personnel mentions, and campus departments.
5. **Sentiment Analysis**: Tracks student satisfaction and sentiment polarity (-1.0 to +1.0) with aspect extraction.
6. **Executive Summary Generation**: Summarizes verbose complaint text into concise summaries for department heads.
7. **Opinion Mining**: Analyzes student poll comments, aggregate sentiment distribution, and emerging campus issues.

---

## ⚡ In-Memory Caching & Performance

- **Thread-safe Multi-tier Cache**: Powered by `cachetools` (TTLCache and LRUCache).
- **Deterministic Key Hashing**: SHA-256 hash digests of text queries prevent redundant neural network forward passes for recurring or identical texts.
- **Lazy Loading**: Models are loaded on-demand by default to enable fast container cold-starts, with an optional `EAGER_LOAD_MODELS=true` toggle.

---

## 📡 API Endpoints

### 1. `POST /classify`
Classifies complaint text into department categories and assesses urgency.

**Request:**
```json
{
  "title": "Wi-Fi not working in Hostel Block B",
  "text": "The router on the second floor has been blinking red since yesterday morning. We cannot submit assignments."
}
```

**Response:**
```json
{
  "category": "IT Infrastructure & Wi-Fi",
  "confidence": 0.9412,
  "urgency": "high",
  "urgency_score": 0.8125,
  "category_scores": [
    { "category": "IT Infrastructure & Wi-Fi", "score": 0.9412 },
    { "category": "Hostel & Residential Life", "score": 0.0418 }
  ],
  "is_emergency": false
}
```

---

### 2. `POST /duplicate-check`
Calculates semantic similarity against existing tickets.

**Request:**
```json
{
  "query": "Wi-Fi is completely broken on the 2nd floor of Block B",
  "corpus": [
    { "id": "complaint-101", "text": "No internet connection in Block B floor 2 router dead", "tracking_code": "CP-2026-001" },
    { "id": "complaint-102", "text": "Water leakage in washroom block A", "tracking_code": "CP-2026-002" }
  ],
  "similarity_threshold": 0.60
}
```

**Response:**
```json
{
  "query": "Wi-Fi is completely broken on the 2nd floor of Block B",
  "matches": [
    {
      "id": "complaint-101",
      "tracking_code": "CP-2026-001",
      "similarity_score": 0.8741,
      "is_duplicate": true
    }
  ],
  "top_match": {
    "id": "complaint-101",
    "tracking_code": "CP-2026-001",
    "similarity_score": 0.8741,
    "is_duplicate": true
  },
  "has_duplicate": true,
  "evaluated_corpus_size": 2
}
```

---

### 3. `POST /sentiment`
Evaluates student feedback polarity and extracts aspects.

**Request:**
```json
{
  "text": "The cafeteria staff resolved the hygiene issue swiftly. The quality of food is remarkably improved!"
}
```

**Response:**
```json
{
  "text": "The cafeteria staff resolved the hygiene issue swiftly. The quality of food is remarkably improved!",
  "sentiment": "positive",
  "polarity": 0.8842,
  "confidence": 0.9421,
  "scores": {
    "positive": 0.9421,
    "neutral": 0.0431,
    "negative": 0.0148
  },
  "key_aspects": ["cafeteria", "hygiene", "quality", "food", "improved"]
}
```

---

### 4. `POST /extract-entities`
Extracts campus locations, facilities, and personnel.

**Request:**
```json
{
  "text": "Please report to Warden Sharma that Room 304 in Hostel Block C has a leaking geyser."
}
```

**Response:**
```json
{
  "entities": [
    { "text": "Hostel Block C", "entity_group": "LOC", "score": 0.99, "start": 48, "end": 62 },
    { "text": "Room 304", "entity_group": "LOC", "score": 0.99, "start": 36, "end": 44 },
    { "text": "Warden Sharma", "entity_group": "PER", "score": 0.9621, "start": 17, "end": 30 }
  ],
  "locations": ["Hostel Block C", "Room 304"],
  "people": ["Warden Sharma"],
  "organizations": []
}
```

---

### 5. `POST /summarize`
Abstractive text summarization.

**Request:**
```json
{
  "text": "Over the past three weeks, students from both North and South campus hostels have repeatedly reported irregular water supply between 7 AM and 9 AM. The maintenance staff inspected the overhead pumps and concluded that pump #2 requires a new motor replacement. Till then, tanker trucks must be dispatched daily.",
  "max_length": 80,
  "min_length": 25
}
```

---

### 6. `POST /feedback-analysis`
Opinion mining on student poll comments.

**Request:**
```json
{
  "topic": "Library Hours Extension",
  "feedbacks": [
    { "text": "Extending library hours till 2 AM is fantastic for mid-term preparations!" },
    { "text": "AC in the reading hall is often too cold or noisy during late hours." }
  ]
}
```

---

## 🛠️ Local Development

```bash
# Navigate to ML directory
cd ml

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI app
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive documentation is available at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 🐳 Docker Deployment

```bash
# Build image
docker build -t campuspulse-ml:latest .

# Run container
docker run -p 8000:8000 campuspulse-ml:latest
```
