"use client";

import React, { useState } from "react";
import { AIAnalysisReport, CapturedPhoto } from "@/types";
import {
  Sparkles,
  Download,
  RotateCcw,
  Trash2,
  ShieldAlert,
  Sun,
  Eye,
  CheckCircle,
  HelpCircle,
  Camera,
  ExternalLink,
  Printer,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface AnalysisDashboardProps {
  report: AIAnalysisReport;
  photos: CapturedPhoto[];
  onRetake: () => void;
  onDeleteSessionData: () => void;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  report,
  photos,
  onRetake,
  onDeleteSessionData,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<CapturedPhoto | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    skin: true,
    geometry: true,
    quality: true,
    presentation: true,
    skincare: false,
  });

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownloadJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify({ report, metadata: { photosCount: photos.length } }, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ai-face-analysis-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded-full bg-sky-100 border border-sky-200 px-3 py-0.5 text-xs font-bold text-sky-800">
              ANALYSIS COMPLETE
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {new Date(report.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
            Facial Appearance &amp; Illumination Report
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Multi-angle optical biometric analysis based on {photos.length} captured frames.
          </p>
        </div>

        {/* Global actions: Download, Print, Retake, Delete */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadJSON}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-2xs hover:border-sky-300 hover:text-sky-700 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-sky-600" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-2xs hover:border-violet-300 hover:text-violet-700 transition-colors"
          >
            <Printer className="h-3.5 w-3.5 text-violet-600" />
            <span>Print PDF</span>
          </button>

          <button
            onClick={onRetake}
            className="flex items-center space-x-1.5 rounded-xl border border-sky-300 bg-sky-50 px-3.5 py-2 text-xs font-bold text-sky-700 hover:bg-sky-100 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Retake Scan</span>
          </button>

          <button
            onClick={onDeleteSessionData}
            title="Purge all session data and images from memory"
            className="flex items-center space-x-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Session</span>
          </button>
        </div>
      </div>

      {/* Hero Score & Summary Card (Ultra-Light) */}
      <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          {/* Circular Metric */}
          <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-6">
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-tr from-sky-500 via-blue-600 to-violet-600 p-1 shadow-md shadow-sky-500/20">
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white">
                <span className="text-3xl font-black text-slate-900">{report.overallScore}</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-sky-600 font-bold">
                  HARMONY
                </span>
              </div>
            </div>
            <div className="mt-3 text-center">
              <span className="text-xs font-bold text-emerald-600">High Optical Quality</span>
              <p className="text-[10px] text-slate-500">Sensor &amp; Pose Fidelity</p>
            </div>
          </div>

          {/* AI Executive Summary */}
          <div className="md:col-span-3 space-y-3">
            <div className="flex items-center space-x-2 text-sky-600">
              <Sparkles className="h-4 w-4" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Executive Appearance Summary</h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed font-normal">
              {report.summary}
            </p>

            {/* Sub metrics grid */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[10px] text-slate-500 font-medium">Facial Symmetry</div>
                <div className="text-sm font-bold text-slate-900 font-mono">{report.facialGeometry.symmetryScore}%</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[10px] text-slate-500 font-medium">Avg Sharpness</div>
                <div className="text-sm font-bold text-sky-600 font-mono">{report.imageQuality.averageSharpness}%</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[10px] text-slate-500 font-medium">Illumination Balance</div>
                <div className="text-sm font-bold text-violet-600 font-mono">{report.imageQuality.lightingUniformity}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Optional Apparent Age Range (If Enabled) */}
      {report.ageEstimation && report.ageEstimation.enabled && (
        <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50 p-5 shadow-2xs">
          <div className="flex items-start space-x-3">
            <Eye className="h-5 w-5 text-violet-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-violet-900">Estimated Apparent Age Range:</h4>
                <span className="rounded-lg bg-white border border-violet-200 px-2.5 py-0.5 text-xs font-mono font-bold text-violet-700 shadow-2xs">
                  {report.ageEstimation.estimatedRange}
                </span>
              </div>
              <p className="mt-1 text-xs text-violet-800 leading-relaxed">
                {report.ageEstimation.disclaimer}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Captured Photo Gallery Row */}
      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Camera className="h-4 w-4 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Analyzed Multi-Angle Captures ({photos.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Click any frame to inspect</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all hover:border-sky-400 hover:shadow-md hover:scale-[1.03]"
            >
              <div className="relative aspect-[4/3] w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.dataUrl}
                  alt={photo.poseLabel}
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-1 left-1 rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-mono font-bold text-sky-700 shadow-2xs">
                  #{idx + 1}
                </div>
              </div>
              <div className="p-2 text-center">
                <div className="truncate text-[11px] font-semibold text-slate-800">{photo.poseLabel}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Analysis Breakdown Cards (Ultra-Light) */}
      <div className="mt-8 space-y-4">
        {/* Section 1: Visible Skin Characteristics */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <button
            onClick={() => toggleSection("skin")}
            className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-slate-50"
          >
            <div className="flex items-center space-x-2.5">
              <Sun className="h-4 w-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Visible Skin Appearance &amp; Texture
              </h3>
            </div>
            {expandedSections.skin ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>

          {expandedSections.skin && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 p-5 text-xs">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="font-bold text-sky-700">Visible Surface Appearance</span>
                <p className="mt-1 text-slate-600 leading-relaxed">
                  {report.skinCharacteristics.visibleAppearance}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="font-bold text-sky-700">Apparent Texture</span>
                <p className="mt-1 text-slate-600 leading-relaxed">
                  {report.skinCharacteristics.apparentTexture}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="font-bold text-sky-700">Hydration &amp; Shine Indicators</span>
                <p className="mt-1 text-slate-600 leading-relaxed">
                  {report.skinCharacteristics.hydrationShine}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="font-bold text-sky-700">Illumination Uniformity</span>
                <p className="mt-1 text-slate-600 leading-relaxed">
                  {report.skinCharacteristics.toneUniformity}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Facial Geometry & Symmetry */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <button
            onClick={() => toggleSection("geometry")}
            className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-slate-50"
          >
            <div className="flex items-center space-x-2.5">
              <CheckCircle className="h-4 w-4 text-violet-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Facial Geometry &amp; Symmetry Analysis
              </h3>
            </div>
            {expandedSections.geometry ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>

          {expandedSections.geometry && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 p-5 text-xs">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="font-bold text-violet-700">Bilateral Landmark Symmetry</span>
                <p className="mt-1 text-slate-600 leading-relaxed">
                  {report.facialGeometry.symmetryNotes}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="font-bold text-violet-700">Structural Proportions</span>
                <p className="mt-1 text-slate-600 leading-relaxed">
                  {report.facialGeometry.structuralHarmony}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                <span className="font-bold text-violet-700">Jawline &amp; Contour Definition</span>
                <p className="mt-1 text-slate-600 leading-relaxed">
                  {report.facialGeometry.jawlineContour}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Photography & Lighting Recommendations */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <button
            onClick={() => toggleSection("quality")}
            className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-slate-50"
          >
            <div className="flex items-center space-x-2.5">
              <Camera className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Camera, Optical &amp; Lighting Recommendations
              </h3>
            </div>
            {expandedSections.quality ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>

          {expandedSections.quality && (
            <div className="border-t border-slate-100 p-5 space-y-3 text-xs">
              <p className="text-slate-600">{report.imageQuality.shadowNotes}</p>
              <ul className="space-y-2 mt-2">
                {report.imageQuality.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start space-x-2 rounded-xl bg-slate-50 p-3 text-slate-700">
                    <span className="text-emerald-600 font-bold">&#8226;</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Section 4: Photo Presentation Suggestions */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <button
            onClick={() => toggleSection("presentation")}
            className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-slate-50"
          >
            <div className="flex items-center space-x-2.5">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Portrait Presentation &amp; Angles
              </h3>
            </div>
            {expandedSections.presentation ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>

          {expandedSections.presentation && (
            <div className="border-t border-slate-100 p-5 text-xs">
              <ul className="space-y-2">
                {report.presentationSuggestions.map((sug, i) => (
                  <li key={i} className="flex items-start space-x-2 rounded-xl bg-slate-50 p-3 text-slate-700">
                    <span className="text-amber-500 font-bold">&#10003;</span>
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Section 5: General Skincare & Wellness Guidance */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <button
            onClick={() => toggleSection("skincare")}
            className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-slate-50"
          >
            <div className="flex items-center space-x-2.5">
              <HelpCircle className="h-4 w-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                General Cosmetic Wellness Tips (Non-Medical)
              </h3>
            </div>
            {expandedSections.skincare ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>

          {expandedSections.skincare && (
            <div className="border-t border-slate-100 p-5 text-xs">
              <ul className="space-y-2">
                {report.skincareGeneralTips.map((tip, i) => (
                  <li key={i} className="flex items-start space-x-2 rounded-xl bg-slate-50 p-3 text-slate-700">
                    <span className="text-sky-600 font-bold">&#8594;</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Mandatory Prominent Non-Medical Disclaimer (Ultra-Light) */}
      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-xs text-amber-900 leading-relaxed shadow-2xs">
        <div className="flex items-start space-x-2.5">
          <ShieldAlert className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-900">Ethical &amp; Non-Medical Disclaimer:</span>
            <p className="mt-1 text-amber-800">{report.disclaimer}</p>
          </div>
        </div>
      </div>

      {/* Lightbox Preview Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="relative max-h-[90vh] max-w-3xl overflow-hidden rounded-2xl border border-slate-700 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedPhoto.dataUrl}
              alt={selectedPhoto.poseLabel}
              className="max-h-[75vh] w-auto object-contain bg-black"
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
    </section>
  );
};
