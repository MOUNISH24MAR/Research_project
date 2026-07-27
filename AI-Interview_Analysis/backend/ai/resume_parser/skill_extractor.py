import os
import re
import pandas as pd
import fitz  # PyMuPDF
import json

# Ensure data directory exists
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
os.makedirs(DATA_DIR, exist_ok=True)

CSV_PATH = os.path.join(DATA_DIR, 'skills_en.csv')

def load_and_clean_skills():
    """Load the skills from the CSV."""
    if not os.path.exists(CSV_PATH):
        return set()
    df = pd.read_csv(CSV_PATH)
    if 'preferredLabel' not in df.columns:
        return set()
    df_skills = df[['preferredLabel']].copy()
    df_skills.dropna(subset=['preferredLabel'], inplace=True)
    df_skills.drop_duplicates(subset=['preferredLabel'], keep='first', inplace=True)
    df_skills['label_cleaned'] = df_skills['preferredLabel'].apply(lambda x: re.sub(r'\([^)]*\)', '', str(x)).strip())
    skill_list = df_skills['label_cleaned'].str.lower().tolist()
    return {s for s in skill_list if s}

def read_resume_pdf(pdf_path):
    """Extract raw text from PDF using PyMuPDF (fitz) for higher accuracy."""
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"Resume PDF not found at {pdf_path}")
    try:
        doc = fitz.open(pdf_path)
        text = "\n".join([page.get_text("text") for page in doc])
        return text
    except Exception as e:
        print(f"Error reading PDF with PyMuPDF: {e}")
        return ""

def categorize_skill(skill):
    """Categorize an extracted skill into specific buckets."""
    skill_lower = skill.lower()
    
    languages = ['python', 'java', 'c', 'c++', 'javascript', 'typescript', 'ruby', 'php', 'swift', 'go', 'rust', 'sql']
    frameworks = ['react', 'angular', 'vue', 'django', 'flask', 'spring', 'express', 'node.js', 'flutter', 'react native']
    databases = ['mysql', 'postgresql', 'mongodb', 'oracle', 'sqlite', 'redis', 'cassandra', 'firebase']
    soft_skills = ['communication', 'teamwork', 'leadership', 'problem solving', 'adaptability', 'time management', 'critical thinking', 'creativity']
    tools = ['git', 'github', 'docker', 'kubernetes', 'jenkins', 'aws', 'azure', 'jira']
    
    if any(s in skill_lower for s in languages): return "Programming Languages"
    if any(s in skill_lower for s in frameworks): return "Frameworks"
    if any(s in skill_lower for s in databases): return "Databases"
    if any(s in skill_lower for s in soft_skills): return "Soft Skills"
    if any(s in skill_lower for s in tools): return "Tools"
    
    return "Libraries" # default tech fallback

def parse_sections(resume_text):
    """Heuristically split resume text into predefined sections."""
    sections = {
        "Education": "",
        "Projects": "",
        "Experience": "",
        "Internship": "",
        "Certifications": "",
        "Achievements": "",
        "Responsibilities": ""
    }
    
    # Define regex patterns for sections
    patterns = {
        "Education": r"(?i)(education|academic|qualifications)",
        "Experience": r"(?i)(experience|employment|work history)",
        "Projects": r"(?i)(projects|academic projects)",
        "Internship": r"(?i)(internship|internships)",
        "Certifications": r"(?i)(certifications|certificates|courses)",
        "Achievements": r"(?i)(achievements|awards|honors)",
        "Responsibilities": r"(?i)(responsibilities|roles|leadership)"
    }
    
    # Split text by lines and find boundaries
    lines = resume_text.split('\n')
    current_section = None
    
    for line in lines:
        line_clean = line.strip()
        if not line_clean:
            continue
            
        # Check if line matches a header (usually short lines)
        if len(line_clean) < 30:
            matched_header = None
            for sec, pattern in patterns.items():
                if re.match(pattern, line_clean):
                    matched_header = sec
                    break
            
            if matched_header:
                current_section = matched_header
                continue
                
        # Append line to current section
        if current_section:
            sections[current_section] += line_clean + "\n"
            
    return sections

def run_extraction_pipeline(resume_path):
    """
    Runs the full end-to-end skill extraction pipeline and returns a structured JSON dictionary.
    """
    print("=== STARTING NLP STRUCTURED EXTRACTION PIPELINE ===")
    
    skills_list = load_and_clean_skills()
    resume_text = read_resume_pdf(resume_path)
    resume_lower = resume_text.lower()
    
    # Extract sections
    parsed_sections = parse_sections(resume_text)
    
    # Extract skills
    extracted_skills = set()
    for skill in skills_list:
        if len(skill) <= 1:
            continue
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, resume_lower):
            extracted_skills.add(skill.title())
            
    if 'c++' in skills_list and 'c++' in resume_lower:
        extracted_skills.add('C++')
        
    # Categorize skills
    tech_skills = {
        "Programming Languages": [],
        "Frameworks": [],
        "Libraries": [],
        "Databases": []
    }
    tools_list = []
    soft_skills_list = []
    
    for skill in extracted_skills:
        cat = categorize_skill(skill)
        if cat in tech_skills:
            tech_skills[cat].append(skill)
        elif cat == "Soft Skills":
            soft_skills_list.append(skill)
        elif cat == "Tools":
            tools_list.append(skill)
            
    # Assemble final JSON
    structured_json = {
        "Education": parsed_sections["Education"].strip(),
        "Technical Skills": tech_skills,
        "Projects": parsed_sections["Projects"].strip(),
        "Experience": parsed_sections["Experience"].strip(),
        "Internship": parsed_sections["Internship"].strip(),
        "Certifications": parsed_sections["Certifications"].strip(),
        "Achievements": parsed_sections["Achievements"].strip(),
        "Tools": ", ".join(tools_list),
        "Responsibilities": parsed_sections["Responsibilities"].strip(),
        "Soft Skills": soft_skills_list
    }
    
    print("[SUCCESS] Parsed resume into structured format.")
    return structured_json

if __name__ == "__main__":
    # Local test
    res = run_extraction_pipeline(r"D:\KAVIYA S 22ITR044 RESUME (1).pdf")
    print(json.dumps(res, indent=2))
