export type PlanCategory = 'Lifestyle' | 'Nutrition' | 'Fitness' | 'Skincare' | 'Grooming' | 'Hair' | 'Expression' | 'Photo' | 'Style';
export type Impact = 'High' | 'Medium' | 'Low';

export interface Strength {
  id: string;
  title: string;
  detail: string;
  value: string | null;
}

export interface PlanItem {
  id: string;
  title: string;
  category: PlanCategory;
  impact: Impact;
  timeframe: string;
  /** Why this was chosen, tied to a measurement when one triggered it. */
  why: string;
  steps: string[];
  isGeneral: boolean;
  priority: number;
}

export interface RoutineBlock { time: 'Morning' | 'Evening' | 'Weekly'; items: string[] }

export interface GlowReport {
  strengths: Strength[];
  free: PlanItem[];
  premium: PlanItem[];
  routine: RoutineBlock[];
}
