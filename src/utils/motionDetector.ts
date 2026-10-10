import { MotionSensitivity } from "@/types";

export class MotionDetector {
  private sampleWidth = 160;
  private sampleHeight = 120;
  private prevFrame: Uint8Array | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.canvas = document.createElement("canvas");
      this.canvas.width = this.sampleWidth;
      this.canvas.height = this.sampleHeight;
      this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
    }
  }

  reset() {
    this.prevFrame = null;
  }

  detectMotion(
    video: HTMLVideoElement,
    sensitivity: MotionSensitivity = "medium"
  ): {
    motionDetected: boolean;
    motionScore: number; // 0 to 100 percentage of significant change
  } {
    if (!this.canvas || !this.ctx || video.videoWidth === 0 || video.videoHeight === 0) {
      return { motionDetected: false, motionScore: 0 };
    }

    try {
      // Draw downscaled frame
      this.ctx.drawImage(video, 0, 0, this.sampleWidth, this.sampleHeight);
      const imgData = this.ctx.getImageData(0, 0, this.sampleWidth, this.sampleHeight);
      const data = imgData.data;

      const totalPixels = this.sampleWidth * this.sampleHeight;
      const currentGray = new Uint8Array(totalPixels);

      // Convert to luminance array
      for (let i = 0; i < totalPixels; i++) {
        const idx = i * 4;
        currentGray[i] = Math.round(0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]);
      }

      if (!this.prevFrame) {
        this.prevFrame = currentGray;
        return { motionDetected: false, motionScore: 0 };
      }

      // Pixel delta threshold to ignore sensor noise (e.g. slight sensor grain)
      const pixelDiffThreshold = 28;
      let changedPixelCount = 0;

      for (let i = 0; i < totalPixels; i++) {
        const diff = Math.abs(currentGray[i] - this.prevFrame[i]);
        if (diff > pixelDiffThreshold) {
          changedPixelCount++;
        }
      }

      // Update baseline frame with blend factor to handle gradual ambient lighting changes
      this.prevFrame = currentGray;

      // Percentage of pixels that changed significantly
      const changedRatio = (changedPixelCount / totalPixels) * 100;
      const motionScore = Math.min(100, Math.round(changedRatio * 8));

      // Trigger threshold depending on sensitivity setting
      // Low: needs larger movement (e.g. 5% of screen)
      // Medium: standard human movement (e.g. 2.5% of screen)
      // High: subtle gesture or distant entrance (e.g. 1.2% of screen)
      let triggerThreshold = 2.5;
      if (sensitivity === "low") {
        triggerThreshold = 5.0;
      } else if (sensitivity === "high") {
        triggerThreshold = 1.2;
      }

      const motionDetected = changedRatio >= triggerThreshold;

      return { motionDetected, motionScore };
    } catch (e) {
      console.warn("Motion detection error:", e);
      return { motionDetected: false, motionScore: 0 };
    }
  }
}

export const motionDetector = new MotionDetector();
