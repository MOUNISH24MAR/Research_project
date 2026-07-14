import logging
import os
from logging.handlers import RotatingFileHandler

def setup_logger(name="ai_interview", log_file="app.log", level=logging.INFO):
    logger = logging.getLogger(name)
    if logger.handlers:
        return logger

    logger.setLevel(level)
    
    # Formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s'
    )

    # Console Handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # File Handler
    try:
        log_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'storage', 'temp')
        os.makedirs(log_dir, exist_ok=True)
        file_path = os.path.join(log_dir, log_file)
        
        file_handler = RotatingFileHandler(file_path, maxBytes=10*1024*1024, backupCount=5)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    except Exception as e:
        print(f"Failed to initialize file logger: {e}")

    return logger

logger = setup_logger()
