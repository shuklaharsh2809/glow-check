import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import type { PortraitOverlay as Overlay } from '../features/analysis/analysis.types';

export function PortraitOverlay({ imageUrl, overlay }: { imageUrl: string; overlay: Overlay | null }) {
  const [guides, setGuides] = useState(true);
  const w = overlay?.imageWidth ?? 1;
  const h = overlay?.imageHeight ?? 1;
  return <div className="relative h-full min-h-[24rem] overflow-hidden bg-black">
    <img src={imageUrl} alt="Your portrait with measurement guides" className="absolute inset-0 h-full w-full object-cover" />
    {/* "slice" mirrors object-cover so the guides stay aligned with the cropped photo. */}
    {overlay && guides && <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {overlay.lines.map(([a, b], i) => <line key={i} x1={a.x * w} y1={a.y * h} x2={b.x * w} y2={b.y * h} stroke="#f1dfe8" strokeOpacity=".75" strokeWidth={w * 0.0022} strokeDasharray={i === 0 ? `${w * 0.008} ${w * 0.006}` : undefined} />)}
      {overlay.points.map((p, i) => <circle key={i} cx={p.x * w} cy={p.y * h} r={w * 0.0048} fill="#fff" stroke="#73566a" strokeWidth={w * 0.0018} />)}
    </svg>}
    <div className="absolute inset-0 bg-gradient-to-t from-[#251b21] via-transparent to-black/20 md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[#251b21]/40" />
    <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
      <span className="rounded-full bg-black/40 px-3 py-1.5 text-[.55rem] font-bold uppercase tracking-[.16em] text-white backdrop-blur">Measured on-device</span>
      {overlay && <button type="button" onClick={() => setGuides((g) => !g)} className="flex min-h-9 items-center gap-1.5 rounded-full bg-white/85 px-3 text-[.55rem] font-bold uppercase tracking-[.14em] text-ink backdrop-blur" aria-pressed={guides}>{guides ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}{guides ? 'Hide guides' : 'Show guides'}</button>}
    </div>
  </div>;
}
