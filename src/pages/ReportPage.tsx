import { Check, Copy, LockKeyhole, RotateCcw, Share2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../components/Button';
import { ScoreRing } from '../components/ScoreRing';
import { TipCard } from '../components/TipCard';
import { trackEvent } from '../features/analytics/analytics';
import type { AnalysisResult } from '../features/analysis/analysis.types';
import type { Recommendations } from '../features/report/report.types';

function label(value: number | null, good: (n: number) => boolean) { return value === null ? 'Unavailable' : good(value) ? 'Good' : 'Could improve'; }

export function ReportPage({ name, result, tips, unlocked, onUnlock, onReset }: { name: string; result: AnalysisResult; tips: Recommendations; unlocked: boolean; onUnlock: () => void; onReset: () => void }) {
  const [modal, setModal] = useState(false);
  const [shared, setShared] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (modal) closeRef.current?.focus(); }, [modal]);
  const share = async () => {
    const text = `I used GlowCheck to review my photo presentation. My report focused on framing, lighting, and sharpness — not attractiveness.`;
    const canShare = typeof navigator.share === 'function';
    try { if (canShare) await navigator.share({ title: 'My GlowCheck report', text }); else await navigator.clipboard.writeText(text); setShared(true); trackEvent('report_shared', { method: canShare ? 'web_share' : 'clipboard' }); } catch { /* User cancelled or clipboard unavailable. */ }
  };
  const open = () => { setModal(true); trackEvent('premium_clicked'); };
  return <main className="py-10 md:py-16">
    <section className="grid gap-8 rounded-3xl bg-lilac/50 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-10"><div><p className="eyebrow">Your report</p><h1 className="mt-3 font-display text-4xl md:text-5xl">A thoughtful starting point, {name}.</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-black/60">This report evaluates measurable photo conditions. It does not score attractiveness, identity, health, or personal worth.</p></div><div className="text-center"><ScoreRing score={result.photoPresentationScore}/><p className="mt-3 text-xs uppercase tracking-widest text-black/50">Experimental heuristic</p></div></section>
    <section className="py-12"><div className="flex items-end justify-between"><div><p className="eyebrow">What we could measure</p><h2 className="mt-3 font-display text-3xl">Photo conditions</h2></div></div><div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">{[
      ['Framing', label(result.framingScore, n=>n>=65)], ['Lighting', label(result.brightnessScore, n=>n>=30&&n<=82)], ['Sharpness', label(result.sharpnessScore, n=>n>=42)], ['Head position', 'Not estimated']
    ].map(([k,v])=><div key={k} className="rounded-2xl border border-black/10 bg-white p-5"><p className="text-xs uppercase tracking-widest text-black/45">{k}</p><p className="mt-3 font-display text-xl">{v}</p></div>)}</div><p className="mt-4 text-xs leading-5 text-black/45">Sharpness is a lightweight edge-detail heuristic, not a calibrated camera-quality measurement. Head angle is omitted because a reliable pose estimate is not available in this MVP.</p></section>
    <section className="pb-12"><p className="eyebrow">Included feedback</p><h2 className="mt-3 font-display text-3xl">Two ideas to try now</h2><div className="mt-6 grid gap-4 md:grid-cols-2">{tips.free.map(t=><TipCard key={t.id} tip={t}/>)}</div></section>
    <section className="rounded-3xl bg-[#ede8e1] p-6 md:p-10"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Demo premium</p><h2 className="mt-3 font-display text-3xl">Three more ways to experiment</h2><p className="mt-2 text-sm text-black/55">₹5 demo price · No money will be collected.</p></div>{!unlocked && <Button onClick={open}><LockKeyhole className="mr-2 inline h-4 w-4"/>Unlock for ₹5</Button>}</div><div className="mt-7 grid gap-4 md:grid-cols-3">{tips.premium.map(t=><TipCard key={t.id} tip={t} locked={!unlocked}/>)}</div>{unlocked && <p role="status" className="mt-5 flex items-center gap-2 text-sm font-semibold text-lavender"><Check className="h-4 w-4"/>Demo report unlocked. No payment was made.</p>}</section>
    <div className="mt-8 flex flex-wrap gap-3"><Button variant="secondary" onClick={share}>{shared ? <Copy className="mr-2 inline h-4 w-4"/> : <Share2 className="mr-2 inline h-4 w-4"/>}{shared ? 'Copied or shared' : 'Share a private summary'}</Button><Button variant="ghost" onClick={onReset}><RotateCcw className="mr-2 inline h-4 w-4"/>Start again</Button></div>
    {modal && <div className="fixed inset-0 z-50 grid place-items-end bg-black/45 p-0 sm:place-items-center sm:p-5" role="presentation" onMouseDown={(e)=>{if(e.target===e.currentTarget)setModal(false)}}><div role="dialog" aria-modal="true" aria-labelledby="unlock-title" className="w-full max-w-lg rounded-t-3xl bg-ivory p-6 shadow-soft sm:rounded-3xl" onKeyDown={(e)=>{if(e.key==='Escape')setModal(false)}}><div className="flex justify-between"><div><p className="eyebrow">Demo unlock · ₹5</p><h2 id="unlock-title" className="mt-2 font-display text-3xl">Open your full report</h2></div><button ref={closeRef} onClick={()=>setModal(false)} className="h-11 w-11 rounded-full hover:bg-black/5" aria-label="Close unlock dialog"><X className="mx-auto h-5 w-5"/></button></div><p className="mt-4 text-sm leading-6 text-black/60">Includes guidance across {tips.premium.map(t=>t.category).join(', ')}. This is a demo unlock. No payment will be collected.</p><div className="mt-6 rounded-2xl border border-lavender/20 bg-lilac/60 p-4 text-sm">No card, checkout, or payment service is involved. The unlock lasts only for this open session.</div><Button className="mt-6 w-full" onClick={()=>{onUnlock();setModal(false)}}>Unlock demo report</Button></div></div>}
  </main>;
}
