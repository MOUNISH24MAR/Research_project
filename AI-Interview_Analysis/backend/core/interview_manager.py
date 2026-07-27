from utils.helpers import generate_uuid, get_current_timestamp
from utils.logger import logger

class InterviewManager:
    def __init__(self):
        # In-memory session store (in production, this would be a database/Redis)
        self.sessions = {}

    def start_session(self):
        """Initialize a new interview session."""
        session_id = generate_uuid()
        session_data = {
            "session_id": session_id,
            "status": "active",
            "start_time": get_current_timestamp(),
            "end_time": None,
            "recordings": []  # List of dicts: {question_id, file_path, file_type, size_bytes, timestamp}
        }
        self.sessions[session_id] = session_data
        logger.info(f"Started new interview session: {session_id}")
        return session_data

    def get_session(self, session_id):
        """Retrieve interview session details by ID."""
        return self.sessions.get(session_id)

    def add_recording_to_session(self, session_id, question_id, file_path, file_type, size_bytes):
        """Register a new recording file for a question within the session."""
        session = self.get_session(session_id)
        if not session:
            logger.error(f"Failed to add recording. Session {session_id} not found.")
            return False
            
        recording_entry = {
            "question_id": question_id,
            "file_path": file_path,
            "file_type": file_type,
            "size_bytes": size_bytes,
            "timestamp": get_current_timestamp()
        }
        session["recordings"].append(recording_entry)
        logger.info(f"Added recording for session {session_id}, question {question_id}: {file_path}")
        return True

    def end_session(self, session_id):
        """Mark an interview session as completed."""
        session = self.get_session(session_id)
        if not session:
            logger.error(f"Failed to end session. Session {session_id} not found.")
            return None
            
        session["status"] = "completed"
        session["end_time"] = get_current_timestamp()
        
        # We no longer generate behavioral reports on the backend per user instructions.
        # The frontend accumulates the LLM technical scores.
        session["report"] = None
        
        logger.info(f"Ended interview session: {session_id}")
        return session

# Global singleton manager
interview_manager = InterviewManager()
