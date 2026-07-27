import os
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def calculate_match_score(job_description, resume_json):
    """
    Calculates a similarity score (0-100) between the Job Description and the Resume.
    Uses TF-IDF and Cosine Similarity on the raw text.
    """
    if not job_description or not resume_json:
        return 0
        
    # Flatten the resume JSON into a single document string
    resume_text_parts = []
    
    # Add explicit text sections
    for section in ["Education", "Experience", "Projects", "Internship", "Certifications", "Achievements", "Responsibilities"]:
        val = resume_json.get(section, "")
        if isinstance(val, str) and val.strip():
            resume_text_parts.append(val)
            
    # Add Technical Skills
    tech_skills = resume_json.get("Technical Skills", {})
    if isinstance(tech_skills, dict):
        for category, skills in tech_skills.items():
            if isinstance(skills, list):
                resume_text_parts.extend(skills)
                
    # Add Soft Skills and Tools
    if isinstance(resume_json.get("Soft Skills"), list):
        resume_text_parts.extend(resume_json["Soft Skills"])
    if isinstance(resume_json.get("Tools"), str):
        resume_text_parts.append(resume_json["Tools"])
        
    resume_full_text = " ".join(resume_text_parts).lower()
    jd_lower = job_description.lower()
    
    if not resume_full_text.strip() or not jd_lower.strip():
        return 0
        
    try:
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform([jd_lower, resume_full_text])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        
        # Convert to percentage
        score = int(round(similarity * 100))
        
        # Boost score slightly if it's artificially low due to length mismatch
        if score > 0:
            score = min(100, score + 20)
            
        return score
    except Exception as e:
        print(f"Error calculating match score: {e}")
        return 0
