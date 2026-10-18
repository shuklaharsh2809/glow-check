import { ArrowLeft, ImagePlus, LoaderCircle, ShieldCheck, Trash2 } from 'lucide-react';
import { useEffect, useReducer, useRef, useState } from 'react';
import { Button } from '../components/Button';
import { CameraCapture } from '../components/CameraCapture';
import { resetAnalyticsSession, setAnalyticsConsent, trackEvent } from '../features/analytics/analytics';
import { analyzeImage } from '../features/analysis/faceLandmarker';
import { AnalysisError, type AnalysisResult } from '../features/analysis/analysis.types';
import { generateTips } from '../features/report/generateTips';
import { decodeImage, validateImageFile } from '../lib/imageValidation';
import { LandingPage } from '../pages/LandingPage';
import { ReportPage } from '../pages/ReportPage';

type Stage = 'landing' | 'details' | 'photo' | 'analyzing' | 'report';
interface State { stage: Stage; name: string; age: string; imageUrl: string | null; result: AnalysisResult | null; unlocked: boolean }
type Action = { type: 'stage'; stage: Stage } | { type: 'details'; name: string; age: string } | { type: 'image'; url: string | null } | { type: 'result'; result: AnalysisResult } | { type: 'unlock' } | { type: 'reset' };
const initial: State = { stage: 'landing', name: '', age: '', imageUrl: null, result: null, unlocked: false };
function reducer(state: State, action: Action): State {
  switch(action.type) { case 'stage': return {...state, stage: action.stage}; case 'details': return {...state, name: action.name, age: action.age, stage:'photo'}; case 'image': return {...state, imageUrl: action.url}; case 'result': return {...state, result: action.result, stage:'report'}; case 'unlock': return {...state, unlocked:true}; case 'reset': return initial; }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initial);
  const [error, setError] = useState('');
  const [consent, setConsent] = useState(false);
  const activeUrl = useRef<string | null>(null);
  const busy = useRef(false);
  useEffect(()=>{ trackEvent('landing_page_view'); },[]);
  useEffect(()=>()=>{ if(activeUrl.current) URL.revokeObjectURL(activeUrl.current); },[]);
  const chooseFile = async (file: File) => {
    setError(''); const validation = validateImageFile(file); if(validation){setError(validation);return;}
    const url=URL.createObjectURL(file);
    try { await decodeImage(url); if(activeUrl.current)URL.revokeObjectURL(activeUrl.current); activeUrl.current=url; dispatch({type:'image',url}); trackEvent('photo_selected',{source:file.name==='camera-photo.jpg'?'camera':'upload'}); }
    catch { URL.revokeObjectURL(url); setError('This image could not be read. Try another JPEG, PNG, or WebP file.'); }
  };
  const removeImage=()=>{if(activeUrl.current)URL.revokeObjectURL(activeUrl.current);activeUrl.current=null;dispatch({type:'image',url:null});};
  const analyze=async()=>{if(!state.imageUrl||busy.current)return;busy.current=true;setError('');dispatch({type:'stage',stage:'analyzing'});trackEvent('analysis_started');try{const image=await decodeImage(state.imageUrl);const result=await analyzeImage(image);dispatch({type:'result',result});trackEvent('analysis_completed',{outcome:'success'});trackEvent('report_viewed');}catch(cause){const message=cause instanceof Error?cause.message:'Analysis did not finish. Try again.';setError(message);dispatch({type:'stage',stage:'photo'});trackEvent('analysis_failed',{error_code:cause instanceof AnalysisError?cause.code:'unknown'});}finally{busy.current=false;}};
  const reset=()=>{removeImage();dispatch({type:'reset'});setError('');resetAnalyticsSession();trackEvent('session_reset');};
  const tips=state.result?generateTips(state.result):null;
  return <div className="min-h-screen"><header className="border-b border-black/10"><div className="page flex h-16 items-center justify-between"><button className="font-display text-2xl" onClick={reset}>GlowCheck</button>{state.stage!=='landing'&&<button className="text-sm text-black/55 hover:text-ink" onClick={reset}>Reset session</button>}</div></header><div className="page">
    {state.stage==='landing'&&<LandingPage onStart={()=>dispatch({type:'stage',stage:'details'})}/>} 
    {state.stage==='details'&&<Details onBack={()=>dispatch({type:'stage',stage:'landing'})} onContinue={(name,age)=>dispatch({type:'details',name,age})}/>} 
    {(state.stage==='photo'||state.stage==='analyzing')&&<PhotoStep imageUrl={state.imageUrl} error={error} busy={state.stage==='analyzing'} onBack={()=>dispatch({type:'stage',stage:'details'})} onFile={chooseFile} onRemove={removeImage} onAnalyze={analyze}/>} 
    {state.stage==='report'&&state.result&&tips&&<ReportPage name={state.name} result={state.result} tips={tips} unlocked={state.unlocked} onUnlock={()=>{dispatch({type:'unlock'});trackEvent('demo_unlock_confirmed')}} onReset={reset}/>} 
  </div><footer className="border-t border-black/10 py-8"><div className="page flex flex-col gap-5 text-xs leading-5 text-black/50 md:flex-row md:justify-between"><p>© GlowCheck · Photo conditions, never attractiveness.</p><label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={consent} onChange={async e=>{setConsent(e.target.checked);await setAnalyticsConsent(e.target.checked)}}/>Allow anonymous product events (optional)</label></div></footer></div>;
}

function Details({onBack,onContinue}:{onBack:()=>void;onContinue:(name:string,age:string)=>void}){
  const [name,setName]=useState('');const [age,setAge]=useState('');const [error,setError]=useState('');
  const submit=(e:React.FormEvent)=>{e.preventDefault();const n=name.trim();const a=Number(age);if(!n||n.length>40){setError('Enter a first name of 40 characters or fewer.');return;}if(!Number.isInteger(a)||a<13||a>120){setError('Enter an age from 13 to 120.');return;}onContinue(n,a.toString())};
  return <main className="mx-auto max-w-xl py-12 md:py-20"><button onClick={onBack} className="mb-8 flex min-h-11 items-center gap-2 text-sm"><ArrowLeft className="h-4 w-4"/>Back</button><p className="eyebrow">Step 1 of 2</p><h1 className="mt-4 font-display text-4xl">A little context</h1><p className="mt-3 text-sm leading-6 text-black/55">We use your first name only for the greeting. Age is collected for this experiment but does not affect your score or tips.</p><form onSubmit={submit} className="mt-8 space-y-5"><label className="block text-sm font-semibold">First name<input autoFocus autoComplete="given-name" value={name} onChange={e=>setName(e.target.value)} className="input mt-2"/></label><label className="block text-sm font-semibold">Age<input inputMode="numeric" type="number" min="13" max="120" value={age} onChange={e=>setAge(e.target.value)} className="input mt-2"/></label>{error&&<p role="alert" className="text-sm text-clay">{error}</p>}<Button type="submit" className="w-full">Continue</Button></form><p className="mt-6 flex gap-2 text-xs leading-5 text-black/45"><ShieldCheck className="h-4 w-4 shrink-0"/>These details live in memory only and are cleared when you reset or close the page.</p></main>;
}

function PhotoStep({imageUrl,error,busy,onBack,onFile,onRemove,onAnalyze}:{imageUrl:string|null;error:string;busy:boolean;onBack:()=>void;onFile:(f:File)=>void;onRemove:()=>void;onAnalyze:()=>void}){
  return <main className="mx-auto max-w-xl py-12 md:py-20"><button onClick={onBack} disabled={busy} className="mb-8 flex min-h-11 items-center gap-2 text-sm"><ArrowLeft className="h-4 w-4"/>Back</button><p className="eyebrow">Step 2 of 2</p><h1 className="mt-4 font-display text-4xl">Choose a clear portrait</h1><p className="mt-3 text-sm leading-6 text-black/55">Use one visible face, even lighting, and a steady shot. Your image stays on this device.</p>{imageUrl?<div className="mt-8"><img src={imageUrl} alt="Selected portrait preview" className="max-h-[55vh] w-full rounded-3xl bg-black/5 object-contain"/><div className="mt-4 flex gap-3"><Button onClick={onAnalyze} disabled={busy} className="flex-1">{busy?<><LoaderCircle className="mr-2 inline h-4 w-4 animate-spin"/>Loading model & analyzing…</>:'Analyze locally'}</Button><Button variant="secondary" onClick={onRemove} disabled={busy}><Trash2 className="h-4 w-4"/><span className="sr-only">Remove photo</span></Button></div></div>:<div className="mt-8 space-y-4"><label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-black/20 bg-white p-6 text-center hover:border-lavender"><ImagePlus className="h-6 w-6"/><span className="mt-3 text-sm font-semibold">Upload a photo</span><span className="mt-1 text-xs text-black/45">JPEG, PNG, or WebP · up to 10 MB</span><input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={e=>{const f=e.target.files?.[0];if(f)onFile(f);e.target.value=''}}/></label><div className="flex items-center gap-3 text-xs text-black/35"><span className="h-px flex-1 bg-black/10"/>or<span className="h-px flex-1 bg-black/10"/></div><CameraCapture onCapture={onFile}/></div>}{error&&<div role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">{error} <button className="ml-1 underline" onClick={onRemove}>Choose another photo</button></div>}<div aria-live="polite" className="sr-only">{busy?'The local model is loading and analyzing your image.':''}</div></main>;
}
