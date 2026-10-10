import { SoundType } from "@/types";

class AudioAlertSynthesizer {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playAlert(type: SoundType = "sonar_ping", volume = 0.8) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      if (type === "sonar_ping") {
        // High-tech Sonar Ping
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(880, now); // A5
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15); // A6

        gain.gain.setValueAtTime(volume * 0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.42);
      } else if (type === "alert_chime") {
        // Two-tone warning chime
        const freqs = [587.33, 880]; // D5, A5
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);

          gain.gain.setValueAtTime(volume * 0.35, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.5);
        });
      } else if (type === "warning_beep") {
        // Warning beep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(1046.5, now); // C6

        gain.gain.setValueAtTime(volume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.24);
      } else if (type === "pulse_alarm") {
        // Pulse alarm
        const freqs = [659.25, 523.25, 659.25];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "square";
          osc.frequency.setValueAtTime(freq, now + idx * 0.09);

          gain.gain.setValueAtTime(volume * 0.22, now + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.18);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.09);
          osc.stop(now + idx * 0.09 + 0.2);
        });
      }
    } catch (e) {
      console.warn("Audio alert error", e);
    }
  }

  playShutter(volume = 0.6) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.06);

      gain.gain.setValueAtTime(volume * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {
      console.warn("Shutter sound error", e);
    }
  }
}

export const alertAudio = new AudioAlertSynthesizer();
