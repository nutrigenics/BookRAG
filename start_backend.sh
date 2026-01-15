#!/bin/bash

# Navigate to the script's directory
cd "$(dirname "$0")"

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "Virtual environment 'venv' not found! Please create it first."
    exit 1
fi

# Load environment variables just in case
if [ -f .env ]; then
    export $(cat .env | xargs)
fi

# Run the server
# Using port 8000 and binding to all interfaces for external access
# Workers: Keeping at 1 since LightRAG might be slightly memory intensive, but can be increased if needed.
exec uvicorn api.api_server:app --host 0.0.0.0 --port 8000
