"use client";

import React from "react";
import { Camera, ShieldCheck, Volume2, VolumeX, Eye, Info } from "lucide-react";

interface NavbarProps {
  isCameraActive: boolean;
  isVisitorModeActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenInfo: () => void;
  onOpenPrivacy: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isCameraActive,
  isVisitorModeActive,
  isMuted,
  onToggleMute,
  onOpenInfo,
  onOpenPrivacy,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-xl transition-all duration-300 shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-violet-600 p-0.5 shadow-xs">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-white">
              <Camera className="h-5 w-5 text-sky-600 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-slate-900">
                AI Face <span className="bg-gradient-to-r from-sky-600 to-violet-600 bg-clip-text text-transparent">Studio</span>
              </span>
              <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                PRO 3D
              </span>
            </div>
            <p className="hidden text-[11px] text-slate-500 sm:block">
              Webcam Biometrics &amp; Facial Appearance Intelligence
            </p>
          </div>
        </div>

        {/* Live Status Indicators & Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {isCameraActive && (
            <div className="flex items-center space-x-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline">Camera Live</span>
            </div>
          )}

          {isVisitorModeActive && (
            <div className="flex items-center space-x-1.5 rounded-full border border-violet-300 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 animate-pulse">
              <Eye className="h-3 w-3" />
              <span className="hidden sm:inline">Visitor Guard</span>
            </div>
          )}

          <button
            onClick={onToggleMute}
            title={isMuted ? "Unmute audio prompts" : "Mute audio prompts"}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs transition-colors hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50/50 focus:outline-none"
            aria-label="Toggle Audio"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-sky-600" />}
          </button>

          <button
            onClick={onOpenInfo}
            className="flex items-center space-x-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition-colors hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50/50"
          >
            <Info className="h-3.5 w-3.5 text-sky-600" />
            <span className="hidden md:inline">How It Works</span>
          </button>

          <button
            onClick={onOpenPrivacy}
            className="flex items-center space-x-1 rounded-xl border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 shadow-2xs transition-colors hover:border-emerald-300 hover:bg-emerald-50/50"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Privacy First</span>
          </button>
        </div>
      </div>
    </header>
  );
};
