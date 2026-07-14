import React from 'react';
import './Report.css';

export const Report = ({ sessionSummary, onRestart }) => {
  const { sessionId, totalQuestions, totalTime } = sessionSummary;

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="report-page-wrapper">
      <header className="report-header glass-panel">
        <div className="header-logo">
          <div className="logo-icon"></div>
          <h1>AI Interview Summary Report</h1>
        </div>
        <button className="restart-btn" onClick={onRestart}>
          🔄 Start New Interview
        </button>
      </header>

      <main className="report-main">
        {/* Session Meta Stats */}
        <section className="meta-stats-grid">
          <div className="stat-card glass-panel">
            <span className="stat-label">Session ID</span>
            <span className="stat-value monospace">{sessionId ? sessionId.substring(0, 18) : 'N/A'}...</span>
          </div>
          <div className="stat-card glass-panel">
            <span className="stat-label">Questions Completed</span>
            <span className="stat-value">{totalQuestions} / 20</span>
          </div>
          <div className="stat-card glass-panel">
            <span className="stat-label">Total Duration</span>
            <span className="stat-value">{formatDuration(totalTime || 0)}</span>
          </div>
          <div className="stat-card glass-panel">
            <span className="stat-label">Recording Status</span>
            <span className="stat-value success-text">Saved & Secured</span>
          </div>
        </section>

        {/* AI Analytics Mockups Section */}
        <section className="analytics-section">
          <div className="section-header">
            <h2>AI Analysis Insights</h2>
            <span className="phase-badge">Phase 2 Scheduled</span>
          </div>

          <div className="analytics-grid">
            {/* Emotion Card */}
            <div className="analytics-card glass-panel pending">
              <div className="card-badge">Pending Phase 2</div>
              <h3>🎭 Emotion & Facial Expression</h3>
              <p className="card-desc">Tracks dynamic emotions like confidence, calm, stress, and engagement through camera keyframes.</p>
              <div className="mockup-chart emotion-chart">
                <div className="bar-row"><span className="lbl">Confidence</span><div className="bar-track"><div className="bar-fill shimmer-bg" style={{width: '78%'}}></div></div><span className="val">78%</span></div>
                <div className="bar-row"><span className="lbl">Calmness</span><div className="bar-track"><div className="bar-fill shimmer-bg" style={{width: '85%'}}></div></div><span className="val">85%</span></div>
                <div className="bar-row"><span className="lbl">Engagement</span><div className="bar-track"><div className="bar-fill shimmer-bg" style={{width: '90%'}}></div></div><span className="val">90%</span></div>
              </div>
            </div>

            {/* Speech Analysis Card */}
            <div className="analytics-card glass-panel pending">
              <div className="card-badge">Pending Phase 2</div>
              <h3>🎙️ Speech & Voice Analytics</h3>
              <p className="card-desc">Measures speaking rate, pitch modulation, pauses, filler words, and vocal confidence levels.</p>
              <div className="mockup-chart speech-chart">
                <div className="stat-metric"><span className="num">142</span><span className="lbl">Words / Min (Ideal)</span></div>
                <div className="stat-metric"><span className="num">4</span><span className="lbl">Filler Words Detected</span></div>
              </div>
            </div>

            {/* Behavioral analysis card */}
            <div className="analytics-card glass-panel pending">
              <div className="card-badge">Pending Phase 2</div>
              <h3>🧠 Behavioral Analysis Summary</h3>
              <p className="card-desc">Cross-references facial features and tone to assess overall composure, eye contact, and clarity.</p>
              <div className="mockup-chart behaviors-chart">
                <div className="radial-metric-row">
                  <div className="circle-stat"><span className="num">82%</span><span className="lbl">Eye Contact</span></div>
                  <div className="circle-stat"><span className="num">88%</span><span className="lbl">Clarity</span></div>
                </div>
              </div>
            </div>

            {/* Report generation card */}
            <div className="analytics-card glass-panel pending">
              <div className="card-badge">Pending Phase 2</div>
              <h3>📝 Complete PDF Report & Review</h3>
              <p className="card-desc">Downloadable structured interview dashboard with detailed breakdown per answer and custom coaching advice.</p>
              <div className="mockup-chart download-chart">
                <button className="mock-btn" disabled>📥 Export PDF Evaluation (Phase 2)</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Report;
