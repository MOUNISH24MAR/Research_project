class RecorderService {
  constructor() {
    this.mediaRecorder = null;
    this.recordedChunks = [];
  }

  getSupportedMimeType() {
    const types = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4"
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return "";
  }

  start(combinedStream, timeslice = 1000) {
    this.recordedChunks = [];
    const mimeType = this.getSupportedMimeType();
    
    const options = {};
    if (mimeType) {
      options.mimeType = mimeType;
    }

    try {
      this.mediaRecorder = new MediaRecorder(combinedStream, options);
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(timeslice);
      console.log(`MediaRecorder started with MIME type: ${this.mediaRecorder.mimeType}`);
    } catch (error) {
      console.error("Failed to start MediaRecorder:", error);
      throw new Error(`MediaRecorder failed: ${error.message}`);
    }
  }

  stop() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === "inactive") {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder.mimeType || "video/webm";
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        this.recordedChunks = [];
        resolve(blob);
      };

      this.mediaRecorder.onerror = (event) => {
        reject(event.error);
      };

      this.mediaRecorder.stop();
    });
  }

  pause() {
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.pause();
    }
  }

  resume() {
    if (this.mediaRecorder && this.mediaRecorder.state === "paused") {
      this.mediaRecorder.resume();
    }
  }

  getState() {
    return this.mediaRecorder ? this.mediaRecorder.state : "inactive";
  }
}

export const recorderService = new RecorderService();
