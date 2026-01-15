FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements_bookrag.txt .
RUN pip install --no-cache-dir -r requirements_bookrag.txt

# Copy source code
COPY api ./api
COPY lightrag ./lightrag

# Copy Index Data (Books)
COPY bookrag_index_pages_LA_Geografia ./bookrag_index_pages_LA_Geografia
COPY bookrag_index_pages_tabulue_rudolphine ./bookrag_index_pages_tabulue_rudolphine
COPY bookrag_index_pages_tractatus ./bookrag_index_pages_tractatus

# Expose API port
EXPOSE 8000

# Start command
CMD ["uvicorn", "api.api_server:app", "--host", "0.0.0.0", "--port", "8000"]
