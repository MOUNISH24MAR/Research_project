import React, { useState } from 'react';
import { apiService } from './services/api';
import ROUTES from './routes';
import Interview from './pages/Interview/Interview';
import Report from './pages/Report/Report';
import { 
  BrainCircuit, 
  Video, 
  Volume2, 
  Clock, 
  BarChart3, 
  UploadCloud, 
  FileText, 
  Download, 
  Briefcase, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Sliders,
  Cpu,
  Layers
} from 'lucide-react';
import { motion } from 'framer-motion';
import './App.css';
import './styles/global.css';

export const App = () => {
  const [view, setView] = useState(ROUTES.WELCOME);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [backupRecording, setBackupRecording] = useState(false);
  const [resumeSkills, setResumeSkills] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [dynamicQuestions, setDynamicQuestions] = useState(null);
  const [matchScore, setMatchScore] = useState(null);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResumeFile(file);
    setIsExtracting(true);
    try {
      const data = await apiService.uploadResume(file);
      if (data && data.skills) {
        setResumeSkills(data.skills);
      }
    } catch (error) {
      console.error("Resume upload failed:", error);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDownloadSkills = () => {
    if (!resumeSkills || Object.keys(resumeSkills).length === 0) return;
    const skillsText = JSON.stringify(resumeSkills, null, 2);
    const blob = new Blob([skillsText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume_parsed.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleStart = async () => {
    if (!jobRole.trim() || !experienceLevel.trim() || !jobDescription.trim()) {
      alert("Please provide the Job Role, Experience Level, and Job Description.");
      return;
    }
    
    setIsGenerating(true);
    try {
      const response = await apiService.generateQuestions(jobRole, experienceLevel, jobDescription);
      if (response && response.questions) {
        setDynamicQuestions(response.questions);
        if (response.match_score !== undefined) {
          setMatchScore(response.match_score);
        }
        setView(ROUTES.INTERVIEW);
      } else {
        alert("Failed to generate questions. Please try again.");
      }
    } catch (error) {
      console.error("Question generation failed:", error);
      alert(error.message || "Error generating questions from backend.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInterviewComplete = (summary) => {
    setSessionSummary(summary);
    setView(ROUTES.REPORT);
  };

  const handleRestart = () => {
    setSessionSummary(null);
    setView(ROUTES.WELCOME);
  };

  return (
    <div className="app-container">
      {view === ROUTES.WELCOME && (
        <div className="welcome-screen-wrapper">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="welcome-card glass-panel"
          >
            {/* Top Brand Banner */}
            <div className="welcome-hero-header">
              <div className="welcome-logo">
                <div className="welcome-logo-icon">
                  <BrainCircuit size={28} />
                </div>
              </div>
              <div className="welcome-hero-text">
                <div className="hero-pill-badge">
                  <Sparkles size={12} /> ENTERPRISE AI DIAGNOSTIC ENGINE
                </div>
                <h1 className="welcome-title">AI Technical Interview & Candidate Evaluation Platform</h1>
                <p className="welcome-subtitle">
                  Automated resume parsing, job-role alignment scoring, dynamic LLM question generation, and real-time speech diagnostics.
                </p>
              </div>
            </div>

            {/* Feature Capability Cards Grid */}
            <div className="feature-grid">
              <div className="feature-item glass-panel">
                <div className="feature-icon-box">
                  <Video size={20} className="icon-cyan" />
                </div>
                <div className="feature-text">
                  <h3>HD Stream Diagnostics</h3>
                  <p>Synchronized video preview with live frequency visualizer.</p>
                </div>
              </div>

              <div className="feature-item glass-panel">
                <div className="feature-icon-box">
                  <Volume2 size={20} className="icon-blue" />
                </div>
                <div className="feature-text">
                  <h3>Natural TTS & STT</h3>
                  <p>Speech synthesis question reading with Web Speech transcript logging.</p>
                </div>
              </div>

              <div className="feature-item glass-panel">
                <div className="feature-icon-box">
                  <Clock size={20} className="icon-emerald" />
                </div>
                <div className="feature-text">
                  <h3>Automated Pacing</h3>
                  <p>Circular SVG countdown gauges with automatic progression.</p>
                </div>
              </div>

              <div className="feature-item glass-panel">
                <div className="feature-icon-box">
                  <BarChart3 size={20} className="icon-purple" />
                </div>
                <div className="feature-text">
                  <h3>Executive Evaluation</h3>
                  <p>Compiles skill proficiencies, difficulty distribution, and PDF report export.</p>
                </div>
              </div>
            </div>

            {/* Developer Mode Toggle */}
            <div className="recording-toggle-container glass-panel">
              <div className="toggle-header">
                <Sliders size={16} className="text-accent" />
                <span className="toggle-title">System Configuration</span>
              </div>
              <label className="toggle-label">
                <input 
                  type="checkbox" 
                  checked={backupRecording} 
                  onChange={(e) => setBackupRecording(e.target.checked)}
                  className="toggle-checkbox"
                />
                <span className="toggle-switch"></span>
                <span className="toggle-text">Enable Local Backup Recording (Development Mode)</span>
              </label>
              <p className="toggle-subtext">
                When enabled, candidate responses are compiled as MediaStream recordings and uploaded to Flask storage.
              </p>
            </div>

            {/* Resume Upload & NLP Skill Extraction Card */}
            <div className="resume-upload-container glass-panel">
              <div className="section-header">
                <div className="section-title-group">
                  <UploadCloud size={20} className="section-icon text-blue" />
                  <h3>1. Resume Parsing & Skill Extraction</h3>
                </div>
                <span className="step-badge">Step 1 of 2</span>
              </div>
              
              <p className="section-desc">
                Upload candidate PDF resume to extract technical proficiencies and align diagnosis.
              </p>
              
              <div className="upload-dropzone">
                <label className="upload-trigger-btn">
                  <UploadCloud size={16} />
                  <span>Choose Candidate PDF Resume</span>
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={handleResumeUpload} 
                    style={{ display: 'none' }} 
                  />
                </label>
                {resumeFile ? (
                  <div className="uploaded-file-chip">
                    <FileText size={14} className="text-accent" />
                    <span>{resumeFile.name}</span>
                    <CheckCircle2 size={14} className="text-success" />
                  </div>
                ) : (
                  <span className="dropzone-hint">Supports standard PDF formats</span>
                )}
              </div>
              
              {isExtracting && (
                <div className="extracting-status-bar">
                  <Cpu size={16} className="spinner-icon text-accent" />
                  <span>Parsing candidate resume via NLP model...</span>
                </div>
              )}
              
              {!isExtracting && resumeSkills && Object.keys(resumeSkills).length > 0 && (
                <div className="skills-extracted-block">
                  <div className="skills-header">
                    <h4><Layers size={15} /> Extracted Skill Profile:</h4>
                    <button onClick={handleDownloadSkills} className="download-skills-btn">
                      <Download size={13} />
                      <span>Download JSON</span>
                    </button>
                  </div>
                  
                  <div className="skills-badge-wrap">
                    {(() => {
                      const skillsToDisplay = [];
                      if (resumeSkills["Technical Skills"]) {
                        Object.values(resumeSkills["Technical Skills"]).forEach(arr => {
                          if (Array.isArray(arr)) skillsToDisplay.push(...arr);
                        });
                      }
                      if (Array.isArray(resumeSkills["Soft Skills"])) {
                        skillsToDisplay.push(...resumeSkills["Soft Skills"]);
                      }
                      if (resumeSkills["Tools"]) {
                        const tools = resumeSkills["Tools"].split(',').map(t => t.trim()).filter(t => t);
                        skillsToDisplay.push(...tools);
                      }
                      
                      if (skillsToDisplay.length === 0) {
                        return <span className="empty-skills-text">No specific skills parsed.</span>;
                      }
                      
                      return skillsToDisplay.map((skill, index) => (
                        <span key={index} className="skill-chip">
                          {skill}
                        </span>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Job Details & Alignment Matrix */}
            {resumeSkills && Object.keys(resumeSkills).length > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="job-desc-container glass-panel"
              >
                <div className="section-header">
                  <div className="section-title-group">
                    <Briefcase size={20} className="section-icon text-accent" />
                    <h3>2. Target Role & Alignment Matrix</h3>
                  </div>
                  <span className="step-badge">Step 2 of 2</span>
                </div>

                <p className="section-desc">
                  Provide target job specifications to generate tailored AI diagnostic questions and calculate Resume Match Alignment.
                </p>

                <div className="form-inputs-row">
                  <div className="input-field-wrap">
                    <label><Briefcase size={13} /> Job Role Title</label>
                    <input 
                      type="text" 
                      value={jobRole}
                      onChange={(e) => setJobRole(e.target.value)}
                      placeholder="e.g. Senior Software Engineer"
                      className="enterprise-input"
                    />
                  </div>
                  
                  <div className="input-field-wrap">
                    <label><Award size={13} /> Experience Level</label>
                    <input 
                      type="text" 
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      placeholder="e.g. 3+ Years Experience"
                      className="enterprise-input"
                    />
                  </div>
                </div>

                <div className="input-field-wrap full-width">
                  <label><FileText size={13} /> Job Description & Requirements</label>
                  <textarea 
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste target job description and requirements here..."
                    className="enterprise-textarea"
                  />
                </div>
                
                {isGenerating && (
                  <div className="extracting-status-bar shimmer-bg">
                    <BrainCircuit size={16} className="spinner-icon text-accent" />
                    <span>Analyzing role alignment & generating dynamic questions via LLM...</span>
                  </div>
                )}

                <button 
                  className="begin-btn primary-action-btn" 
                  onClick={handleStart} 
                  disabled={isGenerating}
                >
                  <span>{isGenerating ? "Generating Diagnostic Suite..." : "Begin Diagnostic Evaluation"}</span>
                  <ArrowRight size={18} />
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}

      {view === ROUTES.INTERVIEW && (
        <Interview 
          backupRecording={backupRecording} 
          dynamicQuestions={dynamicQuestions}
          matchScore={matchScore}
          onComplete={handleInterviewComplete} 
        />
      )}

      {view === ROUTES.REPORT && (
        <Report 
          sessionSummary={sessionSummary} 
          onRestart={handleRestart} 
        />
      )}
    </div>
  );
};

export default App;
