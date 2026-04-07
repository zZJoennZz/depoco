import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
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
    session_id: str

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