"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Camera,
  Play,
  Pause,
  RotateCcw,
  RefreshCw,
  Maximize2,
  Minimize2,
  Square,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";
import { ScanningOverlay } from "./ScanningOverlay";
import { LandmarkPoint, PoseType, FaceMetrics } from "@/types";

interface CameraStreamProps {
  stream: MediaStream | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  landmarks: LandmarkPoint[] | null;
  allFaces: LandmarkPoint[][];
  faceMetrics: FaceMetrics;
  isScanning: boolean;
  scanLineProgress: number;
  activePose: PoseType | null;
  arrowDirection: "center" | "left" | "right" | "up" | "down" | "smile" | null;
  isPoseMatched: boolean;
  isCapturingFlash: boolean;
  showMeshWireframe: boolean;
  onToggleMesh: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onRetakeAll: () => void;
  onSwitchCamera: () => void;
  onStopCamera: () => void;
  onSnapPhoto?: () => void;
  isVisitorMode: boolean;
}

export const CameraStream: React.FC<CameraStreamProps> = ({
  stream,
  videoRef,
  landmarks,
  allFaces,
  faceMetrics,
  isScanning,
  scanLineProgress,
  activePose,
  arrowDirection,
  isPoseMatched,
  isCapturingFlash,
  showMeshWireframe,
  onToggleMesh,
  isPaused,
  onTogglePause,
  onRetakeAll,
  onSwitchCamera,
  onStopCamera,
  onSnapPhoto,
  isVisitorMode,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 480 });

  // Update canvas sizing to match video intrinsic aspect ratio
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const v = videoRef.current;
      setVideoDimensions({
        width: v.videoWidth || 640,
        height: v.videoHeight || 480,
      });
      v.play().catch((err) => console.warn(err));
    }
  };

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  // Attach stream to video element whenever stream prop or videoRef changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (stream) {
      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }
      video.play().catch((err) => {
        console.warn("Video auto-play prevented or pending interaction:", err);
      });
    } else {
      video.srcObject = null;
    }
  }, [stream, videoRef]);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl transition-all duration-300 ${
        isFullscreen ? "h-screen w-screen rounded-none" : "w-full aspect-[4/3] sm:aspect-[16/10]"
      }`}
    >
      {/* Live Video Feed Interior */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-slate-950">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={() => videoRef.current?.play().catch(() => {})}
          className={`h-full w-full object-cover transition-transform duration-300 ${
            // Mirror image for user-facing camera natural feel
            "scale-x-[-1]"
          }`}
        />

        {/* 3D Real-time Facial Landmark Overlay */}
        <ScanningOverlay
          landmarks={landmarks}
          allFaces={allFaces}
          videoWidth={videoDimensions.width}
          videoHeight={videoDimensions.height}
          isScanning={isScanning}
          scanLineProgress={scanLineProgress}
          activePose={activePose}
          arrowDirection={arrowDirection}
          isPoseMatched={isPoseMatched}
          isCapturingFlash={isCapturingFlash}
          showMeshWireframe={showMeshWireframe}
          isVisitorMode={isVisitorMode}
        />

        {/* Ambient Top HUD Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 via-black/20 to-transparent pointer-events-none">
          <div className="flex items-center space-x-2 pointer-events-auto">
            <div className="flex items-center space-x-1.5 rounded-full border border-sky-400/40 bg-black/60 px-3 py-1 text-xs font-mono font-medium text-sky-300 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
              </span>
              <span>LIVE_3D_FEED</span>
            </div>

            {landmarks && (
              <div className="hidden sm:flex items-center space-x-1.5 rounded-full border border-white/20 bg-black/60 px-2.5 py-1 text-[11px] font-mono text-white/90 backdrop-blur-md">
                <Sparkles className="h-3 w-3 text-violet-400" />
                <span>468 LANDMARKS</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 pointer-events-auto">
            <button
              onClick={onToggleMesh}
              title={showMeshWireframe ? "Hide 3D Wireframe" : "Show 3D Wireframe"}
              className={`rounded-xl border px-3 py-1 text-xs font-medium backdrop-blur-md transition-colors ${
                showMeshWireframe
                  ? "border-sky-400/50 bg-sky-500/30 text-sky-200"
                  : "border-white/20 bg-black/60 text-white/70 hover:text-white"
              }`}
            >
              <Layers className="inline h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">Wireframe</span>
            </button>

            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/20 bg-black/60 text-white backdrop-blur-md hover:border-sky-400/50 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Live Visitor Alert Banner */}
        {allFaces.length > 1 && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <div className="flex items-center space-x-2 rounded-2xl border-2 border-rose-500 bg-rose-600/95 px-5 py-2 text-xs font-bold text-white shadow-2xl animate-bounce backdrop-blur-md">
              <span className="flex h-2.5 w-2.5 rounded-full bg-white animate-ping" />
              <span>🚨 VISITOR DETECTED! ({allFaces.length} Faces in Camera View)</span>
            </div>
          </div>
        )}

        {/* Floating Alignment Feedback Pill at Bottom-Center */}
        <div className="absolute bottom-16 left-1/2 z-20 -translate-x-1/2 pointer-events-none">
          <div
            className={`flex items-center space-x-2 rounded-full px-4 py-1.5 text-xs font-semibold backdrop-blur-md shadow-lg transition-all ${
              !faceMetrics.detected
                ? "border border-amber-400/50 bg-amber-950/80 text-amber-200"
                : faceMetrics.isPoseMatched
                ? "border border-emerald-400/60 bg-emerald-950/80 text-emerald-200"
                : "border border-sky-400/50 bg-black/80 text-sky-200"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-current animate-ping" />
            <span>{faceMetrics.alignmentMessage}</span>
          </div>
        </div>

        {/* Disclaimer watermark in bottom corner */}
        <div className="absolute bottom-3 left-4 z-20 pointer-events-none">
          <span className="text-[10px] text-white/60 font-mono tracking-tight">
            *Visual 3D tracking representation. Non-medical optical analysis.
          </span>
        </div>
      </div>

      {/* Camera Control Footer Bar (Ultra-Light) */}
      <div className="relative z-30 flex items-center justify-between border-t border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur-md">
        {/* Left: Device Switching */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onSwitchCamera}
            title="Switch front/back camera"
            className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-sky-300 hover:text-sky-700 hover:bg-sky-50/50 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Flip Camera</span>
          </button>

          <button
            onClick={onRetakeAll}
            title="Reset & retake photo sequence"
            className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50/50 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Retake Poses</span>
          </button>
        </div>

        {/* Center: Manual Snap Button & Pause / Resume */}
        <div className="flex items-center space-x-2.5">
          {onSnapPhoto && (
            <button
              onClick={onSnapPhoto}
              title="Click to take photo immediately"
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-violet-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-sky-600/25 hover:scale-105 active:scale-95 transition-all"
            >
              <Camera className="h-4 w-4" />
              <span>Snap Photo Now</span>
            </button>
          )}

          <button
            onClick={onTogglePause}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-2xs transition-all ${
              isPaused
                ? "bg-sky-600 text-white hover:bg-sky-700 shadow-sky-600/20"
                : "border border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:text-sky-700"
            }`}
          >
            {isPaused ? <Play className="h-3.5 w-3.5 fill-current" /> : <Pause className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isPaused ? "Resume" : "Pause"}</span>
          </button>
        </div>

        {/* Right: Release / Stop Camera */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onStopCamera}
            className="flex items-center space-x-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 hover:text-rose-900 transition-colors"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
            <span>Stop Camera</span>
          </button>
        </div>
      </div>
    </div>
  );
};
