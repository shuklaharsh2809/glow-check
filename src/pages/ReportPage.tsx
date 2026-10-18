import { CalendarDays, Check, Copy, Crown, LockKeyhole, Moon, RotateCcw, Share2, Sparkles, Sun, TrendingUp, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../components/Button';
import { MetricCard } from '../components/MetricCard';
import { PlanCard } from '../components/PlanCard';
import { PortraitOverlay } from '../components/PortraitOverlay';
import { ScoreRing } from '../components/ScoreRing';
import { trackEvent } from '../features/analytics/analytics';
import type { AnalysisResult, SkinMetrics } from '../features/analysis/analysis.types';
import type { GlowReport, RoutineBlock } from '../features/report/report.types';

const FREE_METRICS = 3;

function tierLabel(score: number | null) {
  if (score === null) return 'More detail needed';
  if (score >= 88) return 'Striking harmony';
  if (score >= 80) return 'Highly attractive';
  if (score >= 72) return 'Naturally attractive';
  if (score >= 64) return 'An attractive foundation';
  return 'Real glow-up potential';
}

const titleCase = (value: string) => `${value[0].toUpperCase()}${value.slice(1)}`;

function SkinPanel({ skin }: { skin: SkinMetrics | null }) {
  if (!skin) return <div className="rounded-[1.4rem] border border-dashed border-black/15 bg-white/50 p-6 text-sm leading-6 text-black/55">The light in this photo was too dim, too bright, or the face too small for a fair skin reading. Retake facing a window in soft daylight to unlock your skin snapshot.</div>;
  const rows: Array<[string, string, number]> = [['Texture clarity', 'Fine detail across the cheeks', skin.clarity], ['Tone evenness', 'Colour consistency across both cheeks', skin.evenness], ['Under-eye brightness', 'Under-eye light compared with your cheeks', skin.underEye]];
  return <div className="grid gap-3 md:grid-cols-3">{rows.map(([label, hint, value]) => <div key={label} className="rounded-[1.25rem] border border-black/[.08] bg-white/70 p-5">
    <div className="flex items-baseline justify-between"><p className="text-[.6rem] font-bold uppercase tracking-[.16em] text-black/40">{label}</p><p className="font-display text-2xl">{value}<span className="text-sm text-black/30">/100</span></p></div>
    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/[.06]"><div className="h-full rounded-full bg-gradient-to-r from-lavender to-ink" style={{ width: `${value}%` }} /></div>
    <p className="mt-3 text-[.7rem] leading-5 text-black/45">{hint} · {value >= 80 ? 'Looking great' : value >= 65 ? 'Good, with room to improve' : 'Your plan targets this'}</p>
  </div>)}</div>;
}

const routineIcons = { Morning: Sun, Evening: Moon, Weekly: CalendarDays };

function Routine({ routine, locked }: { routine: RoutineBlock[]; locked: boolean }) {
  return <div className="relative mt-10">
    <div className="flex items-center justify-between"><h3 className="font-display text-3xl">Your daily glow routine</h3>{locked && <LockKeyhole className="h-4 w-4 text-[#d9c2cf]" aria-label="Locked" />}</div>
    <div className={`mt-5 grid gap-4 md:grid-cols-3 ${locked ? 'pointer-events-none select-none blur-[5px]' : ''}`} aria-hidden={locked}>{routine.map((block) => {
      const Icon = routineIcons[block.time];
      return <div key={block.time} className="rounded-[1.4rem] border border-white/10 bg-white/[.055] p-6"><p className="flex items-center gap-2 text-[.6rem] font-bold uppercase tracking-[.18em] text-[#d9c2cf]"><Icon className="h-3.5 w-3.5" />{block.time}</p><ol className="mt-5 space-y-3 text-sm leading-6 text-white/75">{block.items.map((item, i) => <li key={item} className="flex gap-3"><span className="font-display text-[#d9c2cf]/70">{i + 1}</span>{item}</li>)}</ol></div>;
    })}</div>
  </div>;
}

export function ReportPage({ name, result, report, imageUrl, unlocked, onUnlock, onReset }: { name: string; result: AnalysisResult; report: GlowReport; imageUrl: string | null; unlocked: boolean; onUnlock: () => void; onReset: () => void }) {
  const [modal, setModal] = useState(false);
  const [shared, setShared] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (modal) closeRef.current?.focus(); }, [modal]);
  const share = async () => {
    const text = `I used GlowCheck to measure my facial proportions and got a personalised glow-up plan — strengths, skin snapshot, and a daily routine.`;
    const canShare = typeof navigator.share === 'function';
    try { if (canShare) await navigator.share({ title: 'My GlowCheck report', text }); else await navigator.clipboard.writeText(text); setShared(true); trackEvent('report_shared', { method: canShare ? 'web_share' : 'clipboard' }); } catch { /* User cancelled or clipboard unavailable. */ }
  };
  const open = () => { setModal(true); trackEvent('premium_clicked'); };
  const gain = result.harmonyScore !== null && result.potentialScore !== null ? result.potentialScore - result.harmonyScore : null;
  const lockedMetrics = unlocked ? 0 : Math.max(0, result.metrics.length - FREE_METRICS);
  const stats: Array<[string, string]> = [
    ['Face shape', result.faceShape ? titleCase(result.faceShape) : '—'],
    ['Symmetry', result.symmetryScore !== null ? `${result.symmetryScore}` : '—'],
    ['Proportions', result.proportionScore !== null ? `${result.proportionScore}` : '—'],
    ['Skin', result.skin ? `${result.skin.score}` : '—'],
  ];

  return <main className="py-8 md:py-14">
    <section className={`relative grid overflow-hidden rounded-[2rem] bg-ink text-white shadow-luxe ${imageUrl ? 'md:grid-cols-[minmax(0,21rem)_1fr]' : ''}`}>
      {imageUrl && <PortraitOverlay imageUrl={imageUrl} overlay={result.overlay} />}
      <div className="relative p-7 md:p-11"><div className="orb orb-one" />
        <p className="eyebrow relative !text-[#d9c2cf]">Your GlowCheck · {name}</p>
        <h1 className="relative mt-4 max-w-2xl font-display text-4xl leading-tight md:text-[3.4rem]">{tierLabel(result.harmonyScore)}.<br /><em className="font-normal text-[#d9c2cf]">Here’s what sets you apart.</em></h1>
        <div className="relative mt-8 flex flex-wrap items-center gap-6">
          <div className="text-center"><ScoreRing score={result.harmonyScore} /><p className="mt-3 text-[.55rem] uppercase tracking-[.18em] text-white/40">Harmony score</p></div>
          {result.potentialScore !== null && <div className="rounded-[1.4rem] border border-white/10 bg-white/[.06] p-5">
            <p className="flex items-center gap-2 text-[.58rem] font-bold uppercase tracking-[.16em] text-[#d9c2cf]"><TrendingUp className="h-3.5 w-3.5" />Your potential</p>
            <p className="mt-2 font-display text-5xl">{result.potentialScore}</p>
            <p className="mt-1 text-xs text-white/55">{gain ? `+${gain} by following your plan` : 'You are already near your peak'}</p>
          </div>}
        </div>
        <div className="relative mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">{stats.map(([k, v]) => <div key={k} className="rounded-xl border border-white/10 px-3 py-2.5"><p className="text-[.52rem] font-bold uppercase tracking-[.15em] text-white/40">{k}</p><p className="mt-1 font-display text-lg">{v}</p></div>)}</div>
        <p className="relative mt-6 max-w-xl text-[.65rem] leading-5 text-white/35">Measured from 478 facial landmarks after correcting for head angle. Beauty is subjective and this is a photo-based estimate, not a verdict on your worth — angle, lighting, and expression all affect it.</p>
      </div>
    </section>

    <section className="py-14">
      <p className="eyebrow">What’s working</p>
      <h2 className="mt-3 font-display text-4xl">What makes your face attractive</h2>
      <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{report.strengths.map((s, i) => <article key={s.id} className={`relative overflow-hidden rounded-[1.4rem] border border-black/[.08] p-6 shadow-[0_14px_45px_rgba(55,34,45,.06)] ${i === 0 ? 'bg-lilac/70' : 'bg-white/75'}`}>
        <div className="flex items-center justify-between"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-lavender">{i === 0 ? <Crown className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}</span>{s.value && <span className="rounded-full bg-white px-3 py-1 font-display text-sm">{s.value}</span>}</div>
        <h3 className="mt-6 font-display text-2xl leading-tight">{s.title}</h3>
        <p className="mt-3 text-sm leading-6 text-black/55">{s.detail}</p>
      </article>)}</div>
    </section>

    <section className="pb-14">
      <p className="eyebrow">Facial analysis</p>
      <h2 className="mt-3 font-display text-4xl">Your proportions, measured</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-black/50">Each measurement is compared with the range most often rated as attractive. “Distinctive” is not a flaw; it is what makes a face recognisable.</p>
      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{result.metrics.map((m, i) => <MetricCard key={m.id} metric={m} locked={!unlocked && i >= FREE_METRICS} />)}</div>
      {lockedMetrics > 0 && <button type="button" onClick={open} className="mt-4 text-xs font-bold uppercase tracking-[.12em] text-lavender underline-offset-4 hover:underline">Unlock {lockedMetrics} more measurements</button>}
      {!result.mouthMeasured && <p className="mt-4 text-[.7rem] leading-5 text-black/40">Lip proportions were skipped because your mouth was open or smiling widely. Retake with relaxed, closed lips to include them.</p>}
    </section>

    <section className="pb-14">
      <p className="eyebrow">Skin snapshot</p>
      <h2 className="mt-3 font-display text-4xl">How your skin reads on camera</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-black/50">Estimated from the pixels on your cheeks and under your eyes. Makeup, filters, and harsh light affect these readings.</p>
      <div className="mt-7"><SkinPanel skin={result.skin} /></div>
    </section>

    <section className="pb-14">
      <p className="eyebrow">Your glow-up plan</p>
      <h2 className="mt-3 font-display text-4xl">Start with these three</h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-black/50">Ranked by how much they can change your appearance, based on what your scan found.</p>
      <div className="mt-7 grid gap-4 lg:grid-cols-3">{report.free.map((item, i) => <PlanCard key={item.id} item={item} index={i} />)}</div>
    </section>

    <section className="relative overflow-hidden rounded-[2rem] bg-ink p-6 text-white shadow-luxe md:p-10"><div className="orb orb-one" />
      <div className="relative flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow !text-[#d9c2cf]">The full glow-up · Demo premium</p><h2 className="mt-3 font-display text-4xl">{gain ? `${report.premium.length} more steps to reach ${result.potentialScore}` : `${report.premium.length} more ways to keep your glow`}</h2><p className="mt-3 text-sm text-white/45">Full measurements, complete plan, and your daily routine · ₹5 demo price · No money will be collected.</p></div>{!unlocked && <Button onClick={open} className="!bg-[#eadde4] !text-ink hover:!bg-white"><LockKeyhole className="mr-2 inline h-4 w-4" />Unlock for ₹5</Button>}</div>
      <div className="relative mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{report.premium.map((item) => <PlanCard key={item.id} item={item} locked={!unlocked} />)}</div>
      <Routine routine={report.routine} locked={!unlocked} />
      {unlocked && <p role="status" className="relative mt-6 flex items-center gap-2 text-sm font-semibold text-[#d9c2cf]"><Check className="h-4 w-4" />Demo report unlocked. No payment was made.</p>}
    </section>

    <div className="mt-8 flex flex-wrap gap-3"><Button variant="secondary" onClick={share}>{shared ? <Copy className="mr-2 inline h-4 w-4" /> : <Share2 className="mr-2 inline h-4 w-4" />}{shared ? 'Copied or shared' : 'Share a private summary'}</Button><Button variant="ghost" onClick={onReset}><RotateCcw className="mr-2 inline h-4 w-4" />Start again</Button></div>
    {modal && <div className="fixed inset-0 z-50 grid place-items-end bg-black/45 p-0 sm:place-items-center sm:p-5" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(false); }}><div role="dialog" aria-modal="true" aria-labelledby="unlock-title" className="w-full max-w-lg rounded-t-3xl bg-ivory p-6 shadow-soft sm:rounded-3xl" onKeyDown={(e) => { if (e.key === 'Escape') setModal(false); }}><div className="flex justify-between"><div><p className="eyebrow">Demo unlock · ₹5</p><h2 id="unlock-title" className="mt-2 font-display text-3xl">Open your full report</h2></div><button ref={closeRef} onClick={() => setModal(false)} className="h-11 w-11 rounded-full hover:bg-black/5" aria-label="Close unlock dialog"><X className="mx-auto h-5 w-5" /></button></div><p className="mt-4 text-sm leading-6 text-black/60">Includes {report.premium.length} more plan steps ({[...new Set(report.premium.map((t) => t.category))].join(', ')}), every facial measurement, and a morning, evening, and weekly routine. This is a demo unlock. No payment will be collected.</p><div className="mt-6 rounded-2xl border border-lavender/20 bg-lilac/60 p-4 text-sm">No card, checkout, or payment service is involved. The unlock lasts only for this open session.</div><Button className="mt-6 w-full" onClick={() => { onUnlock(); setModal(false); }}>Unlock demo report</Button></div></div>}
  </main>;
}
