"use client";

import React from "react";
import {
  Sliders,
  Volume2,
  VolumeX,
  Clock,
  Camera,
  Play,
  Shield,
  Bell,
  Sparkles,
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
}) => {
  const isLight = config.theme === "light";
  const isMidnight = config.theme === "midnight";

  const panelBg = isLight
    ? "border border-neutral-200/90 bg-white text-neutral-900 shadow-sm"
    : isMidnight
    ? "border border-neutral-800/80 bg-[#0c0f18] text-neutral-100 shadow-lg shadow-black/40"
    : "border border-neutral-800/80 bg-neutral-900 text-neutral-100 shadow-lg shadow-black/40";

  const sectionBg = isLight
    ? "bg-neutral-50/80 border border-neutral-200/80"
    : isMidnight
    ? "bg-[#131824]/60 border border-neutral-800/80"
    : "bg-neutral-950/60 border border-neutral-800/80";

  return (
    <div className={`flex flex-col space-y-4 rounded-2xl p-4 sm:p-5 transition-colors duration-200 ${panelBg}`}>
      {/* Telemetry Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-xl p-3.5 transition-colors ${sectionBg}`}>
          <div className="flex items-center space-x-1.5 text-xs text-neutral-500 font-medium">
            <Camera className="h-3.5 w-3.5 text-neutral-400" />
            <span>Captured Events</span>
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tracking-tight">
            {eventCount}
          </div>
        </div>

        <div className={`rounded-xl p-3.5 transition-colors ${sectionBg}`}>
          <div className="flex items-center space-x-1.5 text-xs text-neutral-500 font-medium">
            <Clock className="h-3.5 w-3.5 text-neutral-400" />
            <span>Last Activity</span>
          </div>
          <div className="mt-1.5 text-xs font-mono font-medium truncate">
            {lastEventTime || "No recent activity"}
          </div>
        </div>
      </div>

      {/* Detection Parameters Card */}
      <div className={`rounded-xl p-4 space-y-4 text-xs ${sectionBg}`}>
        <div className="flex items-center justify-between border-b pb-2.5 border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center space-x-2 font-semibold">
            <Sliders className="h-3.5 w-3.5 text-neutral-500" />
            <span>Detection Sensitivity</span>
          </div>

          <button
            onClick={onSimulateDetection}
            title="Simulate visitor detection trigger"
            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors border ${
              isLight
                ? "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
                : "border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
            }`}
          >
            Test Trigger
          </button>
        </div>

        {/* Person Confidence Threshold */}
        <div>
          <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
            <label className="font-medium">Person Confidence</label>
            <span className={`font-mono font-bold ${isLight ? "text-neutral-900" : "text-white"}`}>
              {Math.round((config.personConfidence ?? 0.30) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0.20}
            max={0.70}
            step={0.02}
            value={config.personConfidence ?? 0.30}
            onChange={(e) => onUpdateConfig({ personConfidence: Number(e.target.value) })}
            className="mt-2 w-full accent-neutral-800 dark:accent-neutral-200 h-1.5 rounded-lg cursor-pointer bg-neutral-200 dark:bg-neutral-800"
          />
          <div className={`flex justify-between text-[10px] font-mono mt-1 ${isLight ? "text-neutral-500" : "text-neutral-400"}`}>
            <span>20% (Fast Walkers)</span>
            <span>30% (Standard)</span>
            <span>70% (Strict)</span>
          </div>
        </div>

        {/* Movement Sensitivity Segmented Control */}
        <div>
          <label className="font-medium text-neutral-600 dark:text-neutral-400 block mb-1.5">
            Motion Sensitivity
          </label>
          <div className="grid grid-cols-3 gap-1 rounded-lg p-1 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            {(["low", "medium", "high"] as MotionSensitivity[]).map((level) => (
              <button
                key={level}
                onClick={() => onUpdateConfig({ sensitivity: level })}
                className={`rounded-md py-1 text-[11px] font-medium capitalize transition-all ${
                  config.sensitivity === level
                    ? isLight
                      ? "bg-neutral-900 text-white shadow-xs font-semibold"
                      : "bg-neutral-700 text-white shadow-xs font-semibold"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Capture Cooldown Slider */}
        <div>
          <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
            <label className="font-medium">Capture Cooldown</label>
            <span className={`font-mono font-bold ${isLight ? "text-neutral-900" : "text-white"}`}>
              {config.cooldownSeconds}s
            </span>
          </div>
          <input
            type="range"
            min={3}
            max={30}
            step={1}
            value={config.cooldownSeconds}
            onChange={(e) => onUpdateConfig({ cooldownSeconds: Number(e.target.value) })}
            className="mt-2 w-full accent-neutral-800 dark:accent-neutral-200 h-1.5 rounded-lg cursor-pointer bg-neutral-200 dark:bg-neutral-800"
          />
        </div>

        {/* Absence Timeout Slider */}
        <div>
          <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
            <label className="font-medium">Re-entry Absence Window</label>
            <span className={`font-mono font-bold ${isLight ? "text-neutral-900" : "text-white"}`}>
              {config.absenceTimeoutSeconds ?? 2}s
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={6}
            step={0.5}
            value={config.absenceTimeoutSeconds ?? 2}
            onChange={(e) => onUpdateConfig({ absenceTimeoutSeconds: Number(e.target.value) })}
            className="mt-2 w-full accent-neutral-800 dark:accent-neutral-200 h-1.5 rounded-lg cursor-pointer bg-neutral-200 dark:bg-neutral-800"
          />
          <p className={`text-[10px] mt-1 leading-normal ${isLight ? "text-neutral-500" : "text-neutral-400"}`}>
            Period subject must stay out of view before re-entering triggers a new visitor event.
          </p>
        </div>

        {/* Triggers checkbox selection */}
        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <label className="font-medium text-neutral-600 dark:text-neutral-400 block mb-2">
            Active Triggers
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors ${
              isLight ? "bg-white border-neutral-200" : "bg-neutral-900 border-neutral-800"
            }`}>
              <input
                type="checkbox"
                checked={config.triggerOnPerson}
                onChange={(e) => onUpdateConfig({ triggerOnPerson: e.target.checked })}
                className="rounded text-neutral-900 focus:ring-neutral-400 accent-neutral-800"
              />
              <span className="font-medium text-[11px]">Person Detection</span>
            </label>

            <label className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors ${
              isLight ? "bg-white border-neutral-200" : "bg-neutral-900 border-neutral-800"
            }`}>
              <input
                type="checkbox"
                checked={config.triggerOnMovement}
                onChange={(e) => onUpdateConfig({ triggerOnMovement: e.target.checked })}
                className="rounded text-neutral-900 focus:ring-neutral-400 accent-neutral-800"
              />
              <span className="font-medium text-[11px]">Motion Activity</span>
            </label>
          </div>
        </div>
      </div>

      {/* Audio Alerts Card */}
      <div className={`rounded-xl p-4 space-y-3.5 text-xs ${sectionBg}`}>
        <div className="flex items-center justify-between border-b pb-2.5 border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center space-x-2 font-semibold">
            <Bell className="h-3.5 w-3.5 text-neutral-500" />
            <span>Audio Notifications</span>
          </div>

          <button
            onClick={onTestSound}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors border ${
              isLight
                ? "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
                : "border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
            }`}
          >
            Play Chime
          </button>
        </div>

        {/* Tone select */}
        <div>
          <label className="font-medium text-neutral-600 dark:text-neutral-400 block mb-1.5">
            Chime Sound
          </label>
          <select
            value={config.soundType}
            onChange={(e) => onUpdateConfig({ soundType: e.target.value as SoundType })}
            className={`w-full rounded-lg border p-2 text-xs focus:outline-none transition-colors ${
              isLight
                ? "border-neutral-200 bg-white text-neutral-800"
                : "border-neutral-800 bg-neutral-900 text-neutral-200"
            }`}
          >
            <option value="sonar_ping">Sonar Ping (Modern)</option>
            <option value="alert_chime">Two-Tone Chime (Soft)</option>
            <option value="warning_beep">Security Beep (Crisp)</option>
            <option value="pulse_alarm">Discrete Pulse (Subtle)</option>
          </select>
        </div>

        {/* Volume slider */}
        <div>
          <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
            <label className="font-medium">Chime Volume</label>
            <span className={`font-mono font-bold ${isLight ? "text-neutral-900" : "text-white"}`}>
              {Math.round(config.alertVolume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={config.alertVolume}
            onChange={(e) => onUpdateConfig({ alertVolume: Number(e.target.value) })}
            className="mt-2 w-full accent-neutral-800 dark:accent-neutral-200 h-1.5 rounded-lg cursor-pointer bg-neutral-200 dark:bg-neutral-800"
          />
        </div>

        {/* Audio Mute switch */}
        <div className="pt-2 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800">
          <span className="text-neutral-600 dark:text-neutral-400 font-medium">
            Alert Sounds
          </span>
          <button
            onClick={() => onUpdateConfig({ alertSoundEnabled: !config.alertSoundEnabled })}
            className={`rounded-lg px-3 py-1 font-medium text-xs transition-colors border ${
              config.alertSoundEnabled
                ? isLight
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-100 bg-neutral-100 text-neutral-900"
                : isLight
                ? "border-neutral-200 bg-neutral-100 text-neutral-500"
                : "border-neutral-800 bg-neutral-800 text-neutral-400"
            }`}
          >
            {config.alertSoundEnabled ? "Enabled" : "Muted"}
          </button>
        </div>
      </div>
    </div>
  );
};
