import os

class Config:
    # Directories
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    STORAGE_DIR = os.path.join(BASE_DIR, 'storage')
    
    RECORDINGS_VIDEO_DIR = os.path.join(STORAGE_DIR, 'recordings', 'videos')
    RECORDINGS_AUDIO_DIR = os.path.join(STORAGE_DIR, 'recordings', 'audio')
    REPORTS_DIR = os.path.join(STORAGE_DIR, 'reports')
    TEMP_DIR = os.path.join(STORAGE_DIR, 'temp')
    MODELS_DIR = os.path.join(STORAGE_DIR, 'models')
    
    # Server configuration
    PORT = int(os.environ.get('PORT', 5000))
    DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'
    
    # Upload limits
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100 MB max limit
    ALLOWED_EXTENSIONS = {'webm', 'mp4', 'wav', 'mp3', 'ogg'}

    @classmethod
    def init_app(cls):
        # Create directories if they don't exist
        for directory in [cls.RECORDINGS_VIDEO_DIR, cls.RECORDINGS_AUDIO_DIR, 
                          cls.REPORTS_DIR, cls.TEMP_DIR, cls.MODELS_DIR]:
            os.makedirs(directory, exist_ok=True)
