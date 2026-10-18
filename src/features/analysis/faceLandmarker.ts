import type { FaceLandmarker as FaceLandmarkerType, NormalizedLandmark } from '@mediapipe/tasks-vision';
import { calculatePresentationScore, framingFromBox } from './analysisRules';
import { AnalysisError, type AnalysisResult } from './analysis.types';
import { calculateHarmonyScore, calculatePotentialScore, estimateExpression, readBlendshapes } from './appearanceAnalysis';
import { buildFaceFrame, buildOverlay, classifyFaceShape, measureMetrics, measureSymmetry, proportionScore } from './faceGeometry';
import { getQualityMetrics } from './imageQuality';
import { getSkinMetrics } from './skinAnalysis';

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm';
const DEFAULT_MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
let landmarkerPromise: Promise<FaceLandmarkerType> | null = null;

async function getLandmarker() {
  if (!('WebAssembly' in window)) throw new AnalysisError('unsupported-browser', 'This browser cannot run the local face model.');
  if (!landmarkerPromise) {
    landmarkerPromise = import('@mediapipe/tasks-vision').then(async ({ FaceLandmarker, FilesetResolver }) => {
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_URL);
        return await FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: import.meta.env.VITE_MEDIAPIPE_MODEL_URL || DEFAULT_MODEL, delegate: 'CPU' },
          runningMode: 'IMAGE',
          numFaces: 2,
          minFaceDetectionConfidence: 0.55,
          minFacePresenceConfidence: 0.55,
          outputFaceBlendshapes: true,
        });
      } catch (cause) {
        landmarkerPromise = null;
        throw new AnalysisError('model-load', 'The local analysis model could not be loaded. Check your connection and try again.', { cause });
      }
    });
  }
  return landmarkerPromise;
}

function boxFromLandmarks(points: NormalizedLandmark[]) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.max(0, Math.min(...xs));
  const minY = Math.max(0, Math.min(...ys));
  const maxX = Math.min(1, Math.max(...xs));
  const maxY = Math.min(1, Math.max(...ys));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export async function analyzeImage(image: HTMLImageElement): Promise<AnalysisResult> {
  const model = await getLandmarker();
  let detection: ReturnType<FaceLandmarkerType['detect']>;
  try { detection = model.detect(image); }
  catch (cause) { throw new AnalysisError('analysis-failed', 'The image could not be analyzed. Try another photo.', { cause }); }
  const landmarks = detection.faceLandmarks;
  if (!landmarks.length) throw new AnalysisError('no-face', 'No clear face was found. Try a front-facing photo with even light.');
  if (landmarks.length > 1) throw new AnalysisError('multiple-faces', 'More than one face was found. Choose a photo with one clearly visible person.');
  const face = landmarks[0];
  const { naturalWidth: width, naturalHeight: height } = image;
  const frame = buildFaceFrame(face, width, height);
  if (!frame) throw new AnalysisError('analysis-failed', 'The face could not be measured. Try another photo.');
  if (Math.abs(frame.pose.yaw) > 22 || Math.abs(frame.pose.pitch) > 25) throw new AnalysisError('low-quality', 'Your head is turned too far for accurate measurements. Face the camera straight on and retake.');
  const shapes = readBlendshapes(detection.faceBlendshapes[0]?.categories);
  if (shapes && shapes.blink > 0.55) throw new AnalysisError('low-quality', 'Your eyes look closed. Retake the portrait with your eyes open.');
  const box = boxFromLandmarks(face);
  const quality = getQualityMetrics(image, width, height);
  const metrics = measureMetrics(frame, { open: (shapes?.jawOpen ?? 0) > 0.25, smiling: (shapes?.smile ?? 0) > 0.45 });
  const symmetryScore = measureSymmetry(frame);
  const usableLight = quality.brightnessScore === null || (quality.brightnessScore >= 18 && quality.brightnessScore <= 92);
  const skin = usableLight ? getSkinMetrics(image, face, width, height) : null;
  const expression = estimateExpression(shapes);
  const scoreInputs = { metrics, symmetry: symmetryScore, skin, expression: expression.score };
  const framingScore = framingFromBox(box);
  return {
    faceDetected: true,
    faceCount: 1,
    faceBoundingBox: box,
    brightnessScore: quality.brightnessScore,
    sharpnessScore: quality.sharpnessScore,
    framingScore,
    photoPresentationScore: calculatePresentationScore({ framingScore, brightnessScore: quality.brightnessScore, sharpnessScore: quality.sharpnessScore, headPositionScore: null }),
    headPose: frame.pose,
    faceShape: classifyFaceShape(frame),
    metrics,
    mouthMeasured: metrics.some((m) => m.id === 'lipRatio'),
    proportionScore: proportionScore(metrics),
    symmetryScore,
    skin,
    expressionScore: expression.score,
    expressionTone: expression.tone,
    harmonyScore: calculateHarmonyScore(scoreInputs),
    potentialScore: calculatePotentialScore(scoreInputs),
    overlay: buildOverlay(face, width, height),
  };
}
