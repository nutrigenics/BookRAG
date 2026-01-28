import os
import sys
import logging
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
from lightrag import LightRAG, QueryParam
from lightrag.llm.openai import gpt_4o_mini_complete, openai_embed
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Define Book Configuration
# Mapping book_id -> index directory
BOOKS = {
    "geografia": "./bookrag_index_pages_LA_Geografia",
    "tractatus": "./bookrag_index_pages_tractatus",
    "tabulae": "./bookrag_index_pages_tabulue_rudolphine"
}

# Global dictionary to hold LightRAG instances
rag_instances = {}

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("bookrag_api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Load LightRAG instances for all books on startup.
    """
    global rag_instances
    logger.info("Starting up: Loading LightRAG indices...")
    
    for book_id, index_dir in BOOKS.items():
        if not os.path.exists(index_dir):
            logger.warning(f"Index directory {index_dir} for '{book_id}' not found! Skipping.")
            continue
            
        try:
            logger.info(f"Initializing '{book_id}' from {index_dir}...")
            instance = LightRAG(
                working_dir=index_dir,
                embedding_func=openai_embed,
                llm_model_func=gpt_4o_mini_complete,
                addon_params={"language": "English"}
            )
            # Load storage (important for querying existing data)
            await instance.initialize_storages()
            
            rag_instances[book_id] = instance
            logger.info(f"Successfully loaded '{book_id}'")
            
        except Exception as e:
            logger.error(f"Failed to initialize '{book_id}': {e}")
            
    if not rag_instances:
        logger.error("No RAG instances were loaded! API will return 503.")

    yield
    
    logger.info("Shutting down...")

app = FastAPI(title="BookRAG API", lifespan=lifespan)

# CORS - Allow all for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    query: str
    mode: str = "hybrid" # hybrid, global, local, naive
    book_id: str = "geografia" # Default to original book
    language: str = "English" # English or Arabic

async def translate_to_english(text: str) -> str:
    """Uses LLM to translate text to English for retrieval."""
    try:
        prompt = f"Translate the following text to English. Return only the translated text, without quotes or explanations.\n\nText: {text}"
        # We can reuse the same LLM function used by LightRAG
        response = await gpt_4o_mini_complete(prompt)
        return response.strip()
    except Exception as e:
        logger.error(f"Translation failed: {e}")
        return text # Fallback to original

@app.get("/health")
async def health_check():
    status = "healthy" if rag_instances else "unhealthy"
    return {"status": status, "loaded_books": list(rag_instances.keys())}

from fastapi.responses import StreamingResponse
import json

@app.post("/chat")
async def chat(request: ChatRequest):
    # Select the correct instance
    rag_instance = rag_instances.get(request.book_id)
    
    if not rag_instance:
        raise HTTPException(status_code=404, detail=f"Book '{request.book_id}' not found or not initialized.")
    
    try:
        logger.info(f"Received query: {request.query} [Book: {request.book_id}] [Mode: {request.mode}] [Lang: {request.language}]")
        
        # 1. Cross-Lingual RAG Logic
        query_for_retrieval = request.query
        response_instruction = ""
        
        if request.language == "Arabic":
            # Translate query to English for better retrieval against English/Latin index
            translated_query = await translate_to_english(request.query)
            logger.info(f"Translated Arabic query: '{request.query}' -> '{translated_query}'")
            query_for_retrieval = translated_query
            # Instruct LLM to answer in Arabic
            response_instruction = "You are a helpful assistant. Please answer the user's question in Arabic language. Prioritize the provided context, but if the context is insufficient or the query is general (e.g., greetings), use your own knowledge to provide a comprehensive answer. Format your response for maximum readability: use markdown tables for comparisons or structured data, bullet points for lists, and bold text for key terms or emphasized points."
        else:
             # Default English instruction
              response_instruction = (
                  "Please answer in English. Prioritize the provided context, but if the context is insufficient or the query is general (e.g., greetings), use your own knowledge to provide a comprehensive answer. Format your response for maximum readability: "
                  "use markdown tables for comparisons or structured data, bullet points for lists, "
                  "and bold text for key terms or emphasized points."
              )
        
        logger.info(f"Response instruction: {response_instruction}")

        # Enable streaming in LightRAG
        # We pass 'user_prompt' to QueryParam which gets injected into the system prompt
        full_response = await rag_instance.aquery_llm(
            query_for_retrieval, 
            param=QueryParam(
                mode=request.mode, 
                stream=True,
                user_prompt=response_instruction 
            )
        )
        
        logger.info(f"LightRAG Response Keys: {full_response.keys()}")
        if "data" in full_response:
             data = full_response['data']
             if isinstance(data, dict):
                 logger.info(f"Context Data Keys: {data.keys()}")
                 chunks = data.get("chunks", [])
                 if len(chunks) == 0 and request.mode == "hybrid":
                     logger.info("Hybrid mode yielded 0 chunks. Attempting backfill via Naive retrieval...")
                     try:
                         # Perform naive query just for context retrieval (skipping LLM generation if possible)
                         naive_full = await rag_instance.aquery_llm(
                             query_for_retrieval, 
                             param=QueryParam(mode="naive", stream=False, only_need_context=True)
                         )
                         naive_data = naive_full.get("data", {})
                         naive_chunks = naive_data.get("chunks", [])
                         if len(naive_chunks) > 0:
                             logger.info(f"Backfilled {len(naive_chunks)} chunks from Naive search.")
                             data["chunks"] = naive_chunks
                     except Exception as e:
                         logger.error(f"Backfill missing chunks failed: {e}")

                 if "chunks" in data and len(data["chunks"]) > 0:
                     logger.info(f"First Chunk Sample: {data['chunks'][0]}")
        
        context_data = full_response.get("data", {})
        llm_response = full_response.get("llm_response", {})
        iterator = llm_response.get("response_iterator")
        
        async def event_generator():
            # 1. Send Context Data first
            yield json.dumps({"type": "context", "data": context_data}) + "\n"
            
            # 2. Stream tokens
            if iterator:
                async for chunk in iterator:
                    if chunk:
                        yield json.dumps({"type": "delta", "content": chunk}) + "\n"
            
        return StreamingResponse(event_generator(), media_type="text/event-stream")

    except Exception as e:
        logger.error(f"Query failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    if not os.getenv("OPENAI_API_KEY"):
        logger.warning("OPENAI_API_KEY not set! API calls will fail.")
    
    port = int(os.getenv("PORT", 8000))
    logger.info(f"Starting server on 0.0.0.0:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
