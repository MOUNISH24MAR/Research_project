class SpeechService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.utterance = null;
    this.voice = null;
    
    // Attempt to load voices immediately
    if (this.synth) {
      this.synth.onvoiceschanged = () => {
        this.selectVoice();
      };
      this.selectVoice();
    }
  }

  selectVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prefer high-quality English speech voices
    this.voice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Natural") || v.lang === "en-US") 
                 || voices.find(v => v.lang.startsWith("en")) 
                 || voices[0];
  }

  speak(text, onStart = null, onEnd = null, onError = null) {
    if (!this.synth) {
      if (onError) onError("Speech synthesis not supported in this browser.");
      return;
    }

    this.stop();

    this.utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) {
      this.utterance.voice = this.voice;
    }
    
    // Configure natural narration settings
    this.utterance.rate = 1.0;  // Normal rate
    this.utterance.pitch = 1.0; // Normal pitch
    this.utterance.volume = 1.0; // Full volume

    if (onStart) this.utterance.onstart = onStart;
    if (onEnd) this.utterance.onend = onEnd;
    if (onError) this.utterance.onerror = onError;

    this.synth.speak(this.utterance);
  }

  stop() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
  }

  pause() {
    if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  isSpeaking() {
    return this.synth ? this.synth.speaking : false;
  }
}

export const speechService = new SpeechService();
