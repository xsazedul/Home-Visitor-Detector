"use client";

import React from "react";
import {
  PoseInstruction,
  FaceMetrics,
  ScanningStage,
  CapturedPhoto,
} from "@/types";
import {
  CheckCircle2,
  SkipForward,
  Volume2,
  VolumeX,
  Sparkles,
  SunMedium,
  Maximize2,
  Focus,
  AlertCircle,
  HelpCircle,
  Camera,
} from "lucide-react";

interface PoseGuidePanelProps {
  currentPose: PoseInstruction | null;
  poseIndex: number;
  totalPoses: number;
  faceMetrics: FaceMetrics;
  stage: ScanningStage;
  stabilityProgress: number; // 0 to 100
  onSkipPose: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  assistantMessage: string;
  capturedPhotos: CapturedPhoto[];
  onReviewPhotos: () => void;
  onSnapPhoto?: () => void;
  autoCaptureEnabled: boolean;
  onToggleAutoCapture: () => void;
}

export const PoseGuidePanel: React.FC<PoseGuidePanelProps> = ({
  currentPose,
  poseIndex,
  totalPoses,
  faceMetrics,
  stage,
  stabilityProgress,
  onSkipPose,
  voiceEnabled,
  onToggleVoice,
  assistantMessage,
  capturedPhotos,
  onReviewPhotos,
  onSnapPhoto,
  autoCaptureEnabled,
  onToggleAutoCapture,
}) => {
  return (
    <div className="flex flex-col space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header: Stage Badge, Voice Toggle, and Auto-Capture Switch */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-sky-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
            {stage === "POSING"
              ? `Pose (${poseIndex + 1}/${totalPoses})`
              : stage === "CAPTURING"
              ? "Capturing"
              : stage}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleAutoCapture}
            title={autoCaptureEnabled ? "Auto-capture active. Click to switch to manual only." : "Manual capture mode active."}
            className={`flex items-center space-x-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition-colors ${
              autoCaptureEnabled
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}
          >
            <span>{autoCaptureEnabled ? "⚡ Auto: ON" : "✋ Auto: OFF"}</span>
          </button>

          <button
            onClick={onToggleVoice}
            title={voiceEnabled ? "Mute AI voice guidance" : "Enable AI voice guidance"}
            className={`flex items-center space-x-1 rounded-xl px-2.5 py-1 text-xs font-medium transition-colors ${
              voiceEnabled
                ? "bg-sky-50 text-sky-700 border border-sky-200"
                : "bg-slate-100 text-slate-500 hover:text-slate-800"
            }`}
          >
            {voiceEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* AI Assistant Message Bubble */}
      <div className="relative rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 via-indigo-50/40 to-white p-3.5 text-xs text-slate-700 shadow-2xs">
        <div className="flex items-start space-x-2.5">
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="font-bold text-slate-900">AI Studio Assistant</div>
            <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">{assistantMessage}</p>
          </div>
        </div>
      </div>

      {/* Current Pose Prompt Card with 1-Click Manual Snap */}
      {currentPose && stage === "POSING" && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">{currentPose.title}</h4>
            <span className="text-xs font-mono font-semibold text-sky-600">
              Pose {poseIndex + 1} of {totalPoses}
            </span>
          </div>

          <p className="mt-2 text-xs font-medium text-slate-700">
            {currentPose.instruction}
          </p>

          <p className="mt-1 text-[11px] text-slate-500 italic">
            Tip: {currentPose.tip}
          </p>

          {/* Quick 1-Click Snap Button */}
          {onSnapPhoto && (
            <div className="mt-3.5">
              <button
                onClick={onSnapPhoto}
                className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-600/20 hover:scale-[1.02] active:scale-98 transition-all"
              >
                <Camera className="h-4 w-4" />
                <span>Snap Photo #{poseIndex + 1} Now (1 Click)</span>
              </button>
            </div>
          )}

          {/* Stability / Hold Progress Bar */}
          {autoCaptureEnabled && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Auto-Capture Hold</span>
                <span className={`font-mono font-bold ${faceMetrics.isPoseMatched ? "text-emerald-600" : "text-slate-400"}`}>
                  {faceMetrics.isPoseMatched ? `${Math.round(stabilityProgress)}%` : "Hold still..."}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full transition-all duration-150 ${
                    faceMetrics.isPoseMatched
                      ? "bg-gradient-to-r from-sky-500 to-emerald-500"
                      : "bg-sky-400/40"
                  }`}
                  style={{ width: `${stabilityProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Skip Pose Link */}
          <div className="mt-3 flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">Can&apos;t get the angle?</span>
            <button
              onClick={onSkipPose}
              className="flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-sky-600 transition-colors"
            >
              <SkipForward className="h-3.5 w-3.5" />
              <span>Skip Pose</span>
            </button>
          </div>
        </div>
      )}

      {/* Direct Analyze Button (Appears as soon as at least 1 photo is taken!) */}
      {capturedPhotos.length >= 1 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-emerald-900">
                {capturedPhotos.length} Photo{capturedPhotos.length > 1 ? "s" : ""} Captured!
              </div>
              <p className="text-[11px] text-emerald-700">
                Ready to analyze now without doing more poses?
              </p>
            </div>
            <button
              onClick={onReviewPhotos}
              className="flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition-all hover:scale-105"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Analyze Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Real-time Environmental Telemetry (Ultra-Light) */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Lighting Badge */}
        <div className="flex items-center space-x-2 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xs">
          <SunMedium className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Lighting Quality</div>
            <div className="font-semibold text-slate-800">
              {faceMetrics.lightingStatus === "OPTIMAL" ? (
                <span className="text-emerald-600 font-bold">Optimal ({faceMetrics.lightingScore}%)</span>
              ) : faceMetrics.lightingStatus === "LOW" ? (
                <span className="text-amber-600 font-semibold">Low Light</span>
              ) : (
                <span className="text-rose-600 font-semibold">Overexposed</span>
              )}
            </div>
          </div>
        </div>

        {/* Distance Badge */}
        <div className="flex items-center space-x-2 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xs">
          <Maximize2 className="h-4 w-4 text-sky-600 flex-shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Subject Distance</div>
            <div className="font-semibold text-slate-800">
              {faceMetrics.distanceStatus === "OPTIMAL" ? (
                <span className="text-emerald-600 font-bold">Optimal Range</span>
              ) : faceMetrics.distanceStatus === "TOO_FAR" ? (
                <span className="text-amber-600 font-semibold">Move Closer</span>
              ) : (
                <span className="text-amber-600 font-semibold">Move Back</span>
              )}
            </div>
          </div>
        </div>

        {/* Sharpness Badge */}
        <div className="flex items-center space-x-2 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xs">
          <Focus className="h-4 w-4 text-violet-600 flex-shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Image Sharpness</div>
            <div className="font-semibold text-slate-800">
              {faceMetrics.sharpnessStatus === "SHARP" ? (
                <span className="text-emerald-600 font-bold">Sharp ({faceMetrics.sharpnessScore}%)</span>
              ) : faceMetrics.sharpnessStatus === "ACCEPTABLE" ? (
                <span className="text-sky-600 font-semibold">Acceptable</span>
              ) : (
                <span className="text-rose-600 font-semibold">Blurry</span>
              )}
            </div>
          </div>
        </div>

        {/* Alignment Status */}
        <div className="flex items-center space-x-2 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xs">
          {faceMetrics.isAligned ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
          )}
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Alignment</div>
            <div className="font-semibold truncate max-w-[100px] text-slate-800">
              {faceMetrics.isAligned ? "Balanced" : "Adjusting"}
            </div>
          </div>
        </div>
      </div>

      {/* Captured Photos Progress Bar & Gallery Preview */}
      <div className="border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 font-bold text-slate-800">
            <Camera className="h-3.5 w-3.5 text-sky-600" />
            <span>Captured Photos ({capturedPhotos.length}/6)</span>
          </div>

          {capturedPhotos.length > 0 && (
            <button
              onClick={onReviewPhotos}
              className="text-xs text-sky-600 hover:text-sky-700 font-semibold hover:underline"
            >
              Review ({capturedPhotos.length})
            </button>
          )}
        </div>

        {/* Mini Thumbnail Row */}
        <div className="mt-2.5 grid grid-cols-6 gap-2">
          {[0, 1, 2, 3, 4, 5].map((idx) => {
            const photo = capturedPhotos[idx];
            return (
              <div
                key={idx}
                className={`relative aspect-square overflow-hidden rounded-xl border ${
                  photo
                    ? "border-emerald-400 bg-white shadow-2xs"
                    : idx === capturedPhotos.length
                    ? "border-sky-400 bg-sky-50/80 animate-pulse"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.dataUrl}
                    alt={photo.poseLabel}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-mono text-slate-400 font-medium">
                    #{idx + 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
