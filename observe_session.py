import sys
import os
import json

# Add backend directory to path
backend_dir = r"D:\Research_project\AI-Interview_Analysis\backend"
sys.path.append(backend_dir)

from app import create_app

def main():
    print("=== Starting Interview Session Simulation ===")
    app = create_app()
    client = app.test_client()

    # 1. Start Interview Session
    print("\n1. Requesting to start a session via /api/interview/start...")
    response = client.post('/api/interview/start')
    if response.status_code == 201:
        start_data = json.loads(response.data)
        print(f"Session started successfully: {json.dumps(start_data, indent=2)}")
        session_id = start_data['data']['session_id']
    else:
        print(f"Failed to start session. Code: {response.status_code}")
        return

    # 2. Observe the custom questions
    print("\n2. Observing the custom interview questions configured for this session...")
    questions_file_path = r"D:\Research_project\AI-Interview_Analysis\frontend\src\data\questions.js"
    
    if os.path.exists(questions_file_path):
        with open(questions_file_path, 'r', encoding='utf-8') as f:
            js_content = f.read()
            
        print("Successfully read questions.js. Current configured questions:")
        # Parse basic JS array to display questions clean
        import re
        matches = re.findall(r"category:\s*\"([^\"]+)\",\s*text:\s*\"([^\"]+)\"", js_content)
        for idx, (category, text) in enumerate(matches, 1):
            print(f"\n  [Question {idx}] Category: {category}")
            print(f"  Text: {text}")
    else:
        print("questions.js file not found at the expected path.")

    # 3. Check Session Status
    print(f"\n3. Checking session status for ID {session_id}...")
    status_response = client.get(f'/api/interview/status/{session_id}')
    status_data = json.loads(status_response.data)
    print(f"Status check response: {json.dumps(status_data, indent=2)}")

    # 4. End Session
    print(f"\n4. Requesting to close session {session_id}...")
    end_response = client.post(
        '/api/interview/end',
        data=json.dumps({'session_id': session_id}),
        content_type='application/json'
    )
    end_data = json.loads(end_response.data)
    print(f"Session closed successfully: {json.dumps(end_data, indent=2)}")
    print("\n=== Simulation Complete ===")

if __name__ == '__main__':
    main()
