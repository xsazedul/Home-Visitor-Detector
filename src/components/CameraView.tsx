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
  Layers,
  Box,
  Radio,
  Eye,
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

  // Theme-specific styles
  const isLight = theme === "light";
  const isHolo = theme === "hologram";

  const cardBorderClass = isLight
    ? "border-slate-200 bg-white shadow-xl shadow-slate-200/50"
    : isHolo
    ? "border-fuchsia-500/40 bg-[#0c0418] shadow-2xl shadow-fuchsia-950/40"
    : "border-slate-800 bg-slate-950 shadow-2xl shadow-cyan-950/20";

  const toolbarBgClass = isLight
    ? "border-slate-200 bg-slate-50/95"
    : isHolo
    ? "border-fuchsia-900/50 bg-[#16072d]/90"
    : "border-slate-800 bg-slate-900/90";

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 ${cardBorderClass} ${
        isFullscreen ? "h-screen w-screen rounded-none" : "w-full aspect-[4/3] sm:aspect-[16/10]"
      }`}
    >
      {/* Video & 3D Stage Container */}
      <div className={`relative flex-1 w-full h-full overflow-hidden bg-black flex items-center justify-center ${is3DMode ? "perspective-container" : ""}`}>
        {cameraStatus === "active" ? (
          <div
            className={`relative w-full h-full transition-transform duration-500 preserve-3d ${
              is3DMode ? "rotate-x-[2deg] scale-[0.98]" : ""
            }`}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onCanPlay={() => videoRef.current?.play().catch(() => {})}
              className="h-full w-full object-cover scale-x-[-1]"
            />

            {/* 3D Floor Perspective Grid Overlay */}
            {is3DMode && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                {/* 3D Depth Floor Grid */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-1/2 opacity-30 animate-grid-pulse"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(6, 182, 212, 0.4) 0%, transparent 80%), repeating-linear-gradient(90deg, rgba(6,182,212,0.15) 0px, rgba(6,182,212,0.15) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(0deg, rgba(6,182,212,0.15) 0px, rgba(6,182,212,0.15) 1px, transparent 1px, transparent 30px)",
                    transform: "perspective(300px) rotateX(45deg)",
                    transformOrigin: "bottom center",
                  }}
                />

                {/* 3D Holographic Scan Sweep Laser */}
                <div className="absolute inset-x-0 h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(6,182,212,0.8)] animate-scanline-3d opacity-70" />
              </div>
            )}

            {/* Person Detections: 3D Volumetric Cuboid vs 2D Overlay */}
            {isMonitoring &&
              boundingBoxes.map((box, idx) => {
                const normLeft = (1 - (box.x + box.width)) * 100;
                const normTop = box.y * 100;
                const normWidth = box.width * 100;
                const normHeight = box.height * 100;

                // Estimate approximate depth based on visual height (normalized)
                const estimatedDistanceMeters = (1.5 / Math.max(0.2, box.height)).toFixed(1);

                if (is3DMode) {
                  // 3D Volumetric Depth Cuboid Projection
                  const depthOffsetPercentX = -2.5;
                  const depthOffsetPercentY = -3.5;

                  return (
                    <div
                      key={box.trackId || idx}
                      className="absolute pointer-events-none transition-all duration-100 z-20"
                      style={{
                        left: `${normLeft}%`,
                        top: `${normTop}%`,
                        width: `${normWidth}%`,
                        height: `${normHeight}%`,
                      }}
                    >
                      {/* Projected Back Face (Depth Layer) */}
                      <div
                        className="absolute inset-0 rounded-xl border border-dashed border-cyan-400/50 bg-cyan-500/10 transition-transform duration-100"
                        style={{
                          transform: `translate(${depthOffsetPercentX}%, ${depthOffsetPercentY}%) scale(0.92)`,
                        }}
                      />

                      {/* 3D Depth Connection Rays (SVG) */}
                      <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                        <line
                          x1="0"
                          y1="0"
                          x2={`${depthOffsetPercentX}%`}
                          y2={`${depthOffsetPercentY}%`}
                          stroke="rgba(6, 182, 212, 0.7)"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />
                        <line
                          x1="100%"
                          y1="0"
                          x2={`calc(100% + ${depthOffsetPercentX}%)`}
                          y2={`${depthOffsetPercentY}%`}
                          stroke="rgba(6, 182, 212, 0.7)"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />
                        <line
                          x1="0"
                          y1="100%"
                          x2={`${depthOffsetPercentX}%`}
                          y2={`calc(100% + ${depthOffsetPercentY}%)`}
                          stroke="rgba(6, 182, 212, 0.7)"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />
                        <line
                          x1="100%"
                          y1="100%"
                          x2={`calc(100% + ${depthOffsetPercentX}%)`}
                          y2={`calc(100% + ${depthOffsetPercentY}%)`}
                          stroke="rgba(6, 182, 212, 0.7)"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />
                      </svg>

                      {/* Front Face Holographic Frame */}
                      <div className="absolute inset-0 rounded-xl border-2 border-rose-500 bg-rose-500/10 shadow-[0_0_25px_rgba(244,63,94,0.4)]">
                        {/* 4 Corner Reticle Brackets */}
                        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-white" />
                        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-white" />
                        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-white" />
                        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-white" />

                        {/* Center Target Crosshair */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                          <div className="w-4 h-0.5 bg-rose-400" />
                          <div className="h-4 w-0.5 bg-rose-400 absolute" />
                        </div>
                      </div>

                      {/* 3D Footprint Floor Ring */}
                      <div
                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3/4 h-3 rounded-full border border-cyan-400 bg-cyan-400/20 opacity-70 animate-pulse"
                        style={{ transform: "rotateX(60deg)" }}
                      />

                      {/* Floating 3D Holographic Label Badge */}
                      <div className="absolute -top-8 left-0 flex items-center space-x-1.5 rounded-lg bg-black/85 px-2 py-1 text-[10px] font-mono font-bold text-white shadow-xl border border-rose-500 backdrop-blur-md">
                        <span className="text-rose-400">
                          {box.trackId ? box.trackId.toUpperCase().replace("_", " #") : `PERSON #${idx + 1}`}
                        </span>
                        <span className="text-slate-400">&#8226;</span>
                        <span className="text-cyan-300">{box.score}%</span>
                        <span className="text-slate-400">&#8226;</span>
                        <span className="text-emerald-400 font-semibold">{estimatedDistanceMeters}m</span>
                      </div>
                    </div>
                  );
                }

                // 2D Classic Bounding Box
                return (
                  <div
                    key={box.trackId || idx}
                    className="absolute pointer-events-none border-2 border-rose-500 rounded-lg shadow-lg shadow-rose-500/30 transition-all duration-75 z-20"
                    style={{
                      left: `${normLeft}%`,
                      top: `${normTop}%`,
                      width: `${normWidth}%`,
                      height: `${normHeight}%`,
                    }}
                  >
                    <div className="absolute -top-6 left-0 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center space-x-1 whitespace-nowrap">
                      <span>{box.trackId ? box.trackId.toUpperCase().replace("_", " #") : `PERSON #${idx + 1}`}</span>
                      {box.score ? <span className="opacity-90 font-mono">({box.score}%)</span> : null}
                    </div>
                  </div>
                );
              })}

            {/* Camera Flash Animation */}
            {isCapturingFlash && (
              <div className="absolute inset-0 bg-white/80 pointer-events-none transition-opacity duration-150 animate-pulse z-30" />
            )}

            {/* Top HUD Overlay */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/20 to-transparent pointer-events-none">
              <div className="flex items-center space-x-2 pointer-events-auto">
                <div className="flex items-center space-x-1.5 rounded-full border border-cyan-500/40 bg-black/70 px-3 py-1 text-xs font-mono text-cyan-400 backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
                  </span>
                  <span>LIVE_PREVIEW</span>
                </div>

                {isMonitoring && (
                  <div className="flex items-center space-x-1.5 rounded-full border border-emerald-500/40 bg-black/70 px-3 py-1 text-xs font-mono text-emerald-400 backdrop-blur-md">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>GUARD_ACTIVE</span>
                  </div>
                )}

                {is3DMode && (
                  <div className="hidden sm:flex items-center space-x-1.5 rounded-full border border-fuchsia-500/50 bg-black/70 px-2.5 py-1 text-[11px] font-mono text-fuchsia-300 backdrop-blur-md">
                    <Box className="h-3 w-3 text-fuchsia-400 animate-spin-slow" />
                    <span>3D_DEPTH</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 pointer-events-auto">
                {/* 3D Mode Quick Toggle in HUD */}
                <button
                  onClick={onToggle3DMode}
                  title={is3DMode ? "Switch to 2D view" : "Switch to 3D volumetric depth view"}
                  className={`flex items-center space-x-1 rounded-xl px-2.5 py-1 text-xs font-mono font-bold transition-all backdrop-blur-md border ${
                    is3DMode
                      ? "border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-md shadow-cyan-500/30"
                      : "border-slate-700 bg-black/60 text-slate-300 hover:text-white"
                  }`}
                >
                  <Box className="h-3.5 w-3.5" />
                  <span>{is3DMode ? "3D ON" : "3D OFF"}</span>
                </button>

                <button
                  onClick={toggleFullscreen}
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-700 bg-black/60 text-slate-300 backdrop-blur-md hover:border-cyan-400 hover:text-white transition-colors"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Live Movement / Person Alert Banner */}
            {isMonitoring && (detectionStatus === "person_detected" || detectionStatus === "movement") && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                <div
                  className={`flex items-center space-x-2.5 rounded-2xl border-2 px-5 py-2 text-xs font-bold text-white shadow-2xl backdrop-blur-md animate-bounce ${
                    detectionStatus === "person_detected"
                      ? "border-rose-500 bg-rose-600/95"
                      : "border-amber-500 bg-amber-600/95"
                  }`}
                >
                  {detectionStatus === "person_detected" ? (
                    <>
                      <UserCheck className="h-4 w-4" />
                      <span>🚨 PERSON DETECTED IN CAMERA VIEW ({personCount} Visible)</span>
                    </>
                  ) : (
                    <>
                      <Activity className="h-4 w-4" />
                      <span>⚡ MOVEMENT DETECTED (Activity: {motionScore}%)</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Real-time Motion Meter */}
            {isMonitoring && (
              <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>MOTION_ACTIVITY</span>
                  <span className={motionScore > 25 ? "text-amber-400 font-bold" : "text-slate-400"}>
                    {motionScore}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden backdrop-blur-sm">
                  <div
                    className={`h-full transition-all duration-100 ${
                      motionScore > 40
                        ? "bg-rose-500"
                        : motionScore > 20
                        ? "bg-amber-400"
                        : "bg-cyan-500"
                    }`}
                    style={{ width: `${Math.min(100, motionScore)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty / Inactive Camera Placeholder */
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-3xl mb-4 shadow-inner ${
                isLight
                  ? "bg-slate-100 border border-slate-200 text-slate-400"
                  : "bg-slate-900 border border-slate-800 text-slate-500"
              }`}
            >
              <Camera className="h-10 w-10" />
            </div>
            <h3 className={`text-lg font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
              Camera is Inactive
            </h3>
            <p className={`mt-1 max-w-sm text-xs leading-relaxed ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              Click &ldquo;Open Webcam&rdquo; below to allow browser camera access and begin monitoring for visitors.
            </p>
            <button
              onClick={onOpenWebcam}
              className="mt-6 flex items-center space-x-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all"
            >
              <Camera className="h-4 w-4" />
              <span>Open Webcam</span>
            </button>
          </div>
        )}
      </div>

      {/* Control Toolbar */}
      {cameraStatus === "active" && (
        <div className={`relative z-30 flex items-center justify-between border-t px-4 py-3 backdrop-blur-md ${toolbarBgClass}`}>
          {/* Left: Monitoring Toggle */}
          <div className="flex items-center space-x-2">
            {!isMonitoring ? (
              <button
                onClick={onStartMonitoring}
                className="flex items-center space-x-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/25 active:scale-95 transition-all"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Start Monitoring</span>
              </button>
            ) : (
              <button
                onClick={onStopMonitoring}
                className="flex items-center space-x-2 rounded-xl bg-amber-600 hover:bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-amber-600/25 active:scale-95 transition-all"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
                <span>Stop Monitoring</span>
              </button>
            )}

            {/* 1-Click Manual Snap */}
            <button
              onClick={onManualCapture}
              title="Capture a photo manually right now"
              className={`flex items-center space-x-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                isLight
                  ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  : "border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <Camera className="h-3.5 w-3.5 text-cyan-500" />
              <span>Snap Photo</span>
            </button>
          </div>

          {/* Right: 3D Toggle & Stop Camera */}
          <div className="flex items-center space-x-2">
            {/* 3D Depth View Button */}
            <button
              onClick={onToggle3DMode}
              title={is3DMode ? "Turn off 3D depth" : "Activate 3D volumetric cuboids & depth scanning"}
              className={`flex items-center space-x-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                is3DMode
                  ? "border-cyan-500 bg-cyan-600 text-white shadow-md shadow-cyan-500/30"
                  : isLight
                  ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  : "border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              <Box className="h-3.5 w-3.5" />
              <span>{is3DMode ? "3D Active" : "Convert 3D"}</span>
            </button>

            <button
              onClick={onStopCamera}
              className="flex items-center space-x-1.5 rounded-xl border border-rose-500/30 bg-rose-950/40 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-900/50 hover:text-white transition-colors"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
              <span>Stop Camera</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
