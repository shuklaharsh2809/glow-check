import { Check, Copy, LockKeyhole, RotateCcw, Share2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../components/Button';
import { ScoreRing } from '../components/ScoreRing';
import { TipCard } from '../components/TipCard';
import { trackEvent } from '../features/analytics/analytics';
import type { AnalysisResult } from '../features/analysis/analysis.types';
import type { Recommendations } from '../features/report/report.types';

function label(value: number | null, good: (n: number) => boolean) { return value === null ? 'Unavailable' : good(value) ? 'Good' : 'Could improve'; }
function appealLabel(score: number | null) {
  if (score === null) return 'More detail needed';
  if (score >= 85) return 'Exceptionally polished';
  if (score >= 70) return 'Naturally striking';
  if (score >= 55) return 'A strong foundation';
  return 'Ready to elevate';
}

export function ReportPage({ name, result, tips, unlocked, onUnlock, onReset }: { name: string; result: AnalysisResult; tips: Recommendations; unlocked: boolean; onUnlock: () => void; onReset: () => void }) {
  const [modal, setModal] = useState(false);
  const [shared, setShared] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (modal) closeRef.current?.focus(); }, [modal]);
  const share = async () => {
    const text = `I used GlowCheck to explore my photo appeal and get ideas for looking my best. The score is based on framing, lighting, and clarity.`;
    const canShare = typeof navigator.share === 'function';
    try { if (canShare) await navigator.share({ title: 'My GlowCheck report', text }); else await navigator.clipboard.writeText(text); setShared(true); trackEvent('report_shared', { method: canShare ? 'web_share' : 'clipboard' }); } catch { /* User cancelled or clipboard unavailable. */ }
  };
  const open = () => { setModal(true); trackEvent('premium_clicked'); };
  return <main className="py-8 md:py-14">
    <section className="relative grid overflow-hidden rounded-[2rem] bg-ink p-7 text-white shadow-luxe md:grid-cols-[1fr_auto] md:items-center md:p-12"><div className="orb orb-one"/><div className="relative"><p className="eyebrow !text-[#d9c2cf]">Your photo appeal</p><h1 className="mt-4 max-w-2xl font-display text-4xl leading-tight md:text-6xl">{appealLabel(result.photoPresentationScore)}.<br/><em className="font-normal text-[#d9c2cf]">Now elevate it, {name}.</em></h1><p className="mt-6 max-w-xl text-sm leading-7 text-white/55">GlowCheck estimates how attractive this portrait presents using controllable photo conditions, then shows what you can try next.</p><p className="mt-3 max-w-xl text-[.65rem] leading-5 text-white/35">The score reflects framing, light, and clarity. It is not an objective measurement of your face, body, worth, or fixed attractiveness.</p></div><div className="relative mt-8 text-center md:ml-12 md:mt-0"><ScoreRing score={result.photoPresentationScore}/><p className="mt-4 text-[.55rem] uppercase tracking-[.18em] text-white/35">Photo appeal score</p></div></section>
    <section className="py-14"><div className="flex items-end justify-between"><div><p className="eyebrow">The composition</p><h2 className="mt-3 font-display text-4xl">What the camera noticed</h2></div></div><div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">{[
      ['Framing', label(result.framingScore, n=>n>=65)], ['Lighting', label(result.brightnessScore, n=>n>=30&&n<=82)], ['Sharpness', label(result.sharpnessScore, n=>n>=42)], ['Head position', 'Not estimated']
    ].map(([k,v],i)=><div key={k} className="rounded-[1.25rem] border border-black/[.08] bg-white/70 p-5 shadow-[0_12px_35px_rgba(55,34,45,.045)]"><div className="flex items-center justify-between"><p className="text-[.6rem] font-bold uppercase tracking-[.16em] text-black/35">{k}</p><span className="font-display text-black/15">0{i+1}</span></div><p className="mt-5 font-display text-xl">{v}</p></div>)}</div><p className="mt-5 max-w-3xl text-[.68rem] leading-5 text-black/40">Sharpness is a lightweight edge-detail heuristic, not a calibrated camera-quality measurement. Head angle is omitted because a reliable pose estimate is not available in this MVP.</p></section>
    <section className="pb-14"><p className="eyebrow">Elevate your appeal</p><h2 className="mt-3 font-display text-4xl">Two ways to look even better</h2><p className="mt-3 max-w-xl text-sm leading-6 text-black/50">Start with the changes most supported by this portrait.</p><div className="mt-7 grid gap-4 md:grid-cols-2">{tips.free.map(t=><TipCard key={t.id} tip={t}/>)}</div></section>
    <section className="relative overflow-hidden rounded-[2rem] bg-ink p-6 text-white shadow-luxe md:p-10"><div className="orb orb-one"/><div className="relative flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow !text-[#d9c2cf]">The full glow-up · Demo premium</p><h2 className="mt-3 font-display text-4xl">Three more ways to look your best</h2><p className="mt-3 text-sm text-white/45">₹5 demo price · No money will be collected.</p></div>{!unlocked && <Button onClick={open} className="!bg-[#eadde4] !text-ink hover:!bg-white"><LockKeyhole className="mr-2 inline h-4 w-4"/>Unlock for ₹5</Button>}</div><div className="relative mt-8 grid gap-4 md:grid-cols-3">{tips.premium.map(t=><TipCard key={t.id} tip={t} locked={!unlocked}/>)}</div>{unlocked && <p role="status" className="relative mt-6 flex items-center gap-2 text-sm font-semibold text-[#d9c2cf]"><Check className="h-4 w-4"/>Demo report unlocked. No payment was made.</p>}</section>
    <div className="mt-8 flex flex-wrap gap-3"><Button variant="secondary" onClick={share}>{shared ? <Copy className="mr-2 inline h-4 w-4"/> : <Share2 className="mr-2 inline h-4 w-4"/>}{shared ? 'Copied or shared' : 'Share a private summary'}</Button><Button variant="ghost" onClick={onReset}><RotateCcw className="mr-2 inline h-4 w-4"/>Start again</Button></div>
    {modal && <div className="fixed inset-0 z-50 grid place-items-end bg-black/45 p-0 sm:place-items-center sm:p-5" role="presentation" onMouseDown={(e)=>{if(e.target===e.currentTarget)setModal(false)}}><div role="dialog" aria-modal="true" aria-labelledby="unlock-title" className="w-full max-w-lg rounded-t-3xl bg-ivory p-6 shadow-soft sm:rounded-3xl" onKeyDown={(e)=>{if(e.key==='Escape')setModal(false)}}><div className="flex justify-between"><div><p className="eyebrow">Demo unlock · ₹5</p><h2 id="unlock-title" className="mt-2 font-display text-3xl">Open your full report</h2></div><button ref={closeRef} onClick={()=>setModal(false)} className="h-11 w-11 rounded-full hover:bg-black/5" aria-label="Close unlock dialog"><X className="mx-auto h-5 w-5"/></button></div><p className="mt-4 text-sm leading-6 text-black/60">Includes guidance across {tips.premium.map(t=>t.category).join(', ')}. This is a demo unlock. No payment will be collected.</p><div className="mt-6 rounded-2xl border border-lavender/20 bg-lilac/60 p-4 text-sm">No card, checkout, or payment service is involved. The unlock lasts only for this open session.</div><Button className="mt-6 w-full" onClick={()=>{onUnlock();setModal(false)}}>Unlock demo report</Button></div></div>}
  </main>;
}
