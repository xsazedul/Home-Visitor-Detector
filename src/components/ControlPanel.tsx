"use client";

import React from "react";
import {
  Sliders,
  Volume2,
  VolumeX,
  Clock,
  Camera,
  Zap,
  Box,
  Sun,
  Moon,
  Sparkles,
  Layers,
} from "lucide-react";
import { MonitoringConfig, MotionSensitivity, SoundType, ThemeMode } from "@/types";

interface ControlPanelProps {
  config: MonitoringConfig;
  onUpdateConfig: (newConfig: Partial<MonitoringConfig>) => void;
  onTestSound: () => void;
  onSimulateDetection: () => void;
  eventCount: number;
  lastEventTime: string | null;
  isMonitoring: boolean;
  onToggle3DMode: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  config,
  onUpdateConfig,
  onTestSound,
  onSimulateDetection,
  eventCount,
  lastEventTime,
  isMonitoring,
  onToggle3DMode,
}) => {
  const isLight = config.theme === "light";
  const isHolo = config.theme === "hologram";

  const containerBg = isLight
    ? "border-slate-200 bg-white/95 text-slate-900 shadow-xl shadow-slate-200/50"
    : isHolo
    ? "border-fuchsia-900/40 bg-[#0d041a]/90 text-slate-100 shadow-2xl shadow-fuchsia-950/40"
    : "border-slate-800 bg-slate-900/80 text-slate-100 shadow-xl";

  const subCardBg = isLight
    ? "border-slate-200 bg-slate-50"
    : isHolo
    ? "border-fuchsia-900/30 bg-[#16072d]/70"
    : "border-slate-800 bg-slate-950/60";

  return (
    <div className={`flex flex-col space-y-4 rounded-3xl border p-5 backdrop-blur-xl transition-colors duration-300 ${containerBg}`}>
      {/* Telemetry Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-2xl border p-3.5 ${subCardBg}`}>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <Camera className="h-3.5 w-3.5 text-cyan-500" />
            <span>Captured Visitors</span>
          </div>
          <div className={`mt-1 text-2xl font-black font-mono ${isLight ? "text-slate-900" : "text-white"}`}>
            {eventCount}
          </div>
        </div>

        <div className={`rounded-2xl border p-3.5 ${subCardBg}`}>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <Clock className="h-3.5 w-3.5 text-indigo-500" />
            <span>Last Detected</span>
          </div>
          <div className={`mt-1 text-xs font-mono font-bold truncate ${isLight ? "text-slate-800" : "text-slate-200"}`}>
            {lastEventTime || "No events yet"}
          </div>
        </div>
      </div>

      {/* Visual Theme Selector Card */}
      <div className={`rounded-2xl border p-4 space-y-2.5 text-xs ${subCardBg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 font-bold">
            <Layers className="h-4 w-4 text-cyan-500" />
            <span>Visual Theme</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-500 uppercase font-bold">
            {config.theme}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Light Theme */}
          <button
            onClick={() => onUpdateConfig({ theme: "light" })}
            className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
              config.theme === "light"
                ? "border-amber-400 bg-amber-50 text-amber-900 shadow-sm font-bold"
                : isLight
                ? "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            <Sun className="h-4 w-4 text-amber-500 mb-1" />
            <span className="text-[11px]">Ultra Light</span>
          </button>

          {/* Dark Theme */}
          <button
            onClick={() => onUpdateConfig({ theme: "dark" })}
            className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
              config.theme === "dark"
                ? "border-cyan-500 bg-cyan-950/60 text-cyan-300 shadow-sm font-bold"
                : isLight
                ? "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            <Moon className="h-4 w-4 text-cyan-400 mb-1" />
            <span className="text-[11px]">Cyber Dark</span>
          </button>

          {/* Hologram Theme */}
          <button
            onClick={() => onUpdateConfig({ theme: "hologram" })}
            className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
              config.theme === "hologram"
                ? "border-fuchsia-500 bg-fuchsia-950/60 text-fuchsia-300 shadow-sm font-bold"
                : isLight
                ? "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="h-4 w-4 text-fuchsia-400 mb-1" />
            <span className="text-[11px]">Hologram 3D</span>
          </button>
        </div>
      </div>

      {/* 3D Mode Card */}
      <div className={`rounded-2xl border p-4 space-y-2 text-xs ${subCardBg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 font-bold">
            <Box className="h-4 w-4 text-fuchsia-500" />
            <span>3D Volumetric Vision</span>
          </div>

          <button
            onClick={onToggle3DMode}
            className={`rounded-xl px-3 py-1 font-bold text-xs transition-all ${
              config.is3DMode
                ? "bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white shadow-md shadow-fuchsia-600/30"
                : isLight
                ? "border border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
                : "border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            {config.is3DMode ? "3D Active" : "Enable 3D"}
          </button>
        </div>
        <p className={`text-[11px] leading-relaxed ${isLight ? "text-slate-500" : "text-slate-400"}`}>
          Renders 3D depth cuboids, holographic floor grid, estimated visitor distances in meters, and corner target reticles.
        </p>
      </div>

      {/* Detection Configuration */}
      <div className={`rounded-2xl border p-4 space-y-3.5 text-xs ${subCardBg}`}>
        <div className="flex items-center justify-between border-b pb-2.5 border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2 font-bold">
            <Sliders className="h-4 w-4 text-cyan-500" />
            <span>Detection Settings</span>
          </div>
          <button
            onClick={onSimulateDetection}
            title="Simulate visitor detection to test alert"
            className="flex items-center space-x-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/20 transition-colors"
          >
            <Zap className="h-3 w-3" />
            <span>Test Trigger</span>
          </button>
        </div>

        {/* Person Detection Confidence */}
        <div>
          <div className="flex items-center justify-between">
            <label className="font-medium">Person Confidence Threshold</label>
            <span className="font-mono text-rose-500 font-bold">{Math.round((config.personConfidence ?? 0.32) * 100)}%</span>
          </div>
          <input
            type="range"
            min={0.20}
            max={0.70}
            step={0.02}
            value={config.personConfidence ?? 0.32}
            onChange={(e) => onUpdateConfig({ personConfidence: Number(e.target.value) })}
            className="mt-1.5 w-full accent-rose-500 h-1.5 rounded-lg cursor-pointer bg-slate-300 dark:bg-slate-800"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>20% (Fast Walkers)</span>
            <span>32% (Balanced)</span>
            <span>70% (Strict)</span>
          </div>
        </div>

        {/* Movement Sensitivity */}
        <div>
          <label className="font-medium">Movement Sensitivity</label>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {(["low", "medium", "high"] as MotionSensitivity[]).map((level) => (
              <button
                key={level}
                onClick={() => onUpdateConfig({ sensitivity: level })}
                className={`rounded-xl py-1.5 text-xs font-bold uppercase transition-all ${
                  config.sensitivity === level
                    ? "bg-cyan-600 text-white shadow-sm shadow-cyan-600/30"
                    : isLight
                    ? "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    : "border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Cooldown Seconds */}
        <div>
          <div className="flex items-center justify-between">
            <label className="font-medium">Capture Cooldown</label>
            <span className="font-mono text-cyan-500 font-bold">{config.cooldownSeconds}s</span>
          </div>
          <input
            type="range"
            min={3}
            max={30}
            step={1}
            value={config.cooldownSeconds}
            onChange={(e) => onUpdateConfig({ cooldownSeconds: Number(e.target.value) })}
            className="mt-1.5 w-full accent-cyan-500 h-1.5 rounded-lg cursor-pointer bg-slate-300 dark:bg-slate-800"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>3s (Rapid)</span>
            <span>10s (Standard)</span>
            <span>30s (Quiet)</span>
          </div>
        </div>

        {/* Absence Timeout */}
        <div>
          <div className="flex items-center justify-between">
            <label className="font-medium">Re-entry Absence Window</label>
            <span className="font-mono text-emerald-500 font-bold">{config.absenceTimeoutSeconds ?? 2}s</span>
          </div>
          <input
            type="range"
            min={1}
            max={6}
            step={0.5}
            value={config.absenceTimeoutSeconds ?? 2}
            onChange={(e) => onUpdateConfig({ absenceTimeoutSeconds: Number(e.target.value) })}
            className="mt-1.5 w-full accent-emerald-500 h-1.5 rounded-lg cursor-pointer bg-slate-300 dark:bg-slate-800"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>1s (Instant Reset)</span>
            <span>2s (Standard)</span>
            <span>6s (Extended)</span>
          </div>
        </div>

        {/* Triggers selection */}
        <div className="pt-1 space-y-2 border-t border-slate-200 dark:border-slate-800">
          <label className="font-medium block">Detection Triggers</label>
          <div className="grid grid-cols-2 gap-2">
            <label className={`flex items-center space-x-2 cursor-pointer p-2 rounded-xl border ${isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"}`}>
              <input
                type="checkbox"
                checked={config.triggerOnPerson}
                onChange={(e) => onUpdateConfig({ triggerOnPerson: e.target.checked })}
                className="rounded border-slate-400 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="font-medium">Person Presence</span>
            </label>

            <label className={`flex items-center space-x-2 cursor-pointer p-2 rounded-xl border ${isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"}`}>
              <input
                type="checkbox"
                checked={config.triggerOnMovement}
                onChange={(e) => onUpdateConfig({ triggerOnMovement: e.target.checked })}
                className="rounded border-slate-400 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="font-medium">Motion Activity</span>
            </label>
          </div>
        </div>
      </div>

      {/* Alert Sound Controls */}
      <div className={`rounded-2xl border p-4 space-y-3.5 text-xs ${subCardBg}`}>
        <div className="flex items-center justify-between border-b pb-2.5 border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2 font-bold">
            <Volume2 className="h-4 w-4 text-indigo-500" />
            <span>Alert Sound Options</span>
          </div>

          <button
            onClick={onTestSound}
            className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/20 transition-colors"
          >
            Play Test Tone
          </button>
        </div>

        {/* Tone Select */}
        <div>
          <label className="font-medium">Alarm Tone</label>
          <select
            value={config.soundType}
            onChange={(e) => onUpdateConfig({ soundType: e.target.value as SoundType })}
            className={`mt-1.5 w-full rounded-xl border p-2.5 focus:border-cyan-500 focus:outline-none ${
              isLight ? "border-slate-300 bg-white text-slate-800" : "border-slate-800 bg-slate-900 text-slate-200"
            }`}
          >
            <option value="sonar_ping">Futuristic Sonar Ping</option>
            <option value="alert_chime">Two-Tone Warning Chime</option>
            <option value="warning_beep">Rapid Security Beep</option>
            <option value="pulse_alarm">Cyber Pulse Alarm</option>
          </select>
        </div>

        {/* Volume Slider */}
        <div>
          <div className="flex items-center justify-between">
            <label className="font-medium">Alarm Volume</label>
            <span className="font-mono text-indigo-500 font-bold">{Math.round(config.alertVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={config.alertVolume}
            onChange={(e) => onUpdateConfig({ alertVolume: Number(e.target.value) })}
            className="mt-1.5 w-full accent-indigo-500 h-1.5 rounded-lg cursor-pointer bg-slate-300 dark:bg-slate-800"
          />
        </div>

        {/* Sound Enable Toggle */}
        <div className="pt-1 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400">Audio Alerts</span>
          <button
            onClick={() => onUpdateConfig({ alertSoundEnabled: !config.alertSoundEnabled })}
            className={`flex items-center space-x-1.5 rounded-xl px-3 py-1.5 font-bold transition-all ${
              config.alertSoundEnabled
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                : isLight
                ? "border border-slate-300 bg-slate-100 text-slate-500"
                : "border border-slate-800 bg-slate-900 text-slate-500"
            }`}
          >
            {config.alertSoundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span>{config.alertSoundEnabled ? "Alert Sound ON" : "Sound Muted"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
