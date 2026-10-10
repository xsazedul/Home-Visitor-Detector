"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Camera,
  Play,
  Square,
  Maximize2,
  Minimize2,
  UserCheck,
  Activity,
  Box,
  Shield,
  ShieldAlert,
  Power,
} from "lucide-react";
import { CameraStatus, DetectionStatus, DetectedBox, ThemeMode } from "@/types";

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
  cameraStatus: CameraStatus;
  detectionStatus: DetectionStatus;
  isMonitoring: boolean;
  motionScore: number;
  personCount: number;
  boundingBoxes: DetectedBox[];
  isCapturingFlash: boolean;
  theme: ThemeMode;
  is3DMode: boolean;
  onToggle3DMode: () => void;
  onOpenWebcam: () => void;
  onStartMonitoring: () => void;
  onStopMonitoring: () => void;
  onStopCamera: () => void;
  onManualCapture: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  stream,
  cameraStatus,
  detectionStatus,
  isMonitoring,
  motionScore,
  personCount,
  boundingBoxes,
  isCapturingFlash,
  theme,
  is3DMode,
  onToggle3DMode,
  onOpenWebcam,
  onStartMonitoring,
  onStopMonitoring,
  onStopCamera,
  onManualCapture,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Bind stream directly to video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (stream) {
      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }
      video.play().catch((err) => console.warn("Video play error:", err));
    } else {
      video.srcObject = null;
    }
  }, [stream, videoRef]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const isLight = theme === "light";
  const isMidnight = theme === "midnight";

  const cardBorderClass = isLight
    ? "border border-neutral-200/90 bg-white shadow-sm"
    : isMidnight
    ? "border border-neutral-800/80 bg-[#0c0f18] shadow-lg shadow-black/40"
    : "border border-neutral-800/80 bg-neutral-900 shadow-lg shadow-black/40";

  return (
    <div
      ref={containerRef}
      className={`group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-200 ${cardBorderClass} ${
        isFullscreen ? "h-screen w-screen rounded-none" : "w-full aspect-[4/3] sm:aspect-[16/10]"
      }`}
    >
      {/* Video Viewport Stage */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-neutral-950 flex items-center justify-center">
        {cameraStatus === "active" ? (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onCanPlay={() => videoRef.current?.play().catch(() => {})}
              className="h-full w-full object-cover scale-x-[-1]"
            />

            {/* Bounding Boxes / Spatial Depth Vision */}
            {isMonitoring &&
              boundingBoxes.map((box, idx) => {
                const normLeft = (1 - (box.x + box.width)) * 100;
                const normTop = box.y * 100;
                const normWidth = box.width * 100;
                const normHeight = box.height * 100;
                const estimatedDistanceMeters = (1.6 / Math.max(0.18, box.height)).toFixed(1);

                if (is3DMode) {
                  // Clean, professional spatial computer vision cuboid (Tesla/Waymo style)
                  const depthOffsetX = -2.2;
                  const depthOffsetY = -3.2;

                  return (
                    <div
                      key={box.trackId || idx}
                      className="absolute pointer-events-none transition-all duration-75 z-20"
                      style={{
                        left: `${normLeft}%`,
                        top: `${normTop}%`,
                        width: `${normWidth}%`,
                        height: `${normHeight}%`,
                      }}
                    >
                      {/* Depth rear plane */}
                      <div
                        className="absolute inset-0 rounded-lg border border-dashed border-indigo-400/60 transition-transform duration-75"
                        style={{
                          transform: `translate(${depthOffsetX}%, ${depthOffsetY}%) scale(0.93)`,
                        }}
                      />

                      {/* Corner perspective depth connectors */}
                      <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                        <line x1="0" y1="0" x2={`${depthOffsetX}%`} y2={`${depthOffsetY}%`} stroke="rgba(129, 140, 248, 0.7)" strokeWidth="1" strokeDasharray="2 2" />
                        <line x1="100%" y1="0" x2={`calc(100% + ${depthOffsetX}%)`} y2={`${depthOffsetY}%`} stroke="rgba(129, 140, 248, 0.7)" strokeWidth="1" strokeDasharray="2 2" />
                        <line x1="0" y1="100%" x2={`${depthOffsetX}%`} y2={`calc(100% + ${depthOffsetY}%)`} stroke="rgba(129, 140, 248, 0.7)" strokeWidth="1" strokeDasharray="2 2" />
                        <line x1="100%" y1="100%" x2={`calc(100% + ${depthOffsetX}%)`} y2={`calc(100% + ${depthOffsetY}%)`} stroke="rgba(129, 140, 248, 0.7)" strokeWidth="1" strokeDasharray="2 2" />
                      </svg>

                      {/* Front bounding frame */}
                      <div className="absolute inset-0 rounded-lg border border-rose-500 bg-rose-500/5">
                        <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-rose-400" />
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-rose-400" />
                        <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-rose-400" />
                        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-rose-400" />
                      </div>

                      {/* Ground contact plane indicator */}
                      <div
                        className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4/5 h-2.5 rounded-full border border-indigo-400/50 bg-indigo-500/15"
                        style={{ transform: "rotateX(60deg)" }}
                      />

                      {/* Discreet metadata label badge */}
                      <div className="absolute -top-7 left-0 flex items-center space-x-1.5 rounded-md bg-neutral-900/90 px-2 py-0.5 text-[10px] font-mono text-neutral-200 border border-neutral-700/80 shadow-md backdrop-blur-sm whitespace-nowrap">
                        <span className="font-semibold text-rose-400">
                          {box.trackId ? box.trackId.toUpperCase().replace("_", " #") : `VISITOR #${idx + 1}`}
                        </span>
                        <span className="text-neutral-500">·</span>
                        <span>{box.score}%</span>
                        <span className="text-neutral-500">·</span>
                        <span className="text-indigo-300 font-medium">{estimatedDistanceMeters}m</span>
                      </div>
                    </div>
                  );
                }

                // 2D Clean modern bounding box
                return (
                  <div
                    key={box.trackId || idx}
                    className="absolute pointer-events-none rounded-lg border-1.5 border-rose-500 bg-rose-500/5 transition-all duration-75 z-20"
                    style={{
                      left: `${normLeft}%`,
                      top: `${normTop}%`,
                      width: `${normWidth}%`,
                      height: `${normHeight}%`,
                    }}
                  >
                    <div className="absolute -top-6 left-0 rounded bg-neutral-900/90 px-2 py-0.5 text-[10px] font-mono font-medium text-neutral-200 border border-neutral-700 shadow-sm flex items-center space-x-1 whitespace-nowrap backdrop-blur-sm">
                      <span className="text-rose-400 font-semibold">
                        {box.trackId ? box.trackId.toUpperCase().replace("_", " #") : `VISITOR #${idx + 1}`}
                      </span>
                      {box.score ? <span className="text-neutral-400">({box.score}%)</span> : null}
                    </div>
                  </div>
                );
              })}

            {/* Camera Snapshot Shutter Animation */}
            {isCapturingFlash && (
              <div className="absolute inset-0 bg-white pointer-events-none camera-shutter-flash z-30" />
            )}

            {/* Clean On-Screen Display (OSD) Header */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3.5 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none">
              <div className="flex items-center space-x-2 pointer-events-auto">
                <div className="flex items-center space-x-1.5 rounded-md bg-black/60 px-2.5 py-1 text-[11px] font-mono text-neutral-200 backdrop-blur-md border border-white/10">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold tracking-wide">CAM 01 · LIVE</span>
                </div>

                {isMonitoring && (
                  <div className="flex items-center space-x-1.5 rounded-md bg-black/60 px-2 py-1 text-[11px] font-mono text-neutral-300 backdrop-blur-md border border-white/10">
                    <Shield className="h-3 w-3 text-emerald-400" />
                    <span>ARMED</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 pointer-events-auto">
                <div className="hidden sm:block rounded-md bg-black/60 px-2 py-1 text-[10px] font-mono text-neutral-400 backdrop-blur-md border border-white/10">
                  1080P · 60FPS
                </div>

                <button
                  onClick={toggleFullscreen}
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-neutral-300 backdrop-blur-md border border-white/10 hover:text-white hover:bg-black/80 transition-colors"
                >
                  {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Smart Detection Notification Toast */}
            {isMonitoring && (detectionStatus === "person_detected" || detectionStatus === "movement") && (
              <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-200">
                <div
                  className={`flex items-center space-x-2 rounded-full px-3.5 py-1 text-xs font-medium text-white shadow-lg backdrop-blur-md border ${
                    detectionStatus === "person_detected"
                      ? "border-rose-500/50 bg-rose-600/90 shadow-rose-950/40"
                      : "border-amber-500/50 bg-amber-600/90 shadow-amber-950/40"
                  }`}
                >
                  {detectionStatus === "person_detected" ? (
                    <>
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Person in View ({personCount})</span>
                    </>
                  ) : (
                    <>
                      <Activity className="h-3.5 w-3.5" />
                      <span>Motion Activity ({motionScore}%)</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Subtle Real-time Activity Meter */}
            {isMonitoring && (
              <div className="absolute bottom-16 left-4 right-4 z-20 pointer-events-none">
                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 mb-1">
                  <span>Activity</span>
                  <span>{motionScore}%</span>
                </div>
                <div className="h-1 w-full bg-black/60 rounded-full overflow-hidden backdrop-blur-sm">
                  <div
                    className={`h-full transition-all duration-100 ${
                      motionScore > 35 ? "bg-rose-500" : motionScore > 15 ? "bg-amber-400" : "bg-neutral-400"
                    }`}
                    style={{ width: `${Math.min(100, motionScore)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Floating Glass Control Dock */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-1.5 rounded-full border border-white/15 bg-black/75 px-3 py-1.5 backdrop-blur-xl shadow-xl">
              {/* Arm/Disarm Button */}
              {!isMonitoring ? (
                <button
                  onClick={onStartMonitoring}
                  className="flex items-center space-x-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 px-3 py-1 text-xs font-medium text-white transition-all"
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span>Arm Guard</span>
                </button>
              ) : (
                <button
                  onClick={onStopMonitoring}
                  className="flex items-center space-x-1.5 rounded-full bg-amber-600 hover:bg-amber-500 px-3 py-1 text-xs font-medium text-white transition-all"
                >
                  <Square className="h-3 w-3 fill-current" />
                  <span>Pause Guard</span>
                </button>
              )}

              <div className="h-4 w-px bg-white/20 mx-1" />

              {/* Spatial 3D toggle */}
              <button
                onClick={onToggle3DMode}
                title={is3DMode ? "Turn off 3D spatial box" : "Enable 3D spatial box & depth estimation"}
                className={`flex items-center space-x-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  is3DMode
                    ? "bg-indigo-600 text-white"
                    : "text-neutral-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Box className="h-3.5 w-3.5" />
                <span>3D</span>
              </button>

              {/* Manual Snap */}
              <button
                onClick={onManualCapture}
                title="Capture instant snapshot"
                className="flex items-center space-x-1 rounded-full px-2.5 py-1 text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Camera className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Snapshot</span>
              </button>

              {/* Power Off Camera */}
              <button
                onClick={onStopCamera}
                title="Disconnect camera"
                className="flex h-7 w-7 items-center justify-center rounded-full text-rose-400 hover:bg-rose-500/20 transition-colors"
              >
                <Power className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Empty Camera State */
          <div className="flex flex-col items-center justify-center p-8 text-center max-w-sm">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl mb-4 transition-colors ${
                isLight
                  ? "bg-neutral-100 text-neutral-500 border border-neutral-200"
                  : "bg-neutral-900 text-neutral-400 border border-neutral-800"
              }`}
            >
              <Camera className="h-7 w-7" />
            </div>
            <h3 className={`text-base font-semibold ${isLight ? "text-neutral-900" : "text-neutral-100"}`}>
              Webcam is Disconnected
            </h3>
            <p className={`mt-1.5 text-xs leading-relaxed ${isLight ? "text-neutral-500" : "text-neutral-400"}`}>
              Connect your camera to begin intelligent movement monitoring and visitor presence detection.
            </p>
            <button
              onClick={onOpenWebcam}
              className={`mt-5 flex items-center space-x-2 rounded-xl px-5 py-2.5 text-xs font-semibold transition-all shadow-sm ${
                isLight
                  ? "bg-neutral-900 text-white hover:bg-neutral-800"
                  : "bg-white text-neutral-900 hover:bg-neutral-100"
              }`}
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Connect Camera</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
