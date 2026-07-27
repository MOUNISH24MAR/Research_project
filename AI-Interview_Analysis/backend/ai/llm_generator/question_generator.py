import os
import json
import requests
import re

def generate_dynamic_questions(job_role, experience, job_description, resume_json, match_score=0):
    """
    Calls the NVIDIA API (Llama 3.1 8B) to generate personalized interview questions based on the 
    user-provided prompt template and JSON structure.
    """
    api_key = os.getenv("NVIDIA_API_KEY")
    if not api_key:
        print("Warning: NVIDIA_API_KEY is not set. Returning mock dynamic questions for demonstration.")
        return _get_mock_questions(job_role, experience)
    
    # Extract data for the prompt
    skills_data = {}
    if "Technical Skills" in resume_json:
        skills_data["Technical Skills"] = resume_json["Technical Skills"]
    if "Soft Skills" in resume_json:
        skills_data["Soft Skills"] = resume_json["Soft Skills"]
    if "Tools" in resume_json:
        skills_data["Tools"] = resume_json["Tools"]
        
    projects_data = resume_json.get("Projects", "No projects listed")
    experience_data = resume_json.get("Experience", "No experience listed")
    education_data = resume_json.get("Education", "No education listed")
        
    prompt = f"""
You are conducting an AI-powered technical interview.

Candidate Information

Resume Information:
{json.dumps(resume_json, indent=2)[:1000]}... (Truncated for brevity)

Extracted Skills:
{json.dumps(skills_data, indent=2)}

Projects:
{json.dumps(projects_data, indent=2)}

Experience:
{json.dumps(experience_data, indent=2)}

Education:
{json.dumps(education_data, indent=2)}

Job Role:
{job_role}

Job Description:
{job_description}

Resume Match Score:
{match_score}

--------------------------------------------------

Task

Analyze ALL the information before generating questions.

The interview questions MUST be based on:

1. Skills extracted from the resume.
2. Technologies mentioned in the Job Description.
3. Candidate projects.
4. Candidate experience level.
5. Resume match score.

Prioritize skills that appear in BOTH the resume and the job description.

--------------------------------------------------

Question Generation Rules

Generate exactly 15 interview questions.

Difficulty Distribution

5 Easy

5 Medium

5 Hard

Do NOT generate duplicate questions.

Do NOT ask the same concept twice.

Each question must evaluate a different skill or a different practical scenario.

If the candidate has projects, ask project-based questions.

If the job description mentions technologies not present in the resume, ask only 1–2 basic questions to evaluate the candidate's learning ability.

Generate real interview questions similar to those asked by top software companies.

--------------------------------------------------

Question Types

Mix the following:

• Conceptual

• Coding

• Debugging

• Scenario-Based

• Project-Based

• API Design

• Database

• Optimization

• Security

--------------------------------------------------

Important Constraints

Never ask generic questions like:

"What is Python?"

"What is Java?"

"What is React?"

Instead ask contextual questions.

Example:

Candidate Project:
Student Management System

Instead of

"What is FastAPI?"

Ask

"In your Student Management System, how would you implement authentication using FastAPI and JWT?"

--------------------------------------------------

Avoid Repetition

Before generating each question,

compare it with all previously generated questions.

If two questions test the same concept,

replace one with a different concept.

Every question must be unique.

--------------------------------------------------

Output Format

Return ONLY JSON.

{{
  "candidate_role": "{job_role}",
  "total_questions": 15,
  "questions": [
    {{
      "id": 1,
      "skill": "",
      "difficulty": "",
      "type": "",
      "question": "",
      "expected_answer": "",
      "key_points": []
    }}
  ]
}}

Return JSON only.

No explanation.

No markdown.

No additional text.
    """
    
    try:
        url = "https://integrate.api.nvidia.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": "meta/llama-3.1-8b-instruct",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7,
            "max_tokens": 2048
        }
        
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        
        response_data = response.json()
        content = response_data["choices"][0]["message"]["content"]
        
        # Clean up possible markdown wrappers
        clean_content = re.sub(r'```(?:json)?', '', content).strip()
        
        # Parse the JSON response
        result = json.loads(clean_content)
        
        # The prompt asks for an object with a "questions" array
        if "questions" in result:
            questions_data = result["questions"]
        elif isinstance(result, list):
            questions_data = result
        else:
            raise ValueError("LLM returned unexpected JSON structure.")
            
        # Map the AI output to ensure compatibility with the frontend React UI
        mapped_questions = []
        for i, q in enumerate(questions_data):
            # Frontend relies on 'id', 'text', and 'duration' for the TTS and Timer
            mapped_q = {
                "id": f"q_{i}",
                "text": q.get("question", ""),  # Map 'question' to 'text'
                "duration": 60 if str(q.get("difficulty")).lower() == "easy" else (90 if str(q.get("difficulty")).lower() == "medium" else 120),
                "category": q.get("type", q.get("question_type", "General")),
                
                # Preserve the rich data for future answer evaluation phases
                "skill": q.get("skill", ""),
                "difficulty": q.get("difficulty", ""),
                "question_type": q.get("type", q.get("question_type", "")),
                "original_question": q.get("question", ""),
                "expected_answer": q.get("expected_answer", ""),
                "key_points": q.get("key_points", [])
            }
            mapped_questions.append(mapped_q)
                
        return mapped_questions
        
    except Exception as e:
        print(f"Error generating questions with NVIDIA API: {e}")
        return _get_mock_questions(job_role, experience)


def _get_mock_questions(job_role, experience):
    """Returns exactly 10 mock questions formatted correctly when API key is missing."""
    mock_data = [
        {
            "skill": "React",
            "difficulty": "Easy",
            "question_type": "Conceptual",
            "question": f"As a {job_role} with {experience}, how do you manage state in a React application?",
            "expected_answer": "Use hooks like useState and useReducer, or context API.",
            "key_points": ["useState", "Context API", "Redux"]
        },
        {
            "skill": "Python",
            "difficulty": "Medium",
            "question_type": "Coding",
            "question": "Can you explain the difference between lists and tuples in Python, and when you would use each?",
            "expected_answer": "Lists are mutable, tuples are immutable.",
            "key_points": ["Mutable vs Immutable", "Performance", "Syntax"]
        },
        {
            "skill": "SQL",
            "difficulty": "Hard",
            "question_type": "Scenario Based",
            "question": "You have a slow-running query on a massive database table. How do you optimize it?",
            "expected_answer": "Check execution plans, add indexes, avoid SELECT *.",
            "key_points": ["Indexing", "Execution Plan", "Query Optimization"]
        },
        {
            "skill": "Architecture",
            "difficulty": "Medium",
            "question_type": "Conceptual",
            "question": "What is the difference between a monolithic and microservices architecture?",
            "expected_answer": "Monoliths are single units; microservices are independent deployable services.",
            "key_points": ["Scalability", "Deployment", "Coupling"]
        },
        {
            "skill": "Debugging",
            "difficulty": "Hard",
            "question_type": "Debugging",
            "question": "A production server is suddenly reporting 100% CPU usage. Walk me through your debugging steps.",
            "expected_answer": "Check logs, use top/htop, identify processes.",
            "key_points": ["Monitoring tools", "Log analysis", "Process management"]
        },
        {
            "skill": "Agile",
            "difficulty": "Easy",
            "question_type": "Behavioral",
            "question": "Tell me about a time you had a disagreement with a team member. How did you resolve it?",
            "expected_answer": "Communicated clearly, found common ground.",
            "key_points": ["Communication", "Empathy", "Resolution"]
        },
        {
            "skill": "Git",
            "difficulty": "Medium",
            "question_type": "Practical",
            "question": "What is a merge conflict, and how do you resolve it?",
            "expected_answer": "When two branches modify the same lines. Manually edit files to choose changes.",
            "key_points": ["Git merge", "Conflict markers", "Commit"]
        },
        {
            "skill": "Testing",
            "difficulty": "Medium",
            "question_type": "Conceptual",
            "question": "Explain Test-Driven Development (TDD) and its advantages.",
            "expected_answer": "Write tests before code. Ensures coverage and clear requirements.",
            "key_points": ["Red-Green-Refactor", "Test coverage", "Design"]
        },
        {
            "skill": "Deployment",
            "difficulty": "Hard",
            "question_type": "Scenario Based",
            "question": "Your deployment to production just failed. What is your rollback strategy?",
            "expected_answer": "Revert to previous stable version using CI/CD pipelines.",
            "key_points": ["CI/CD", "Rollback", "Downtime minimization"]
        },
        {
            "skill": "Problem Solving",
            "difficulty": "Hard",
            "question_type": "Behavioral",
            "question": "Describe a situation where you had to learn a new technology quickly to solve a critical issue.",
            "expected_answer": "Read docs, built small projects, applied to the problem immediately.",
            "key_points": ["Adaptability", "Learning process", "Resourcefulness"]
        },
        {
            "skill": "Security",
            "difficulty": "Hard",
            "question_type": "Conceptual",
            "question": "How do you protect a web application from XSS and CSRF attacks?",
            "expected_answer": "Use CSRF tokens, sanitize inputs, and set secure HTTP-only cookies.",
            "key_points": ["XSS", "CSRF", "Input Sanitization"]
        },
        {
            "skill": "Cloud",
            "difficulty": "Hard",
            "question_type": "Scenario Based",
            "question": "How would you design a highly available architecture in AWS?",
            "expected_answer": "Use multiple Availability Zones, load balancers, and auto-scaling groups.",
            "key_points": ["Multi-AZ", "Auto-scaling", "Load Balancing"]
        },
        {
            "skill": "API Design",
            "difficulty": "Hard",
            "question_type": "Practical",
            "question": "What are the best practices for designing a RESTful API?",
            "expected_answer": "Use nouns, HTTP methods appropriately, versioning, and status codes.",
            "key_points": ["HTTP Methods", "Versioning", "Status Codes"]
        },
        {
            "skill": "Data Structures",
            "difficulty": "Hard",
            "question_type": "Coding",
            "question": "Explain how a hash map works under the hood.",
            "expected_answer": "Uses an array and a hash function to map keys to indices. Handles collisions with chaining or open addressing.",
            "key_points": ["Hash function", "Collisions", "O(1) lookup"]
        },
        {
            "skill": "CI/CD",
            "difficulty": "Hard",
            "question_type": "Scenario Based",
            "question": "How do you achieve zero-downtime deployments?",
            "expected_answer": "Use blue-green deployments or canary releases.",
            "key_points": ["Blue-green", "Canary", "Load balancer routing"]
        }
    ]
    
    # Map mock data for frontend
    mapped_questions = []
    for i, q in enumerate(mock_data):
        mapped_questions.append({
            "id": f"q_{i}",
            "text": q["question"],
            "duration": 60 if q["difficulty"].lower() == "easy" else (90 if q["difficulty"].lower() == "medium" else 120),
            "category": q["question_type"],
            "skill": q["skill"],
            "difficulty": q["difficulty"],
            "question_type": q["question_type"],
            "original_question": q["question"],
            "expected_answer": q["expected_answer"],
            "key_points": q["key_points"]
        })
    return mapped_questions
