class CameraService {
  async getStream(constraints = {}) {
    const defaultConstraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      },
      ...constraints
    };

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Webcam access is not supported by your browser.");
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(defaultConstraints);
      return stream;
    } catch (error) {
      console.error("Error accessing camera:", error);
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        throw new Error("Camera permission was denied. Please allow camera access in your browser settings.");
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        throw new Error("No camera device was found on this system.");
      }
      throw new Error(`Failed to access camera: ${error.message}`);
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

export const cameraService = new CameraService();
