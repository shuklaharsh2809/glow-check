import { describe, expect, it } from 'vitest';
import { canonicalLandmarks, FIXTURE_SIZE, widen } from '../../test/faceFixture';
import { buildFaceFrame, classifyFaceShape, measureMetrics, measureSymmetry, scoreAgainstRange } from './faceGeometry';

const frameFor = (options: Parameters<typeof canonicalLandmarks>[0] = {}) => buildFaceFrame(canonicalLandmarks(options), FIXTURE_SIZE, FIXTURE_SIZE)!;
const values = (options: Parameters<typeof canonicalLandmarks>[0] = {}) => Object.fromEntries(measureMetrics(frameFor(options)).map((m) => [m.id, m.value]));

describe('face geometry', () => {
  it('reads the population-average template as oval and symmetric with balanced vertical proportions', () => {
    const frame = frameFor();
    expect(classifyFaceShape(frame)).toBe('oval');
    expect(measureSymmetry(frame)).toBe(100);
    const metrics = measureMetrics(frame);
    expect(metrics).toHaveLength(9);
    // The template has a near-neutral tilt, and its eye corners and alae sit differently from real-face
    // predictions, so eye and nose ranges (set from anthropometric norms) flag it.
    const flagged = Object.fromEntries(metrics.filter((m) => m.verdict !== 'ideal').map((m) => [m.id, m.verdictLabel]));
    expect(flagged).toEqual({ canthalTilt: 'Neutral tilt', eyeSpacing: 'Wide-set', noseWidth: 'Narrow' });
  });

  it('measures the same proportions regardless of head yaw, pitch, and roll', () => {
    const level = values();
    for (const pose of [{ yaw: 18 }, { pitch: -12 }, { roll: 14 }, { yaw: -15, pitch: 9, roll: -7 }]) {
      const turned = values(pose);
      for (const [id, value] of Object.entries(level)) expect(turned[id]).toBeCloseTo(value, 6);
    }
  });

  it('reports head pose in degrees', () => {
    const pose = frameFor({ yaw: 15, roll: 10 }).pose;
    expect(Math.abs(pose.yaw)).toBeCloseTo(15, 0);
    expect(Math.abs(pose.roll)).toBeCloseTo(10, 0);
    expect(Math.abs(frameFor().pose.pitch)).toBeLessThan(0.5);
  });

  it('detects a wider jaw as square with a softer jawline', () => {
    const frame = frameFor({ edit: widen([172, 397, 136, 365, 58, 288], 1.16) });
    expect(classifyFaceShape(frame)).toBe('square');
    const jaw = measureMetrics(frame).find((m) => m.id === 'jawDefinition')!;
    expect(jaw.direction).toBe('low');
    expect(jaw.verdictLabel).toBe('Soft jawline');
  });

  it('classifies a stretched face as oblong', () => {
    expect(classifyFaceShape(frameFor({ edit: (p) => p.forEach((v) => { v[1] *= 1.18; }) }))).toBe('oblong');
  });

  it('penalises visible asymmetry', () => {
    const lopsided = frameFor({ edit: (p) => { for (const i of [291, 334, 336, 300]) p[i][1] += 0.45; } });
    expect(measureSymmetry(lopsided)!).toBeLessThan(95);
  });

  it('skips lip and chin proportions when the mouth is open', () => {
    const ids = measureMetrics(frameFor(), { open: true, smiling: false }).map((m) => m.id);
    expect(ids).not.toContain('lipRatio');
    expect(ids).not.toContain('chinBalance');
    expect(measureMetrics(frameFor(), { open: false, smiling: true }).map((m) => m.id)).not.toContain('mouthWidth');
  });

  it('scores values inside the ideal range at 100 and decays outside it', () => {
    expect(scoreAgainstRange(1, 0.9, 1.1, 0.1)).toBe(100);
    expect(scoreAgainstRange(1.2, 0.9, 1.1, 0.1)).toBe(55);
    expect(scoreAgainstRange(5, 0.9, 1.1, 0.1)).toBe(25);
  });
});
