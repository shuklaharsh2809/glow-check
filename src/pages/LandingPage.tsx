import { ArrowRight, Camera, LockKeyhole, ScanFace, Sparkles, WandSparkles } from 'lucide-react';
import { Button } from '../components/Button';
import { PrivacyNotice } from '../components/PrivacyNotice';

export function LandingPage({ onStart }: { onStart: () => void }) {
  const steps = [
    [Camera, 'Capture', 'Take a fresh portrait in the guided camera. No uploads or camera-roll access.'],
    [ScanFace, 'Understand', 'Your browser checks framing, light, and image clarity on-device.'],
    [WandSparkles, 'Refine', 'Turn measurable photo conditions into small, useful adjustments.'],
  ] as const;

  return <main>
    <section className="relative grid min-h-[calc(100vh-4.75rem)] items-center gap-10 py-12 lg:grid-cols-[1.08fr_.92fr] lg:py-16">
      <div className="hero-halo" aria-hidden="true"/>
      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-black/[.08] bg-white/70 px-3 py-2 text-[.62rem] font-bold uppercase tracking-[.18em] text-black/50 shadow-sm backdrop-blur"><Sparkles className="h-3.5 w-3.5 text-lavender"/>Your private portrait studio</div>
        <h1 className="mt-7 font-display text-[3.4rem] leading-[.92] tracking-[-.055em] sm:text-7xl lg:text-[5.4rem]">See your portrait<br/>with <em className="font-normal text-lavender">fresh eyes.</em></h1>
        <p className="mt-7 max-w-xl text-base leading-8 text-black/55 sm:text-lg">Private, practical feedback on the details that shape a photo: light, composition, clarity, and presentation.</p>
        <div className="mt-9 flex flex-wrap items-center gap-4"><Button onClick={onStart} className="group">Begin my GlowCheck <ArrowRight className="ml-3 inline h-4 w-4 transition-transform group-hover:translate-x-1"/></Button><span className="flex items-center gap-2 text-xs text-black/40"><LockKeyhole className="h-3.5 w-3.5"/>Captured and analyzed locally</span></div>
        <div className="mt-12 grid max-w-xl grid-cols-3 border-t border-black/[.08] pt-6"><div><strong className="font-display text-xl">~60 sec</strong><p className="mt-1 text-[.62rem] uppercase tracking-[.13em] text-black/35">to your report</p></div><div className="border-l border-black/[.08] pl-5"><strong className="font-display text-xl">100%</strong><p className="mt-1 text-[.62rem] uppercase tracking-[.13em] text-black/35">in your browser</p></div><div className="border-l border-black/[.08] pl-5"><strong className="font-display text-xl">₹5</strong><p className="mt-1 text-[.62rem] uppercase tracking-[.13em] text-black/35">demo unlock</p></div></div>
      </div>
      <div className="relative z-10 mx-auto w-full max-w-[28rem] py-4">
        <div className="absolute -left-7 top-14 hidden rounded-2xl border border-white/70 bg-white/80 p-4 shadow-luxe backdrop-blur sm:block"><p className="text-[.58rem] font-bold uppercase tracking-[.16em] text-black/35">Lighting</p><p className="mt-1 font-display text-lg">Soft & balanced</p></div>
        <div className="hero-device"><div className="hero-device-inner"><div className="flex items-center justify-between"><span className="text-[.58rem] font-bold uppercase tracking-[.18em] text-white/50">Example report</span><span className="h-2 w-2 rounded-full bg-[#ceb8c5] shadow-[0_0_18px_#ceb8c5]"/></div><div className="my-10 text-center"><div className="score-orbit"><span className="font-display text-6xl">82</span><small>of 100</small></div><p className="mt-5 text-[.6rem] font-bold uppercase tracking-[.2em] text-white/45">Photo presentation</p></div><div className="space-y-3"><div className="metric-line"><span>Framing</span><i style={{width:'86%'}}/></div><div className="metric-line"><span>Light</span><i style={{width:'78%'}}/></div><div className="metric-line"><span>Clarity</span><i style={{width:'84%'}}/></div></div><div className="mt-8 rounded-2xl border border-white/10 bg-white/[.06] p-4"><p className="text-[.58rem] font-bold uppercase tracking-[.16em] text-[#d9c2cf]">First recommendation</p><p className="mt-2 font-display text-xl">Let soft light lead.</p><p className="mt-1 text-xs leading-5 text-white/45">Move toward a window and let the light fall gently across the frame.</p></div></div></div>
        <div className="absolute -bottom-2 -right-5 rounded-2xl border border-white/60 bg-[#eee4e8]/90 p-4 shadow-luxe backdrop-blur"><Sparkles className="h-4 w-4 text-lavender"/><p className="mt-2 text-[.62rem] font-bold uppercase tracking-[.13em] text-black/45">Practical<br/>not judgmental</p></div>
      </div>
    </section>

    <section className="section-rule py-20"><div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr]"><div><p className="eyebrow">The ritual</p><h2 className="mt-4 max-w-sm font-display text-4xl leading-tight sm:text-5xl">A clearer photo in three considered steps.</h2><p className="mt-5 max-w-sm text-sm leading-7 text-black/50">No account, no image library, and no mysterious beauty score.</p></div><div className="grid gap-4 sm:grid-cols-3">{steps.map(([Icon,title,copy],index)=><article key={title} className="premium-card group"><div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#efe7eb] text-lavender"><Icon className="h-4 w-4"/></span><span className="font-display text-2xl text-black/15">0{index+1}</span></div><h3 className="mt-10 font-display text-2xl">{title}</h3><p className="mt-3 text-sm leading-6 text-black/50">{copy}</p></article>)}</div></div></section>

    <section className="py-20"><PrivacyNotice/></section>
  </main>;
}
