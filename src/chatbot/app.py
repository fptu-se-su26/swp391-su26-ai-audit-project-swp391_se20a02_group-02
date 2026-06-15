import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from rag_engine import RAGEngine
from actions import ChatOrchestrator, VehicleConsultantAction

# Load configuration
load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Allow cross-origin requests from the React Frontend
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize core engines
logger.info("Initializing LuxeWay Chatbot Backend...")
try:
    rag_engine = RAGEngine()
    
    # Try loading the vector database on startup
    # If SQL Server is running, it will automatically connect and index the vehicles.
    # We catch any initial exceptions so the Flask server can still boot and allow the user to troubleshoot.
    try:
        rag_engine.load_vector_db()
        logger.info("RAG Engine loaded successfully on startup.")
    except Exception as db_err:
        logger.warning(f"Could not initialize vector database on startup: {str(db_err)}")
        logger.warning("The application will boot, but calls to /api/chat will fail until /api/bootstrap is successful.")

    # Instantiate the OCP Orchestrator
    orchestrator = ChatOrchestrator(engine=rag_engine)
    
    # Register the default Vehicle Consultant Action (RAG & Gemini)
    orchestrator.register_action(VehicleConsultantAction())
    logger.info("Default VehicleConsultantAction successfully registered in OCP Orchestrator.")

except Exception as init_err:
    logger.error(f"Critical initialization failure: {str(init_err)}")
    raise init_err


@app.route("/api/health", methods=["GET"])
def health_check():
    """Simple API health check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "LuxeWay Chatbot Advisor API",
        "database_connected": rag_engine.vector_store is not None
    }), 200


@app.route("/api/bootstrap", methods=["POST"])
def bootstrap_database():
    """
    Manually triggers reloading and rebuilding the local vector database from SQL Server.
    Use this endpoint after adding or updating vehicles in your database.
    """
    try:
        success = rag_engine.bootstrap_vector_db()
        if success:
            return jsonify({
                "success": True,
                "message": "Cơ sở dữ liệu Vector đã được đồng bộ và cập nhật thành công từ SQL Server!"
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "Không tìm thấy dữ liệu xe trong cơ sở dữ liệu."
            }), 404
    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Lỗi khi đồng bộ cơ sở dữ liệu.",
            "error": str(e)
        }), 500


@app.route("/api/chat", methods=["POST"])
def chat():
    """
    Main chat endpoint.
    Expects JSON:
    {
        "message": "User query here",
        "history": [
            { "role": "user", "content": "..." },
            { "role": "assistant", "content": "..." }
        ]
    }
    """
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"error": "Missing 'message' field in request body."}), 400

    user_message = data["message"].strip()
    history = data.get("history", [])
    
    context = {
        "history": history
    }

    logger.info(f"Incoming message from customer: '{user_message}'")
    
    # Delegate message processing to the OCP orchestrator
    response = orchestrator.process_message(user_message, context)
    
    return jsonify(response), 200


if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5000))
    debug_mode = os.getenv("FLASK_ENV", "development") == "development"
    
    logger.info(f"Starting Flask Chatbot service on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=debug_mode)
