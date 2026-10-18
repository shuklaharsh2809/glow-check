import { describe, expect, it } from 'vitest';
import { canonicalLandmarks, resultFromLandmarks, widen } from '../../test/faceFixture';
import { generateReport } from './generateReport';

const average = resultFromLandmarks(canonicalLandmarks());
const softJaw = resultFromLandmarks(canonicalLandmarks({ edit: widen([172, 397, 136, 365, 58, 288], 1.16) }), { skin: { clarity: 55, evenness: 64, underEye: 62, score: 60 }, expressionTone: 'neutral' });

describe('glow report', () => {
  it('leads with genuine strengths backed by measurements', () => {
    const { strengths } = generateReport(average, 25);
    expect(strengths.length).toBeGreaterThanOrEqual(3);
    expect(strengths.map((s) => s.id)).toContain('symmetry');
    expect(strengths.map((s) => s.id)).toContain('jawDefinition');
  });

  it('returns three free and up to six premium unique plan items plus a routine', () => {
    const report = generateReport(softJaw, 25);
    expect(report.free).toHaveLength(3);
    expect(report.premium.length).toBeGreaterThan(0);
    expect(report.premium.length).toBeLessThanOrEqual(6);
    const ids = [...report.free, ...report.premium].map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(report.routine.map((r) => r.time)).toEqual(['Morning', 'Evening', 'Weekly']);
  });

  it('prioritises lifestyle and skincare changes that target what the scan found', () => {
    const report = generateReport(softJaw, 25);
    expect(report.free.map((p) => p.id)).toEqual(['jaw-fitness', 'sleep-reset', 'clear-skin']);
    const ids = [...report.free, ...report.premium].map((p) => p.id);
    expect(ids).toEqual(expect.arrayContaining(['smile-squinch', 'even-tone', 'morning-light']));
    expect(report.free[0].why).toContain('1.11');
  });

  it('keeps advice for teenagers free of calorie deficits and unsupervised retinoids', () => {
    const report = generateReport(softJaw, 15);
    const text = [...report.free, ...report.premium].flatMap((p) => p.steps).join(' ');
    expect(text).not.toMatch(/calorie deficit/i);
    expect(text).not.toMatch(/adapalene/i);
    expect(report.routine[1].items.join(' ')).toContain('8–10 hours');
  });

  it('falls back to general guidance when nothing needs fixing, and is deterministic', () => {
    const report = generateReport(average, 30);
    expect(report).toEqual(generateReport({ ...average }, 30));
    expect([...report.free, ...report.premium].some((p) => p.id === 'jaw-fitness')).toBe(false);
    expect(report.free[0].id).toBe('hair-shape');
  });
});
