import React from 'react';
import { 
  BrainCircuit, 
  Printer, 
  RotateCcw, 
  Award, 
  Target, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  FileText, 
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import './Report.css';

export const Report = ({ sessionSummary, onRestart }) => {
  const { sessionId, totalQuestions, totalTime, matchScore, evaluations, finalScore, finalMaxScore } = sessionSummary;

  // 1. Calculations
  const questionsAttempted = evaluations.filter(e => e.transcript && e.transcript.trim().length > 0).length;
  const overallPercentage = finalMaxScore > 0 ? Math.round((finalScore / finalMaxScore) * 100) : 0;

  // 2. Skill-wise Aggregations
  const skillAggregates = evaluations.reduce((acc, curr) => {
    const skill = curr.skill || 'General';
    if (!acc[skill]) {
      acc[skill] = { obtained: 0, total: 0 };
    }
    acc[skill].obtained += curr.score || 0;
    acc[skill].total += curr.maxScore || 10;
    return acc;
  }, {});

  const skillScores = Object.entries(skillAggregates).map(([skill, data]) => ({
    skill,
    obtained: data.obtained,
    total: data.total,
    percentage: data.total > 0 ? Math.round((data.obtained / data.total) * 100) : 0
  })).sort((a, b) => b.percentage - a.percentage);

  // 3. Difficulty-wise Aggregations
  const difficultyAggregates = evaluations.reduce((acc, curr) => {
    const diff = curr.difficulty || 'Medium';
    if (!acc[diff]) {
      acc[diff] = { obtained: 0, total: 0, count: 0 };
    }
    acc[diff].obtained += curr.score || 0;
    acc[diff].total += curr.maxScore || 10;
    acc[diff].count += 1;
    return acc;
  }, {});

  const difficulties = ["Easy", "Medium", "Hard"];
  const difficultyScores = difficulties.map(diff => {
    const data = difficultyAggregates[diff] || { obtained: 0, total: 0, count: 0 };
    return {
      difficulty: diff,
      obtained: data.obtained,
      total: data.total,
      count: data.count,
      percentage: data.total > 0 ? Math.round((data.obtained / data.total) * 100) : 0
    };
  });

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="report-page-wrapper">
      <header className="report-header glass-panel">
        <div className="header-brand-group">
          <div className="brand-logo-icon">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h1 className="report-title">Candidate Evaluation Report</h1>
            <p className="report-subtitle">Session ID: {sessionId} • Generated via AI Diagnostic Engine</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="export-pdf-btn" onClick={handlePrint}>
            <Printer size={15} />
            <span>Export PDF Report</span>
          </button>
          <button className="restart-btn" onClick={onRestart}>
            <RotateCcw size={15} />
            <span>Start New Diagnosis</span>
          </button>
        </div>
      </header>

      <main className="report-main">
        {/* Key Performance Metric Cards Strip */}
        <section className="meta-stats-grid">
          <div className="stat-card glass-panel highlight-card">
            <div className="stat-card-header">
              <Award size={18} className="stat-icon text-primary" />
              <span className="stat-label">Overall Performance</span>
            </div>
            <div className="stat-value-group">
              <span className="stat-value text-primary">{overallPercentage}%</span>
              <span className="stat-subtext">{finalScore} / {finalMaxScore} Cumulative Marks</span>
            </div>
          </div>

          <div className="stat-card glass-panel">
            <div className="stat-card-header">
              <Target size={18} className="stat-icon text-accent" />
              <span className="stat-label">Resume Alignment</span>
            </div>
            <div className="stat-value-group">
              <span className="stat-value">{matchScore}%</span>
              <span className="stat-subtext">Job Match Score</span>
            </div>
          </div>

          <div className="stat-card glass-panel">
            <div className="stat-card-header">
              <CheckCircle2 size={18} className="stat-icon text-emerald" />
              <span className="stat-label">Diagnostic Completion</span>
            </div>
            <div className="stat-value-group">
              <span className="stat-value">{evaluations.length} / {totalQuestions}</span>
              <span className="stat-subtext">Questions Evaluated</span>
            </div>
          </div>

          <div className="stat-card glass-panel">
            <div className="stat-card-header">
              <TrendingUp size={18} className="stat-icon text-purple" />
              <span className="stat-label">Candidate Engagement</span>
            </div>
            <div className="stat-value-group">
              <span className="stat-value">{questionsAttempted}</span>
              <span className="stat-subtext">Questions Responded</span>
            </div>
          </div>

          <div className="stat-card glass-panel">
            <div className="stat-card-header">
              <Clock size={18} className="stat-icon text-cyan" />
              <span className="stat-label">Total Duration</span>
            </div>
            <div className="stat-value-group">
              <span className="stat-value">{formatDuration(totalTime || 0)}</span>
              <span className="stat-subtext">Total Elapsed Time</span>
            </div>
          </div>
        </section>

        <div className="dashboard-grid">
          {/* Left Column: Aggregated Analytics Charts */}
          <div className="dashboard-left">
            <div className="analytics-card glass-panel">
              <div className="card-header-bar">
                <BarChart3 size={18} className="card-icon text-primary" />
                <div>
                  <h3>Skill-wise Technical Proficiency</h3>
                  <p className="card-desc">Candidate breakdown across tested technical domains.</p>
                </div>
              </div>
              
              <div className="css-chart">
                {skillScores.length > 0 ? skillScores.map((s, idx) => (
                  <div className="chart-bar-row" key={idx}>
                    <div className="chart-label-group">
                      <span className="chart-label">{s.skill}</span>
                      <span className="chart-score-text">{s.obtained} / {s.total} Marks ({s.percentage}%)</span>
                    </div>
                    <div className="chart-track">
                      <div 
                        className={`chart-fill ${s.percentage >= 80 ? 'high' : s.percentage >= 60 ? 'med' : 'low'}`} 
                        style={{ width: `${s.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )) : <p className="empty-state">No skills evaluated.</p>}
              </div>
            </div>

            <div className="analytics-card glass-panel">
              <div className="card-header-bar">
                <PieChart size={18} className="card-icon text-accent" />
                <div>
                  <h3>Difficulty Level Breakdown</h3>
                  <p className="card-desc">Proficiency distribution across question complexities.</p>
                </div>
              </div>
              
              <div className="difficulty-metrics">
                {difficultyScores.map((diff, idx) => (
                  <div className={`diff-card diff-${diff.difficulty.toLowerCase()}`} key={idx}>
                    <h4>{diff.difficulty}</h4>
                    <span className="diff-count">{diff.count} Questions</span>
                    <div className="diff-circle">
                      <span className="diff-pct">{diff.percentage}%</span>
                    </div>
                    <span className="diff-score">{diff.obtained}/{diff.total} Marks</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Complete Question Evaluation History */}
          <div className="dashboard-right">
            <div className="analytics-card glass-panel full-height">
              <div className="card-header-bar">
                <FileText size={18} className="card-icon text-cyan" />
                <div>
                  <h3>Complete Response & Evaluation Audit</h3>
                  <p className="card-desc">Transcribed audio responses and automated AI grading transcript.</p>
                </div>
              </div>
              
              <div className="history-list">
                {evaluations.map((ev, idx) => (
                  <div className="history-item glass-panel" key={idx}>
                    <div className="history-header">
                      <div className="history-meta">
                        <span className="q-number">Q{idx + 1}</span>
                        <span className="q-skill tag">{ev.skill}</span>
                        <span className={`q-diff tag diff-${ev.difficulty.toLowerCase()}`}>{ev.difficulty}</span>
                      </div>
                      <div className="history-score">
                        <span className="score-val">{ev.score}</span>
                        <span className="score-max">/{ev.maxScore}</span>
                      </div>
                    </div>
                    
                    <div className="history-body">
                      <div className="history-qa">
                        <h5>Question Text:</h5>
                        <p className="q-text">{ev.questionText}</p>
                      </div>
                      <div className="history-qa">
                        <h5>Expected Ideal Answer:</h5>
                        <p className="a-expected">{ev.expectedAnswer || "Contextual explanation required."}</p>
                      </div>
                      <div className="history-qa">
                        <h5>Candidate Spoken Response:</h5>
                        <p className={ev.transcript ? "a-candidate" : "a-candidate empty"}>
                          {ev.transcript || "(No spoken response detected / Question Skipped)"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Report;
