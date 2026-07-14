import uuid
from datetime import datetime

def generate_uuid():
    """Generate a random unique identifier."""
    return str(uuid.uuid4())

def get_current_timestamp():
    """Retrieve current formatted ISO timestamp."""
    return datetime.utcnow().isoformat() + 'Z'

def format_response(success, message, data=None, error=None):
    """Generate a standard API JSON response wrapper."""
    response = {
        "success": success,
        "message": message,
        "timestamp": get_current_timestamp()
    }
    if data is not None:
        response["data"] = data
    if error is not None:
        response["error"] = error
    return response
