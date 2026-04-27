import httpx
import asyncio
import os

async def terminal_client():
    # Ensure this matches your live FastAPI port
    base_url = "http://127.0.0.1:8000"
    
    print("--- Depoco System Tester ---")
    print("Commands: '1' for Suggestion, '2' for Upload PDF, 'exit' to quit\n")

    async with httpx.AsyncClient() as client:
        while True:
            mode = input("Select Mode [1/2/exit]: ").strip()

            if mode.lower() == 'exit':
                break

            # MODE 1: Suggest Follow-up Question
            if mode == '1':
                testimony = input("\nWitness Testimony > ")
                payload = {
                    "text": testimony,
                    "session_id": "cli-test-session" # Optional in backend, but good for logs
                }
                
                try:
                    res = await client.post(f"{base_url}/suggest-question", json=payload, timeout=60.0)
                    if res.status_code == 200:
                        data = res.json()
                        print(f"\nAI SUGGESTION:\n{data['suggestion']}\n")
                        print(f"Sources found: {len(data['evidence_used'])}")
                    else:
                        print(f"Error {res.status_code}: {res.text}")
                except Exception as e:
                    print(f"Request failed: {e}")

            # MODE 2: Ingest PDF Document
            elif mode == '2':
                file_path = input("\nEnter path to PDF (e.g., records.pdf) > ").strip()
                if not os.path.exists(file_path):
                    print("File not found locally.")
                    continue

                print(f"Uploading and vectorizing {file_path}...")
                try:
                    with open(file_path, "rb") as f:
                        files = {"file": (os.path.basename(file_path), f, "application/pdf")}
                        res = await client.post(f"{base_url}/ingest-document", files=files, timeout=120.0)
                    
                    if res.status_code == 200:
                        print(f"Success! {res.json()['chunks_processed']} chunks vectorized to Supabase.\n")
                    else:
                        print(f"Error {res.status_code}: {res.text}")
                except Exception as e:
                    print(f"Upload failed: {e}")

if __name__ == "__main__":
    try:
        asyncio.run(terminal_client())
    except KeyboardInterrupt:
        pass