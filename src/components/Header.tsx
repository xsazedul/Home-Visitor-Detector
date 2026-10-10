"use client";

import React from "react";
import {
  Volume2,
  VolumeX,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Sun,
  Moon,
  Sparkles,
  Layers,
  Box,
  Video,
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
  theme,
  onSelectTheme,
  is3DMode,
  onToggle3DMode,
}) => {
  const isLight = theme === "light";
  const isDark = theme === "dark";
  const isMidnight = theme === "midnight";

  const headerContainerClass = isLight
    ? "border-b border-neutral-200/80 bg-white/80 text-neutral-900"
    : isMidnight
    ? "border-b border-neutral-800/80 bg-[#090b10]/85 text-neutral-100"
    : "border-b border-neutral-800/80 bg-neutral-950/85 text-neutral-100";

  return (
    <header className={`sticky top-0 z-40 w-full backdrop-blur-md transition-colors duration-200 ${headerContainerClass}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand identity */}
        <div className="flex items-center space-x-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
              isLight
                ? "border-neutral-200 bg-neutral-100 text-neutral-800 shadow-sm"
                : "border-neutral-700/60 bg-neutral-900 text-neutral-200 shadow-inner"
            }`}
          >
            <Video className="h-4 w-4" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold tracking-tight text-sm sm:text-base">
                Vision Guard
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase ${
                  isLight
                    ? "bg-neutral-100 text-neutral-600 border border-neutral-200"
                    : "bg-neutral-800/70 text-neutral-300 border border-neutral-700/60"
                }`}
              >
                Edge AI
              </span>
            </div>
            <p className="hidden text-[11px] text-neutral-500 sm:block -mt-0.5">
              Intelligent Home &amp; Office Visitor Monitor
            </p>
          </div>
        </div>

        {/* System telemetry & Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Camera hardware status */}
          <div
            className={`hidden sm:flex items-center space-x-2 rounded-full border px-2.5 py-1 text-xs ${
              isLight
                ? "border-neutral-200 bg-neutral-50 text-neutral-600"
                : "border-neutral-800 bg-neutral-900/60 text-neutral-400"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                cameraStatus === "active"
                  ? "bg-emerald-500 ring-2 ring-emerald-500/20"
                  : cameraStatus === "initializing"
                  ? "bg-amber-400 ring-2 ring-amber-400/20"
                  : "bg-neutral-400"
              }`}
            />
            <span className="font-medium text-[11px]">
              {cameraStatus === "active" ? "Camera Active" : cameraStatus === "initializing" ? "Connecting..." : "Camera Inactive"}
            </span>
          </div>

          {/* Guard Monitoring State */}
          <div
            className={`flex items-center space-x-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
              !isMonitoring
                ? isLight
                  ? "border-neutral-200 bg-neutral-100/80 text-neutral-500"
                  : "border-neutral-800 bg-neutral-900 text-neutral-400"
                : detectionStatus === "person_detected"
                ? "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                : detectionStatus === "movement"
                ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : isLight
                ? "border-emerald-500/30 bg-emerald-50 text-emerald-700"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            }`}
          >
            {isMonitoring ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                <span className="text-[11px]">
                  {detectionStatus === "person_detected"
                    ? "Person Detected"
                    : detectionStatus === "movement"
                    ? "Motion Active"
                    : "Guard Armed"}
                </span>
              </>
            ) : (
              <>
                <Shield className="h-3 w-3 text-neutral-400" />
                <span className="text-[11px]">Standby</span>
              </>
            )}
          </div>

          {/* Spatial 3D Toggle */}
          <button
            onClick={onToggle3DMode}
            title={is3DMode ? "Switch to 2D standard view" : "Enable 3D spatial depth projection"}
            className={`flex items-center space-x-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${
              is3DMode
                ? isLight
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700 shadow-xs"
                  : "border-indigo-500/40 bg-indigo-500/15 text-indigo-300"
                : isLight
                ? "border-neutral-200 bg-neutral-50 text-neutral-600 hover:text-neutral-900"
                : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Box className="h-3 w-3" />
            <span className="hidden sm:inline">3D Spatial</span>
          </button>

          {/* Theme switcher pill */}
          <div
            className={`flex items-center rounded-full border p-0.5 ${
              isLight
                ? "border-neutral-200 bg-neutral-100"
                : "border-neutral-800 bg-neutral-900"
            }`}
          >
            <button
              onClick={() => onSelectTheme("light")}
              title="Light studio theme"
              className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${
                isLight
                  ? "bg-white text-neutral-900 shadow-xs font-semibold"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Sun className="h-3 w-3" />
            </button>
            <button
              onClick={() => onSelectTheme("dark")}
              title="Dark theme"
              className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${
                isDark
                  ? "bg-neutral-800 text-neutral-100 shadow-xs font-semibold"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Moon className="h-3 w-3" />
            </button>
            <button
              onClick={() => onSelectTheme("midnight")}
              title="Midnight cobalt theme"
              className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${
                isMidnight
                  ? "bg-indigo-600 text-white shadow-xs font-semibold"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Sparkles className="h-3 w-3" />
            </button>
          </div>

          {/* Sound mute button */}
          <button
            onClick={onToggleSound}
            title={alertSoundEnabled ? "Mute audio alarms" : "Unmute audio alarms"}
            className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
              alertSoundEnabled
                ? isLight
                  ? "border-neutral-300 bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  : "border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
                : isLight
                ? "border-neutral-200 bg-transparent text-neutral-400 hover:text-neutral-600"
                : "border-neutral-800 bg-transparent text-neutral-500 hover:text-neutral-300"
            }`}
          >
            {alertSoundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
