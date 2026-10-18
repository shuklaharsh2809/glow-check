import { ArrowRight, Camera, ScanFace, WandSparkles } from 'lucide-react';
import { Button } from '../components/Button';
import { PrivacyNotice } from '../components/PrivacyNotice';

export function LandingPage({ onStart }: { onStart: () => void }) {
  return <main>
    <section className="grid min-h-[72vh] items-center gap-12 py-16 md:grid-cols-[1.2fr_.8fr] md:py-24">
      <div><p className="eyebrow">Private photo guidance</p><h1 className="mt-5 max-w-3xl font-display text-5xl leading-[.98] tracking-[-.035em] sm:text-7xl">Your look, with a little more intention.</h1><p className="mt-7 max-w-xl text-lg leading-8 text-black/60">Discover practical ways to improve your photo presentation, grooming, and personal style.</p><Button onClick={onStart} className="mt-8">Analyze my look <ArrowRight className="ml-2 inline h-4 w-4" /></Button><p className="mt-4 text-xs text-black/50">No account · Local photo processing · About two minutes</p></div>
      <div className="rotate-1 rounded-[2rem] border border-black/10 bg-white p-5 shadow-soft"><div className="rounded-2xl bg-lilac/50 p-5"><span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-widest">Example report</span><div className="my-10 text-center"><div className="mx-auto grid h-28 w-28 place-items-center rounded-full border-[10px] border-lavender"><span className="font-display text-4xl">82</span></div><p className="mt-3 text-xs uppercase tracking-widest text-black/50">Photo presentation</p></div></div><h3 className="mt-5 font-display text-2xl">Softer light, stronger frame</h3><p className="mt-2 text-sm leading-6 text-black/55">A practical, condition-based report. This preview is an example, not your result.</p></div>
    </section>
    <section className="border-y border-black/10 py-16"><p className="eyebrow">How it works</p><div className="mt-8 grid gap-5 md:grid-cols-3">{[[Camera,'Choose a photo','Capture a selfie or select an image you already have.'],[ScanFace,'Check the conditions','MediaPipe and Canvas measure face framing, light, and edge detail locally.'],[WandSparkles,'Try focused ideas','Get two free tips and preview three more in the ₹5 demo unlock.']].map(([Icon,title,copy],i) => { const I = Icon as typeof Camera; return <div key={title as string} className="rounded-2xl bg-white p-6"><span className="text-xs text-lavender">0{i+1}</span><I className="mt-8 h-6 w-6"/><h3 className="mt-4 font-display text-2xl">{title as string}</h3><p className="mt-2 text-sm leading-6 text-black/55">{copy as string}</p></div>})}</div></section>
    <section className="py-16"><PrivacyNotice /></section>
  </main>;
}
