import { useEffect, useRef } from 'react';
import { Camera, CameraOff, Circle } from 'lucide-react';
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
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => { if (blob) { onCapture(new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' })); stop(); } }, 'image/jpeg', 0.9);
  };
  if (!stream) return <div className="space-y-3"><Button type="button" variant="secondary" onClick={open} className="w-full"><Camera className="mr-2 inline h-4 w-4" />Use camera</Button>{error && <p role="alert" className="text-sm text-clay">{error}</p>}</div>;
  return <div className="space-y-3">
    <div className="relative overflow-hidden rounded-2xl bg-black"><video ref={videoRef} autoPlay playsInline muted className="aspect-[4/5] w-full object-cover" /></div>
    <div className="flex gap-3"><Button type="button" onClick={capture} className="flex-1"><Circle className="mr-2 inline h-4 w-4" />Capture</Button><Button type="button" variant="secondary" onClick={stop}><CameraOff className="h-4 w-4" /><span className="sr-only">Close camera</span></Button></div>
  </div>;
}
