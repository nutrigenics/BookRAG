#!/bin/bash

ENV_NAME="bookrag"

echo "Creating Conda environment: $ENV_NAME"
# Check if conda command exists, if not try to find it
if ! command -v conda &> /dev/null; then
    echo "Conda command not found. Searching for conda..."
    CONDA_PATHS=(
        "$HOME/miniconda3"
        "$HOME/anaconda3"
        "/opt/miniconda3"
        "/opt/anaconda3"
        "/usr/local/miniconda3"
        "/usr/local/anaconda3"
    )
    
    FOUND_CONDA=false
    for path in "${CONDA_PATHS[@]}"; do
        if [ -f "$path/etc/profile.d/conda.sh" ]; then
            echo "Found conda at: $path"
            source "$path/etc/profile.d/conda.sh"
            FOUND_CONDA=true
            break
        fi
    done
    
    if [ "$FOUND_CONDA" = false ]; then
        echo "Error: Could not find conda installation. Please ensure conda is installed and in your PATH."
        exit 1
    fi
fi

echo "Creating Conda environment: $ENV_NAME"
conda create -n $ENV_NAME python=3.10 -y

echo "Activating environment..."
# Source conda.sh again just to be sure if we didn't do it above, or if we need to refresh
if [ -z "$CONDA_PREFIX" ]; then
    CONDA_BASE=$(conda info --base)
    if [ -f "$CONDA_BASE/etc/profile.d/conda.sh" ]; then
        source "$CONDA_BASE/etc/profile.d/conda.sh"
    fi
fi
conda activate $ENV_NAME

echo "Installing dependencies..."
pip install -r requirements_bookrag.txt

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "To activate this environment, run:"
echo "    conda activate $ENV_NAME"
echo "=========================================="
