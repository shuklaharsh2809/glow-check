import { describe, expect, it } from 'vitest';
import { calculatePresentationScore, framingFromBox } from './analysisRules';

describe('analysis rules', () => {
  it('scores a centered, useful crop higher than an off-centre tiny face', () => {
    expect(framingFromBox({x:.3,y:.2,width:.4,height:.5})).toBeGreaterThan(framingFromBox({x:.02,y:.02,width:.1,height:.1}));
  });
  it('requires framing, light, and sharpness', () => expect(calculatePresentationScore({framingScore:80,brightnessScore:null,sharpnessScore:70,headPositionScore:null})).toBeNull());
  it('creates a bounded score and penalizes extreme light', () => {
    const good=calculatePresentationScore({framingScore:90,brightnessScore:55,sharpnessScore:80,headPositionScore:null})!;
    const over=calculatePresentationScore({framingScore:90,brightnessScore:99,sharpnessScore:80,headPositionScore:null})!;
    expect(good).toBeGreaterThan(over); expect(good).toBeLessThanOrEqual(100);
  });
});
