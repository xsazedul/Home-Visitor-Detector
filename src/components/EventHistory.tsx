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
  X,
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
  const isMidnight = theme === "midnight";

  const panelBg = isLight
    ? "border border-neutral-200/90 bg-white text-neutral-900 shadow-sm"
    : isMidnight
    ? "border border-neutral-800/80 bg-[#0c0f18] text-neutral-100 shadow-lg shadow-black/40"
    : "border border-neutral-800/80 bg-neutral-900 text-neutral-100 shadow-lg shadow-black/40";

  const eventItemBg = isLight
    ? "border border-neutral-200/80 bg-neutral-50/70 hover:bg-neutral-100/70 text-neutral-800"
    : isMidnight
    ? "border border-neutral-800/80 bg-[#131824]/60 hover:bg-[#181f2e] text-neutral-200"
    : "border border-neutral-800/80 bg-neutral-950/60 hover:bg-neutral-950 text-neutral-200";

  const handleDownload = (ev: DetectionEvent) => {
    const link = document.createElement("a");
    link.href = ev.thumbnail;
    link.download = `security-event-${ev.sequenceNumber}-${ev.type.toLowerCase()}-${ev.timestamp}.jpg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className={`rounded-2xl p-4 sm:p-5 transition-colors duration-200 ${panelBg}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3.5 border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-neutral-500" />
          <h2 className="text-sm font-semibold tracking-tight">
            Security Event History
          </h2>
          <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-[11px] font-mono font-medium text-neutral-600 dark:text-neutral-400">
            {events.length}
          </span>
        </div>

        {events.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs font-medium text-neutral-500 hover:text-rose-600 transition-colors"
          >
            Clear History
          </button>
        )}
      </div>

      {/* Events List */}
      <div className="mt-3.5 max-h-[360px] overflow-y-auto space-y-2 pr-1">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-400">
            <ShieldCheck className="h-8 w-8 text-neutral-300 dark:text-neutral-700 mb-2 stroke-[1.5]" />
            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
              No security events recorded
            </p>
            <p className="text-[11px] text-neutral-400 mt-0.5 max-w-xs leading-normal">
              When monitoring is active, detected visitors and movements will automatically be logged here.
            </p>
          </div>
        ) : (
          events.map((ev) => (
            <div
              key={ev.id}
              className={`group flex items-center justify-between rounded-xl p-2.5 text-xs transition-all ${eventItemBg}`}
            >
              {/* Left: Thumbnail & Details */}
              <div className="flex items-center space-x-3">
                <div
                  onClick={() => setSelectedEvent(ev)}
                  className="relative h-11 w-16 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700/80 bg-neutral-950 shadow-xs"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ev.thumbnail}
                    alt={ev.type}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="h-3 w-3 text-white" />
                  </div>
                  <div className="absolute bottom-0.5 left-0.5 rounded bg-black/80 px-1 text-[8px] font-mono font-medium text-white">
                    #{ev.sequenceNumber}
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-1.5">
                    {ev.type === "PERSON_DETECTED" ? (
                      <span className="flex items-center space-x-1 font-medium text-rose-600 dark:text-rose-400">
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Person Detected</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 font-medium text-amber-600 dark:text-amber-400">
                        <Activity className="h-3.5 w-3.5" />
                        <span>Motion Activity</span>
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[11px] font-mono text-neutral-500">
                    {ev.formattedTime}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center space-x-1 opacity-70 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDownload(ev)}
                  title="Download snapshot"
                  className="rounded-md p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => onDeleteEvent(ev.id)}
                  title="Delete event"
                  className="rounded-md p-1.5 text-neutral-500 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Privacy note */}
      <div className="mt-3.5 pt-3 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-400 flex items-center space-x-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
        <span>
          Images remain encrypted in browser session memory. No remote telemetry or cloud upload.
        </span>
      </div>

      {/* Lightbox Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative max-h-[90vh] max-w-3xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl">
            {/* Image viewport */}
            <div className="relative max-h-[72vh] overflow-hidden bg-black flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedEvent.thumbnail}
                alt={selectedEvent.type}
                className="max-h-[72vh] w-auto object-contain"
              />
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between border-t border-neutral-800 bg-neutral-900/90 p-4">
              <div>
                <div className="text-sm font-semibold text-white">
                  Event #{selectedEvent.sequenceNumber} · {selectedEvent.type === "PERSON_DETECTED" ? "Person Detected" : "Motion Activity"}
                </div>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  Captured at {selectedEvent.formattedTime}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownload(selectedEvent)}
                  className="flex items-center space-x-1.5 rounded-lg bg-white text-neutral-900 hover:bg-neutral-100 px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>

                <button
                  onClick={() => setSelectedEvent(null)}
                  className="rounded-lg border border-neutral-700 bg-neutral-800 px-3.5 py-1.5 text-xs font-medium text-neutral-300 hover:text-white transition-colors"
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
