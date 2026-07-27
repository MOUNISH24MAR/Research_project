from flask import Blueprint, request, jsonify
import os
import json
from core.interview_manager import interview_manager
from utils.helpers import format_response
from utils.logger import logger

# Import new LLM modules
from ai.llm_generator.match_scorer import calculate_match_score
from ai.llm_generator.question_generator import generate_dynamic_questions
from ai.llm_generator.evaluator import evaluate_answer

interview_bp = Blueprint('interview', __name__)

@interview_bp.route('/generate', methods=['POST'])
def generate_questions():
    """Dynamically generate interview questions and match score."""
    try:
        data = request.get_json() or {}
        job_role = data.get('job_role', '')
        experience = data.get('experience', '')
        job_description = data.get('job_description', '')
        
        # Read the previously parsed resume JSON
        parsed_json_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'storage', 'resume_parsed.json')
        resume_json = {}
        if os.path.exists(parsed_json_path):
            with open(parsed_json_path, 'r', encoding='utf-8') as f:
                resume_json = json.load(f)
                
        # Calculate Resume Match Score
        match_score = calculate_match_score(job_description, resume_json)
        
        # Generate Dynamic Questions
        questions = generate_dynamic_questions(job_role, experience, job_description, resume_json, match_score)
        
        return jsonify(format_response(
            success=True,
            message="Questions generated successfully",
            data={
                "match_score": match_score,
                "questions": questions
            }
        )), 200
        
    except Exception as e:
        logger.error(f"Error in generate_questions API: {e}")
        return jsonify(format_response(
            success=False,
            message="Failed to generate questions. Check backend logs.",
            error=str(e)
        )), 500

@interview_bp.route('/evaluate', methods=['POST'])
def evaluate():
    """Evaluates a candidate's transcribed answer against the expected answer."""
    try:
        data = request.get_json() or {}
        question_id = data.get('question_id', '')
        question = data.get('question', '')
        expected_answer = data.get('expected_answer', '')
        candidate_answer = data.get('candidate_answer', '')
        
        if not candidate_answer.strip():
            # If the candidate didn't say anything, give 0
            return jsonify(format_response(
                success=True,
                message="Answer evaluated",
                data={"question_id": question_id, "score": 0, "max_score": 10}
            )), 200
            
        score_data = evaluate_answer(question_id, question, expected_answer, candidate_answer)
        
        return jsonify(format_response(
            success=True,
            message="Answer evaluated successfully",
            data=score_data
        )), 200
        
    except Exception as e:
        logger.error(f"Error in evaluate API: {e}")
        return jsonify(format_response(
            success=False,
            message="Failed to evaluate answer.",
            error=str(e)
        )), 500

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
