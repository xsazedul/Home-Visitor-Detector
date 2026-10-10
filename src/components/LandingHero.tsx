"use client";

import React from "react";
import {
  Camera,
  Layers,
  Sparkles,
  Compass,
  Eye,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

interface LandingHeroProps {
  onStartWebcam: () => void;
  onOpenHowItWorks: () => void;
  onOpenPrivacy: () => void;
  permissionError: string | null;
  onClearError: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartWebcam,
  onOpenHowItWorks,
  onOpenPrivacy,
  permissionError,
  onClearError,
}) => {
  return (
    <section className="relative overflow-hidden py-12 sm:py-20">
      {/* Background Decorative Soft Washes */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-gradient-to-tr from-sky-200/40 via-indigo-100/30 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-10 top-1/3 -z-10 h-72 w-72 rounded-full bg-violet-100/40 blur-2xl" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
        {/* Subtle pill tag */}
        <div className="inline-flex items-center space-x-2 rounded-full border border-sky-200 bg-sky-50/80 px-3.5 py-1 text-xs font-semibold text-sky-800 shadow-2xs mb-6 animate-float">
          <Sparkles className="h-3.5 w-3.5 text-sky-600" />
          <span>Next-Generation In-Browser Computer Vision</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl md:text-7xl">
          Discover Your Face <br />
          <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
            with AI Intelligence
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-base text-slate-600 sm:text-lg">
          Experience real-time 3D facial landmark tracking, intelligent guided poses, precision multi-angle photo capture, and a comprehensive structured facial appearance analysis—processed locally with complete privacy.
        </p>

        {/* Permission Error Banner */}
        {permissionError && (
          <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-rose-200 bg-rose-50 p-4 text-left text-sm text-rose-800 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-rose-900">Camera Access Notice</h4>
                <p className="mt-1 text-xs text-rose-700 leading-relaxed">{permissionError}</p>
                <p className="mt-2 text-[11px] text-rose-600 font-medium">
                  Tip: Look for the camera lock icon in your browser URL address bar, select &ldquo;Allow&rdquo;, and refresh or click &ldquo;Open Webcam&rdquo; again.
                </p>
              </div>
              <button
                onClick={onClearError}
                className="ml-2 text-rose-400 hover:text-rose-700"
                title="Dismiss"
              >
                &times;
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            onClick={onStartWebcam}
            className="group relative flex w-full items-center justify-center space-x-2.5 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-violet-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-sky-600/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl sm:w-auto"
          >
            <Camera className="h-5 w-5 transition-transform group-hover:rotate-12" />
            <span>Open Webcam</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={onOpenHowItWorks}
            className="flex w-full items-center justify-center space-x-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-base font-medium text-slate-700 shadow-2xs transition-all duration-200 hover:border-sky-300 hover:bg-sky-50/50 hover:text-sky-700 sm:w-auto"
          >
            <HelpCircle className="h-5 w-5 text-sky-600" />
            <span>Learn How It Works</span>
          </button>
        </div>

        {/* Privacy Notice Banner */}
        <div className="mx-auto mt-8 flex max-w-2xl items-center justify-center space-x-3 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-2.5 text-xs text-emerald-900 shadow-2xs">
          <ShieldCheck className="h-4 w-4 flex-shrink-0 text-emerald-600" />
          <span>
            <strong>Zero Secret Storage:</strong> Face tracking &amp; landmarks run in your browser. Photos are processed in memory and never stored without your explicit approval.
          </span>
          <button
            onClick={onOpenPrivacy}
            className="underline underline-offset-2 hover:text-emerald-700 font-semibold"
          >
            Policy
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 text-left">
          {/* Card 1 */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-sky-300 hover:shadow-md hover:scale-[1.01]">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600 mb-4 border border-sky-100">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
              Real-Time 3D Mesh
            </h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              468+ high-density facial landmark points tracked continuously with dynamic wireframe depth overlays and iris tracking.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-violet-300 hover:shadow-md hover:scale-[1.01]">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600 mb-4 border border-violet-100">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
              Intelligent Guided Poses
            </h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Active head-pose estimation (yaw, pitch, roll) with animated directional arrows guiding you through 6 natural poses.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-md hover:scale-[1.01]">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4 border border-blue-100">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Appearance AI Analysis
            </h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Sharpness metrics, illumination balance, facial symmetry, and non-medical photography optimization advice.
            </p>
          </div>

          {/* Card 4 */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-emerald-300 hover:shadow-md hover:scale-[1.01]">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-4 border border-emerald-100">
              <Eye className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              Visitor Guard Mode
            </h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Optional session monitor detects additional persons entering camera field of view with audio alerts and event logging.
            </p>
          </div>
        </div>

        {/* System Verification Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          <div className="flex items-center space-x-1.5 font-medium">
            <CheckCircle2 className="h-4 w-4 text-sky-600" />
            <span>Standard WebRTC Camera API</span>
          </div>
          <div className="flex items-center space-x-1.5 font-medium">
            <CheckCircle2 className="h-4 w-4 text-sky-600" />
            <span>Works on Chrome, Edge, Safari, Firefox</span>
          </div>
          <div className="flex items-center space-x-1.5 font-medium">
            <Lock className="h-4 w-4 text-emerald-600" />
            <span>Hardware Accelerated Client-Side AI</span>
          </div>
        </div>
      </div>
    </section>
  );
};
