"use client";

import React from "react";
import {
  Volume2,
  VolumeX,
  Eye,
  Activity,
  UserCheck,
  Sun,
  Moon,
  Sparkles,
  Box,
} from "lucide-react";
import { CameraStatus, DetectionStatus, ThemeMode } from "@/types";

interface HeaderProps {
  cameraStatus: CameraStatus;
  detectionStatus: DetectionStatus;
  isMonitoring: boolean;
  alertSoundEnabled: boolean;
  onToggleSound: () => void;
  eventCount: number;
  lastEventTime: string | null;
  theme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
  is3DMode: boolean;
  onToggle3DMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cameraStatus,
  detectionStatus,
  isMonitoring,
  alertSoundEnabled,
  onToggleSound,
  eventCount,
  lastEventTime,
  theme,
  onSelectTheme,
  is3DMode,
  onToggle3DMode,
}) => {
  const isLight = theme === "light";
  const isHolo = theme === "hologram";

  const headerBgClass = isLight
    ? "border-b border-slate-200 bg-white/90 text-slate-800"
    : isHolo
    ? "border-b border-fuchsia-900/40 bg-[#090314]/90 text-slate-100"
    : "border-b border-slate-800 bg-slate-950/85 text-slate-100";

  return (
    <header className={`sticky top-0 z-40 w-full backdrop-blur-xl transition-colors duration-300 ${headerBgClass}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className={`flex h-full w-full items-center justify-center rounded-[10px] ${isLight ? "bg-white" : "bg-slate-950"}`}>
              <Eye className="h-5 w-5 text-cyan-500 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className={`text-lg font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                AI Visitor <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">Detector</span>
              </h1>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400">
                {is3DMode ? "3D DEPTH" : "ACTIVE VISION"}
              </span>
            </div>
            <p className={`hidden text-[11px] sm:block ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              Webcam Movement &amp; Person Detection System
            </p>
          </div>
        </div>

        {/* Live Status Indicators & Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Camera Status Badge */}
          <div
            className={`hidden sm:flex items-center space-x-1.5 rounded-full border px-3 py-1 text-xs ${
              isLight
                ? "border-slate-200 bg-slate-100 text-slate-700"
                : "border-slate-800 bg-slate-900/90 text-slate-300"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                cameraStatus === "active"
                  ? "bg-emerald-400 animate-ping"
                  : cameraStatus === "initializing"
                  ? "bg-amber-400 animate-pulse"
                  : "bg-slate-400"
              }`}
            />
            <span className="font-medium">
              {cameraStatus === "active" ? "Camera Active" : cameraStatus === "initializing" ? "Starting..." : "Inactive"}
            </span>
          </div>

          {/* Monitoring Status Badge */}
          {isMonitoring && (
            <div
              className={`flex items-center space-x-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                detectionStatus === "person_detected"
                  ? "border-rose-500 bg-rose-500/20 text-rose-500 animate-pulse"
                  : detectionStatus === "movement"
                  ? "border-amber-500 bg-amber-500/20 text-amber-500"
                  : "border-emerald-500/50 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {detectionStatus === "person_detected" ? (
                <>
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Person Detected</span>
                </>
              ) : detectionStatus === "movement" ? (
                <>
                  <Activity className="h-3.5 w-3.5" />
                  <span>Movement</span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  </span>
                  <span>Monitoring</span>
                </>
              )}
            </div>
          )}

          {/* 3D Mode Switcher Button */}
          <button
            onClick={onToggle3DMode}
            title={is3DMode ? "Switch to 2D view" : "Convert to 3D volumetric view"}
            className={`flex items-center space-x-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all border ${
              is3DMode
                ? "border-cyan-500 bg-cyan-600 text-white shadow-sm shadow-cyan-500/30"
                : isLight
                ? "border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900"
                : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            <Box className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{is3DMode ? "3D Active" : "Convert 3D"}</span>
          </button>

          {/* Theme Selector (Light / Dark / Hologram) */}
          <div
            className={`flex items-center rounded-xl p-0.5 border ${
              isLight
                ? "border-slate-200 bg-slate-100"
                : isHolo
                ? "border-fuchsia-900/50 bg-[#16072d]"
                : "border-slate-800 bg-slate-900"
            }`}
          >
            <button
              onClick={() => onSelectTheme("light")}
              title="Ultra Light Theme"
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                theme === "light"
                  ? "bg-white text-amber-500 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => onSelectTheme("dark")}
              title="Cyber Dark Theme"
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                theme === "dark"
                  ? "bg-slate-800 text-cyan-400 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Moon className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => onSelectTheme("hologram")}
              title="Hologram Neon 3D Theme"
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                theme === "hologram"
                  ? "bg-fuchsia-600 text-white shadow-sm shadow-fuchsia-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={alertSoundEnabled ? "Mute alert audio" : "Enable alert audio"}
            className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${
              alertSoundEnabled
                ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-500"
                : isLight
                ? "border-slate-200 bg-slate-100 text-slate-400"
                : "border-slate-800 bg-slate-900 text-slate-500 hover:text-slate-300"
            }`}
          >
            {alertSoundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
