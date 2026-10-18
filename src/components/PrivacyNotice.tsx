import { ShieldCheck } from 'lucide-react';
export function PrivacyNotice() {
  return <section className="rounded-3xl bg-ink p-7 text-white md:p-10"><ShieldCheck className="h-7 w-7 text-[#cbbbe2]" /><h2 className="mt-5 font-display text-3xl">Your photo stays in this browser.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">GlowCheck analyzes the selected photo locally in the normal supported flow. It does not upload or persist your photo, name, age, landmarks, or results. Reset clears the active session. The MediaPipe model files are downloaded from versioned public hosts; browser extensions and device software remain outside this app’s control.</p></section>;
}
