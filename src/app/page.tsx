"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { CameraView } from "@/components/CameraView";
import { ControlPanel } from "@/components/ControlPanel";
import { EventHistory } from "@/components/EventHistory";

import {
  CameraStatus,
  DetectionStatus,
  MonitoringConfig,
  DetectionEvent,
  DetectedBox,
} from "@/types";

import { motionDetector } from "@/utils/motionDetector";
import { initPersonDetector, detectPersons } from "@/utils/personDetector";
import { personTracker } from "@/utils/personTracker";
import { alertAudio } from "@/utils/audio";
import { AlertCircle, Shield, CheckCircle2, Lock } from "lucide-react";

export default function VisitorDetectorPage() {
  // Camera & Stream
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("inactive");
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Monitoring & Detection State
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState<DetectionStatus>("standby");
  const [motionScore, setMotionScore] = useState(0);
  const [personCount, setPersonCount] = useState(0);
  const [boundingBoxes, setBoundingBoxes] = useState<DetectedBox[]>([]);
  const [isCapturingFlash, setIsCapturingFlash] = useState(false);

  // Inference pacing & overlap guard
  const isInferencingRef = useRef(false);
  const lastInferenceTimeRef = useRef(0);

  // Configuration
  const [config, setConfig] = useState<MonitoringConfig>({
    sensitivity: "medium",
    personConfidence: 0.30,
    cooldownSeconds: 8,
    absenceTimeoutSeconds: 2,
    alertSoundEnabled: true,
    soundType: "sonar_ping",
    alertVolume: 0.8,
    triggerOnPerson: true,
    triggerOnMovement: true,
    autoCapture: true,
    theme: "light", // Ultra Light theme enabled by default
    is3DMode: true, // 3D depth mode converted and enabled
  });

  const toggle3DMode = useCallback(() => {
    setConfig((prev) => ({ ...prev, is3DMode: !prev.is3DMode }));
  }, []);

  const selectTheme = useCallback((theme: ThemeMode) => {
    setConfig((prev) => ({ ...prev, theme }));
  }, []);

  // History & Tracking
  const [events, setEvents] = useState<DetectionEvent[]>([]);
  const sequenceCounterRef = useRef(1);
  const lastCaptureTimeRef = useRef(0);

  // Capture frame helper
  const captureEventFrame = useCallback(
    (type: "PERSON_DETECTED" | "MOVEMENT_DETECTED", currentMotionScore = 0) => {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0 || video.videoHeight === 0) return;

      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Mirror snapshot to match display
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnail = canvas.toDataURL("image/jpeg", 0.88);

        // Flash and Audio
        setIsCapturingFlash(true);
        setTimeout(() => setIsCapturingFlash(false), 180);

        if (config.alertSoundEnabled) {
          alertAudio.playAlert(config.soundType, config.alertVolume);
        }
        alertAudio.playShutter(0.5);

        const now = Date.now();
        const newEvent: DetectionEvent = {
          id: `event-${now}-${Math.random().toString(36).substr(2, 6)}`,
          sequenceNumber: sequenceCounterRef.current++,
          type,
          timestamp: now,
          formattedTime: new Date(now).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          thumbnail,
          motionScore: currentMotionScore,
        };

        setEvents((prev) => [newEvent, ...prev]);
        lastCaptureTimeRef.current = now;
      } catch (err) {
        console.warn("Capture frame error:", err);
      }
    },
    [config.alertSoundEnabled, config.soundType, config.alertVolume]
  );

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraStream(null);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    motionDetector.reset();
    personTracker.reset();
    isInferencingRef.current = false;
    setIsMonitoring(false);
    setCameraStatus("inactive");
    setDetectionStatus("standby");
    setMotionScore(0);
    setPersonCount(0);
    setBoundingBoxes([]);
  }, []);

  // Request & Start Camera
  const openWebcam = async () => {
    setPermissionError(null);
    setCameraStatus("initializing");

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setCameraStream(stream);
      setCameraStatus("active");

      // Auto start monitoring when webcam opens
      setIsMonitoring(true);
      setDetectionStatus("monitoring");
      personTracker.reset();

      // Init person detector in background
      initPersonDetector().catch((err) => {
        console.warn("ObjectDetector loading in background:", err);
      });
    } catch (err: unknown) {
      console.error("Camera access error:", err);
      let errMsg = "Unable to access camera.";
      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          errMsg =
            "Camera permission denied. Please allow camera access in your browser settings and retry.";
        } else if (err.name === "NotFoundError") {
          errMsg = "No camera found. Please connect a webcam.";
        } else if (err.name === "NotReadableError") {
          errMsg = "Camera is currently in use by another app. Please close other camera apps.";
        } else {
          errMsg = err.message;
        }
      }
      setPermissionError(errMsg);
      setCameraStatus("error");
    }
  };

  // Start & Stop Monitoring
  const startMonitoring = () => {
    setIsMonitoring(true);
    setDetectionStatus("monitoring");
    motionDetector.reset();
    personTracker.reset();
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    setDetectionStatus("standby");
    setMotionScore(0);
    setPersonCount(0);
    setBoundingBoxes([]);
    personTracker.reset();
  };

  // Simulate Test Detection
  const handleSimulateDetection = () => {
    captureEventFrame("PERSON_DETECTED", 85);
  };

  // Main Detection Loop with Inference Pacing and PersonTracker
  useEffect(() => {
    if (cameraStatus !== "active" || !isMonitoring) return;

    const runDetection = () => {
      const video = videoRef.current;
      if (video && video.readyState >= 2 && !video.paused) {
        const perfNow = performance.now();
        const wallClockNow = Date.now();

        // 1. Motion Detection (Canvas frame difference) - runs smoothly each frame
        const { motionDetected, motionScore: curMotionScore } = motionDetector.detectMotion(
          video,
          config.sensitivity
        );
        setMotionScore(curMotionScore);

        // 2. Person Detection & Tracking (Target ~13-14 FPS, approx every 75ms)
        // With isInferencingRef guard to prevent overlapping inference
        const timeSinceLastInference = perfNow - lastInferenceTimeRef.current;
        const TARGET_INTERVAL_MS = 75;

        if (timeSinceLastInference >= TARGET_INTERVAL_MS && !isInferencingRef.current) {
          isInferencingRef.current = true;
          lastInferenceTimeRef.current = perfNow;

          try {
            // Run MediaPipe ObjectDetector for full-body human detection
            const personRes = detectPersons(
              video,
              perfNow,
              config.personConfidence ?? 0.30
            );

            // Update temporal tracking across frames
            const absenceTimeoutMs = (config.absenceTimeoutSeconds ?? 2) * 1000;
            const trackerResult = personTracker.update(
              personRes.detections,
              wallClockNow,
              absenceTimeoutMs
            );

            setPersonCount(trackerResult.totalCount);
            setBoundingBoxes(trackerResult.activeTracks.map((t) => t.box));

            // Cooldown check for rate-limiting captures
            const cooldownMs = config.cooldownSeconds * 1000;
            const cooldownExpired = wallClockNow - lastCaptureTimeRef.current > cooldownMs;

            // Trigger Evaluation:
            // PRIMARY TRIGGER: Person Detection
            // When a new person walks into the frame or re-enters after absence
            if (config.triggerOnPerson && trackerResult.isNewPersonDetected && cooldownExpired) {
              setDetectionStatus("person_detected");
              captureEventFrame("PERSON_DETECTED", curMotionScore);
            }
            // SECONDARY TRIGGER: Motion activity (only if no person is present)
            else if (
              config.triggerOnMovement &&
              motionDetected &&
              trackerResult.totalCount === 0 &&
              cooldownExpired
            ) {
              setDetectionStatus("movement");
              captureEventFrame("MOVEMENT_DETECTED", curMotionScore);
            }
            // STATUS UPDATE
            else if (trackerResult.totalCount > 0) {
              setDetectionStatus("person_detected");
            } else if (motionDetected) {
              setDetectionStatus("movement");
            } else {
              setDetectionStatus("monitoring");
            }
          } catch (inferErr) {
            console.warn("Detection loop error:", inferErr);
          } finally {
            isInferencingRef.current = false;
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(runDetection);
    };

    animFrameRef.current = requestAnimationFrame(runDetection);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      isInferencingRef.current = false;
    };
  }, [
    cameraStatus,
    isMonitoring,
    config.sensitivity,
    config.personConfidence,
    config.cooldownSeconds,
    config.absenceTimeoutSeconds,
    config.triggerOnPerson,
    config.triggerOnMovement,
    captureEventFrame,
  ]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const lastEvent = events[0] || null;

  const isLight = config.theme === "light";
  const isHolo = config.theme === "hologram";

  const rootBgClass = isLight
    ? "bg-slate-100 text-slate-900 selection:bg-cyan-500/20 selection:text-cyan-900"
    : isHolo
    ? "bg-[#070114] text-slate-100 selection:bg-fuchsia-500/30 selection:text-fuchsia-300"
    : "bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-300";

  const footerClass = isLight
    ? "border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500"
    : isHolo
    ? "border-t border-fuchsia-950 bg-[#070114] py-5 text-center text-xs text-slate-500"
    : "border-t border-slate-900 bg-slate-950 py-5 text-center text-xs text-slate-500";

  return (
    <div className={`flex min-h-screen flex-col transition-colors duration-300 ${rootBgClass}`}>
      {/* Top Header */}
      <Header
        cameraStatus={cameraStatus}
        detectionStatus={detectionStatus}
        isMonitoring={isMonitoring}
        alertSoundEnabled={config.alertSoundEnabled}
        onToggleSound={() =>
          setConfig((c) => ({ ...c, alertSoundEnabled: !c.alertSoundEnabled }))
        }
        eventCount={events.length}
        lastEventTime={lastEvent ? lastEvent.formattedTime : null}
        theme={config.theme}
        onSelectTheme={selectTheme}
        is3DMode={config.is3DMode}
        onToggle3DMode={toggle3DMode}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl flex-1 px-4 py-6 sm:px-6 w-full space-y-6">
        {/* Permission Error Banner */}
        {permissionError && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-950/40 p-4 text-xs text-rose-200 backdrop-blur-md flex items-start justify-between">
            <div className="flex items-start space-x-2.5">
              <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-300 text-sm">Camera Permission Error</h4>
                <p className="mt-1 leading-relaxed">{permissionError}</p>
              </div>
            </div>
            <button
              onClick={() => setPermissionError(null)}
              className="text-rose-400 hover:text-white font-bold ml-2"
            >
              &times;
            </button>
          </div>
        )}

        {/* Studio Grid: Camera Feed (Left/Top) + Controls & Telemetry (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Camera Feed (8 cols on desktop) */}
          <div className="lg:col-span-8 w-full space-y-6">
            <CameraView
              videoRef={videoRef}
              stream={cameraStream}
              cameraStatus={cameraStatus}
              detectionStatus={detectionStatus}
              isMonitoring={isMonitoring}
              motionScore={motionScore}
              personCount={personCount}
              boundingBoxes={boundingBoxes}
              isCapturingFlash={isCapturingFlash}
              theme={config.theme}
              is3DMode={config.is3DMode}
              onToggle3DMode={toggle3DMode}
              onOpenWebcam={openWebcam}
              onStartMonitoring={startMonitoring}
              onStopMonitoring={stopMonitoring}
              onStopCamera={stopCamera}
              onManualCapture={() => captureEventFrame("PERSON_DETECTED", motionScore)}
            />

            {/* Event History Panel */}
            <EventHistory
              events={events}
              onDeleteEvent={(id) => setEvents((prev) => prev.filter((e) => e.id !== id))}
              onClearHistory={() => setEvents([])}
              theme={config.theme}
            />
          </div>

          {/* Control & Configuration Panel (4 cols on desktop) */}
          <div className="lg:col-span-4 w-full">
            <ControlPanel
              config={config}
              onUpdateConfig={(newConf) => setConfig((prev) => ({ ...prev, ...newConf }))}
              onTestSound={() => alertAudio.playAlert(config.soundType, config.alertVolume)}
              onSimulateDetection={handleSimulateDetection}
              eventCount={events.length}
              lastEventTime={lastEvent ? lastEvent.formattedTime : null}
              isMonitoring={isMonitoring}
              onToggle3DMode={toggle3DMode}
            />
          </div>
        </div>
      </main>

      {/* Global Footer */}
      <footer className={footerClass}>
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono">
          <div className="flex items-center space-x-2 text-slate-500">
            <Shield className="h-3.5 w-3.5 text-cyan-500" />
            <span>AI Visitor Detector &#8226; Local Computer Vision</span>
          </div>
          <div>
            <span>No remote image uploads &#8226; In-browser execution only</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
