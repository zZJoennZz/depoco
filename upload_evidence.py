import os
from google import genai
from supabase import create_client
from dotenv import load_dotenv

# Load and sanitize environment variables
load_dotenv()
GEMINI_KEY = os.getenv("GEMINI_API_KEY").strip()
SUPA_URL = os.getenv("SUPABASE_URL").strip()
SUPA_KEY = os.getenv("SUPABASE_KEY").strip()

# Initialize Clients
gen_client = genai.Client(api_key=GEMINI_KEY)
supabase = create_client(SUPA_URL, SUPA_KEY)

# The "Evidence Locker"
evidences = [
    {
        "title": "Surgical Sponge Count",
        "content": "14:45 - Scrub nurse reports 4x4 gauze sponge missing. Dr. Aris notified. Search performed. Nurse later stated count 'resolved' without X-ray confirmation.",
        "metadata": {"type": "Surgical Log", "doctor": "Aris"}
    },
    {
        "title": "Pharmacy Allergy Alert",
        "content": "09:00 - Pre-op order for Cefazolin CANCELLED. System alert: Patient has documented severe Penicillin allergy. No alternative antibiotic was ordered by surgical team.",
        "metadata": {"type": "Pharmacy Record", "doctor": "N/A"}
    },
    {
        "title": "Post-Op Recovery Vitals",
        "content": "18:30 - Patient BP 85/50. Heart rate 115. Signs of internal hemorrhage noted. Paged Dr. Aris. No response received until 19:15.",
        "metadata": {"type": "Nursing Note", "doctor": "Aris"}
    }
]

def ingest_data():
    for ev in evidences:
        print(f"Processing: {ev['title']}...")
        
        try:
            # 1. Generate the 768-dimension embedding
            # Using 'models/embedding-001' to match your dimension requirements
            emb_res = gen_client.models.embed_content(
                model="gemini-embedding-001",
                contents=ev['content'],
                config={'task_type': 'RETRIEVAL_DOCUMENT'}
            )
            vector = emb_res.embeddings[0].values

            # 2. Insert into Supabase
            supabase.table("documents").insert({
                "title": ev['title'],
                "content": ev['content'],
                "embedding": vector,
                "metadata": ev['metadata']
            }).execute()
            
            print(f"✅ Successfully indexed: {ev['title']}")

        except Exception as e:
            print(f"❌ Error indexing {ev['title']}: {e}")

if __name__ == "__main__":
    ingest_data()