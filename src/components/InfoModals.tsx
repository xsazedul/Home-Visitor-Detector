"use client";

import React from "react";
import {
  X,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  Camera,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface InfoModalsProps {
  isHowItWorksOpen: boolean;
  onCloseHowItWorks: () => void;
  isPrivacyOpen: boolean;
  onClosePrivacy: () => void;
}

export const InfoModals: React.FC<InfoModalsProps> = ({
  isHowItWorksOpen,
  onCloseHowItWorks,
  isPrivacyOpen,
  onClosePrivacy,
}) => {
  return (
    <>
      {/* How It Works Modal */}
      {isHowItWorksOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900">
                  How AI Face Studio Works
                </h3>
              </div>
              <button
                onClick={onCloseHowItWorks}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4">
                <h4 className="font-bold text-sky-900 text-sm">
                  1. Local 3D Landmark Tracking
                </h4>
                <p className="mt-1 text-slate-600">
                  Using MediaPipe neural vision algorithms running directly in WebAssembly inside your browser, the studio tracks 468+ spatial facial coordinates in real time. We calculate head rotation (yaw, pitch, roll), eye gaze, and expression metrics locally at 30+ FPS.
                </p>
                <p className="mt-2 text-[11px] text-slate-500 italic">
                  *Note: Visual 3D wireframe mesh displays depth tracking overlays. Standard webcams capture 2D optical images, not CT-scanned volumetric surfaces.
                </p>
              </div>

              <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-4">
                <h4 className="font-bold text-violet-900 text-sm">
                  2. Intelligent 6-Pose Guided Capture
                </h4>
                <p className="mt-1 text-slate-600">
                  The AI assistant directs you through 6 natural facial angles (neutral, left, right, chin up, chin down, smile). When the pose is verified stable and environmental lighting/sharpness scores are optimal, the frame is automatically captured.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                <h4 className="font-bold text-emerald-900 text-sm">
                  3. Structured Appearance &amp; Lighting Analysis
                </h4>
                <p className="mt-1 text-slate-600">
                  Once you inspect and approve your 6 captured photos, our vision engine generates a structured report covering visible skin texture, lighting distribution, facial symmetry, and photography tips.
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                <h4 className="font-bold text-amber-900 text-sm">
                  4. Non-Medical Guidance &amp; Privacy First
                </h4>
                <p className="mt-1 text-slate-600">
                  This studio provides photography, cosmetic appearance, and lighting recommendations only. It does not diagnose dermatological or medical conditions. All images remain in temporary session memory and can be permanently purged at any time.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onCloseHowItWorks}
                className="rounded-xl bg-sky-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-sky-700 shadow-sm"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {isPrivacyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900">
                  Privacy &amp; Data Protection Policy
                </h3>
              </div>
              <button
                onClick={onClosePrivacy}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="flex items-start space-x-3 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <Lock className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900">Zero Biometric Identification</h4>
                  <p className="mt-1 text-slate-600">
                    We do not store biometric facial templates, facial recognition hashes, or identity databases. Face detection serves strictly to verify poses and frame composition.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900">In-Memory Local Processing</h4>
                  <p className="mt-1 text-slate-600">
                    Photographs captured during the guided session reside strictly in local browser memory until you review and approve them. If you cancel or click &ldquo;Delete Session&rdquo;, all images and logs are wiped instantly.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <Camera className="h-4 w-4 text-sky-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900">Explicit Camera Permission &amp; Release</h4>
                  <p className="mt-1 text-slate-600">
                    Camera access is requested only when you click &ldquo;Open Webcam&rdquo;. When you stop the camera or close the session, all active media tracks are immediately stopped and released.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <Sparkles className="h-4 w-4 text-violet-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900">No AI Model Training On Your Images</h4>
                  <p className="mt-1 text-slate-600">
                    Captured photos are never used to train public machine learning models. User privacy and individual consent are unconditionally prioritized.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onClosePrivacy}
                className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
