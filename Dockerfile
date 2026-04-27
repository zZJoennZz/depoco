# 1. Use a lightweight Python image
FROM python:3.11-slim

# 2. Set the working directory in the container
WORKDIR /app

# 3. Copy requirements first (leverages Docker caching for faster builds)
COPY requirements.txt .

# 4. Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the rest of your backend code
COPY . .

# 6. Expose the port (informative only, Cloud Run/Render use $PORT)
EXPOSE 8000

# 7. Start the server
# We bind to 0.0.0.0 so it's accessible externally
# We use the $PORT environment variable provided by the host
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}