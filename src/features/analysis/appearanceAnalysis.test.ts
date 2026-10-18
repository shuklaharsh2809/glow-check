import { describe, expect, it } from 'vitest';
import type { Category, NormalizedLandmark } from '@mediapipe/tasks-vision';
import { calculateAppearanceImpressionScore, estimateExpression, estimateFaceShape } from './appearanceAnalysis';

describe('appearance analysis', () => {
  it('classifies a softly proportioned outline as oval', () => {
    const points: NormalizedLandmark[] = Array.from({ length: 478 }, () => ({ x: .5, y: .5, z: 0, visibility: 1 }));
    points[10] = { x: .5, y: .2, z: 0, visibility: 1 };
    points[152] = { x: .5, y: .8, z: 0, visibility: 1 };
    points[234] = { x: .25, y: .5, z: 0, visibility: 1 };
    points[454] = { x: .75, y: .5, z: 0, visibility: 1 };
    points[172] = { x: .3, y: .7, z: 0, visibility: 1 };
    points[397] = { x: .7, y: .7, z: 0, visibility: 1 };
    expect(estimateFaceShape(points, 1000, 1000)).toBe('oval');
  });

  it('reads a visible smile as a warm expression', () => {
    const category = (categoryName: string, score: number): Category => ({ categoryName, score, index: 0, displayName: '' });
    expect(estimateExpression([category('mouthSmileLeft', .7), category('mouthSmileRight', .8)]).tone).toBe('warm');
  });

  it('requires geometry and keeps the impression score bounded', () => {
    expect(calculateAppearanceImpressionScore(null, 80, 70)).toBeNull();
    expect(calculateAppearanceImpressionScore(90, 85, 75)).toBe(86);
  });
});
