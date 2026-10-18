import type { AnalysisResult, FaceBox } from './analysis.types';

const valid = (n: number | null): n is number => n !== null && Number.isFinite(n) && n >= 0 && n <= 100;
const clamp = (n: number) => Math.round(Math.max(0, Math.min(100, n)));

export function framingFromBox(box: FaceBox): number {
  const occupancy = box.width * box.height;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const sizeScore = occupancy < 0.08 ? occupancy / 0.08 : occupancy > 0.48 ? (0.72 - occupancy) / 0.24 : 1;
  const offset = Math.hypot((cx - 0.5) / 0.42, (cy - 0.46) / 0.46);
  return clamp(Math.max(0, sizeScore) * 70 + Math.max(0, 1 - offset) * 30);
}

function lightingCondition(score: number) {
  if (score < 30) return score / 30;
  if (score > 82) return (100 - score) / 18;
  return 1;
}

export function calculatePresentationScore(values: Pick<AnalysisResult, 'framingScore' | 'brightnessScore' | 'sharpnessScore' | 'headPositionScore'>): number | null {
  const parts: Array<[number | null, number, (n: number) => number]> = [
    [values.framingScore, 0.4, (n) => n],
    [values.brightnessScore, 0.3, (n) => clamp(lightingCondition(n) * 100)],
    [values.sharpnessScore, 0.3, (n) => n],
  ];
  if (valid(values.headPositionScore)) parts.push([values.headPositionScore, 0.1, (n) => n]);
  const available = parts.filter(([value]) => valid(value));
  if (available.length < 3) return null;
  const weight = available.reduce((sum, [, w]) => sum + w, 0);
  return clamp(available.reduce((sum, [value, w, normalize]) => sum + normalize(value as number) * w, 0) / weight);
}
