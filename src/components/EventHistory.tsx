"use client";

import React, { useState } from "react";
import {
  Clock,
  Trash2,
  Download,
  ZoomIn,
  UserCheck,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { DetectionEvent, ThemeMode } from "@/types";

interface EventHistoryProps {
  events: DetectionEvent[];
  onDeleteEvent: (id: string) => void;
  onClearHistory: () => void;
  theme: ThemeMode;
}

export const EventHistory: React.FC<EventHistoryProps> = ({
  events,
  onDeleteEvent,
  onClearHistory,
  theme,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<DetectionEvent | null>(null);

  const isLight = theme === "light";
  const isHolo = theme === "hologram";

  const containerBg = isLight
    ? "border-slate-200 bg-white/95 text-slate-900 shadow-xl shadow-slate-200/50"
    : isHolo
    ? "border-fuchsia-900/40 bg-[#0d041a]/90 text-slate-100 shadow-2xl shadow-fuchsia-950/40"
    : "border-slate-800 bg-slate-900/80 text-slate-100 shadow-xl";

  const eventItemBg = isLight
    ? "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800"
    : isHolo
    ? "border-fuchsia-900/30 bg-[#16072d]/70 hover:bg-[#1f0a3e] text-slate-100"
    : "border-slate-800 bg-slate-950/70 hover:bg-slate-950 text-slate-100";

  const handleDownload = (ev: DetectionEvent) => {
    const link = document.createElement("a");
    link.href = ev.thumbnail;
    link.download = `visitor-${ev.sequenceNumber}-${ev.type.toLowerCase()}-${ev.timestamp}.jpg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className={`rounded-3xl border p-5 backdrop-blur-xl transition-colors duration-300 ${containerBg}`}>
      {/* Header */}
      <div className={`flex items-center justify-between border-b pb-3.5 ${isLight ? "border-slate-200" : "border-slate-800"}`}>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-cyan-500" />
          <h2 className="text-sm font-bold uppercase tracking-wider">
            Visitor Event History ({events.length})
          </h2>
        </div>

        {events.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center space-x-1 text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Events List */}
      <div className="mt-4 max-h-[380px] overflow-y-auto space-y-2.5 pr-1">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
            <ShieldCheck className="h-10 w-10 text-slate-400 dark:text-slate-700 mb-2" />
            <p className="text-xs font-medium">No visitor events recorded yet.</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-600 mt-0.5">
              Start monitoring to automatically capture visitors when detected.
            </p>
          </div>
        ) : (
          events.map((ev) => (
            <div
              key={ev.id}
              className={`group flex items-center justify-between rounded-2xl border p-3 text-xs transition-all ${eventItemBg}`}
            >
              {/* Left: Thumbnail & Info */}
              <div className="flex items-center space-x-3.5">
                <div
                  onClick={() => setSelectedEvent(ev)}
                  className="relative h-12 w-16 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border border-slate-700 bg-black shadow-sm group-hover:border-cyan-500/50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ev.thumbnail}
                    alt={ev.type}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="absolute bottom-0.5 left-0.5 rounded bg-black/80 px-1 text-[9px] font-mono font-bold text-cyan-400">
                    #{ev.sequenceNumber}
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-1.5">
                    {ev.type === "PERSON_DETECTED" ? (
                      <span className="flex items-center space-x-1 font-bold text-rose-500">
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Person Detected</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 font-bold text-amber-500">
                        <Activity className="h-3.5 w-3.5" />
                        <span>Movement Detected</span>
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    {ev.formattedTime}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleDownload(ev)}
                  title="Download event photo"
                  className="rounded-lg p-1.5 text-slate-400 hover:text-cyan-500 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => onDeleteEvent(ev.id)}
                  title="Delete event"
                  className="rounded-lg p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Local storage disclosure */}
      <div className={`mt-4 pt-3 border-t text-[11px] flex items-center space-x-1.5 ${isLight ? "border-slate-200 text-slate-500" : "border-slate-800/80 text-slate-500"}`}>
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
        <span>
          Images are stored locally in your browser session. Photos are never uploaded to remote servers.
        </span>
      </div>

      {/* Lightbox Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-h-[92vh] max-w-3xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
            {/* Image */}
            <div className="relative max-h-[75vh] overflow-hidden bg-black flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedEvent.thumbnail}
                alt={selectedEvent.type}
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900 p-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-white">
                    Event #{selectedEvent.sequenceNumber} - {selectedEvent.type === "PERSON_DETECTED" ? "Person Detected" : "Movement Detected"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {selectedEvent.formattedTime}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownload(selectedEvent)}
                  className="flex items-center space-x-1.5 rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-500 shadow transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>

                <button
                  onClick={() => setSelectedEvent(null)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
