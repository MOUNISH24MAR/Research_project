import unittest
import json
import io
import os
import sys

# Ensure backend root is in search path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from core.interview_manager import interview_manager
from config import Config

class TestInterviewAPI(unittest.TestCase):
    def setUp(self):
        Config.DEBUG = False
        self.app = create_app()
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()

    def tearDown(self):
        self.ctx.pop()

    def test_health_check(self):
        """Test the health check status endpoint."""
        response = self.client.get('/api/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['status'], 'healthy')

    def test_interview_session_flow(self):
        """Test starting, status checking, uploading to, and ending a session."""
        # 1. Start session
        response = self.client.post('/api/interview/start')
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        
        session_id = data['data']['session_id']
        self.assertIsNotNone(session_id)
        self.assertEqual(data['data']['status'], 'active')

        # 2. Get status of active session
        status_response = self.client.get(f'/api/interview/status/{session_id}')
        self.assertEqual(status_response.status_code, 200)
        status_data = json.loads(status_response.data)
        self.assertEqual(status_data['data']['status'], 'active')

        # 3. Mock file upload
        test_file = (io.BytesIO(b"dummy webm video content"), 'recording.webm')
        upload_data = {
            'file': test_file,
            'session_id': session_id,
            'question_id': '1',
            'file_type': 'video'
        }
        
        upload_response = self.client.post(
            '/api/upload',
            data=upload_data,
            content_type='multipart/form-data'
        )
        self.assertEqual(upload_response.status_code, 200)
        upload_res_data = json.loads(upload_response.data)
        self.assertTrue(upload_res_data['success'])
        self.assertEqual(upload_res_data['data']['question_id'], '1')

        # Check file exists on filesystem
        saved_file_path = upload_res_data['data']['file_path']
        self.assertTrue(os.path.exists(saved_file_path))

        # 4. End session
        end_response = self.client.post(
            '/api/interview/end',
            data=json.dumps({'session_id': session_id}),
            content_type='application/json'
        )
        self.assertEqual(end_response.status_code, 200)
        end_data = json.loads(end_response.data)
        self.assertTrue(end_data['success'])
        self.assertEqual(end_data['data']['status'], 'completed')
        self.assertIsNotNone(end_data['data']['end_time'])

        # Clean up created file and directory
        if os.path.exists(saved_file_path):
            os.remove(saved_file_path)
            os.rmdir(os.path.dirname(saved_file_path))

if __name__ == '__main__':
    unittest.main()
