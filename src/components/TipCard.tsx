import { Camera, Lightbulb, Lock, Scissors, Shirt, Sparkles } from 'lucide-react';
import type { Recommendation } from '../features/report/report.types';

const icons = { Lighting: Lightbulb, Framing: Camera, Camera, Grooming: Scissors, Style: Sparkles, Wardrobe: Shirt };

export function TipCard({ tip, locked = false }: { tip: Recommendation; locked?: boolean }) {
  const Icon = icons[tip.category];
  return <article className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center justify-between"><span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-lavender"><Icon className="h-4 w-4" />{tip.category}</span>{locked && <Lock className="h-4 w-4 text-lavender" aria-label="Locked" />}</div>
    <h3 className="font-display text-2xl">{tip.title}</h3>
    <p className="mt-2 text-sm leading-6 text-black/65">{locked ? `${tip.description.split('.')[0]}. Full guidance is included in the demo unlock.` : tip.description}</p>
    {!locked && <><p className="mt-4 rounded-xl bg-lilac/60 p-3 text-sm"><strong>Try this:</strong> {tip.action}</p><p className="mt-3 text-xs text-black/50">{tip.isGeneral ? 'General suggestion' : `Why this tip: ${tip.reason}`}</p></>}
  </article>;
}
