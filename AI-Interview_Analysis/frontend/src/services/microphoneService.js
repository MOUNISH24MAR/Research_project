class MicrophoneService {
  async getStream(constraints = {}) {
    const defaultConstraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      ...constraints
    };

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Microphone access is not supported by your browser.");
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(defaultConstraints);
      return stream;
    } catch (error) {
      console.error("Error accessing microphone:", error);
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        throw new Error("Microphone permission was denied. Please allow microphone access in your browser settings.");
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        throw new Error("No microphone device was found on this system.");
      }
      throw new Error(`Failed to access microphone: ${error.message}`);
    }
  }

  stopStream(stream) {
    if (stream) {
      stream.getTracks().forEach(track => {
        if (track.readyState === "live") {
          track.stop();
        }
      });
    }
  }
}

export const microphoneService = new MicrophoneService();
