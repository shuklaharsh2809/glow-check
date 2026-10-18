import { Heart, Lock, Scissors, Shirt, Smile, Sparkles, UserRound } from 'lucide-react';
import type { Recommendation } from '../features/report/report.types';

const icons = { 'Face shape': UserRound, Features: Heart, Expression: Smile, Hair: Scissors, Grooming: Sparkles, Style: Sparkles, Wardrobe: Shirt };

export function TipCard({ tip, locked = false }: { tip: Recommendation; locked?: boolean }) {
  const Icon = icons[tip.category];
  return <article className={`group relative overflow-hidden rounded-[1.4rem] border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-luxe ${locked?'border-white/10 bg-white/[.055] text-white':'border-black/[.08] bg-white/75 shadow-[0_14px_45px_rgba(55,34,45,.06)]'}`}>
    <div className="mb-8 flex items-center justify-between"><span className={`flex items-center gap-2 text-[.6rem] font-bold uppercase tracking-[.18em] ${locked?'text-[#d9c2cf]':'text-lavender'}`}><span className={`grid h-8 w-8 place-items-center rounded-lg ${locked?'bg-white/[.08]':'bg-lilac'}`}><Icon className="h-3.5 w-3.5" /></span>{tip.category}</span>{locked && <span className="grid h-8 w-8 place-items-center rounded-full border border-white/10"><Lock className="h-3.5 w-3.5 text-[#d9c2cf]" aria-label="Locked" /></span>}</div>
    <h3 className="font-display text-2xl leading-tight">{tip.title}</h3>
    <p className={`mt-3 text-sm leading-6 ${locked?'text-white/50':'text-black/55'}`}>{locked ? `${tip.description.split('.')[0]}. Full guidance is included in the demo unlock.` : tip.description}</p>
    {!locked && <><p className="mt-5 rounded-xl bg-lilac/55 p-4 text-sm leading-6"><strong className="text-xs uppercase tracking-[.08em]">Try this</strong><br/>{tip.action}</p><p className="mt-4 text-[.68rem] leading-5 text-black/40">{tip.isGeneral ? 'General suggestion' : `Selected because: ${tip.reason}`}</p></>}
  </article>;
}
