import type { Category, NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { ExpressionTone, FaceShape } from './analysis.types';

const clamp = (value: number) => Math.round(Math.max(0, Math.min(100, value)));
const distance = (a: NormalizedLandmark, b: NormalizedLandmark, width: number, height: number) =>
  Math.hypot((a.x - b.x) * width, (a.y - b.y) * height);

function rangeScore(value: number, low: number, high: number) {
  if (value >= low && value <= high) return 100;
  const distanceFromRange = value < low ? low - value : value - high;
  return clamp(100 - distanceFromRange * 500);
}

export function estimateFaceShape(points: NormalizedLandmark[], width: number, height: number): FaceShape | null {
  if (points.length < 455) return null;
  const faceHeight = distance(points[10], points[152], width, height);
  const cheekWidth = distance(points[234], points[454], width, height);
  const jawWidth = distance(points[172], points[397], width, height);
  if (!faceHeight || !cheekWidth) return null;
  const aspect = faceHeight / cheekWidth;
  const jawRatio = jawWidth / cheekWidth;
  if (aspect > 1.48) return 'long';
  if (aspect < 1.18 && jawRatio < 0.88) return 'round';
  if (jawRatio >= 0.88) return 'angular';
  return 'oval';
}

export function estimateFacialSymmetry(points: NormalizedLandmark[], width: number): number | null {
  if (points.length < 455) return null;
  const faceWidth = Math.abs(points[454].x - points[234].x) * width;
  if (!faceWidth) return null;
  const eyeMid = ((points[33].x + points[263].x) / 2) * width;
  const noseAxis = ((points[1].x + points[4].x + points[168].x) / 3) * width;
  // A turned face makes 2D symmetry misleading, so omit the measurement.
  if (Math.abs(eyeMid - noseAxis) / faceWidth > 0.075) return null;
  const pairs: Array<[number, number]> = [[33,263],[133,362],[61,291],[70,300],[105,334],[172,397],[234,454]];
  const difference = pairs.reduce((sum, [left, right]) => {
    const leftDistance = Math.abs(points[left].x * width - noseAxis);
    const rightDistance = Math.abs(points[right].x * width - noseAxis);
    return sum + Math.abs(leftDistance - rightDistance) / faceWidth;
  }, 0) / pairs.length;
  return clamp(100 - difference * 650);
}

export function estimateFeatureBalance(points: NormalizedLandmark[], width: number, height: number): number | null {
  if (points.length < 455) return null;
  const faceWidth = distance(points[234], points[454], width, height);
  if (!faceWidth) return null;
  const eyeSpan = distance(points[33], points[263], width, height) / faceWidth;
  const mouthSpan = distance(points[61], points[291], width, height) / faceWidth;
  const noseSpan = distance(points[129], points[358], width, height) / faceWidth;
  // Broad ranges avoid treating one narrow proportion as an appearance ideal.
  return clamp((rangeScore(eyeSpan, 0.46, 0.66) + rangeScore(mouthSpan, 0.28, 0.48) + rangeScore(noseSpan, 0.16, 0.32)) / 3);
}

export function estimateExpression(categories: Category[] | undefined): { score: number | null; tone: ExpressionTone | null } {
  if (!categories?.length) return { score: null, tone: null };
  const values = new Map(categories.map((category) => [category.categoryName, category.score]));
  const smile = ((values.get('mouthSmileLeft') ?? 0) + (values.get('mouthSmileRight') ?? 0)) / 2;
  const mouthPress = ((values.get('mouthPressLeft') ?? 0) + (values.get('mouthPressRight') ?? 0)) / 2;
  const score = clamp(58 + smile * 42 - mouthPress * 18);
  return { score, tone: smile > 0.42 ? 'warm' : smile > 0.12 ? 'soft' : 'neutral' };
}

export function calculateAppearanceImpressionScore(symmetry: number | null, balance: number | null, expression: number | null) {
  if (symmetry === null || balance === null) return null;
  const expressionValue = expression ?? 60;
  return clamp(symmetry * 0.42 + balance * 0.43 + expressionValue * 0.15);
}
