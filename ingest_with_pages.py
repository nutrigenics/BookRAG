import os
import sys
import argparse
import asyncio
import logging
import pypdf
from lightrag import LightRAG, QueryParam
from lightrag.llm.openai import gpt_4o_mini_complete, openai_embed

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def extract_pages_with_overlap(file_path, overlap_chars=200):
    """
    Extracts text from PDF page by page, adding overlap from the previous page.
    Returns a list of strings, where each string is:
    "[SOURCE: Page N] <Overlap text> <Page text>"
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    pages_content = []
    
    try:
        reader = pypdf.PdfReader(file_path)
        num_pages = len(reader.pages)
        logger.info(f"Found {num_pages} pages in {file_path}")
        
        prev_page_end = ""
        
        for i, page in enumerate(reader.pages):
            page_num = i + 1
            text = page.extract_text() or ""
            
            # Create content block with explicit marker
            # We include explicit marker so query results show it clearly
            marker = f"[SOURCE: Page {page_num}]\n"
            
            # Combine overlap + marker + text
            # Note: We put overlap BEFORE the marker? Or after?
            # If we put it after, it belongs to this page. 
            # If we put it before, it might confuse.
            # Let's do: [SOURCE: Page N] (Overlap) ... Content
            
            if prev_page_end:
                 full_page_text = f"{marker}(Overlap from previous page)... {prev_page_end}\n\n{text}"
            else:
                 full_page_text = f"{marker}{text}"
            
            pages_content.append(full_page_text)
            
            # Update overlap for next page
            # Take last N chars
            if len(text) > overlap_chars:
                prev_page_end = text[-overlap_chars:]
            else:
                prev_page_end = text
                
    except Exception as e:
        logger.error(f"Error reading PDF: {e}")
        raise

    return pages_content

async def initialize_rag(working_dir):
    if not os.path.exists(working_dir):
        os.makedirs(working_dir)
        
    rag = LightRAG(
        working_dir=working_dir,
        embedding_func=openai_embed,
        llm_model_func=gpt_4o_mini_complete,
        addon_params={"language": "English"} 
    )
    await rag.initialize_storages()
    return rag

async def main():
    parser = argparse.ArgumentParser(description="BookRAG: Ingest PDF with Page Numbers")
    parser.add_argument("--file_path", default="tractatus.pdf", help="Path to the PDF file")
    parser.add_argument("--working_dir", default="./bookrag_index_pages_tractatus", help="Directory to store the NEW index")
    
    args = parser.parse_args()

    if not os.getenv("OPENAI_API_KEY"):
        logger.error("OPENAI_API_KEY environment variable is not set.")
        sys.exit(1)

    try:
        logger.info(f"Processing PDF: {args.file_path}")
        pages = await extract_pages_with_overlap(args.file_path)
        logger.info(f"Extracted {len(pages)} pages.")

        logger.info(f"Initializing LightRAG in {args.working_dir}...")
        rag = await initialize_rag(args.working_dir)

        logger.info("Indexing pages... This will treat each page as a document/chunk source.")
        
        # We ingest all pages. LightRAG's ainsert accepts a list of strings?
        # Checking implementation: ainsert(string_or_strings)
        # Yes, it iterates if list.
        
        await rag.ainsert(pages)
        
        logger.info("Indexing complete.")

    except Exception as e:
        logger.error(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
