#!/bin/bash

# Configuration
export RAG_WORKING_DIR="./bookrag_index_pages_LA_Geografia"
export PORT=8000

# Activate Environment
ENV_NAME="bookrag"

# Check if conda command exists, if not try to find it
if ! command -v conda &> /dev/null; then
    CONDA_PATHS=(
        "$HOME/miniconda3"
        "$HOME/anaconda3"
        "/opt/miniconda3"
        "/opt/anaconda3"
        "/usr/local/miniconda3"
        "/usr/local/anaconda3"
    )
    for path in "${CONDA_PATHS[@]}"; do
        if [ -f "$path/bin/conda" ]; then
            export PATH="$path/bin:$PATH"
            break
        fi
    done
fi

# Initialize conda for bash
if command -v conda &> /dev/null; then
    eval "$(conda shell.bash hook)"
    conda activate $ENV_NAME
else
    echo "Error: Could not find conda. Please ensure conda is installed."
    exit 1
fi

# Verify activation
if [ "$CONDA_DEFAULT_ENV" != "$ENV_NAME" ]; then
    echo "Error: Failed to activate conda environment '$ENV_NAME'."
    exit 1
fi

echo "Starting BookRAG Chat Backend..."
echo "Using Index: $RAG_WORKING_DIR"

# Run the API Server
python -m api.api_server
