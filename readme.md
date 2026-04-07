# 📜 depoco: Medical Malpractice AI Assistant

**depoco** is a real-time Retrieval-Augmented Generation (RAG) backend designed for plaintiff attorneys. It listens to live testimony and instantly cross-references it against a vector database of medical records to identify contradictions and suggest "Gotcha" questions.

---

## 🚀 Features

* **Real-Time Semantic Search:** Converts transcript chunks into 768-dimension embeddings using **Gemini embedding-001**.
* **Contradiction Engine:** Powered by **Gemini 2.0 Flash** to analyze testimony vs. evidence.
* **Vectorized Memory:** Uses **Supabase (pgvector)** to store and retrieve surgical logs, nursing notes, and pharmacy records.
* **Attorney-Centric Output:** Delivers suggestions in a structured *Question | Backup | Citation* format.

---

## 🛠️ Technical Stack

* **Backend:** FastAPI (Python 3.10+)
* **AI Stack:** * `gemini-embedding-001`
    * `gemini-2.0-flash` (Inference)
* **Database:** Supabase + pgvector
* **SDK:** `google-genai`

---

## 📦 Installation & Setup

### 1. Environment Configuration
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
```

### 2. Database Schema
Run this in the Supabase SQL Editor to align the table with the depoco logic:
```sql
-- Setup the evidence store
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text,
  content text,
  metadata jsonb,
  embedding vector(768) -- Optimized for Gemini
);

-- The match_evidence function
CREATE OR REPLACE FUNCTION match_evidence (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (id uuid, title text, content text, metadata jsonb, similarity float)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT id, title, content, metadata, 1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
```

---

## 🚦 API Endpoints
POST /suggest-question
The core engine of depoco.

Request Body:
```json
{
  "text": "Dr. Aris, you testified that the count was correct before closure?",
  "session_id": "depo_001"
}
```

## ⚖️ Legal Disclaimer
depoco is a tool to assist legal professionals. It does not provide legal advice. All AI-generated suggestions should be verified against the primary evidence before being used in a legal proceeding.