import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from config import Config
from api.interview import interview_bp
from api.upload import upload_bp
from utils.logger import logger
from utils.helpers import format_response

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Load configurations
    app.config.from_object(Config)
    
    # Configure CORS (allow frontend development server access)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Initialize directories
    Config.init_app()
    
    # Register blueprints
    app.register_blueprint(interview_bp, url_prefix='/api/interview')
    app.register_blueprint(upload_bp, url_prefix='/api/upload')
    
    # Root status endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify(format_response(
            success=True,
            message="AI Interview Analysis Backend is online and healthy",
            data={
                "status": "healthy",
                "storage_initialized": True
            }
        )), 200

    @app.errorhandler(413)
    def request_entity_too_large(error):
        return jsonify(format_response(
            success=False,
            message="File size exceeds maximum allowable limit of 100MB",
            error=str(error)
        )), 413
        
    @app.errorhandler(404)
    def not_found(error):
        return jsonify(format_response(
            success=False,
            message="Requested API endpoint not found",
            error=str(error)
        )), 404

    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify(format_response(
            success=False,
            message="An internal server error occurred",
            error=str(error)
        )), 500
        
    return app

app = create_app()

if __name__ == '__main__':
    port = Config.PORT
    debug = Config.DEBUG
    logger.info(f"Starting Flask server on port {port} (debug={debug})...")
    app.run(host='0.0.0.0', port=port, debug=debug)
