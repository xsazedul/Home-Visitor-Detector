"use client";

import React, { useState } from "react";
import { VisitorEvent, MonitoringSettings } from "@/types";
import { soundSynth } from "@/utils/audio";
import {
  Eye,
  ShieldCheck,
  AlertTriangle,
  Volume2,
  VolumeX,
  Play,
  Square,
  Trash2,
  Sliders,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react";

interface VisitorMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: MonitoringSettings;
  onUpdateSettings: (newSettings: Partial<MonitoringSettings>) => void;
  events: VisitorEvent[];
  onClearEvents: () => void;
  onDeleteEvent: (id: string) => void;
  activeFaceCount: number;
  onStartMonitoring: () => void;
  onStopMonitoring: () => void;
  onSimulateVisitor?: () => void;
}

export const VisitorMonitorModal: React.FC<VisitorMonitorModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  events,
  onClearEvents,
  onDeleteEvent,
  activeFaceCount,
  onStartMonitoring,
  onStopMonitoring,
  onSimulateVisitor,
}) => {
  const [hasAcknowledgedConsent, setHasAcknowledgedConsent] = useState(false);

  if (!isOpen) return null;

  const handleTestSound = () => {
    soundSynth.playVisitorAlert(settings.soundType, settings.alertVolume);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 text-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold tracking-tight text-slate-900">
                  Visitor Detection Mode
                </h3>
                {settings.enabled ? (
                  <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 animate-pulse">
                    ACTIVE MONITORING
                  </span>
                ) : (
                  <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                    DISABLED
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                In-session detection of additional persons entering camera field of view.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Pre-Activation Disclosure Banner (Ultra-Light) */}
        {!settings.enabled && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-xs text-amber-900 space-y-3">
            <div className="flex items-center space-x-2 text-amber-900 font-bold">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Consent &amp; Browser Limitations Notice</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-amber-800">
              <li>
                <strong>Browser Limitation:</strong> Web browsers cannot monitor cameras in the background when this tab is closed, suspended, or minimized. Monitoring functions strictly while this tab is active.
              </li>
              <li>
                <strong>Privacy &amp; Identity Protection:</strong> This system strictly counts visible faces without facial recognition or building biometric databases. Additional people are neutrally labeled &ldquo;Additional person detected&rdquo;.
              </li>
              <li>
                <strong>Local Audio Tone:</strong> Alerts are generated synthetically via the Web Audio API without ambient audio recording or microphone upload.
              </li>
            </ul>

            <div className="flex items-center space-x-2 pt-2 border-t border-amber-200">
              <input
                id="visitor-consent"
                type="checkbox"
                checked={hasAcknowledgedConsent}
                onChange={(e) => setHasAcknowledgedConsent(e.target.checked)}
                className="h-4 w-4 rounded border-amber-300 text-violet-600 focus:ring-violet-500"
              />
              <label htmlFor="visitor-consent" className="text-xs text-amber-900 font-medium">
                I understand the browser limits and consent to activating local session visitor alerts.
              </label>
            </div>

            <div className="pt-2">
              <button
                disabled={!hasAcknowledgedConsent}
                onClick={onStartMonitoring}
                className={`flex items-center space-x-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
                  hasAcknowledgedConsent
                    ? "bg-violet-600 text-white shadow-md shadow-violet-500/25 hover:bg-violet-700"
                    : "cursor-not-allowed bg-slate-200 text-slate-400"
                }`}
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Enable Visitor Detection Mode</span>
              </button>
            </div>
          </div>
        )}

        {/* Active Controls & Settings */}
        {settings.enabled && (
          <div className="mt-6 space-y-5">
            {/* Status Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center space-x-3">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">Active Visitor Guard</h4>
                  <p className="text-xs text-emerald-800">
                    Currently visible faces in frame: <strong className="font-mono text-emerald-950 font-bold">{activeFaceCount}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {onSimulateVisitor && (
                  <button
                    onClick={onSimulateVisitor}
                    title="Simulate an additional person detected event to test alert sounds and logs"
                    className="flex items-center space-x-1 rounded-xl border border-violet-300 bg-violet-600 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-violet-700 transition-colors"
                  >
                    <span>⚡ Simulate Alert</span>
                  </button>
                )}
                <button
                  onClick={onStopMonitoring}
                  className="flex items-center space-x-1.5 rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors shadow-2xs"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                  <span>Stop Monitoring</span>
                </button>
              </div>
            </div>

            {/* Audio & Sensitivity Settings (Ultra-Light) */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center space-x-2 font-bold text-slate-900">
                  <Sliders className="h-4 w-4 text-sky-600" />
                  <span>Notification &amp; Cooldown Controls</span>
                </div>

                <button
                  onClick={handleTestSound}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50 shadow-2xs"
                >
                  Test Sound
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sound Select */}
                <div>
                  <label className="text-slate-700 font-semibold">Alert Tone</label>
                  <select
                    value={settings.soundType}
                    onChange={(e) => onUpdateSettings({ soundType: e.target.value as MonitoringSettings["soundType"] })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-sky-400 focus:outline-none shadow-2xs"
                  >
                    <option value="cyber_ping">Cyber Sonar Ping</option>
                    <option value="soft_chime">Soft Harmonic Chime</option>
                    <option value="radar_pulse">Sci-Fi Radar Pulse</option>
                    <option value="subtle_beep">Subtle Beep</option>
                  </select>
                </div>

                {/* Cooldown Seconds */}
                <div>
                  <label className="text-slate-700 font-semibold">Alert Cooldown (Seconds)</label>
                  <select
                    value={settings.cooldownSeconds}
                    onChange={(e) => onUpdateSettings({ cooldownSeconds: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-sky-400 focus:outline-none shadow-2xs"
                  >
                    <option value={2}>2 seconds (Frequent)</option>
                    <option value={5}>5 seconds (Balanced)</option>
                    <option value={10}>10 seconds (Relaxed)</option>
                  </select>
                </div>
              </div>

              {/* Volume Slider & Sound Mute Toggle */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onUpdateSettings({ soundAlertEnabled: !settings.soundAlertEnabled })}
                    className={`flex items-center space-x-1.5 rounded-xl px-3 py-1.5 font-semibold ${
                      settings.soundAlertEnabled
                        ? "bg-sky-100 text-sky-800 border border-sky-300"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {settings.soundAlertEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                    <span>{settings.soundAlertEnabled ? "Sound Alerts On" : "Muted"}</span>
                  </button>
                </div>

                {/* Optional Thumbnail Capture */}
                <div className="flex items-center space-x-2">
                  <input
                    id="thumb-check"
                    type="checkbox"
                    checked={settings.captureThumbnails}
                    onChange={(e) => onUpdateSettings({ captureThumbnails: e.target.checked })}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600"
                  />
                  <label htmlFor="thumb-check" className="text-slate-700 font-medium">
                    Save Event Thumbnails (In-Memory Only)
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visitor Event Log Dashboard */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2 font-bold text-slate-900 text-xs">
              <Clock className="h-4 w-4 text-sky-600" />
              <span>Visitor Event History ({events.length})</span>
            </div>

            {events.length > 0 && (
              <button
                onClick={onClearEvents}
                className="flex items-center space-x-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clear All Logs</span>
              </button>
            )}
          </div>

          <div className="mt-3 max-h-56 overflow-y-auto space-y-2">
            {events.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No visitor activity recorded during this session.
              </div>
            ) : (
              events.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-2xs"
                >
                  <div className="flex items-center space-x-3">
                    {ev.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ev.thumbnail}
                        alt="Event"
                        className="h-10 w-10 rounded-lg object-cover border border-rose-200"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                    )}

                    <div>
                      <div className="font-bold text-rose-800">{ev.message}</div>
                      <div className="text-[11px] text-slate-500">
                        {new Date(ev.timestamp).toLocaleTimeString()} &#8226; Status: {ev.detectionStatus}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteEvent(ev.id)}
                    title="Delete event log"
                    className="p-1.5 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-200"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
