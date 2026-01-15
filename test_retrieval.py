import asyncio
import os
from lightrag import LightRAG, QueryParam
from lightrag.llm.openai import gpt_4o_mini_complete, openai_embed

# Setup
from dotenv import load_dotenv
load_dotenv()

WORKING_DIR = "./bookrag_index_pages_tabulue_rudolphine"
QUERY_ENGLISH = "What event does Erasmus Reinhold mention occurring in 1415?"
QUERY_LATIN = "ERASMUS REINHOLDUS meminit Eclipsis Solis Anno 1415"

async def test_retrieval():
    if not os.path.exists(WORKING_DIR):
        print(f"Error: Directory {WORKING_DIR} not found.")
        return

    rag = LightRAG(
        working_dir=WORKING_DIR,
        embedding_func=openai_embed,
        llm_model_func=gpt_4o_mini_complete,
        addon_params={"language": "English"}
    )
    
    # Test EN
    print(f"\n--- Testing English Query (Hybrid) ---\nQuery: {QUERY_ENGLISH}")
    try:
        response = await rag.aquery_llm(QUERY_ENGLISH, param=QueryParam(mode="hybrid", stream=False))
        # Inspect internals if possible, otherwise we infer from api_server logs that chunks are 0.
        # But here we can't see internal logs easily unless we configure logging.
        print("Response received.")
    except Exception as e:
        print(f"Error: {e}")

    # Test LATIN
    print(f"\n--- Testing Latin Query (Hybrid) ---\nQuery: {QUERY_LATIN}")
    try:
        response = await rag.aquery_llm(QUERY_LATIN, param=QueryParam(mode="hybrid", stream=False))
        print("Response received.")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    asyncio.run(test_retrieval())
