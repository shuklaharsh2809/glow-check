import { Lock } from 'lucide-react';
import type { FaceMetric } from '../features/analysis/analysis.types';

const position = (value: number, metric: FaceMetric) => Math.max(0, Math.min(100, ((value - metric.scaleMin) / (metric.scaleMax - metric.scaleMin)) * 100));
const verdictStyles = { ideal: 'bg-ink text-white', close: 'bg-lilac text-lavender', distinct: 'border border-black/10 text-black/55' };
const verdictText = { ideal: 'Ideal', close: 'Near ideal', distinct: 'Distinctive' };

export function MetricCard({ metric, locked = false }: { metric: FaceMetric; locked?: boolean }) {
  const low = position(metric.idealLow, metric);
  const high = position(metric.idealHigh, metric);
  return <article className="relative overflow-hidden rounded-[1.25rem] border border-black/[.08] bg-white/70 p-5 shadow-[0_12px_35px_rgba(55,34,45,.045)]">
    <div className="flex items-start justify-between gap-3">
      <div><p className="text-[.6rem] font-bold uppercase tracking-[.16em] text-black/40">{metric.label}</p><p className="mt-1 text-[.68rem] leading-4 text-black/35">{metric.description}</p></div>
      {locked ? <Lock className="h-3.5 w-3.5 shrink-0 text-lavender" aria-label="Locked" /> : <span className={`shrink-0 rounded-full px-2.5 py-1 text-[.55rem] font-bold uppercase tracking-[.12em] ${verdictStyles[metric.verdict]}`}>{verdictText[metric.verdict]}</span>}
    </div>
    <div className={locked ? 'select-none blur-[6px]' : ''} aria-hidden={locked}>
      <div className="mt-5 flex items-baseline justify-between gap-3"><p className="font-display text-3xl">{locked ? '0.00' : metric.display}</p><p className="text-right text-xs font-semibold text-lavender">{locked ? 'Hidden' : metric.verdictLabel}</p></div>
      <div className="relative mt-4 h-1.5 rounded-full bg-black/[.06]">
        <div className="absolute inset-y-0 rounded-full bg-lavender/30" style={{ left: `${low}%`, width: `${high - low}%` }} />
        {!locked && <div className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-ink shadow-[0_2px_8px_rgba(0,0,0,.25)]" style={{ left: `${position(metric.value, metric)}%` }} />}
      </div>
      <p className="mt-2 text-[.6rem] uppercase tracking-[.12em] text-black/30">Shaded band = ideal range</p>
    </div>
  </article>;
}
