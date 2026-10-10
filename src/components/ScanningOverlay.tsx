"use client";

import React, { useEffect, useRef } from "react";
import { LandmarkPoint, PoseType } from "@/types";
import {
  FACE_OVAL_INDICES,
  LIPS_OUTER_INDICES,
  LEFT_EYE_INDICES,
  RIGHT_EYE_INDICES,
  NOSE_RIDGE_INDICES,
  KEY_3D_FEATURE_POINTS,
} from "@/utils/faceLandmarker";

interface ScanningOverlayProps {
  landmarks: LandmarkPoint[] | null;
  allFaces?: LandmarkPoint[][];
  videoWidth: number;
  videoHeight: number;
  isScanning: boolean;
  scanLineProgress: number; // 0.0 to 1.0
  activePose: PoseType | null;
  arrowDirection: "center" | "left" | "right" | "up" | "down" | "smile" | null;
  isPoseMatched: boolean;
  isCapturingFlash: boolean;
  showMeshWireframe: boolean;
  isVisitorMode: boolean;
}

export const ScanningOverlay: React.FC<ScanningOverlayProps> = ({
  landmarks,
  allFaces = [],
  videoWidth,
  videoHeight,
  isScanning,
  scanLineProgress,
  activePose,
  arrowDirection,
  isPoseMatched,
  isCapturingFlash,
  showMeshWireframe = true,
  isVisitorMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || videoWidth === 0 || videoHeight === 0) return;

    if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
      canvas.width = videoWidth;
      canvas.height = videoHeight;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, videoWidth, videoHeight);

    // 1. Camera Flash Animation
    if (isCapturingFlash) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.fillRect(0, 0, videoWidth, videoHeight);
      return;
    }

    // 2. Draw Additional Faces (Visitor / Multi-person detection)
    if (allFaces.length > 1) {
      // Faces after index 0 are extra people in view
      for (let f = 1; f < allFaces.length; f++) {
        const extraFace = allFaces[f];
        if (!extraFace || extraFace.length === 0) continue;

        let minX = 1, maxX = 0, minY = 1, maxY = 0;
        for (const pt of extraFace) {
          if (pt.x < minX) minX = pt.x;
          if (pt.x > maxX) maxX = pt.x;
          if (pt.y < minY) minY = pt.y;
          if (pt.y > maxY) maxY = pt.y;
        }

        // Mirror horizontally to match mirrored video display
        const bx = (1 - maxX) * videoWidth;
        const by = minY * videoHeight;
        const bw = (maxX - minX) * videoWidth;
        const bh = (maxY - minY) * videoHeight;

        // Orange/Red Visitor Alert Box
        ctx.strokeStyle = "rgba(244, 63, 94, 0.9)";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(bx, by, bw, bh);
        ctx.setLineDash([]);

        // Label Tag
        ctx.fillStyle = "rgba(244, 63, 94, 0.85)";
        ctx.fillRect(bx, Math.max(0, by - 24), Math.max(160, bw), 22);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText("ADDITIONAL PERSON DETECTED", bx + 6, Math.max(15, by - 8));
      }
    }

    // 3. If primary face landmarks exist, draw futuristic 3D mesh HUD
    if (landmarks && landmarks.length >= 468) {
      const primaryFace = landmarks;

      // Color scheme: turns green/cyan when pose matches, cyan/violet when posing/scanning
      const strokeColor = isPoseMatched
        ? "rgba(16, 185, 129, 0.75)"
        : "rgba(0, 240, 255, 0.65)";
      const glowColor = isPoseMatched
        ? "rgba(16, 185, 129, 0.4)"
        : "rgba(139, 92, 246, 0.4)";

      ctx.save();

      // Bounding Face Oval
      drawLandmarkPath(ctx, primaryFace, FACE_OVAL_INDICES, videoWidth, videoHeight, strokeColor, 1.5, true);

      // Lips
      drawLandmarkPath(ctx, primaryFace, LIPS_OUTER_INDICES, videoWidth, videoHeight, "rgba(236, 72, 153, 0.6)", 1.2, true);

      // Eyes
      drawLandmarkPath(ctx, primaryFace, LEFT_EYE_INDICES, videoWidth, videoHeight, strokeColor, 1.2, true);
      drawLandmarkPath(ctx, primaryFace, RIGHT_EYE_INDICES, videoWidth, videoHeight, strokeColor, 1.2, true);

      // Nose Ridge
      drawLandmarkPath(ctx, primaryFace, NOSE_RIDGE_INDICES, videoWidth, videoHeight, "rgba(0, 240, 255, 0.5)", 1.0, false);

      // 3D Geometric wireframe triangulation lines across cheeks and forehead
      if (showMeshWireframe) {
        ctx.strokeStyle = isPoseMatched ? "rgba(16, 185, 129, 0.22)" : "rgba(0, 240, 255, 0.2)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();

        // Connect forehead to nose, eyes to cheeks, chin to mouth
        const meshTriangles = [
          [10, 33, 1], [10, 263, 1], [33, 234, 152], [263, 454, 152],
          [1, 61, 152], [1, 291, 152], [168, 107, 1], [168, 336, 1],
          [33, 133, 1], [263, 362, 1], [199, 152, 61], [199, 152, 291]
        ];

        for (const [a, b, c] of meshTriangles) {
          const ptA = primaryFace[a];
          const ptB = primaryFace[b];
          const ptC = primaryFace[c];
          if (ptA && ptB && ptC) {
            ctx.moveTo(ptA.x * videoWidth, ptA.y * videoHeight);
            ctx.lineTo(ptB.x * videoWidth, ptB.y * videoHeight);
            ctx.lineTo(ptC.x * videoWidth, ptC.y * videoHeight);
            ctx.closePath();
          }
        }
        ctx.stroke();
      }

      // Key 3D Feature Nodes (Forehead, Nose, Chin, Temples, Irises)
      for (const idx of KEY_3D_FEATURE_POINTS) {
        const pt = primaryFace[idx];
        if (pt) {
          const px = pt.x * videoWidth;
          const py = pt.y * videoHeight;

          // Glowing node circle
          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = isPoseMatched ? "#10b981" : "#00f0ff";
          ctx.fill();

          ctx.beginPath();
          ctx.arc(px, py, 6.5, 0, Math.PI * 2);
          ctx.strokeStyle = glowColor;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Draw Iris gaze markers (468: left iris center, 473: right iris center)
      if (primaryFace[468]) {
        drawIrisTarget(ctx, primaryFace[468].x * videoWidth, primaryFace[468].y * videoHeight, isPoseMatched);
      }
      if (primaryFace[473]) {
        drawIrisTarget(ctx, primaryFace[473].x * videoWidth, primaryFace[473].y * videoHeight, isPoseMatched);
      }

      // 4. Moving Scan Line from top to bottom
      if (isScanning) {
        const scanY = scanLineProgress * videoHeight;
        const scanGrad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 10);
        scanGrad.addColorStop(0, "rgba(0, 240, 255, 0)");
        scanGrad.addColorStop(0.7, "rgba(0, 240, 255, 0.4)");
        scanGrad.addColorStop(1, "rgba(139, 92, 246, 0.9)");

        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, scanY - 25, videoWidth, 25);

        // Core laser line
        ctx.strokeStyle = "#00f0ff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(videoWidth, scanY);
        ctx.stroke();

        // Laser scan tag
        ctx.fillStyle = "#00f0ff";
        ctx.font = "9px monospace";
        ctx.fillText(`SCAN_LINE // Y:${Math.round(scanY)}px`, 16, Math.max(16, scanY - 6));
      }

      // 5. Directional Guided Arrow Overlay
      if (arrowDirection) {
        const noseX = primaryFace[1].x * videoWidth;
        const noseY = primaryFace[1].y * videoHeight;
        drawPoseDirectionArrow(ctx, arrowDirection, noseX, noseY, isPoseMatched);
      }

      ctx.restore();
    } else {
      // No face detected - Draw centering guide reticle
      drawCenterGuideReticle(ctx, videoWidth, videoHeight);
    }
  }, [
    landmarks,
    allFaces,
    videoWidth,
    videoHeight,
    isScanning,
    scanLineProgress,
    activePose,
    arrowDirection,
    isPoseMatched,
    isCapturingFlash,
    showMeshWireframe,
    isVisitorMode,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10 h-full w-full object-cover"
    />
  );
};

// Helper: draw connected landmark lines
function drawLandmarkPath(
  ctx: CanvasRenderingContext2D,
  landmarks: LandmarkPoint[],
  indices: number[],
  width: number,
  height: number,
  strokeColor: string,
  lineWidth: number,
  closePath = false
) {
  if (indices.length < 2) return;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();

  const first = landmarks[indices[0]];
  if (!first) return;
  ctx.moveTo(first.x * width, first.y * height);

  for (let i = 1; i < indices.length; i++) {
    const pt = landmarks[indices[i]];
    if (pt) {
      ctx.lineTo(pt.x * width, pt.y * height);
    }
  }

  if (closePath) {
    ctx.closePath();
  }
  ctx.stroke();
}

// Helper: iris gaze target
function drawIrisTarget(ctx: CanvasRenderingContext2D, x: number, y: number, isMatched: boolean) {
  ctx.save();
  ctx.strokeStyle = isMatched ? "#10b981" : "#00f0ff";
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.stroke();

  // Mini crosshair ticks
  ctx.beginPath();
  ctx.moveTo(x - 8, y);
  ctx.lineTo(x + 8, y);
  ctx.moveTo(x, y - 8);
  ctx.lineTo(x, y + 8);
  ctx.stroke();

  ctx.restore();
}

// Helper: Draw animated direction guide arrows
function drawPoseDirectionArrow(
  ctx: CanvasRenderingContext2D,
  direction: "center" | "left" | "right" | "up" | "down" | "smile",
  centerX: number,
  centerY: number,
  isMatched: boolean
) {
  ctx.save();
  const color = isMatched ? "#10b981" : "#00f0ff";
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  const offset = 70;

  if (direction === "left") {
    // Arrow pointing to the left (mirror user's left)
    const startX = centerX - 40;
    ctx.beginPath();
    ctx.moveTo(startX, centerY);
    ctx.lineTo(startX - 50, centerY);
    ctx.lineTo(startX - 35, centerY - 15);
    ctx.moveTo(startX - 50, centerY);
    ctx.lineTo(startX - 35, centerY + 15);
    ctx.stroke();
  } else if (direction === "right") {
    // Arrow pointing right
    const startX = centerX + 40;
    ctx.beginPath();
    ctx.moveTo(startX, centerY);
    ctx.lineTo(startX + 50, centerY);
    ctx.lineTo(startX + 35, centerY - 15);
    ctx.moveTo(startX + 50, centerY);
    ctx.lineTo(startX + 35, centerY + 15);
    ctx.stroke();
  } else if (direction === "up") {
    // Arrow pointing up
    const startY = centerY - 50;
    ctx.beginPath();
    ctx.moveTo(centerX, startY);
    ctx.lineTo(centerX, startY - 45);
    ctx.lineTo(centerX - 15, startY - 30);
    ctx.moveTo(centerX, startY - 45);
    ctx.lineTo(centerX + 15, startY - 30);
    ctx.stroke();
  } else if (direction === "down") {
    // Arrow pointing down
    const startY = centerY + 50;
    ctx.beginPath();
    ctx.moveTo(centerX, startY);
    ctx.lineTo(centerX, startY + 45);
    ctx.lineTo(centerX - 15, startY + 30);
    ctx.moveTo(centerX, startY + 45);
    ctx.lineTo(centerX + 15, startY + 30);
    ctx.stroke();
  } else if (direction === "center") {
    // Center targeting ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
    ctx.setLineDash([8, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (direction === "smile") {
    // Smile icon badge near bottom
    ctx.beginPath();
    ctx.arc(centerX, centerY + 45, 25, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.lineWidth = 3.5;
    ctx.stroke();
  }

  ctx.restore();
}

// Helper: Reticle when waiting for face
function drawCenterGuideReticle(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const cx = width / 2;
  const cy = height / 2;
  const rx = width * 0.22;
  const ry = height * 0.32;

  ctx.save();
  ctx.strokeStyle = "rgba(0, 240, 255, 0.3)";
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 8]);

  // Ellipse guide for head position
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Corner brackets
  const bSize = 24;
  const left = cx - rx;
  const right = cx + rx;
  const top = cy - ry;
  const bottom = cy + ry;

  ctx.strokeStyle = "rgba(0, 240, 255, 0.6)";
  ctx.lineWidth = 2.5;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(left, top + bSize);
  ctx.lineTo(left, top);
  ctx.lineTo(left + bSize, top);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(right - bSize, top);
  ctx.lineTo(right, top);
  ctx.lineTo(right, top + bSize);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(left, bottom - bSize);
  ctx.lineTo(left, bottom);
  ctx.lineTo(left + bSize, bottom);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(right - bSize, bottom);
  ctx.lineTo(right, bottom);
  ctx.lineTo(right, bottom - bSize);
  ctx.stroke();

  // Instruction text
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.font = "bold 13px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("POSITION FACE WITHIN FRAME", cx, bottom + 32);

  ctx.restore();
}
