import type { FaceLandmarker as FaceLandmarkerType, NormalizedLandmark } from '@mediapipe/tasks-vision';
import { calculatePresentationScore, framingFromBox } from './analysisRules';
import { AnalysisError, type AnalysisResult } from './analysis.types';
import { calculateAppearanceImpressionScore, estimateExpression, estimateFaceShape, estimateFacialSymmetry, estimateFeatureBalance } from './appearanceAnalysis';
import { getQualityMetrics } from './imageQuality';

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
  const box = boxFromLandmarks(landmarks[0]);
  const quality = getQualityMetrics(image, image.naturalWidth, image.naturalHeight);
  const framingScore = framingFromBox(box);
  const faceShape = estimateFaceShape(landmarks[0], image.naturalWidth, image.naturalHeight);
  const facialSymmetryScore = estimateFacialSymmetry(landmarks[0], image.naturalWidth);
  const featureBalanceScore = estimateFeatureBalance(landmarks[0], image.naturalWidth, image.naturalHeight);
  const expression = estimateExpression(detection.faceBlendshapes[0]?.categories);
  const base: AnalysisResult = {
    faceDetected: true,
    faceCount: 1,
    faceBoundingBox: box,
    faceCenterX: box.x + box.width / 2,
    faceCenterY: box.y + box.height / 2,
    faceOccupancy: box.width * box.height,
    headYawEstimate: null,
    headPitchEstimate: null,
    brightnessScore: quality.brightnessScore,
    sharpnessScore: quality.sharpnessScore,
    framingScore,
    headPositionScore: null,
    photoPresentationScore: null,
    faceShape,
    facialSymmetryScore,
    featureBalanceScore,
    expressionScore: expression.score,
    expressionTone: expression.tone,
    appearanceImpressionScore: calculateAppearanceImpressionScore(facialSymmetryScore, featureBalanceScore, expression.score),
  };
  return { ...base, photoPresentationScore: calculatePresentationScore(base) };
}
