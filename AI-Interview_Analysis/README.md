# AI Interview Analysis System - Phase 1

This repository hosts the **AI Interview Analysis System**, structured to establish a hardware-diagnostic setup, interactive 20-question tech interviews narrated via Text-to-Speech (TTS), and optional backup WebM recording.

---

## 📂 Project Structure

```text
ai-interview-system/
├── frontend/                 # Vite + React (Frontend App)
│   ├── src/
│   │   ├── components/       # Header, Webcam, Timer, Controls, ProgressBar, QuestionPanel
│   │   ├── hooks/            # useCamera, useMicrophone, useSpeech, useRecorder
│   │   ├── services/         # cameraService, microphoneService, recorderService, api, speechService
│   │   └── data/             # questions.js (20 technical questions)
│   └── package.json
│
├── backend/                  # Flask Server (Backend API)
│   ├── app.py                # Server Bootstrap
│   ├── config.py             # File and folder setup configs
│   ├── requirements.txt      # Python dependencies
│   ├── api/                  # Blueprint controllers (interview, upload)
│   ├── core/                 # Session Managers (interview_manager, recording_manager)
│   ├── ai/                   # Modular pipeline stubs (Future Face/Speech models)
│   └── storage/              # Video/audio output archives
│
├── docs/                     # Architectural & workflow document logs
│   ├── architecture.md
│   ├── workflow.md
│   └── setup.md
└── README.md                 # Project Setup & Startup Guide (This File)
```

---

## 🛠️ Installation & Setup

### Prerequisites
* **Python 3.8+**
* **Node.js 18+**

---

### 1. Backend (Flask App) Setup

1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Create a Python Virtual Environment:
   ```bash
   python -m venv venv
   ```

3. Activate the Virtual Environment:
   * **On Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   * **On Windows (CMD)**:
     ```cmd
     .\venv\Scripts\activate.bat
     ```
   * **On macOS/Linux**:
     ```bash
     source venv/bin/activate
     ```

4. Install the required python packages:
   ```bash
   pip install -r requirements.txt
   ```

5. Start the Flask server:
   ```bash
   python app.py
   ```
   *The Flask API is now active at `http://localhost:5000/api`.*

---

### 2. Frontend (React App) Setup

1. Open a second terminal window and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install the frontend dependencies:
   ```bash
   npm install
   ```

3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   *The React interface is now running at `http://localhost:5173/`.*

---

## 🚀 Running the Interview Diagnostic

1. Make sure both the **Flask Backend** (port 5000) and **React Frontend** (port 5173) are running.
2. Visit `http://localhost:5173/` in your web browser.
3. Observe the network connectivity dot in the top-right corner of the header: it should glow **Green ("Flask Connected")**.
4. Configure the **Backup Recording Toggle** in the welcome splash screen:
   * **Unchecked (Default)**: Runs the 20 questions, active webcam preview, Speech Synthesis narration, and live frequency mic visualizer *without* compiling or saving video data onto disk.
   * **Checked**: Records WebM files question-by-question and uploads them to `backend/storage/recordings/videos/` as fallback data for developer testing.
5. Click **"Begin Diagnosis & Setup"** to grant camera and microphone access, then click **"Start Interview"** to begin!
