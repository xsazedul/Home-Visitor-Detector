export type CameraStatus = "inactive" | "initializing" | "active" | "error";

export type DetectionStatus = "standby" | "monitoring" | "movement" | "person_detected";

export type MotionSensitivity = "low" | "medium" | "high";

export type SoundType = "sonar_ping" | "alert_chime" | "warning_beep" | "pulse_alarm";

export interface DetectionEvent {
  id: string;
  sequenceNumber: number;
  type: "PERSON_DETECTED" | "MOVEMENT_DETECTED";
  timestamp: number;
  formattedTime: string;
  thumbnail: string;
  motionScore?: number;
}

export interface DetectedBox {
  x: number;
  y: number;
  width: number;
  height: number;
  score: number;
  trackId?: string;
}

export type ThemeMode = "dark" | "light" | "hologram";

export interface MonitoringConfig {
  sensitivity: MotionSensitivity;
  personConfidence: number; // 0.20 to 0.70 (default ~0.32)
  cooldownSeconds: number; // e.g. 5-10s
  absenceTimeoutSeconds: number; // e.g. 2s before re-entry triggers new event
  alertSoundEnabled: boolean;
  soundType: SoundType;
  alertVolume: number; // 0.0 to 1.0
  triggerOnPerson: boolean;
  triggerOnMovement: boolean;
  autoCapture: boolean;
  theme: ThemeMode;
  is3DMode: boolean;
}
