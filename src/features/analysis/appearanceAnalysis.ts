import type { Category } from '@mediapipe/tasks-vision';
import type { ExpressionTone, FaceMetric, SkinMetrics } from './analysis.types';
import { proportionScore } from './faceGeometry';

const clamp = (value: number) => Math.round(Math.max(0, Math.min(100, value)));

export interface Blendshapes { smile: number; jawOpen: number; blink: number; mouthPress: number }

export function readBlendshapes(categories: Category[] | undefined): Blendshapes | null {
  if (!categories?.length) return null;
  const values = new Map(categories.map((category) => [category.categoryName, category.score]));
  const avg = (a: string, b: string) => ((values.get(a) ?? 0) + (values.get(b) ?? 0)) / 2;
  return {
    smile: avg('mouthSmileLeft', 'mouthSmileRight'),
    jawOpen: values.get('jawOpen') ?? 0,
    blink: avg('eyeBlinkLeft', 'eyeBlinkRight'),
    mouthPress: avg('mouthPressLeft', 'mouthPressRight'),
  };
}

export function estimateExpression(shapes: Blendshapes | null): { score: number | null; tone: ExpressionTone | null } {
  if (!shapes) return { score: null, tone: null };
  // A relaxed neutral face is not penalised heavily; a genuine smile earns a modest lift.
  const score = clamp(80 + shapes.smile * 30 - shapes.mouthPress * 15);
  return { score, tone: shapes.smile > 0.42 ? 'warm' : shapes.smile > 0.12 ? 'soft' : 'neutral' };
}

interface ScoreInputs { metrics: FaceMetric[]; symmetry: number | null; skin: SkinMetrics | null; expression: number | null }

export function calculateHarmonyScore({ metrics, symmetry, skin, expression }: ScoreInputs): number | null {
  const proportions = proportionScore(metrics);
  if (proportions === null || symmetry === null) return null;
  const parts: Array<[number, number]> = [[proportions, 0.5], [symmetry, 0.25], [expression ?? 82, 0.1]];
  if (skin) parts.push([skin.score, 0.15]);
  const weight = parts.reduce((sum, [, w]) => sum + w, 0);
  return clamp(parts.reduce((sum, [value, w]) => sum + value * w, 0) / weight);
}

/** Re-scores the face assuming the changeable factors (skin, expression, soft-tissue definition) reach a realistic target. */
export function calculatePotentialScore(inputs: ScoreInputs): number | null {
  const current = calculateHarmonyScore(inputs);
  if (current === null) return null;
  const metrics = inputs.metrics.map((m) => (m.improvable ? { ...m, score: Math.min(100, m.score + 20) } : m));
  const skin = inputs.skin && { ...inputs.skin, score: Math.max(inputs.skin.score, 90) };
  const potential = calculateHarmonyScore({ metrics, symmetry: inputs.symmetry, skin, expression: Math.max(inputs.expression ?? 0, 96) });
  return Math.max(current, potential ?? current);
}
