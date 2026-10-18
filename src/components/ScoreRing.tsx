export function ScoreRing({ score }: { score: number | null }) {
  if (score === null) return <div className="flex h-32 w-32 items-center justify-center rounded-full border-8 border-lilac text-center text-sm font-semibold">Not enough<br />information</div>;
  return <div className="relative grid h-32 w-32 place-items-center rounded-full" style={{ background: `conic-gradient(#81719d ${score * 3.6}deg, #e8e2db 0)` }} aria-label={`Photo Presentation Score: ${score} out of 100`}>
    <div className="grid h-24 w-24 place-items-center rounded-full bg-ivory"><span className="font-display text-4xl">{score}</span></div>
  </div>;
}
