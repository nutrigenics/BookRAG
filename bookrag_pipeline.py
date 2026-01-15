import os
import sys
import argparse
import asyncio
import logging
from lightrag import LightRAG, QueryParam
from lightrag.llm.openai import gpt_4o_mini_complete, openai_embed

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def extract_text(file_path):
    """
    Extracts text from a given file path. Supports .txt and .pdf.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    _, ext = os.path.splitext(file_path)
    ext = ext.lower()

    if ext == '.txt':
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except UnicodeDecodeError:
            # Fallback for latin english if utf-8 fails, though utf-8 is preferred
            with open(file_path, 'r', encoding='latin-1') as f:
                return f.read()
    elif ext == '.pdf':
        try:
            import pypdf
        except ImportError:
            logger.error("pypdf is required for PDF processing. Please install it via `pip install pypdf`.")
            sys.exit(1)
        
        try:
            text = ""
            reader = pypdf.PdfReader(file_path)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text
        except Exception as e:
            logger.error(f"Error reading PDF: {e}")
            raise
    else:
        raise ValueError(f"Unsupported file extension: {ext}. Only .txt and .pdf are supported.")

async def initialize_rag(working_dir):
    """
    Initializes LightRAG instance.
    """
    if not os.path.exists(working_dir):
        os.makedirs(working_dir)
        
    rag = LightRAG(
        working_dir=working_dir,
        embedding_func=openai_embed,
        llm_model_func=gpt_4o_mini_complete,
        addon_params={"language": "English"}  # Force English for entity extraction/graph
    )
    await rag.initialize_storages()
    return rag

async def main():
    parser = argparse.ArgumentParser(description="BookRAG: Ingest and Index Books (PDF/TXT)")
    parser.add_argument("file_path", help="Path to the book file (.pdf or .txt)")
    parser.add_argument("--working_dir", default="./bookrag_index", help="Directory to store the index")
    parser.add_argument("--query", help="Optional query to run after indexing for verification")
    
    args = parser.parse_args()

    # Check for OpenAI API Key
    if not os.getenv("OPENAI_API_KEY"):
        logger.error("OPENAI_API_KEY environment variable is not set.")
        print("Please set export OPENAI_API_KEY='your-key'")
        sys.exit(1)

    try:
        logger.info(f"Processing file: {args.file_path}")
        text_content = await extract_text(args.file_path)
        logger.info(f"Extracted {len(text_content)} characters.")

        logger.info("Initializing LightRAG...")
        rag = await initialize_rag(args.working_dir)

        logger.info("Indexing content... This may take a while.")
        await rag.ainsert(text_content)
        logger.info("Indexing complete.")

        if args.query:
            logger.info(f"Running query: {args.query}")
            response = await rag.aquery(args.query, param=QueryParam(mode="hybrid"))
            print("\nResponse:\n")
            print(response)

    except Exception as e:
        logger.error(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
