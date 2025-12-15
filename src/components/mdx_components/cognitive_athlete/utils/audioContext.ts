class BreathingAudio {
  private ctx: AudioContext | null = null;
  private mainGain: GainNode | null = null;
  private isEnabled: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Lazy init
    }
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      this.ctx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      this.mainGain = this.ctx.createGain();
      this.mainGain.connect(this.ctx.destination);
      this.mainGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  start() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isEnabled = true;
  }

  stop() {
    this.isEnabled = false;
    if (this.ctx && this.mainGain) {
      // Fade out
      const now = this.ctx.currentTime;
      this.mainGain.gain.cancelScheduledValues(now);
      this.mainGain.gain.setTargetAtTime(0, now, 0.1);
    }
  }

  setPhase(phase: string, duration: number) {
    if (!this.isEnabled || !this.ctx || !this.mainGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    osc.connect(oscGain);
    oscGain.connect(this.mainGain);

    // Default params
    let startFreq = 200;
    let endFreq = 200;
    const volume = 0.15;

    switch (phase) {
      case 'inhale':
        startFreq = 180;
        endFreq = 280;
        osc.type = 'sine';
        break;
      case 'inhale-short':
        startFreq = 280;
        endFreq = 320;
        osc.type = 'sine';
        break;
      case 'hold':
        startFreq = 320; // Maintain the high note
        endFreq = 320;
        osc.type = 'sine';
        break;
      case 'exhale':
        startFreq = 320;
        endFreq = 160;
        osc.type = 'sine'; // deeply relaxing
        break;
      default:
        return;
    }

    // Frequency Envelope
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

    // Amplitude Envelope (ADSR-ish)
    oscGain.gain.setValueAtTime(0, now);
    oscGain.gain.linearRampToValueAtTime(volume, now + 0.1); // Attack

    // Sustain is implicit as we hold volume until release

    // Release
    oscGain.gain.setValueAtTime(volume, now + duration - 0.2);
    oscGain.gain.linearRampToValueAtTime(0, now + duration);

    // Start/Stop
    osc.start(now);
    osc.stop(now + duration + 0.1);

    // Ensure main gain is up (if it was faded out)
    this.mainGain.gain.cancelScheduledValues(now);
    this.mainGain.gain.setValueAtTime(1, now);
  }
}

export const breathingAudio = new BreathingAudio();
