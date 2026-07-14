# AI Interview Analysis System - Architecture Design (Phase 1)

This document provides a comprehensive overview of the design patterns, interfaces, and file orchestration schemas utilized in Phase 1.

## High-Level Block Diagram

```mermaid
graph TD
    subgraph Frontend (React-Vite)
        App[App.jsx] --> Interview[Interview Page]
        App --> Report[Report Page]
        
        Interview --> Header[Header Component]
        Interview --> Webcam[Webcam Component + Audio Visualizer]
        Interview --> QuestionPanel[Question Panel]
        Interview --> Timer[Circular Timer]
        Interview --> Controls[Mute/Next Controls]
        
        Interview --> CameraService[cameraService.js]
        Interview --> MicService[microphoneService.js]
        Interview --> RecorderService[recorderService.js]
        Interview --> SpeechService[speechService.js (TTS)]
        Interview --> ApiService[api.js]
    end

    subgraph Backend (Flask)
        app.py[app.py Entry] --> BlueprintInt[api/interview.py]
        app.py --> BlueprintUp[api/upload.py]
        
        BlueprintInt --> IntManager[core/interview_manager.py]
        BlueprintUp --> RecManager[core/recording_manager.py]
        
        RecManager --> Storage[storage/recordings/]
        
        subgraph Future AI Pipelines
            AI[ai/ folders]
        end
    end

    ApiService -- POST /start /end --> BlueprintInt
    ApiService -- POST /upload (WebM) --> BlueprintUp
```

## Phase 1 Architecture vs. Future Roadmap

### Development Recording (Phase 1)
In Phase 1, we use `MediaRecorder` to record the interview. This recording mechanism serves as a **temporary development mechanism** rather than the final system design. 
Its purpose is to:
1. Verify device synchronization between video and audio.
2. Provide pre-recorded baseline files for testing and debugging AI models repeatedly without needing live interviews.
3. Validate browser-level media controls and error handling.

### Live AI Analysis (Phase 2+)
Starting in Phase 2, the system will shift from record-and-analyze to **live analysis**. In the future pipeline:
* Raw video frames (via Canvas buffer grabs) and microphone PCM chunks will be sent to the backend in real-time (e.g., using WebSockets).
* AI models will process streams *on the fly*, saving granular metrics (emotion logs, speaking rates, blink counts) incrementally into database models.
* The final report will compile from this *structured database of results*, rather than processing recorded video.

## Design for Future Compatibility
To avoid major code churn or directory restructuring when introducing live processing:
1. **Raw Streams Exposure**: Hooks like [useCamera](file:///d:/AI-Interview_Analysis/frontend/src/hooks/useCamera.js) and [useMicrophone](file:///d:/AI-Interview_Analysis/frontend/src/hooks/useMicrophone.js) expose raw `MediaStream` objects directly. The UI rendering is completely decoupled from the recording logic, meaning we can attach a canvas capture service or audio context processor without modifying the UI layout.
2. **AI Module Interface Stubs**: The backend [ai/](file:///d:/AI-Interview_Analysis/backend/ai) folder is populated with modular helper packages. These files contain base classes with `process_frame()` and `process_audio()` method stubs to guide the development of frame-by-frame analysis in subsequent phases.

---

## System Interfaces & API Definitions

### 1. Start Interview Session
* **Route**: `POST /api/interview/start`
* **Purpose**: Initializes active state for a session.
* **Response**:
  ```json
  {
    "success": true,
    "message": "Interview session started successfully",
    "timestamp": "2026-07-14T22:37:00Z",
    "data": {
      "session_id": "89025e1a-c56a-4933-bf46-3024840e6988",
      "status": "active",
      "start_time": "2026-07-14T22:37:00Z",
      "end_time": null,
      "recordings": []
    }
  }
  ```

### 2. Upload Recording Chunk
* **Route**: `POST /api/upload`
* **Payload**: Multipart form containing:
  - `file`: binary WebM recording.
  - `session_id`: UUID string.
  - `question_id`: string/integer.
  - `file_type`: 'video' | 'audio'.
* **Response**:
  ```json
  {
    "success": true,
    "message": "Recording uploaded and registered successfully",
    "timestamp": "2026-07-14T22:39:12Z",
    "data": {
      "session_id": "89025e1a-c56a-4933-bf46-3024840e6988",
      "question_id": "1",
      "file_path": "backend/storage/recordings/videos/89025e1a-c56a-4933-bf46-3024840e6988/q_1.webm",
      "size_bytes": 1420950
    }
  }
  ```

### 3. Complete Interview Session
* **Route**: `POST /api/interview/end`
* **Payload**: `{ "session_id": "89025e1a-c56a-4933-bf46-3024840e6988" }`
* **Response**:
  ```json
  {
    "success": true,
    "message": "Interview session completed successfully",
    "timestamp": "2026-07-14T22:42:00Z",
    "data": {
      "session_id": "89025e1a-c56a-4933-bf46-3024840e6988",
      "status": "completed",
      "start_time": "2026-07-14T22:37:00Z",
      "end_time": "2026-07-14T22:42:00Z",
      "recordings": [...]
    }
  }
  ```

## Storage Layout
* Recording chunks are structured under folders per session UUID:
  - Videos: `backend/storage/recordings/videos/<session_id>/q_<question_id>.webm`
  - Audio: `backend/storage/recordings/audio/<session_id>/q_<question_id>.wav`
  - Reports: `backend/storage/reports/` (Metadata summary templates)
  - Models: `backend/storage/models/` (Where future CNN and MediaPipe models reside)
