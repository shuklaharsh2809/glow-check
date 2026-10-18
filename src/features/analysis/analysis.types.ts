export interface Point { x: number; y: number; z?: number }

export interface FaceBox { x: number; y: number; width: number; height: number }
export type FaceShape = 'oval' | 'round' | 'square' | 'heart' | 'oblong' | 'diamond';
export type ExpressionTone = 'warm' | 'soft' | 'neutral';

export type MetricId =
  | 'canthalTilt'
  | 'eyeSpacing'
  | 'facialThirds'
  | 'midfaceRatio'
  | 'jawDefinition'
  | 'noseWidth'
  | 'mouthWidth'
  | 'lipRatio'
  | 'chinBalance';

export type MetricVerdict = 'ideal' | 'close' | 'distinct';

export interface FaceMetric {
  id: MetricId;
  label: string;
  description: string;
  value: number;
  display: string;
  idealLow: number;
  idealHigh: number;
  scaleMin: number;
  scaleMax: number;
  score: number;
  verdict: MetricVerdict;
  /** Which side of the ideal range the value falls on, or null when inside it. */
  direction: 'low' | 'high' | null;
  verdictLabel: string;
  improvable: boolean;
}

export interface SkinMetrics {
  clarity: number;
  evenness: number;
  underEye: number;
  score: number;
}

export interface HeadPose { yaw: number; pitch: number; roll: number }

export interface PortraitOverlay {
  imageWidth: number;
  imageHeight: number;
  lines: Array<[Point, Point]>;
  points: Point[];
}

export interface AnalysisResult {
  faceDetected: boolean;
  faceCount: number;
  faceBoundingBox: FaceBox | null;
  brightnessScore: number | null;
  sharpnessScore: number | null;
  framingScore: number | null;
  photoPresentationScore: number | null;
  headPose: HeadPose | null;
  faceShape: FaceShape | null;
  metrics: FaceMetric[];
  /** False when an open mouth or big smile made lip and chin proportions unreliable. */
  mouthMeasured: boolean;
  proportionScore: number | null;
  symmetryScore: number | null;
  skin: SkinMetrics | null;
  expressionScore: number | null;
  expressionTone: ExpressionTone | null;
  harmonyScore: number | null;
  potentialScore: number | null;
  overlay: PortraitOverlay | null;
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
