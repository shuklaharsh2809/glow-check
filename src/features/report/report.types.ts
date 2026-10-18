export type TipCategory = 'Face shape' | 'Features' | 'Expression' | 'Hair' | 'Grooming' | 'Style' | 'Wardrobe';

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  action: string;
  category: TipCategory;
  priority: number;
  trigger: string;
  reason: string;
  isGeneral: boolean;
  premium: boolean;
}

export interface Recommendations { free: Recommendation[]; premium: Recommendation[] }
