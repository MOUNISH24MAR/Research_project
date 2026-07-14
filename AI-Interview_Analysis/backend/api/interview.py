from flask import Blueprint, request, jsonify
from core.interview_manager import interview_manager
from utils.helpers import format_response
from utils.logger import logger

interview_bp = Blueprint('interview', __name__)

@interview_bp.route('/start', methods=['POST'])
def start_interview():
    """Start a new interview session."""
    try:
        session_data = interview_manager.start_session()
        return jsonify(format_response(
            success=True,
            message="Interview session started successfully",
            data=session_data
        )), 201
    except Exception as e:
        logger.error(f"Error in start_interview API: {e}")
        return jsonify(format_response(
            success=False,
            message="Failed to start interview session",
            error=str(e)
        )), 500

@interview_bp.route('/status/<session_id>', methods=['GET'])
def get_interview_status(session_id):
    """Retrieve status and metadata of an interview session."""
    try:
        session = interview_manager.get_session(session_id)
        if not session:
            return jsonify(format_response(
                success=False,
                message="Session not found"
            )), 404
        return jsonify(format_response(
            success=True,
            message="Session status retrieved successfully",
            data=session
        )), 200
    except Exception as e:
        logger.error(f"Error in get_interview_status API: {e}")
        return jsonify(format_response(
            success=False,
            message="Failed to retrieve session status",
            error=str(e)
        )), 500

@interview_bp.route('/end', methods=['POST'])
def end_interview():
    """End an interview session."""
    try:
        data = request.get_json() or {}
        session_id = data.get('session_id')
        
        if not session_id:
            return jsonify(format_response(
                success=False,
                message="Missing required field: session_id"
            )), 400
            
        session = interview_manager.end_session(session_id)
        if not session:
            return jsonify(format_response(
                success=False,
                message="Session not found or already closed"
            )), 404
            
        return jsonify(format_response(
            success=True,
            message="Interview session completed successfully",
            data=session
        )), 200
    except Exception as e:
        logger.error(f"Error in end_interview API: {e}")
        return jsonify(format_response(
            success=False,
            message="Failed to end interview session",
            error=str(e)
        )), 500
