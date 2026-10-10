import { FaceMetrics, LandmarkPoint, PoseType } from "@/types";

// MediaPipe 468/478 Landmark indices for reference:
// Nose tip: 1
// Chin: 152
// Left eye outer: 33, inner: 133
// Right eye outer: 263, inner: 362
// Mouth left: 61, right: 291, top: 13, bottom: 14
// Forehead: 10
// Left cheek: 234, Right cheek: 454

export interface RawLandmarks {
  [index: number]: { x: number; y: number; z?: number };
  length: number;
}

export function computeSharpness(imageData: ImageData): number {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  // Convert to grayscale sample (step by 2 for high performance)
  const step = 2;
  const grayWidth = Math.floor(width / step);
  const grayHeight = Math.floor(height / step);
  const gray = new Float32Array(grayWidth * grayHeight);

  for (let y = 0; y < grayHeight; y++) {
    for (let x = 0; x < grayWidth; x++) {
      const idx = (y * step * width + x * step) * 4;
      // Luminance formula
      gray[y * grayWidth + x] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    }
  }

  // Discrete Laplacian variance calculation
  // Kernel: [0, 1, 0], [1, -4, 1], [0, 1, 0]
  let laplacianSum = 0;
  let laplacianSqSum = 0;
  let count = 0;

  for (let y = 1; y < grayHeight - 1; y++) {
    for (let x = 1; x < grayWidth - 1; x++) {
      const center = gray[y * grayWidth + x];
      const lap =
        gray[(y - 1) * grayWidth + x] +
        gray[(y + 1) * grayWidth + x] +
        gray[y * grayWidth + (x - 1)] +
        gray[y * grayWidth + (x + 1)] -
        4 * center;

      laplacianSum += lap;
      laplacianSqSum += lap * lap;
      count++;
    }
  }

  if (count === 0) return 50;
  const mean = laplacianSum / count;
  const variance = laplacianSqSum / count - mean * mean;

  // Map variance (typically 20 to 800) to 0-100 score
  const normalized = Math.min(100, Math.max(0, Math.round(Math.sqrt(variance) * 3.8)));
  return normalized;
}

export function computeLighting(imageData: ImageData): { score: number; status: "LOW" | "OPTIMAL" | "OVEREXPOSED" } {
  const data = imageData.data;
  let totalLuminance = 0;
  const totalPixels = imageData.width * imageData.height;
  const sampleStep = 4; // Sample every 4th pixel for speed
  let samples = 0;

  for (let i = 0; i < data.length; i += 4 * sampleStep) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    totalLuminance += lum;
    samples++;
  }

  const avgLum = samples > 0 ? totalLuminance / samples : 128; // 0 to 255

  // Map average luminance to score (optimal around 110-180)
  let score = 100;
  let status: "LOW" | "OPTIMAL" | "OVEREXPOSED" = "OPTIMAL";

  if (avgLum < 75) {
    status = "LOW";
    score = Math.max(20, Math.round((avgLum / 75) * 60));
  } else if (avgLum > 210) {
    status = "OVEREXPOSED";
    score = Math.max(30, Math.round(100 - ((avgLum - 210) / 45) * 50));
  } else {
    // In optimal range
    score = Math.round(85 + ((avgLum - 75) / (210 - 75)) * 15);
  }

  return { score, status };
}

export function computeHeadPoseAndMetrics(
  landmarks: LandmarkPoint[],
  videoWidth: number,
  videoHeight: number,
  imageData?: ImageData
): FaceMetrics {
  if (!landmarks || landmarks.length < 468) {
    return {
      detected: false,
      faceCount: 0,
      yaw: 0,
      pitch: 0,
      roll: 0,
      distanceScore: 0,
      distanceStatus: "TOO_FAR",
      lightingScore: 0,
      lightingStatus: "LOW",
      sharpnessScore: 0,
      sharpnessStatus: "BLURRY",
      isAligned: false,
      alignmentMessage: "No face detected in camera view.",
      smileScore: 0,
      isPoseMatched: false,
    };
  }

  // Key landmark positions
  const noseTip = landmarks[1];
  const chin = landmarks[152];
  const forehead = landmarks[10];
  const leftEyeOuter = landmarks[33];
  const rightEyeOuter = landmarks[263];
  const leftCheek = landmarks[234];
  const rightCheek = landmarks[454];
  const mouthLeft = landmarks[61];
  const mouthRight = landmarks[291];
  const mouthTop = landmarks[13];
  const mouthBottom = landmarks[14];

  // Head Yaw (Left / Right rotation in degrees)
  // Distance from nose tip to left cheek vs right cheek
  const distNoseToLeftCheek = Math.hypot(noseTip.x - leftCheek.x, noseTip.y - leftCheek.y);
  const distNoseToRightCheek = Math.hypot(noseTip.x - rightCheek.x, noseTip.y - rightCheek.y);
  const cheekTotal = distNoseToLeftCheek + distNoseToRightCheek;
  const yawRatio = cheekTotal > 0 ? (distNoseToLeftCheek - distNoseToRightCheek) / cheekTotal : 0;
  // yawRatio ~ 0 when straight, negative when turned left, positive when turned right
  const yaw = Math.round(yawRatio * 90);

  // Head Pitch (Tilt up / down in degrees)
  // Forehead to nose tip vs nose tip to chin ratio
  const distForeheadNose = Math.hypot(forehead.x - noseTip.x, forehead.y - noseTip.y);
  const distNoseChin = Math.hypot(noseTip.x - chin.x, noseTip.y - chin.y);
  const faceHeight = distForeheadNose + distNoseChin;
  const pitchRatio = faceHeight > 0 ? (distForeheadNose - distNoseChin) / faceHeight : 0;
  // Average neutral pitch offset is around 0.05 - 0.15
  const pitch = Math.round((pitchRatio - 0.08) * 80);

  // Head Roll (Side tilt)
  const eyeDx = rightEyeOuter.x - leftEyeOuter.x;
  const eyeDy = rightEyeOuter.y - leftEyeOuter.y;
  const roll = Math.round(Math.atan2(eyeDy, eyeDx) * (180 / Math.PI));

  // Distance Estimation (based on interocular / cheek distance relative to frame)
  const faceWidthNorm = Math.hypot(rightCheek.x - leftCheek.x, rightCheek.y - leftCheek.y);
  // Optimal face width is roughly 35% to 55% of frame width
  const distanceScore = Math.min(100, Math.max(0, Math.round(faceWidthNorm * 180)));
  let distanceStatus: "TOO_FAR" | "TOO_CLOSE" | "OPTIMAL" = "OPTIMAL";
  if (faceWidthNorm < 0.28) {
    distanceStatus = "TOO_FAR";
  } else if (faceWidthNorm > 0.65) {
    distanceStatus = "TOO_CLOSE";
  }

  // Smile calculation
  const mouthWidth = Math.hypot(mouthRight.x - mouthLeft.x, mouthRight.y - mouthLeft.y);
  const interEyeWidth = Math.hypot(rightEyeOuter.x - leftEyeOuter.x, rightEyeOuter.y - leftEyeOuter.y);
  const smileRatio = interEyeWidth > 0 ? mouthWidth / interEyeWidth : 0;
  // Neutral mouth width is ~0.65 of inter-eye width, smiling is >0.82
  const smileScore = Math.min(1, Math.max(0, (smileRatio - 0.68) / 0.22));

  // Bounding box
  let minX = 1, maxX = 0, minY = 1, maxY = 0;
  for (let i = 0; i < landmarks.length; i++) {
    const p = landmarks[i];
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const box = {
    x: Math.max(0, minX * videoWidth),
    y: Math.max(0, minY * videoHeight),
    width: Math.min(videoWidth, (maxX - minX) * videoWidth),
    height: Math.min(videoHeight, (maxY - minY) * videoHeight),
  };

  // Image quality from imageData
  let sharpnessScore = 80;
  let sharpnessStatus: "BLURRY" | "ACCEPTABLE" | "SHARP" = "SHARP";
  let lightingScore = 85;
  let lightingStatus: "LOW" | "OPTIMAL" | "OVEREXPOSED" = "OPTIMAL";

  if (imageData) {
    sharpnessScore = computeSharpness(imageData);
    sharpnessStatus = sharpnessScore < 45 ? "BLURRY" : sharpnessScore < 70 ? "ACCEPTABLE" : "SHARP";

    const light = computeLighting(imageData);
    lightingScore = light.score;
    lightingStatus = light.status;
  }

  // Alignment validation
  let isAligned = true;
  let alignmentMessage = "Face aligned. Ready for scan.";

  if (distanceStatus === "TOO_FAR") {
    isAligned = false;
    alignmentMessage = "Move slightly closer to the camera.";
  } else if (distanceStatus === "TOO_CLOSE") {
    isAligned = false;
    alignmentMessage = "Move slightly back from the camera.";
  } else if (Math.abs(roll) > 15) {
    isAligned = false;
    alignmentMessage = "Hold your head level with the horizon.";
  } else if (lightingStatus === "LOW") {
    alignmentMessage = "Lighting is low. Face toward a light source.";
  }

  return {
    detected: true,
    faceCount: 1,
    box,
    landmarks,
    yaw,
    pitch,
    roll,
    distanceScore,
    distanceStatus,
    lightingScore,
    lightingStatus,
    sharpnessScore,
    sharpnessStatus,
    isAligned,
    alignmentMessage,
    smileScore,
    isPoseMatched: false,
  };
}

export function checkPoseMatch(metrics: FaceMetrics, currentPose: PoseType): { matched: boolean; feedback: string } {
  if (!metrics.detected) {
    return { matched: false, feedback: "Center your face in view" };
  }

  switch (currentPose) {
    case "neutral": {
      const isCenteredYaw = Math.abs(metrics.yaw) <= 18;
      const isCenteredPitch = Math.abs(metrics.pitch) <= 18;
      if (!isCenteredYaw) {
        return {
          matched: false,
          feedback: metrics.yaw > 18 ? "Turn slightly to your left" : "Turn slightly to your right",
        };
      }
      if (!isCenteredPitch) {
        return {
          matched: false,
          feedback: metrics.pitch > 18 ? "Lower your chin slightly" : "Raise your chin slightly",
        };
      }
      return { matched: true, feedback: "Great! Look into the camera" };
    }
    case "turn_left": {
      // User turns their head slightly to their left
      const matched = metrics.yaw >= 7;
      return {
        matched,
        feedback: matched ? "Good angle! Hold steady." : "Turn your face slightly to the left",
      };
    }
    case "turn_right": {
      // User turns their head slightly to their right
      const matched = metrics.yaw <= -7;
      return {
        matched,
        feedback: matched ? "Good angle! Hold steady." : "Turn your face slightly to the right",
      };
    }
    case "chin_up": {
      const matched = metrics.pitch >= 6;
      return {
        matched,
        feedback: matched ? "Good elevation. Hold still." : "Tilt your chin slightly upward",
      };
    }
    case "chin_down": {
      const matched = metrics.pitch <= -6;
      return {
        matched,
        feedback: matched ? "Good angle. Hold steady." : "Lower your chin slightly",
      };
    }
    case "smile": {
      const matched = metrics.smileScore >= 0.3;
      return {
        matched,
        feedback: matched ? "Lovely smile! Capturing..." : "Give a gentle smile",
      };
    }
    default:
      return { matched: true, feedback: "Hold position" };
  }
}
