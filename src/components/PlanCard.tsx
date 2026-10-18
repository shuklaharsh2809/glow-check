import { Apple, Camera, Check, Clock, Droplets, Dumbbell, Lock, Scissors, Shirt, Smile, Sparkles, Sun } from 'lucide-react';
import type { PlanItem } from '../features/report/report.types';

const icons = { Lifestyle: Sun, Nutrition: Apple, Fitness: Dumbbell, Skincare: Droplets, Grooming: Sparkles, Hair: Scissors, Expression: Smile, Photo: Camera, Style: Shirt };

export function PlanCard({ item, locked = false, index }: { item: PlanItem; locked?: boolean; index?: number }) {
  const Icon = icons[item.category];
  return <article className={`group relative flex flex-col overflow-hidden rounded-[1.4rem] border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-luxe ${locked ? 'border-white/10 bg-white/[.055] text-white' : 'border-black/[.08] bg-white/90 text-ink shadow-[0_14px_45px_rgba(55,34,45,.06)]'}`}>
    <div className="mb-6 flex items-center justify-between gap-3">
      <span className={`flex items-center gap-2 text-[.6rem] font-bold uppercase tracking-[.18em] ${locked ? 'text-[#d9c2cf]' : 'text-lavender'}`}><span className={`grid h-8 w-8 place-items-center rounded-lg ${locked ? 'bg-white/[.08]' : 'bg-lilac'}`}><Icon className="h-3.5 w-3.5" /></span>{item.category}</span>
      {locked ? <span className="grid h-8 w-8 place-items-center rounded-full border border-white/10"><Lock className="h-3.5 w-3.5 text-[#d9c2cf]" aria-label="Locked" /></span>
        : <span className={`rounded-full px-2.5 py-1 text-[.55rem] font-bold uppercase tracking-[.14em] ${item.impact === 'High' ? 'bg-ink text-white' : 'border border-black/10 text-black/50'}`}>{item.impact} impact</span>}
    </div>
    {index !== undefined && !locked && <span className="absolute right-6 top-[4.6rem] font-display text-4xl text-black/[.06]">0{index + 1}</span>}
    <h3 className="font-display text-2xl leading-tight">{item.title}</h3>
    <p className={`mt-2 flex items-center gap-1.5 text-[.65rem] font-bold uppercase tracking-[.12em] ${locked ? 'text-white/40' : 'text-black/40'}`}><Clock className="h-3 w-3" />{item.timeframe}</p>
    <p className={`mt-4 text-sm leading-6 ${locked ? 'text-white/50' : 'text-black/55'}`}>{locked ? `${item.why.split('. ')[0].replace(/\.$/, '')}. The full steps are included in the demo unlock.` : item.why}</p>
    {!locked && <>
      <ul className="mt-5 space-y-2.5 rounded-xl bg-lilac/55 p-4 text-sm leading-6">{item.steps.map((step) => <li key={step} className="flex gap-2.5"><Check className="mt-1 h-3.5 w-3.5 shrink-0 text-lavender" /><span>{step}</span></li>)}</ul>
      <p className="mt-auto pt-4 text-[.68rem] leading-5 text-black/40">{item.isGeneral ? 'General recommendation for everyone' : 'Personalised from your scan'}</p>
    </>}
  </article>;
}
