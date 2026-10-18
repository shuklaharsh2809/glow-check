import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { FaceMetric, FaceShape, HeadPose, MetricId, Point, PortraitOverlay } from './analysis.types';

interface Vec3 { x: number; y: number; z: number }

const sub = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const scale = (a: Vec3, s: number): Vec3 => ({ x: a.x * s, y: a.y * s, z: a.z * s });
const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;
const cross = (a: Vec3, b: Vec3): Vec3 => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x });
const normalize = (a: Vec3) => scale(a, 1 / (Math.hypot(a.x, a.y, a.z) || 1));
const centroid = (points: Vec3[]): Vec3 => scale(points.reduce((sum, p) => ({ x: sum.x + p.x, y: sum.y + p.y, z: sum.z + p.z }), { x: 0, y: 0, z: 0 }), 1 / points.length);
const degrees = (radians: number) => (radians * 180) / Math.PI;
const clamp = (value: number, low = 0, high = 100) => Math.round(Math.max(low, Math.min(high, value)));

// Eye-contour centroids are used instead of iris centres so gaze direction cannot rotate the frame.
const RIGHT_EYE = [33, 133, 159, 145];
const LEFT_EYE = [263, 362, 386, 374];
const MIDLINE = [10, 151, 9, 8, 168, 6, 197, 195, 5, 4, 1, 2, 164, 0, 17, 18, 200, 199, 175, 152];
const SYMMETRY_PAIRS: Array<[number, number]> = [[33, 263], [133, 362], [159, 386], [145, 374], [70, 300], [105, 334], [107, 336], [129, 358], [61, 291], [234, 454], [172, 397], [58, 288], [136, 365], [50, 280], [93, 323]];
// The vector from chin to mesh top leans back slightly even on a level head; this is its offset in the canonical mesh.
const PITCH_BASELINE = -0.7;

export interface FaceFrame {
  /** Landmarks rotated into a frontal, roll-free frame: x across the eyes, y down the face, in pixels. */
  points: Vec3[];
  pose: HeadPose;
  ipd: number;
}

export function buildFaceFrame(landmarks: NormalizedLandmark[], width: number, height: number): FaceFrame | null {
  if (landmarks.length < 468 || !width || !height) return null;
  const raw = landmarks.map((p) => ({ x: p.x * width, y: p.y * height, z: (p.z ?? 0) * width }));
  const rightEye = centroid(RIGHT_EYE.map((i) => raw[i]));
  const leftEye = centroid(LEFT_EYE.map((i) => raw[i]));
  const origin = scale({ x: rightEye.x + leftEye.x, y: rightEye.y + leftEye.y, z: rightEye.z + leftEye.z }, 0.5);
  const across = normalize(sub(leftEye, rightEye));
  const upRaw = sub(raw[10], raw[152]);
  const up = normalize(sub(upRaw, scale(across, dot(upRaw, across))));
  const depth = cross(across, up);
  const points = raw.map((p) => {
    const d = sub(p, origin);
    return { x: dot(d, across), y: -dot(d, up), z: dot(d, depth) };
  });
  const ipd = Math.hypot(leftEye.x - rightEye.x, leftEye.y - rightEye.y, leftEye.z - rightEye.z);
  if (!ipd) return null;
  const pose: HeadPose = {
    yaw: degrees(Math.asin(Math.max(-1, Math.min(1, across.z)))),
    pitch: degrees(Math.asin(Math.max(-1, Math.min(1, up.z)))) - PITCH_BASELINE,
    roll: degrees(Math.atan2(across.y, Math.abs(across.x))),
  };
  return { points, pose, ipd };
}

const dist = (p: Vec3[], a: number, b: number) => Math.hypot(p[a].x - p[b].x, p[a].y - p[b].y);

interface MetricDefinition {
  label: string;
  description: string;
  ideal: [number, number];
  tolerance: number;
  scale: [number, number];
  weight: number;
  improvable: boolean;
  labels: { ideal: string; low: string; high: string };
  format: (value: number) => string;
}

// Vertical and jaw ranges are calibrated on MediaPipe's canonical (population-average) mesh. Eye and nose ranges
// follow anthropometric norms instead, because the canonical template's eye corners sit unusually far apart
// compared with the model's predictions on real faces.
export const METRIC_DEFINITIONS: Record<MetricId, MetricDefinition> = {
  canthalTilt: { label: 'Canthal tilt', description: 'Angle from inner to outer eye corner', ideal: [3, 9], tolerance: 4, scale: [-6, 12], weight: 1.2, improvable: false, labels: { ideal: 'Positive tilt', low: 'Neutral tilt', high: 'Sharp upward tilt' }, format: (v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}°` },
  eyeSpacing: { label: 'Eye spacing', description: 'Gap between eyes ÷ eye width', ideal: [0.95, 1.2], tolerance: 0.15, scale: [0.7, 1.6], weight: 1, improvable: false, labels: { ideal: 'Balanced spacing', low: 'Close-set', high: 'Wide-set' }, format: (v) => `${v.toFixed(2)}×` },
  facialThirds: { label: 'Facial thirds', description: 'Mid-face height : lower-face height', ideal: [0.88, 1.08], tolerance: 0.15, scale: [0.7, 1.3], weight: 1, improvable: false, labels: { ideal: 'Balanced thirds', low: 'Longer lower face', high: 'Longer midface' }, format: (v) => `1 : ${(1 / v).toFixed(2)}` },
  midfaceRatio: { label: 'Midface ratio', description: 'Eye spacing ÷ eye-to-lip height', ideal: [0.98, 1.18], tolerance: 0.12, scale: [0.8, 1.3], weight: 1, improvable: false, labels: { ideal: 'Compact midface', low: 'Longer midface', high: 'Short midface' }, format: (v) => v.toFixed(2) },
  jawDefinition: { label: 'Jawline definition', description: 'Cheekbone width ÷ jaw width', ideal: [1.22, 1.6], tolerance: 0.12, scale: [1.05, 1.7], weight: 1.2, improvable: true, labels: { ideal: 'Defined jawline', low: 'Soft jawline', high: 'Sharply tapered' }, format: (v) => v.toFixed(2) },
  noseWidth: { label: 'Nose width', description: 'Nose width ÷ gap between eyes', ideal: [0.88, 1.12], tolerance: 0.15, scale: [0.6, 1.4], weight: 0.8, improvable: false, labels: { ideal: 'Harmonious', low: 'Narrow', high: 'Wider' }, format: (v) => `${v.toFixed(2)}×` },
  mouthWidth: { label: 'Mouth width', description: 'Mouth width ÷ nose width', ideal: [1.4, 1.75], tolerance: 0.25, scale: [1, 2.2], weight: 0.7, improvable: false, labels: { ideal: 'Balanced', low: 'Compact mouth', high: 'Wide smile' }, format: (v) => `${v.toFixed(2)}×` },
  lipRatio: { label: 'Lip ratio', description: 'Upper lip : lower lip height', ideal: [1.25, 1.9], tolerance: 0.4, scale: [0.6, 2.6], weight: 0.7, improvable: true, labels: { ideal: 'Balanced lips', low: 'Fuller upper lip', high: 'Thinner upper lip' }, format: (v) => `1 : ${v.toFixed(2)}` },
  chinBalance: { label: 'Chin balance', description: 'Nose-to-lips : lips-to-chin', ideal: [0.4, 0.56], tolerance: 0.12, scale: [0.25, 0.75], weight: 0.9, improvable: false, labels: { ideal: 'Balanced chin', low: 'Longer chin', high: 'Shorter chin' }, format: (v) => `1 : ${(1 / v).toFixed(2)}` },
};

export function scoreAgainstRange(value: number, low: number, high: number, tolerance: number) {
  if (value >= low && value <= high) return 100;
  const offset = value < low ? low - value : value - high;
  return clamp(100 - 45 * Math.pow(offset / tolerance, 1.15), 25);
}

function toMetric(id: MetricId, value: number): FaceMetric {
  const def = METRIC_DEFINITIONS[id];
  const [low, high] = def.ideal;
  const score = scoreAgainstRange(value, low, high, def.tolerance);
  const direction = value < low ? 'low' : value > high ? 'high' : null;
  return {
    id, value, score, direction,
    label: def.label,
    description: def.description,
    display: def.format(value),
    idealLow: low,
    idealHigh: high,
    scaleMin: def.scale[0],
    scaleMax: def.scale[1],
    verdict: direction === null ? 'ideal' : score >= 72 ? 'close' : 'distinct',
    verdictLabel: def.labels[direction ?? 'ideal'],
    improvable: def.improvable,
  };
}

export interface MouthState { open: boolean; smiling: boolean }

export function measureMetrics(frame: FaceFrame, mouth: MouthState = { open: false, smiling: false }): FaceMetric[] {
  const p = frame.points;
  const metrics: FaceMetric[] = [];
  const add = (id: MetricId, value: number) => { if (Number.isFinite(value) && value > -90 && value < 90) metrics.push(toMetric(id, value)); };
  const tilt = (outer: number, inner: number) => degrees(Math.atan2(p[inner].y - p[outer].y, Math.abs(p[inner].x - p[outer].x)));
  const eyeWidth = (dist(p, 33, 133) + dist(p, 263, 362)) / 2;
  const innerGap = dist(p, 133, 362);
  // 98/327 sit on the outer alar rims; checked against real portraits, wider mesh pairs overshoot onto the cheek.
  const noseWidth = dist(p, 98, 327);
  const stomion = (p[13].y + p[14].y) / 2;
  const lipGap = Math.abs(p[14].y - p[13].y);
  const mouthOpen = mouth.open || lipGap > frame.ipd * 0.15;

  add('canthalTilt', (tilt(33, 133) + tilt(263, 362)) / 2);
  add('eyeSpacing', innerGap / eyeWidth);
  add('facialThirds', Math.abs(p[2].y - p[9].y) / Math.abs(p[152].y - p[2].y));
  add('midfaceRatio', frame.ipd / Math.abs(p[0].y));
  add('jawDefinition', dist(p, 234, 454) / dist(p, 172, 397));
  add('noseWidth', noseWidth / innerGap);
  if (!mouth.smiling) add('mouthWidth', dist(p, 61, 291) / noseWidth);
  if (!mouthOpen && !mouth.smiling) add('lipRatio', Math.abs(p[17].y - p[14].y) / Math.abs(p[13].y - p[0].y));
  if (!mouthOpen) add('chinBalance', (stomion - p[2].y) / (p[152].y - stomion));
  return metrics;
}

export function proportionScore(metrics: FaceMetric[]): number | null {
  if (metrics.length < 4) return null;
  const weight = metrics.reduce((sum, m) => sum + METRIC_DEFINITIONS[m.id].weight, 0);
  return clamp(metrics.reduce((sum, m) => sum + m.score * METRIC_DEFINITIONS[m.id].weight, 0) / weight);
}

export function classifyFaceShape(frame: FaceFrame): FaceShape {
  const p = frame.points;
  const width = dist(p, 234, 454);
  const length = Math.abs(p[152].y - p[10].y) / width;
  const forehead = dist(p, 54, 284) / width;
  const jaw = dist(p, 172, 397) / width;
  // The mesh stops below the hairline, so an average oval face measures about 1.15 here.
  if (length >= 1.3) return 'oblong';
  if (jaw >= 0.84) return 'square';
  if (length <= 1.07) return 'round';
  if (forehead >= jaw + 0.1 && forehead >= 0.82) return 'heart';
  if (forehead <= 0.77 && jaw <= 0.74) return 'diamond';
  return 'oval';
}

export function measureSymmetry(frame: FaceFrame): number | null {
  const p = frame.points;
  const mid = MIDLINE.map((i) => p[i]);
  const meanY = mid.reduce((s, q) => s + q.y, 0) / mid.length;
  const meanX = mid.reduce((s, q) => s + q.x, 0) / mid.length;
  const varY = mid.reduce((s, q) => s + (q.y - meanY) ** 2, 0);
  if (!varY) return null;
  // Fit the facial midline as x = slope * y + intercept, then mirror each right-side point across it.
  const slope = mid.reduce((s, q) => s + (q.y - meanY) * (q.x - meanX), 0) / varY;
  const intercept = meanX - slope * meanY;
  const length = Math.hypot(slope, 1);
  const dir = { x: slope / length, y: 1 / length };
  const mirror = (q: Vec3) => {
    const rel = { x: q.x - intercept, y: q.y };
    const along = rel.x * dir.x + rel.y * dir.y;
    return { x: 2 * along * dir.x - rel.x + intercept, y: 2 * along * dir.y - rel.y };
  };
  const error = SYMMETRY_PAIRS.reduce((sum, [right, left]) => {
    const m = mirror(p[right]);
    return sum + Math.hypot(m.x - p[left].x, m.y - p[left].y) / frame.ipd;
  }, 0) / SYMMETRY_PAIRS.length;
  return clamp(100 - error * 400, 30);
}

const OVERLAY_POINTS = [33, 133, 362, 263, 9, 1, 2, 152, 61, 291, 172, 397, 234, 454];

export function buildOverlay(landmarks: NormalizedLandmark[], width: number, height: number): PortraitOverlay | null {
  if (landmarks.length < 468) return null;
  const at = (i: number): Point => ({ x: landmarks[i].x, y: landmarks[i].y });
  const rightEye = centroid(RIGHT_EYE.map((i) => ({ ...at(i), z: 0 })));
  const leftEye = centroid(LEFT_EYE.map((i) => ({ ...at(i), z: 0 })));
  // Horizontal guide ticks follow the eye line so they stay aligned on a tilted head.
  const ax = (leftEye.x - rightEye.x) * width;
  const ay = (leftEye.y - rightEye.y) * height;
  const len = Math.hypot(ax, ay) || 1;
  const half = (landmarks[454].x - landmarks[234].x) * 0.5;
  const tick = (i: number): [Point, Point] => {
    const c = at(i);
    const dx = (ax / len) * Math.abs(half);
    const dy = ((ay / len) * Math.abs(half) * width) / height;
    return [{ x: c.x - dx, y: c.y - dy }, { x: c.x + dx, y: c.y + dy }];
  };
  return {
    imageWidth: width,
    imageHeight: height,
    lines: [[at(10), at(152)], tick(9), tick(2), tick(152), [at(33), at(263)], [at(234), at(454)], [at(172), at(397)]],
    points: OVERLAY_POINTS.map(at),
  };
}
