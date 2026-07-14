import os
from werkzeug.utils import secure_filename
from config import Config

def allowed_file(filename):
    """Check if the uploaded file has a valid extension."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

def get_file_extension(filename):
    """Retrieve extension from filename."""
    if '.' in filename:
        return filename.rsplit('.', 1)[1].lower()
    return ''

def ensure_dir(path):
    """Ensure directory exists, create if not."""
    os.makedirs(path, exist_ok=True)
    return path
