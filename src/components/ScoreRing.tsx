export function ScoreRing({ score }: { score: number | null }) {
  if (score === null) return <div className="flex h-36 w-36 items-center justify-center rounded-full border border-white/15 text-center text-xs font-semibold text-white/70">Not enough<br />information</div>;
  return <div className="relative grid h-36 w-36 place-items-center rounded-full p-[1px]" style={{ background: `conic-gradient(#d9c2cf ${score * 3.6}deg, rgba(255,255,255,.1) 0)` }} aria-label={`Appearance Impression Score: ${score} out of 100`}>
    <div className="grid h-[8.2rem] w-[8.2rem] place-items-center rounded-full bg-ink"><div className="text-center"><span className="font-display text-5xl text-white">{score}</span><p className="mt-1 text-[.5rem] uppercase tracking-[.18em] text-white/35">of 100</p></div></div>
  </div>;
}
