import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { LandmarkPoint } from "@/types";

let faceLandmarkerInstance: FaceLandmarker | null = null;
let isInitializing = false;
let initPromise: Promise<FaceLandmarker | null> | null = null;

export async function initFaceLandmarker(): Promise<FaceLandmarker | null> {
  if (faceLandmarkerInstance) return faceLandmarkerInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      isInitializing = true;
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );

      const landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numFaces: 5, // Detect up to 5 faces for multi-person and visitor tracking
        minFaceDetectionConfidence: 0.25,
        minFacePresenceConfidence: 0.25,
        minTrackingConfidence: 0.25,
        outputFaceBlendshapes: true,
      });

      faceLandmarkerInstance = landmarker;
      return landmarker;
    } catch (err) {
      console.warn("MediaPipe GPU initialization failed, attempting CPU fallback...", err);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "CPU",
          },
          runningMode: "VIDEO",
          numFaces: 5,
          minFaceDetectionConfidence: 0.25,
          minFacePresenceConfidence: 0.25,
          minTrackingConfidence: 0.25,
          outputFaceBlendshapes: true,
        });
        faceLandmarkerInstance = landmarker;
        return landmarker;
      } catch (cpuErr) {
        console.error("MediaPipe initialization failed entirely. Operating in fallback mode.", cpuErr);
        return null;
      }
    } finally {
      isInitializing = false;
    }
  })();

  return initPromise;
}

export function detectFaceLandmarks(
  video: HTMLVideoElement,
  timestamp: number
): {
  faces: LandmarkPoint[][];
  blendshapes?: unknown[];
} {
  if (!faceLandmarkerInstance) {
    return { faces: [] };
  }

  try {
    const results = faceLandmarkerInstance.detectForVideo(video, timestamp);
    if (!results || !results.faceLandmarks || results.faceLandmarks.length === 0) {
      return { faces: [] };
    }

    const faces: LandmarkPoint[][] = results.faceLandmarks.map((face) =>
      face.map((pt) => ({
        x: pt.x,
        y: pt.y,
        z: pt.z,
      }))
    );

    return {
      faces,
      blendshapes: results.faceBlendshapes,
    };
  } catch (err) {
    // If frames come too fast or video isn't ready
    return { faces: [] };
  }
}

// Canonical facial wireframe connections for drawing futuristic 3D mesh
export const FACE_OVAL_INDICES = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378,
  400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21,
  54, 103, 67, 109, 10
];

export const LIPS_OUTER_INDICES = [
  61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 61
];

export const LEFT_EYE_INDICES = [
  33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246, 33
];

export const RIGHT_EYE_INDICES = [
  362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398, 362
];

export const NOSE_RIDGE_INDICES = [
  168, 6, 197, 195, 5, 4, 1, 19, 94, 2
];

export const KEY_3D_FEATURE_POINTS = [
  1, 152, 10, 33, 263, 61, 291, 199, 234, 454, 468, 473
];
