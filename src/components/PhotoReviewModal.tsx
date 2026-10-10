"use client";

import React, { useState } from "react";
import { CapturedPhoto } from "@/types";
import {
  CheckCircle2,
  Trash2,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  ZoomIn,
  X,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

interface PhotoReviewModalProps {
  isOpen: boolean;
  photos: CapturedPhoto[];
  onClose: () => void;
  onDeletePhoto: (id: string) => void;
  onRetakePhoto: (poseId: string) => void;
  onProceedToAnalysis: (enableAgeEstimation: boolean) => void;
  isAnalyzing: boolean;
}

export const PhotoReviewModal: React.FC<PhotoReviewModalProps> = ({
  isOpen,
  photos,
  onClose,
  onDeletePhoto,
  onRetakePhoto,
  onProceedToAnalysis,
  isAnalyzing,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<CapturedPhoto | null>(null);
  const [enableAgeEstimation, setEnableAgeEstimation] = useState(false);
  const [hasApprovedConsent, setHasApprovedConsent] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 text-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="flex h-3 w-3 rounded-full bg-emerald-500" />
              <h3 className="text-xl font-bold tracking-tight text-slate-900">
                Review Captured Photographs
              </h3>
              <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-700 border border-sky-200">
                {photos.length} Photos
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Review your multi-angle poses before proceeding to the AI appearance and lighting analysis.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:border-sky-300 hover:shadow-md"
            >
              {/* Photo Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.dataUrl}
                  alt={photo.poseLabel}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Overlay Action Buttons */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/40 opacity-0 backdrop-blur-2xs transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => setSelectedPhoto(photo)}
                    title="Zoom Fullscreen"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-800 hover:bg-sky-500 hover:text-white transition-colors shadow-sm"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => onRetakePhoto(photo.poseId)}
                    title="Retake this pose"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-800 hover:bg-violet-600 hover:text-white transition-colors shadow-sm"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => onDeletePhoto(photo.id)}
                    title="Delete photo"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-rose-600 hover:bg-rose-600 hover:text-white transition-colors shadow-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Badge */}
                <div className="absolute top-2 left-2 rounded-lg bg-white/90 px-2 py-0.5 text-[10px] font-mono font-bold text-sky-700 shadow-2xs backdrop-blur-md">
                  #{index + 1}
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>{photo.poseLabel}</span>
                  <span className="font-mono text-[11px] text-emerald-600">
                    {photo.sharpnessScore}% Sharp
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Lighting: {photo.lightingScore}%</span>
                  <span>Yaw: {photo.yaw}°</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state if user deleted all */}
        {photos.length === 0 && (
          <div className="my-10 text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
            <h4 className="mt-3 text-base font-bold text-slate-800">No Photos Captured</h4>
            <p className="mt-1 text-xs text-slate-500">
              Please retake the poses to continue with the appearance analysis.
            </p>
          </div>
        )}

        {/* Consent, Privacy & Age Estimation Options (Ultra-Light) */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
          <div className="flex items-start space-x-3">
            <input
              id="consent-check"
              type="checkbox"
              checked={hasApprovedConsent}
              onChange={(e) => setHasApprovedConsent(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <label htmlFor="consent-check" className="text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900">Explicit Processing Consent:</strong> I approve submitting these {photos.length} captured photos for facial appearance and illumination evaluation. I understand the photos are processed in temporary session memory and can be permanently discarded at any time.
            </label>
          </div>

          <div className="flex items-start space-x-3 border-t border-slate-200 pt-3">
            <input
              id="age-check"
              type="checkbox"
              checked={enableAgeEstimation}
              onChange={(e) => setEnableAgeEstimation(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
            />
            <label htmlFor="age-check" className="text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900">Optional Apparent Age Range:</span> Include an estimated apparent age bracket (e.g. &ldquo;22–28 years&rdquo;) in the report.{" "}
              <span className="text-slate-500">
                (Strictly an uncertain visual estimate based on webcam lighting; not a verified age. You can leave this unchecked.)
              </span>
            </label>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-4">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Back to Camera
          </button>

          <button
            disabled={photos.length === 0 || !hasApprovedConsent || isAnalyzing}
            onClick={() => onProceedToAnalysis(enableAgeEstimation)}
            className={`flex w-full sm:w-auto items-center justify-center space-x-2 rounded-xl px-8 py-3 text-sm font-bold shadow-md transition-all ${
              photos.length === 0 || !hasApprovedConsent || isAnalyzing
                ? "cursor-not-allowed bg-slate-200 text-slate-400"
                : "bg-gradient-to-r from-sky-600 via-blue-600 to-violet-600 text-white shadow-sky-600/20 hover:scale-[1.02]"
            }`}
          >
            {isAnalyzing ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Generating Facial Report...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate AI Appearance Report</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* Lightbox / Zoom View */}
        {selectedPhoto && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/90 p-4">
            <div className="relative max-h-[90vh] max-w-3xl overflow-hidden rounded-2xl border border-slate-700 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPhoto.dataUrl}
                alt={selectedPhoto.poseLabel}
                className="max-h-[80vh] w-auto object-contain bg-black"
              />
              <div className="flex items-center justify-between p-4 bg-white border-t border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-900">{selectedPhoto.poseLabel}</h4>
                  <p className="text-xs text-slate-500">
                    Sharpness: {selectedPhoto.sharpnessScore}% | Lighting: {selectedPhoto.lightingScore}%
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="rounded-xl bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-200"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
