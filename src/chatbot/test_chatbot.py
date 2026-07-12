import os
import sys
import logging
from dotenv import load_dotenv

from rag_engine import RAGEngine

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def main():
    if sys.platform.startswith('win'):
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass
    load_dotenv()
    logger.info("=============================================================")
    logger.info("LUXEWAY CHATBOT DIAGNOSTICS & TEST SCRIPT")
    logger.info("=============================================================")
    
    # Verify environment variables
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.error("[ERROR] GEMINI_API_KEY not found in .env! Please define it.")
        sys.exit(1)
    logger.info(f"[OK] Gemini API Key is configured (Prefix: {api_key[:8]}...)")
    
    # Initialize RAG Engine
    try:
        engine = RAGEngine()
        logger.info("[OK] RAG Engine initialized successfully.")
    except Exception as e:
        logger.error(f"[ERROR] Failed to initialize RAG Engine: {str(e)}")
        sys.exit(1)
        
    # Test Database Connection
    try:
        conn = engine.connect_db()
        logger.info("[OK] SQL Server Database connected successfully!")
        conn.close()
    except Exception as e:
        logger.error(f"[ERROR] Failed to connect to SQL Server database.")
        logger.error("Please make sure:")
        logger.error(" 1. SQL Server is running locally on port 1433")
        logger.error(" 2. The database 'car_rental_platform' exists")
        logger.error(" 3. The username 'sa' and password '123456' are correct")
        logger.error(f"Error Details: {str(e)}")
        sys.exit(1)

    # Test Data Fetching & Vector Store Bootstrapping
    try:
        logger.info("Fetching database records and building FAISS Vector store...")
        success = engine.bootstrap_vector_db()
        if success:
            logger.info("[OK] FAISS Vector Database successfully bootstrapped with real vehicle data!")
        else:
            logger.warning("[WARNING] FAISS Vector DB bootstrapped, but no active vehicles were found in the database.")
    except Exception as e:
        logger.error(f"[ERROR] Failed to bootstrap Vector DB: {str(e)}")
        sys.exit(1)

    # Test Semantic Retrieval & LLM Generation
    test_query = "Tôi muốn tìm xe tự động phân khúc cao cấp hoặc gia đình ở Việt Nam"
    logger.info(f"Testing RAG Query: '{test_query}'...")
    try:
        reply = engine.query(test_query, history=[])
        logger.info("\n" + "="*60 + "\nAI CHATBOT RESPONSE:\n" + "="*60)
        print(reply)
        logger.info("\n" + "="*60)
        logger.info("[SUCCESS] Chatbot test successfully finished!")
    except Exception as e:
        logger.error(f"[ERROR] Failed to query RAG Engine: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
