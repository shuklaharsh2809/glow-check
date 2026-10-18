import { useCallback, useEffect, useRef, useState } from 'react';

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState('');
  const current = useRef<MediaStream | null>(null);
  const stop = useCallback(() => {
    current.current?.getTracks().forEach((track) => track.stop());
    current.current = null;
    setStream(null);
  }, []);
  const start = useCallback(async () => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) { setError('Camera access is unavailable here. Use image upload instead.'); return null; }
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false });
      current.current = media;
      setStream(media);
      return media;
    } catch {
      setError('Camera access was not available. Check browser permission or upload a photo instead.');
      return null;
    }
  }, []);
  useEffect(() => stop, [stop]);
  return { stream, error, start, stop };
}
