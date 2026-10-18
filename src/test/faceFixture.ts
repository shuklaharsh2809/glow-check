import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { AnalysisResult } from '../features/analysis/analysis.types';
import { calculateHarmonyScore, calculatePotentialScore } from '../features/analysis/appearanceAnalysis';
import { buildFaceFrame, buildOverlay, classifyFaceShape, measureMetrics, measureSymmetry, proportionScore } from '../features/analysis/faceGeometry';
import { CANONICAL_FACE } from './canonicalFace';

export const FIXTURE_SIZE = 1000;

/** Projects the canonical mesh into MediaPipe-style normalized landmarks, optionally rotated (degrees). */
export function canonicalLandmarks({ yaw = 0, pitch = 0, roll = 0, edit }: { yaw?: number; pitch?: number; roll?: number; edit?: (points: number[][]) => void } = {}): NormalizedLandmark[] {
  const points = CANONICAL_FACE.map((p) => [...p]);
  edit?.(points);
  const [cy, sy] = [Math.cos((yaw * Math.PI) / 180), Math.sin((yaw * Math.PI) / 180)];
  const [cp, sp] = [Math.cos((pitch * Math.PI) / 180), Math.sin((pitch * Math.PI) / 180)];
  const [cr, sr] = [Math.cos((roll * Math.PI) / 180), Math.sin((roll * Math.PI) / 180)];
  const unit = 0.025;
  return points.map(([x0, y0, z0]) => {
    const x1 = x0 * cy + z0 * sy, z1 = -x0 * sy + z0 * cy;
    const y2 = y0 * cp - z1 * sp, z2 = y0 * sp + z1 * cp;
    const x3 = x1 * cr - y2 * sr, y3 = x1 * sr + y2 * cr;
    // Image y grows downward and MediaPipe z is smaller toward the camera.
    return { x: 0.5 + x3 * unit, y: 0.45 - y3 * unit, z: -z2 * unit, visibility: 1 };
  });
}

/** Builds a full analysis result from landmarks using the real geometry and scoring pipeline. */
export function resultFromLandmarks(landmarks: NormalizedLandmark[], overrides: Partial<AnalysisResult> = {}): AnalysisResult {
  const frame = buildFaceFrame(landmarks, FIXTURE_SIZE, FIXTURE_SIZE)!;
  const metrics = measureMetrics(frame);
  const symmetry = measureSymmetry(frame);
  const skin = overrides.skin === undefined ? { clarity: 84, evenness: 86, underEye: 90, score: 86 } : overrides.skin;
  const expression = overrides.expressionScore ?? 85;
  const inputs = { metrics: overrides.metrics ?? metrics, symmetry: overrides.symmetryScore ?? symmetry, skin, expression };
  return {
    faceDetected: true, faceCount: 1, faceBoundingBox: { x: 0.3, y: 0.2, width: 0.4, height: 0.5 },
    brightnessScore: 55, sharpnessScore: 75, framingScore: 85, photoPresentationScore: 80,
    headPose: frame.pose, faceShape: classifyFaceShape(frame), metrics, mouthMeasured: true,
    proportionScore: proportionScore(metrics), symmetryScore: symmetry, skin,
    expressionScore: expression, expressionTone: 'soft',
    harmonyScore: calculateHarmonyScore(inputs), potentialScore: calculatePotentialScore(inputs),
    overlay: buildOverlay(landmarks, FIXTURE_SIZE, FIXTURE_SIZE),
    ...overrides,
  };
}

/** Scales the x-coordinate of the given canonical vertices to widen or narrow a feature. */
export const widen = (indices: number[], factor: number) => (points: number[][]) => { for (const i of indices) points[i][0] *= factor; };
