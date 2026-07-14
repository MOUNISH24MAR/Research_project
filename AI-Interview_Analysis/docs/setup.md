# System Setup & Deployment Guide (Phase 1)

Follow these steps to configure, build, and deploy the React frontend and Flask backend locally.

## Prerequisite Software
- Python 3.8+
- Node.js 18+ (npm 9+)

---

## 1. Backend (Flask App) Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create a Python Virtual Environment**:
   ```bash
   # On Windows
   python -m venv venv
   # On macOS/Linux
   python3 -m venv venv
   ```

3. **Activate the Virtual Environment**:
   ```bash
   # On Windows (PowerShell)
   .\venv\Scripts\Activate.ps1
   # On Windows (CMD)
   .\venv\Scripts\activate.bat
   # On macOS/Linux
   source venv/bin/activate
   ```

4. **Install Package Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure Environment Variables (Optional)**:
   Create a `.env` file inside the `backend/` directory:
   ```env
   PORT=5000
   DEBUG=True
   ```

6. **Start the Flask Development Server**:
   ```bash
   python app.py
   ```
   The API server will run at: `http://localhost:5000/`

---

## 2. Frontend (React App) Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install npm packages**:
   ```bash
   npm install
   ```

3. **Verify Dev Port & Backend URI Configurations**:
   Create a `.env.local` inside the `frontend/` directory (Optional - defaults to localhost:5000):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the Frontend Development Server**:
   ```bash
   npm run dev
   ```
   The browser will display the splash screen, usually hosting at: `http://localhost:5173/` or `http://localhost:3000/`

---

## 3. Post-Deployment Verification Check
1. Start the Flask Backend.
2. Start the React Frontend.
3. Open the browser and visit the React app address.
4. Check the top-right indicator in the header: it should show **"Flask Connected"** (Emerald dot). If it shows **"Flask Offline"**, ensure that the Flask server is running on port 5000.
5. Click **"Begin Diagnosis & Setup"**, test permissions, and click **"Start Interview"** to initiate question narrations.
