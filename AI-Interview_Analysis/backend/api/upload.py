from flask import Blueprint, request, jsonify
from core.recording_manager import recording_manager
from core.interview_manager import interview_manager
from utils.file_utils import allowed_file
from utils.helpers import format_response
from utils.logger import logger
import os
from werkzeug.utils import secure_filename
from ai.resume_parser.skill_extractor import run_extraction_pipeline

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('', methods=['POST'])
def upload_recording():
    """Upload recorded audio/video for a specific question."""
    try:
        # Check if files exist in request
        if 'file' not in request.files:
            return jsonify(format_response(
                success=False,
                message="No file part in request"
            )), 400
            
        file = request.files['file']
        session_id = request.form.get('session_id')
        question_id = request.form.get('question_id')
        file_type = request.form.get('file_type', 'video')  # Default to video
        
        if not session_id or not question_id:
            return jsonify(format_response(
                success=False,
                message="Missing required parameters: session_id and question_id are required"
            )), 400
            
        if file.filename == '':
            return jsonify(format_response(
                success=False,
                message="No file selected for upload"
            )), 400
            
        # Verify file extensions
        if not allowed_file(file.filename):
            return jsonify(format_response(
                success=False,
                message=f"File extension not allowed. Allowed types are: webm, mp4, wav, mp3, ogg"
            )), 400
            
        # Verify session is active
        session = interview_manager.get_session(session_id)
        if not session:
            return jsonify(format_response(
                success=False,
                message=f"Active session {session_id} not found"
            )), 404
            
        # Save recording file
        filepath, size_bytes = recording_manager.save_recording(session_id, question_id, file, file_type)
        if not filepath:
            return jsonify(format_response(
                success=False,
                message="Failed to save recording on server"
            )), 500
            
        # Add recording reference to the session manager
        success = interview_manager.add_recording_to_session(
            session_id=session_id,
            question_id=question_id,
            file_path=filepath,
            file_type=file_type,
            size_bytes=size_bytes
        )
        
        if not success:
            return jsonify(format_response(
                success=False,
                message="Failed to associate recording with active session"
            )), 500
            
        return jsonify(format_response(
            success=True,
            message="Recording uploaded and registered successfully",
            data={
                "session_id": session_id,
                "question_id": question_id,
                "file_path": filepath,
                "size_bytes": size_bytes
            }
        )), 200
        
    except Exception as e:
        logger.error(f"Error in upload_recording API: {e}")
        return jsonify(format_response(
            success=False,
            message="An error occurred during file upload",
            error=str(e)
        )), 500

@upload_bp.route('/resume', methods=['POST'])
def upload_resume():
    """Upload a resume PDF and extract skills using the NLP pipeline."""
    try:
        if 'file' not in request.files:
            return jsonify(format_response(
                success=False,
                message="No file part in request"
            )), 400
            
        file = request.files['file']
        
        if file.filename == '':
            return jsonify(format_response(
                success=False,
                message="No file selected for upload"
            )), 400
            
        if file and file.filename.lower().endswith('.pdf'):
            # Save file temporarily
            filename = secure_filename(file.filename)
            temp_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'storage', filename)
            os.makedirs(os.path.dirname(temp_path), exist_ok=True)
            
            file.save(temp_path)
            
            # Extract skills using the existing pipeline
            extracted_json = run_extraction_pipeline(temp_path)
            
            # Save the full structured JSON for future modules
            parsed_json_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'storage', 'resume_parsed.json')
            with open(parsed_json_path, 'w', encoding='utf-8') as f:
                import json
                json.dump(extracted_json, f, indent=4)
            
            # Clean up the temporary file (optional but good practice)
            try:
                os.remove(temp_path)
            except Exception as e:
                logger.warning(f"Could not remove temporary resume file: {e}")
                
            return jsonify(format_response(
                success=True,
                message="Resume uploaded, parsed, and JSON stored successfully",
                data={
                    "skills": extracted_json
                }
            )), 200
        else:
            return jsonify(format_response(
                success=False,
                message="Invalid file format. Only PDF is allowed."
            )), 400
            
    except Exception as e:
        logger.error(f"Error in upload_resume API: {e}")
        return jsonify(format_response(
            success=False,
            message="An error occurred during resume skill extraction",
            error=str(e)
        )), 500

