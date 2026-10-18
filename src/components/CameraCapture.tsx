import { useEffect, useRef } from 'react';
import { Camera, CameraOff, Check, ShieldCheck, Sparkles, SunMedium } from 'lucide-react';
import { trackEvent } from '../features/analytics/analytics';
import { useCamera } from '../hooks/useCamera';
import { Button } from './Button';

export function CameraCapture({ onCapture }: { onCapture: (file: File) => void }) {
  const { stream, error, start, stop } = useCamera();
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => { if (videoRef.current && stream) videoRef.current.srcObject = stream; }, [stream]);
  const open = async () => { const media = await start(); trackEvent(media ? 'camera_permission_granted' : 'camera_permission_denied'); };
  const capture = () => {
    const video = videoRef.current;
    if (!video?.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0);
    canvas.toBlob((blob) => { if (blob) { onCapture(new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' })); stop(); } }, 'image/jpeg', 0.9);
  };
  if (!stream) return <div className="mx-auto max-w-md">
    <div className="capture-shell overflow-hidden"><div className="relative grid aspect-[4/5] place-items-center overflow-hidden bg-[#20171d] p-8 text-center text-white"><div className="camera-glow"/><div className="relative"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-white/15 bg-white/10"><Camera className="h-7 w-7 text-[#dfcbd6]"/></span><h2 className="mt-6 font-display text-3xl">Open your camera</h2><p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-white/55">We’ll ask for permission once. Your live view and captured image stay on this device.</p><div className="mx-auto mt-7 flex max-w-xs justify-center gap-4 text-[.65rem] uppercase tracking-[.12em] text-white/50"><span className="flex items-center gap-1.5"><SunMedium className="h-3.5 w-3.5"/>Soft light</span><span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5"/>Clean lens</span></div></div></div></div>
    <Button type="button" onClick={open} className="mt-5 w-full"><Camera className="mr-2 inline h-4 w-4"/>Enable camera</Button>
    <p className="mt-3 flex items-center justify-center gap-2 text-center text-[.68rem] text-black/40"><ShieldCheck className="h-3.5 w-3.5"/>Permission is used only while this camera view is open.</p>
    {error && <p role="alert" className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
  </div>;
  return <div className="mx-auto max-w-md">
    <div className="capture-shell p-2"><div className="relative overflow-hidden rounded-[1.4rem] bg-black"><video ref={videoRef} autoPlay playsInline muted className="aspect-[4/5] w-full scale-x-[-1] object-cover"/><div className="camera-vignette"/><div className="face-guide" aria-hidden="true"/><span className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-[.6rem] font-bold uppercase tracking-[.16em] text-white backdrop-blur"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"/>Live</span><span className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-black/40 px-3 py-1.5 text-[.6rem] uppercase tracking-[.12em] text-white/80 backdrop-blur"><Check className="h-3 w-3"/>Face straight on · lips relaxed</span></div></div>
    <div className="relative mt-5 flex items-center justify-center"><button type="button" onClick={stop} className="absolute left-0 grid h-12 w-12 place-items-center rounded-2xl border border-black/10 bg-white transition hover:border-black/25" aria-label="Close camera"><CameraOff className="h-4 w-4"/></button><button type="button" onClick={capture} className="shutter" aria-label="Capture portrait"><span/></button><span className="absolute right-0 text-[.6rem] font-bold uppercase tracking-[.14em] text-black/35">Tap to<br/>capture</span></div>
  </div>;
}
