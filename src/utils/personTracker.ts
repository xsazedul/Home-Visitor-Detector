import { DetectedBox } from "@/types";

export interface TrackedPerson {
  id: string;
  box: DetectedBox;
  centroid: { x: number; y: number };
  firstSeen: number;
  lastSeen: number;
  detectionsCount: number;
  hasTriggeredEvent: boolean;
  lostFrames: number;
}

export interface TrackerUpdateResult {
  activeTracks: TrackedPerson[];
  newVisitors: TrackedPerson[];
  isNewPersonDetected: boolean;
  totalCount: number;
}

function computeIoU(boxA: DetectedBox, boxB: DetectedBox): number {
  const xA = Math.max(boxA.x, boxB.x);
  const yA = Math.max(boxA.y, boxB.y);
  const xB = Math.min(boxA.x + boxA.width, boxB.x + boxB.width);
  const yB = Math.min(boxA.y + boxA.height, boxB.y + boxB.height);

  const interWidth = Math.max(0, xB - xA);
  const interHeight = Math.max(0, yB - yA);
  const interArea = interWidth * interHeight;

  const areaA = boxA.width * boxA.height;
  const areaB = boxB.width * boxB.height;
  const unionArea = areaA + areaB - interArea;

  return unionArea > 0 ? interArea / unionArea : 0;
}

function computeCentroidDistance(
  cA: { x: number; y: number },
  cB: { x: number; y: number }
): number {
  const dx = cA.x - cB.x;
  const dy = cA.y - cB.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export class PersonTracker {
  private tracks: Map<string, TrackedPerson> = new Map();
  private nextTrackId = 1;

  public reset(): void {
    this.tracks.clear();
    this.nextTrackId = 1;
  }

  public getActiveCount(): number {
    return this.tracks.size;
  }

  public getActiveTracks(): TrackedPerson[] {
    return Array.from(this.tracks.values());
  }

  /**
   * Update tracks given new bounding boxes from person detector.
   * Handles:
   * - Walking across camera (left to right / right to left)
   * - Entering from edges
   * - Partial occlusions
   * - Re-entry after absence period
   */
  public update(
    rawDetections: DetectedBox[],
    timestamp: number,
    absenceTimeoutMs: number = 2000
  ): TrackerUpdateResult {
    const existingTracks = Array.from(this.tracks.values());
    const matchedTrackIds = new Set<string>();
    const matchedDetectionIndices = new Set<number>();
    const newVisitors: TrackedPerson[] = [];

    // Pairwise scoring matrix between existing tracks and incoming detections
    interface MatchCandidate {
      trackId: string;
      detectionIndex: number;
      iou: number;
      centroidDist: number;
      score: number;
    }

    const candidates: MatchCandidate[] = [];

    for (let dIdx = 0; dIdx < rawDetections.length; dIdx++) {
      const det = rawDetections[dIdx];
      const detCentroid = {
        x: det.x + det.width / 2,
        y: det.y + det.height / 2,
      };

      for (const track of existingTracks) {
        const iou = computeIoU(track.box, det);
        const dist = computeCentroidDistance(track.centroid, detCentroid);

        // A valid match has either bounding box overlap (IoU >= 0.12)
        // OR close centroid distance (dist <= 0.30) to handle fast lateral walking strides
        if (iou >= 0.12 || dist <= 0.30) {
          // Combined affinity score (higher is better)
          const score = iou * 2.0 + Math.max(0, 0.40 - dist);
          candidates.push({
            trackId: track.id,
            detectionIndex: dIdx,
            iou,
            centroidDist: dist,
            score,
          });
        }
      }
    }

    // Sort by best score descending for greedy matching
    candidates.sort((a, b) => b.score - a.score);

    for (const match of candidates) {
      if (
        matchedTrackIds.has(match.trackId) ||
        matchedDetectionIndices.has(match.detectionIndex)
      ) {
        continue;
      }

      // Found valid match!
      matchedTrackIds.add(match.trackId);
      matchedDetectionIndices.add(match.detectionIndex);

      const det = rawDetections[match.detectionIndex];
      const track = this.tracks.get(match.trackId)!;

      // Smooth position update
      track.box = {
        ...det,
        trackId: track.id,
      };
      track.centroid = {
        x: det.x + det.width / 2,
        y: det.y + det.height / 2,
      };
      track.lastSeen = timestamp;
      track.detectionsCount++;
      track.lostFrames = 0;
    }

    // Unmatched detections represent NEW people entering the camera view
    for (let dIdx = 0; dIdx < rawDetections.length; dIdx++) {
      if (!matchedDetectionIndices.has(dIdx)) {
        const det = rawDetections[dIdx];
        const trackId = `visitor_${this.nextTrackId++}`;
        const detCentroid = {
          x: det.x + det.width / 2,
          y: det.y + det.height / 2,
        };

        const newTrack: TrackedPerson = {
          id: trackId,
          box: {
            ...det,
            trackId,
          },
          centroid: detCentroid,
          firstSeen: timestamp,
          lastSeen: timestamp,
          detectionsCount: 1,
          hasTriggeredEvent: true, // Trigger once upon initial appearance
          lostFrames: 0,
        };

        this.tracks.set(trackId, newTrack);
        newVisitors.push(newTrack);
      }
    }

    // Age existing tracks that had no match in this frame
    for (const track of existingTracks) {
      if (!matchedTrackIds.has(track.id)) {
        track.lostFrames++;
        const elapsedSinceLastSeen = timestamp - track.lastSeen;

        // If person has been absent longer than configurable absence period, delete track
        if (elapsedSinceLastSeen > absenceTimeoutMs) {
          this.tracks.delete(track.id);
        }
      }
    }

    const currentActiveTracks = Array.from(this.tracks.values());

    return {
      activeTracks: currentActiveTracks,
      newVisitors,
      isNewPersonDetected: newVisitors.length > 0,
      totalCount: currentActiveTracks.length,
    };
  }
}

export const personTracker = new PersonTracker();
