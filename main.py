import os
import io
from langchain_text_splitters import RecursiveCharacterTextSplitter
import pypdf
from fastapi import UploadFile, File, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
    "https://depoco.vercel.app",
]
# --- CORS CONFIGURATION ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- END ---

gen_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"), http_options={'api_version': 'v1beta'})
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))


class DepoChunk(BaseModel):
    text: str
    session_id: Optional[str] = None

@app.get("/")
async def health_check():
    return {"status": "online", "message": "Depo-Copilot Backend is Live"}

@app.post("/suggest-question")
async def suggest_question(chunk: DepoChunk):
    emb_res = gen_client.models.embed_content(
        model="gemini-embedding-001",
        contents=chunk.text,
        config=genai.types.EmbedContentConfig(task_type="RETRIEVAL_QUERY")
    )

    vector = emb_res.embeddings[0].values

    evidence = supabase.rpc("match_evidence", {
        "query_embedding": vector,
        "match_threshold": 0.3,
        "match_count": 2
    }).execute()

    context_text = "\n".join([f"Evidence: {doc['content']}" for doc in evidence.data])

    prompt = f"""
    You are a Plaintiff Malpractice Attorney's assistant.
    TESTIMONY: {chunk.text}
    EVIDENCE FOUND: {context_text}
    
    Based ONLY on the evidence, give one short follow-up question to expose a contradiction or confirm a fact. 
    Format: Question | Backup | Citation
    """
    
    response = gen_client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=prompt
    )
    
    return {
        "suggestion": response.text,
        "evidence_used": evidence.data
    }

@app.post("/ingest-document")
async def ingest_document(file: UploadFile = File(...)):
    content = await file.read()
    pdf_reader = pypdf.PdfReader(io.BytesIO(content))
    
    full_text = ""
    for page in pdf_reader.pages:
        full_text += page.extract_text() + "\n"

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    chunks = text_splitter.split_text(full_text)

    # 3. Embedding and Storage
    for i, chunk_text in enumerate(chunks):
        # Generate 768-dim vector to match our Supabase schema
        emb_res = gen_client.models.embed_content(
            model="gemini-embedding-001",
            contents=chunk_text,
            config={
                'task_type': 'RETRIEVAL_DOCUMENT',
            }
        )

        # Insert into Supabase
        supabase.table("documents").insert({
            "title": file.filename,
            "content": chunk_text,
            "metadata": {"chunk_index": i, "source": file.filename},
            "embedding": emb_res.embeddings[0].values
        }).execute()

    return {"status": "success", "chunks_processed": len(chunks)}