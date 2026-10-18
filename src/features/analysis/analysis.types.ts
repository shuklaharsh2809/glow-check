export interface Point { x: number; y: number; z?: number }

export interface FaceBox { x: number; y: number; width: number; height: number }

export interface AnalysisResult {
  faceDetected: boolean;
  faceCount: number;
  faceBoundingBox: FaceBox | null;
  faceCenterX: number | null;
  faceCenterY: number | null;
  faceOccupancy: number | null;
  headYawEstimate: number | null;
  headPitchEstimate: number | null;
  brightnessScore: number | null;
  sharpnessScore: number | null;
  framingScore: number | null;
  headPositionScore: number | null;
  photoPresentationScore: number | null;
}

export type AnalysisErrorCode =
  | 'no-face'
  | 'multiple-faces'
  | 'model-load'
  | 'unsupported-image'
  | 'low-quality'
  | 'unsupported-browser'
  | 'analysis-failed';

export class AnalysisError extends Error {
  constructor(public code: AnalysisErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'AnalysisError';
  }
}
