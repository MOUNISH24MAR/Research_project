import os
from werkzeug.utils import secure_filename
from config import Config
from utils.file_utils import ensure_dir, get_file_extension
from utils.logger import logger

class RecordingManager:
    @staticmethod
    def save_recording(session_id, question_id, file_storage, file_type):
        """
        Saves an uploaded recording file.
        
        :param session_id: UUID of the session
        :param question_id: ID or index of the question
        :param file_storage: Werkzeug FileStorage object containing the file
        :param file_type: 'video' or 'audio'
        :return: Path to the saved file or None if it fails
        """
        try:
            # Determine directory based on type
            if file_type == 'audio':
                base_dir = Config.RECORDINGS_AUDIO_DIR
            else:
                base_dir = Config.RECORDINGS_VIDEO_DIR
                
            # Create session-specific folder
            session_dir = os.path.join(base_dir, session_id)
            ensure_dir(session_dir)
            
            # Secure filename extension
            ext = get_file_extension(file_storage.filename)
            if not ext:
                # Default to webm for videos and wav for audio if extension is missing
                ext = 'webm' if file_type == 'video' else 'wav'
                
            filename = f"q_{question_id}.{ext}"
            filepath = os.path.join(session_dir, filename)
            
            # Save file
            file_storage.save(filepath)
            
            # Get file size
            size_bytes = os.path.getsize(filepath)
            logger.info(f"Saved recording: {filepath} ({size_bytes} bytes)")
            
            return filepath, size_bytes
        except Exception as e:
            logger.error(f"Failed to save recording for session {session_id}, question {question_id}: {e}")
            return None, 0

# Global singleton manager
recording_manager = RecordingManager()
