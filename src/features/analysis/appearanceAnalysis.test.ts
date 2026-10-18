import { describe, expect, it } from 'vitest';
import type { Category } from '@mediapipe/tasks-vision';
import { canonicalLandmarks, FIXTURE_SIZE } from '../../test/faceFixture';
import { calculateHarmonyScore, calculatePotentialScore, estimateExpression, readBlendshapes } from './appearanceAnalysis';
import { buildFaceFrame, measureMetrics } from './faceGeometry';

const category = (categoryName: string, score: number): Category => ({ categoryName, score, index: 0, displayName: '' });
const metrics = measureMetrics(buildFaceFrame(canonicalLandmarks(), FIXTURE_SIZE, FIXTURE_SIZE)!);

describe('appearance scoring', () => {
  it('reads blendshapes and a visible smile as a warm expression', () => {
    const shapes = readBlendshapes([category('mouthSmileLeft', 0.7), category('mouthSmileRight', 0.8), category('eyeBlinkLeft', 0.1), category('jawOpen', 0.05)]);
    expect(shapes).toMatchObject({ smile: 0.75, jawOpen: 0.05, blink: 0.05 });
    expect(estimateExpression(shapes).tone).toBe('warm');
  });

  it('does not heavily penalise a neutral face', () => {
    const neutral = estimateExpression(readBlendshapes([category('mouthSmileLeft', 0), category('mouthSmileRight', 0)]));
    expect(neutral.tone).toBe('neutral');
    expect(neutral.score).toBe(80);
  });

  it('requires proportions and symmetry for a harmony score', () => {
    expect(calculateHarmonyScore({ metrics: [], symmetry: 90, skin: null, expression: 80 })).toBeNull();
    expect(calculateHarmonyScore({ metrics, symmetry: null, skin: null, expression: 80 })).toBeNull();
    const score = calculateHarmonyScore({ metrics, symmetry: 90, skin: null, expression: 80 })!;
    expect(score).toBeGreaterThan(80);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('projects a higher potential when skin and expression can improve', () => {
    const inputs = { metrics, symmetry: 88, skin: { clarity: 50, evenness: 55, underEye: 60, score: 54 }, expression: 80 };
    expect(calculatePotentialScore(inputs)!).toBeGreaterThan(calculateHarmonyScore(inputs)!);
  });
});
