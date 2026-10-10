import { FilesetResolver, ObjectDetector } from "@mediapipe/tasks-vision";
import { DetectedBox } from "@/types";

let detectorInstance: ObjectDetector | null = null;
let isInitializing = false;
let initPromise: Promise<ObjectDetector | null> | null = null;
let lastVideoTimestamp = -1;

export function isDetectorReady(): boolean {
  return detectorInstance !== null;
}

/**
 * Initializes MediaPipe Tasks Vision ObjectDetector for full-body human/person detection.
 * Tries local static assets first, with CDN fallback.
 * Uses GPU delegate with CPU fallback.
 */
export async function initPersonDetector(): Promise<ObjectDetector | null> {
  if (detectorInstance) return detectorInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    isInitializing = true;
    try {
      // 1. Resolve Wasm fileset (local /wasm with CDN fallback)
      let vision;
      try {
        vision = await FilesetResolver.forVisionTasks("/wasm");
      } catch (localWasmErr) {
        console.warn("Local wasm load fallback to CDN:", localWasmErr);
        vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
      }

      // 2. Try loading ObjectDetector with GPU delegate
      try {
        const detector = await ObjectDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "/models/efficientdet_lite0.tflite",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          scoreThreshold: 0.22, // Low base threshold so we capture partial/walking figures
          categoryAllowlist: ["person"],
          maxResults: 6,
        });
        detectorInstance = detector;
        console.log("ObjectDetector (GPU) loaded successfully for person detection");
        return detector;
      } catch (gpuErr) {
        console.warn("GPU ObjectDetector failed, falling back to CPU / CDN...", gpuErr);

        // Fallback: CPU delegate with remote model path if needed
        const detector = await ObjectDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite",
            delegate: "CPU",
          },
          runningMode: "VIDEO",
          scoreThreshold: 0.22,
          categoryAllowlist: ["person"],
          maxResults: 6,
        });
        detectorInstance = detector;
        console.log("ObjectDetector (CPU) loaded successfully for person detection");
        return detector;
      }
    } catch (err) {
      console.error("Critical: Failed to initialize ObjectDetector:", err);
      return null;
    } finally {
      isInitializing = false;
    }
  })();

  return initPromise;
}

export interface PersonDetectionResult {
  personDetected: boolean;
  personCount: number;
  detections: DetectedBox[];
}

/**
 * Detects humans / persons in the video frame in real time.
 * Detects walking persons across the camera, people entering from edges,
 * profile views, and partially occluded bodies.
 */
export function detectPersons(
  video: HTMLVideoElement,
  timestamp: number,
  minConfidence = 0.30
): PersonDetectionResult {
  if (!detectorInstance) {
    return { personDetected: false, personCount: 0, detections: [] };
  }

  // Validate video element dimensions
  if (
    !video ||
    video.readyState < 2 ||
    video.paused ||
    video.videoWidth === 0 ||
    video.videoHeight === 0
  ) {
    return { personDetected: false, personCount: 0, detections: [] };
  }

  // Ensure monotonically increasing timestamp required by MediaPipe VIDEO mode
  let frameTimestamp = Math.floor(timestamp);
  if (frameTimestamp <= lastVideoTimestamp) {
    frameTimestamp = lastVideoTimestamp + 1;
  }
  lastVideoTimestamp = frameTimestamp;

  try {
    const results = detectorInstance.detectForVideo(video, frameTimestamp);
    if (!results || !results.detections || results.detections.length === 0) {
      return { personDetected: false, personCount: 0, detections: [] };
    }

    const videoW = video.videoWidth;
    const videoH = video.videoHeight;
    const validDetections: DetectedBox[] = [];

    for (const det of results.detections) {
      // Find person category
      const personCat = det.categories.find(
        (c) =>
          c.categoryName.toLowerCase() === "person" &&
          c.score >= minConfidence
      );

      if (personCat && det.boundingBox) {
        const bb = det.boundingBox;

        // Normalize coordinates to 0.0 - 1.0 range
        const normX = Math.max(0, Math.min(1, bb.originX / videoW));
        const normY = Math.max(0, Math.min(1, bb.originY / videoH));
        const normW = Math.max(0.01, Math.min(1 - normX, bb.width / videoW));
        const normH = Math.max(0.01, Math.min(1 - normY, bb.height / videoH));

        // Ignore tiny artifacts (< 2% of screen)
        if (normW >= 0.02 && normH >= 0.04) {
          validDetections.push({
            x: normX,
            y: normY,
            width: normW,
            height: normH,
            score: Math.round(personCat.score * 100),
          });
        }
      }
    }

    return {
      personDetected: validDetections.length > 0,
      personCount: validDetections.length,
      detections: validDetections,
    };
  } catch (err) {
    console.warn("Detection inference error:", err);
    return { personDetected: false, personCount: 0, detections: [] };
  }
}
