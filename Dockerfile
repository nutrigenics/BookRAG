FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements_bookrag.txt .
RUN pip install --no-cache-dir -r requirements_bookrag.txt

# Copy source code
COPY api ./api
COPY lightrag ./lightrag

# Copy Split Data and Reassemble
COPY bookrag_data.part_* ./
RUN cat bookrag_data.part_* > bookrag_data.tar.gz && \
    tar -xzf bookrag_data.tar.gz && \
    rm bookrag_data.tar.gz bookrag_data.part_*

# Expose API port (Documentary only)
EXPOSE 8080

# Start command
# Use shell form to allow variable expansion for $PORT
# DigitalOcean App Platform defaults to port 8080 or sets $PORT
CMD uvicorn api.api_server:app --host 0.0.0.0 --port ${PORT:-8080}
