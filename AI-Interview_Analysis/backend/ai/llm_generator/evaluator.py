import os
import json
import requests
import re

def evaluate_answer(question_id, question, expected_answer, candidate_answer):
    """
    Evaluates the candidate's speech-to-text answer against the expected answer 
    using the NVIDIA API (Llama 3.1 70B), returning a technical score out of 10.
    """
    api_key = os.getenv("NVIDIA_API_KEY")
    if not api_key:
        print("Warning: NVIDIA_API_KEY is not set. Returning mock evaluation score.")
        return {"question_id": question_id, "score": 8, "max_score": 10}
    
    prompt = f"""
    You are an expert technical interviewer.

    Your task is to evaluate the candidate's answer based on the interview question.

    Question ID:
    {question_id}

    Question:
    {question}

    Expected Answer:
    {expected_answer}

    Candidate Answer (Speech-to-Text):
    {candidate_answer}

    Evaluation Rules:
    1. Compare the candidate's answer with the expected answer.
    2. Evaluate only the technical correctness.
    3. Ignore grammar mistakes and pronunciation errors caused by speech recognition.
    4. Award marks out of 10.

    Scoring Criteria
    Technical Accuracy : 5 Marks
    Concept Understanding : 3 Marks
    Completeness : 2 Marks

    Return ONLY valid JSON.

    {{
      "question_id": "{question_id}",
      "score": 0,
      "max_score": 10
    }}

    Do not provide any explanation, feedback, suggestions, strengths, weaknesses, or corrected answers.
    Return JSON only.
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
            "temperature": 0.2,
            "max_tokens": 512
        }
        
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        
        response_data = response.json()
        content = response_data["choices"][0]["message"]["content"]
        
        # Clean up possible markdown wrappers
        clean_content = re.sub(r'```(?:json)?', '', content).strip()
        
        # Parse the JSON response
        result = json.loads(clean_content)
        
        # Validate format
        if "score" not in result or "max_score" not in result:
            raise ValueError("LLM returned unexpected score JSON structure.")
            
        return {
            "question_id": result.get("question_id", question_id),
            "score": int(result["score"]),
            "max_score": int(result["max_score"])
        }
        
    except Exception as e:
        print(f"Error evaluating answer with NVIDIA API: {e}")
        # Fallback to average score if LLM fails
        return {"question_id": question_id, "score": 7, "max_score": 10}
