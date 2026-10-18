import type { AnalysisResult, FaceMetric, FaceShape, MetricId } from '../analysis/analysis.types';
import type { GlowReport, PlanItem, RoutineBlock, Strength } from './report.types';

const FREE_PLAN_ITEMS = 3;
const PREMIUM_PLAN_ITEMS = 6;

export const FACE_SHAPE_COPY: Record<FaceShape, { summary: string; hair: string[]; frames: string }> = {
  oval: {
    summary: 'balanced length and width with a softly tapered jaw — the most versatile shape for styling',
    hair: ['Almost any cut works; a textured crop, side part, or long layers all suit you.', 'Keep the forehead at least partly visible so your balanced proportions show.', 'Avoid heavy fringes that hide your best asset: balance.'],
    frames: 'Most frames suit you — try slightly wider-than-face rectangles or classic wayfarers.',
  },
  round: {
    summary: 'soft curves with similar width and length, which reads as youthful and approachable',
    hair: ['Add height at the crown and keep the sides tighter to lengthen the face.', 'Side parts and longer layers that fall past the chin create vertical lines.', 'If you grow facial hair, keep it fuller on the chin and shorter on the cheeks.'],
    frames: 'Angular or rectangular frames add structure.',
  },
  square: {
    summary: 'a strong, angular jaw and broad forehead — a bold, photogenic structure',
    hair: ['Soften the angles with texture: waves, a textured quiff, or side-swept layers.', 'Avoid severe, geometric cuts that repeat the jaw’s straight lines.', 'Light stubble or a clean shave both showcase the jaw.'],
    frames: 'Round or oval frames balance the angles.',
  },
  heart: {
    summary: 'wider cheekbones and forehead tapering to a delicate chin',
    hair: ['Side-swept fringes reduce forehead width visually.', 'Chin-length volume or medium textured styles add width at the jaw.', 'If you grow facial hair, a fuller chin area balances the taper.'],
    frames: 'Bottom-heavy frames, aviators, or rimless styles balance a wider brow.',
  },
  oblong: {
    summary: 'an elegant, longer face with refined vertical structure',
    hair: ['Add width at the sides and avoid extra height on top.', 'A fringe or curtain bangs shorten the face visually.', 'Waves and side volume suit you; skip tall pompadours.'],
    frames: 'Taller, oversized frames break up length.',
  },
  diamond: {
    summary: 'high, prominent cheekbones with a narrower forehead and chin — a striking, sculpted shape',
    hair: ['Keep fullness at the forehead and chin to frame the cheekbones.', 'A soft fringe or tucked-behind-the-ear styles show off cheekbone width.', 'Chin-length layers add balance at the jaw.'],
    frames: 'Oval, cat-eye, or rimless frames highlight the cheekbones.',
  },
};

const STRENGTH_COPY: Record<MetricId, { title: string; detail: (m: FaceMetric) => string; weight: number }> = {
  canthalTilt: { title: 'Positive canthal tilt', weight: 10, detail: (m) => `Your outer eye corners sit slightly higher than the inner corners (${m.display}). This upswept eye shape reads as alert and youthful and is one of the most consistently admired eye traits.` },
  jawDefinition: { title: 'Defined jawline', weight: 9, detail: (m) => `Your face tapers clearly from cheekbones to jaw (ratio ${m.display}). A visible jaw contour signals definition and leanness and photographs sharply.` },
  eyeSpacing: { title: 'Well-spaced eyes', weight: 8, detail: () => 'The gap between your eyes is in balance with their width — the classic “rule of fifths” proportion that makes a face feel harmonious at a glance.' },
  facialThirds: { title: 'Balanced facial thirds', weight: 8, detail: (m) => `Your mid-face and lower face are close to equal in height (${m.display}), the proportion artists use as the template for a balanced face.` },
  midfaceRatio: { title: 'Compact midface', weight: 7, detail: (m) => `Your eye spacing is well matched to the distance from eyes to lips (${m.display}). A compact midface tends to read as youthful and attractive.` },
  noseWidth: { title: 'Harmonious nose', weight: 6, detail: () => 'Your nose width closely matches the space between your eyes, the textbook proportion for a balanced central face.' },
  lipRatio: { title: 'Balanced lips', weight: 6, detail: (m) => `Your lower lip is fuller than the upper (${m.display}), close to the roughly 1 : 1.6 ratio often rated most attractive.` },
  chinBalance: { title: 'Balanced chin', weight: 5, detail: (m) => `The space from nose to lips and from lips to chin is well proportioned (${m.display}), giving your lower face a stable, refined profile.` },
  mouthWidth: { title: 'Well-proportioned mouth', weight: 4, detail: () => 'Your mouth width sits in proportion with your nose, which helps your smile look natural and balanced.' },
};

const metric = (r: AnalysisResult, id: MetricId) => r.metrics.find((m) => m.id === id) ?? null;
const outside = (m: FaceMetric | null, direction?: 'low' | 'high') => !!m && m.verdict !== 'ideal' && (!direction || m.direction === direction);

export function findStrengths(r: AnalysisResult): Strength[] {
  const strengths: Array<Strength & { weight: number }> = [];
  for (const m of r.metrics) {
    if (m.verdict !== 'ideal') continue;
    const copy = STRENGTH_COPY[m.id];
    strengths.push({ id: m.id, title: copy.title, detail: copy.detail(m), value: m.display, weight: copy.weight });
  }
  if (r.symmetryScore !== null && r.symmetryScore >= 85) strengths.push({ id: 'symmetry', title: 'High facial symmetry', detail: `Your left and right features mirror each other closely (${r.symmetryScore}/100). Symmetry is one of the strongest universal attractiveness cues.`, value: `${r.symmetryScore}/100`, weight: 9.5 });
  if (r.skin && r.skin.clarity >= 80) strengths.push({ id: 'clarity', title: 'Smooth skin texture', detail: 'Your skin reads as smooth and refined in this photo, which is strongly linked to perceived health and attractiveness.', value: `${r.skin.clarity}/100`, weight: 7.5 });
  if (r.skin && r.skin.evenness >= 82) strengths.push({ id: 'evenness', title: 'Even skin tone', detail: 'Your skin tone looks even across both cheeks. Even colouring is one of the clearest cues of a healthy glow.', value: `${r.skin.evenness}/100`, weight: 7 });
  if (r.skin && r.skin.underEye >= 88) strengths.push({ id: 'under-eye', title: 'Bright, rested eyes', detail: 'There is little visible darkness under your eyes, which makes you look rested and alert.', value: `${r.skin.underEye}/100`, weight: 6.5 });
  if (r.expressionTone === 'warm') strengths.push({ id: 'smile', title: 'Warm, genuine smile', detail: 'Your smile engages your whole face. Smiling faces are consistently rated as more attractive and trustworthy.', value: null, weight: 8.5 });
  if (r.faceShape) strengths.push({ id: 'shape', title: `${r.faceShape[0].toUpperCase()}${r.faceShape.slice(1)} face shape`, detail: `Your face reads as ${r.faceShape}: ${FACE_SHAPE_COPY[r.faceShape].summary}.`, value: null, weight: r.faceShape === 'oval' ? 6 : 3 });
  // Always surface the closest-to-ideal measurement so every report leads with something genuine.
  if (strengths.length < 3) {
    const best = [...r.metrics].filter((m) => m.verdict === 'close').sort((a, b) => b.score - a.score)[0];
    if (best) strengths.push({ id: best.id, title: `Near-ideal ${best.label.toLowerCase()}`, detail: `Your ${best.label.toLowerCase()} (${best.display}) sits just outside the classic ideal range — close enough to read as balanced.`, value: best.display, weight: 2 });
  }
  return strengths.sort((a, b) => b.weight - a.weight).slice(0, 5).map(({ weight: _weight, ...s }) => s);
}

type Candidate = Omit<PlanItem, 'priority'> & { priority: number; when: boolean };

function candidates(r: AnalysisResult, age: number): Candidate[] {
  const teen = age < 18;
  const skin = r.skin;
  const jaw = metric(r, 'jawDefinition');
  const tilt = metric(r, 'canthalTilt');
  const spacing = metric(r, 'eyeSpacing');
  const lips = metric(r, 'lipRatio');
  const thirds = metric(r, 'facialThirds');
  const chin = metric(r, 'chinBalance');
  const nose = metric(r, 'noseWidth');
  const tiredEyes = !!skin && skin.underEye < 78;
  const textured = !!skin && skin.clarity < 72;
  const uneven = !!skin && skin.evenness < 72;
  const softJaw = outside(jaw, 'low');
  // Body-fat advice only when the jaw is clearly soft; a near-ideal reading gets grooming and posture tips instead.
  const verySoftJaw = softJaw && jaw?.verdict === 'distinct';
  const shape = r.faceShape;

  return [
    { id: 'jaw-fitness', title: 'Reveal a sharper jawline', category: 'Fitness', impact: 'High', timeframe: '8–12 weeks', priority: 96, when: verySoftJaw, isGeneral: false,
      why: `Your cheek-to-jaw ratio is ${jaw?.display} (defined range starts at 1.22). Facial definition is driven mostly by overall body fat, so the jaw sharpens as body composition improves.`,
      steps: teen
        ? ['Aim for 60 minutes of activity daily — sports, cycling, or brisk walking all count.', 'Build meals around protein, vegetables, and whole grains; avoid restrictive dieting while you are still growing.', 'Swap sugary drinks for water.']
        : ['Do 150+ minutes of cardio a week (brisk walking, cycling, running) plus 2–3 strength sessions.', 'Eat in a gentle calorie deficit (about 300–500 kcal/day) with 1.6 g protein per kg of body weight.', 'Track a weekly front-facing photo in the same light — the jaw usually shows change before the scale does.'] },
    { id: 'depuff', title: 'De-puff your face', category: 'Nutrition', impact: 'Medium', timeframe: '3–7 days', priority: 80, when: verySoftJaw || tiredEyes, isGeneral: false,
      why: verySoftJaw ? 'Water retention softens the jaw and cheek contour, and it responds within days.' : 'Puffiness and fluid under the eyes deepen shadows; reducing sodium and alcohol helps quickly.',
      steps: ['Drink 2–3 litres of water spread through the day.', 'Cut back on salty, processed foods and late-night meals.', teen ? 'Limit energy drinks and sugary sodas.' : 'Limit alcohol, especially within 3 hours of bed.', 'Eat potassium-rich foods — bananas, spinach, beans, coconut water.'] },
    { id: 'posture', title: 'Fix posture for a cleaner jaw and neck', category: 'Lifestyle', impact: 'Medium', timeframe: '2–4 weeks', priority: 70, when: softJaw, isGeneral: false,
      why: 'Forward-head posture compresses the area under the chin and blurs the jaw-to-neck angle in photos.',
      steps: ['Do 3 sets of 10 chin tucks daily: glide your head straight back, hold 3 seconds.', 'Raise your phone and screen to eye level.', 'In photos, push your forehead slightly forward and down to define the jawline.'] },
    { id: 'jaw-grooming', title: 'Use grooming to add jaw structure', category: 'Grooming', impact: 'Medium', timeframe: 'Immediate', priority: 66, when: softJaw, isGeneral: false,
      why: 'Grooming and contouring can draw a sharper jawline immediately while longer-term changes take effect.',
      steps: ['If you grow facial hair: a short boxed beard or defined stubble with a crisp neckline 1–2 cm above the Adam’s apple creates an instant jawline.', 'If you wear makeup: a matte contour one shade deeper just under the jawbone, blended down toward the neck.', 'Choose open collars or V-necks over high crew necks.'] },
    { id: 'sleep-reset', title: 'Reset sleep to brighten your eyes', category: 'Lifestyle', impact: 'High', timeframe: '1–2 weeks', priority: 94, when: tiredEyes, isGeneral: false,
      why: `Your under-eye area reads darker than your cheeks (score ${skin?.underEye}/100). Short or irregular sleep is the most common cause of dark circles and puffiness.`,
      steps: [teen ? 'Get 8–10 hours of sleep with a consistent bedtime, even on weekends.' : 'Get 7–9 hours of sleep with a consistent bedtime, even on weekends.', 'Put screens away 45 minutes before bed and keep the room cool and dark.', 'Sleep on your back with your head slightly raised to stop fluid pooling under the eyes.'] },
    { id: 'morning-light', title: 'Get morning sunlight', category: 'Lifestyle', impact: tiredEyes ? 'High' : 'Medium', timeframe: 'Daily · 10–15 min', priority: tiredEyes ? 88 : 58, when: true, isGeneral: !tiredEyes,
      why: tiredEyes ? 'Morning daylight sets your body clock, which deepens sleep and reduces the tired look around the eyes.' : 'Morning daylight sets your body clock for deeper sleep and supports vitamin D — both show up in your skin and energy.',
      steps: ['Step outside for 10–15 minutes within an hour of waking — no sunglasses, never look at the sun.', 'Pair it with a walk to boost circulation and that post-exercise flush.', 'Wear SPF on your face; for longer midday exposure, seek shade between 11 am and 3 pm.'] },
    { id: 'eye-care', title: 'Targeted under-eye care', category: 'Skincare', impact: 'Medium', timeframe: '2–6 weeks', priority: 72, when: tiredEyes, isGeneral: false,
      why: 'Topical care reduces puffiness and shadowing while sleep habits improve.',
      steps: ['Use a caffeine eye serum each morning; tap it in with your ring finger.', 'Apply a cold compress or chilled spoons for 5 minutes on puffy mornings.', 'If your eyes are often itchy or watery, allergies may be darkening the area — consider a pharmacist or doctor’s advice.'] },
    { id: 'clear-skin', title: 'Refine skin texture', category: 'Skincare', impact: 'High', timeframe: '6–12 weeks', priority: 93, when: textured, isGeneral: false,
      why: `Your cheek texture reads ${skin && skin.clarity < 50 ? 'notably ' : ''}uneven in this photo (clarity ${skin?.clarity}/100). Smoother texture is one of the strongest visible health cues.`,
      steps: [
        'Cleanse twice daily with a gentle, fragrance-free cleanser — no harsh scrubs.',
        teen ? 'Use a 2% salicylic acid or benzoyl peroxide 2.5% product on breakouts; ask a doctor before starting retinoids.' : 'Start a retinoid at night (adapalene 0.1% or retinol) 2–3 nights a week, building to nightly.',
        'Follow with a lightweight non-comedogenic moisturizer.',
        ...(skin && skin.clarity < 50 ? ['Persistent acne or scarring responds best to a dermatologist — prescription options work far faster.'] : []),
      ] },
    { id: 'skin-diet', title: 'Eat for a natural glow', category: 'Nutrition', impact: textured || uneven ? 'High' : 'Medium', timeframe: '4–8 weeks', priority: textured || uneven ? 86 : 52, when: true, isGeneral: !(textured || uneven),
      why: textured || uneven ? 'Diet affects breakouts and skin tone; high-sugar diets are linked to acne, while colourful produce adds a healthy warmth to skin.' : 'Studies find that eating more fruit and vegetables visibly improves skin colour within weeks — people rate that glow as more attractive.',
      steps: ['Eat 5+ portions of colourful fruit and veg daily — carrots, tomatoes, sweet potato, spinach, and berries are rich in skin-warming carotenoids.', 'Add omega-3s: oily fish twice a week, or walnuts, chia, and flax.', 'Reduce sugar, refined carbs, and, if you are breakout-prone, skimmed milk.', 'Drink water consistently rather than in bursts.'] },
    { id: 'even-tone', title: 'Even out your skin tone', category: 'Skincare', impact: 'High', timeframe: '4–8 weeks', priority: 90, when: uneven, isGeneral: false,
      why: `Colour varies across your cheeks (evenness ${skin?.evenness}/100), which can come from redness, marks, or sun spots.`,
      steps: ['Apply a vitamin C serum each morning before sunscreen.', 'Use niacinamide (4–5%) to calm redness and fade marks.', 'Avoid picking spots — post-blemish marks are the main cause of patchiness.', 'Daily SPF is essential; without it, tone treatments are undone by UV.'] },
    { id: 'spf', title: 'Wear SPF every single day', category: 'Skincare', impact: 'High', timeframe: 'Daily', priority: uneven ? 84 : 62, when: true, isGeneral: !uneven,
      why: 'UV exposure causes most uneven tone, dullness, and early ageing — sunscreen is the most proven appearance-preserving habit there is.',
      steps: ['Apply SPF 30+ broad-spectrum as the last step every morning, even when cloudy.', 'Use two finger-lengths for face and neck.', 'Reapply every 2 hours when outdoors.'] },
    { id: 'smile-squinch', title: 'Master the confident smile', category: 'Expression', impact: 'High', timeframe: 'Immediate', priority: r.expressionTone === 'neutral' ? 91 : 30, when: r.expressionTone !== 'warm', isGeneral: false,
      why: 'Your expression reads neutral. Faces with a genuine smile and engaged eyes are consistently rated more attractive than the same face at rest.',
      steps: ['“Squinch”: slightly raise your lower eyelids as if focusing — it reads as confident rather than startled.', 'Think of something funny just before the shot so the smile reaches your eyes.', 'Exhale and drop your shoulders before every photo to release jaw tension.'] },
    { id: 'brow-lift', title: 'Lift the eye area with brow shaping', category: 'Grooming', impact: 'Medium', timeframe: 'Immediate', priority: 74, when: outside(tilt, 'low'), isGeneral: false,
      why: `Your canthal tilt is ${tilt?.display}, which is perfectly normal but reads less upswept than the 3–9° most often admired.`,
      steps: ['Groom brows so the tail ends slightly higher than the start.', 'Remove stray hairs under the arch to open the eye area.', 'If you wear makeup: a subtle upward flick of liner at the outer corner, or tightline the upper lash line.'] },
    { id: 'eye-spacing', title: outside(spacing, 'high') ? 'Bring focus to the centre of the face' : 'Open up the eye area', category: 'Grooming', impact: 'Low', timeframe: 'Immediate', priority: 56, when: outside(spacing), isGeneral: false,
      why: `Your eye spacing is ${spacing?.display} of eye width (${spacing?.verdictLabel.toLowerCase()}). Brow shape can visually balance this.`,
      steps: outside(spacing, 'high')
        ? ['Let the inner brow start sit slightly closer to the nose — avoid over-plucking the centre.', 'If you wear makeup: deepen shadow at the inner corners.']
        : ['Clean up the space between your brows so they start in line with the inner eye corner.', 'If you wear makeup: brighten the inner corners and extend shadow outward.'] },
    { id: 'lip-care', title: 'Define and hydrate your lips', category: 'Grooming', impact: 'Low', timeframe: '1–2 weeks', priority: 54, when: outside(lips), isGeneral: false,
      why: `Your upper-to-lower lip ratio is ${lips?.display} (${lips?.verdictLabel.toLowerCase()}); hydrated, defined lips look fuller and more balanced.`,
      steps: ['Use an SPF lip balm daily and a thicker balm overnight.', 'Gently exfoliate lips once a week.', 'If you wear makeup: a liner matched to your lip colour can subtly balance upper and lower fullness.'] },
    { id: 'lower-face', title: 'Balance your lower-face proportions', category: 'Hair', impact: 'Low', timeframe: 'Next haircut', priority: 50, when: outside(thirds) || outside(chin), isGeneral: false,
      why: `Your facial proportions read as ${(outside(thirds) ? thirds : chin)?.verdictLabel.toLowerCase()}. Hair and facial-hair length can rebalance them visually.`,
      steps: (outside(thirds, 'low') || outside(chin, 'low'))
        ? ['Add volume at the crown or temples to draw the eye upward.', 'If you grow facial hair, keep the chin area short and the sides fuller.']
        : ['Keep height on top modest and add a little length at the chin — a short goatee or chin-length layers work well.', 'A soft fringe can shorten a longer midface.'] },
    { id: 'camera-distance', title: 'Stop your phone widening your nose', category: 'Photo', impact: 'Medium', timeframe: 'Immediate', priority: outside(nose, 'high') ? 76 : 44, when: true, isGeneral: !outside(nose, 'high'),
      why: outside(nose, 'high') ? `Your nose measures ${nose?.display} of the gap between your eyes. Close-range selfie lenses exaggerate the centre of the face by up to 30%.` : 'Close-range phone lenses enlarge the nose and shrink the ears, making any face look wider in the middle.',
      steps: ['Hold the camera at arm’s length or farther, or use the 2× lens from 1–1.5 m away.', 'Keep the lens at or slightly above eye level.', 'Face a window so soft light falls evenly on both sides of your face.'] },
    { id: 'hair-shape', title: shape ? `Hairstyles for your ${shape} face` : 'Choose a face-framing hairstyle', category: 'Hair', impact: 'High', timeframe: 'Next haircut', priority: 78, when: !!shape, isGeneral: false,
      why: shape ? `Your face shape reads as ${shape} — ${FACE_SHAPE_COPY[shape].summary}.` : 'Hairstyle is the biggest frame around your face.',
      steps: shape ? [...FACE_SHAPE_COPY[shape].hair, FACE_SHAPE_COPY[shape].frames] : [] },
    { id: 'move-daily', title: 'Train for a healthy flush', category: 'Fitness', impact: 'Medium', timeframe: '2–4 weeks', priority: 46, when: !verySoftJaw, isGeneral: true,
      why: 'Regular exercise improves circulation, sleep, and stress hormones — people who exercise look more vibrant in photos.',
      steps: ['Get your heart rate up for 30 minutes on most days.', 'Add 2 strength sessions a week to improve posture and how clothes sit.', 'Wash your face after sweaty workouts to prevent breakouts.'] },
    { id: 'colour-contrast', title: 'Wear colours that bring your face forward', category: 'Style', impact: 'Low', timeframe: 'Immediate', priority: 40, when: true, isGeneral: true,
      why: 'Clothing colour near the face changes how bright your skin and eyes look on camera.',
      steps: ['Compare a soft neutral and a richer colour near your face in the same light.', 'Choose the one where your eyes stand out first and under-eye shadows look lighter.'] },
  ];
}

function buildRoutine(r: AnalysisResult, plan: PlanItem[], age: number): RoutineBlock[] {
  const has = (id: string) => plan.some((p) => p.id === id);
  const morning = ['10–15 min of outdoor daylight within an hour of waking', 'Gentle cleanse or a splash of lukewarm water'];
  if (has('even-tone')) morning.push('Vitamin C serum');
  if (has('eye-care')) morning.push('Caffeine eye serum');
  morning.push('Moisturizer + SPF 30 or higher', 'A large glass of water before coffee');
  const evening = ['Cleanse to remove sunscreen, oil, and pollution'];
  if (has('clear-skin')) evening.push(age < 18 ? 'Spot-treat breakouts (salicylic acid or benzoyl peroxide)' : 'Retinoid 2–3 nights a week, building up gradually');
  else if (has('even-tone')) evening.push('Niacinamide serum');
  evening.push('Moisturizer, plus lip balm', 'Screens off 45 min before bed', age < 18 ? '8–10 hours of sleep' : '7–9 hours of sleep');
  const weekly = [has('jaw-fitness') ? '150 min cardio + 2–3 strength sessions' : '3–5 workouts that raise your heart rate', 'Brow tidy and hair touch-up every 2–4 weeks'];
  if (has('clear-skin')) weekly.push('One gentle exfoliation (BHA or AHA) — skip if skin feels irritated');
  weekly.push('Retake your GlowCheck every 4 weeks in the same light to track progress');
  return [{ time: 'Morning', items: morning }, { time: 'Evening', items: evening }, { time: 'Weekly', items: weekly }];
}

export function generateReport(result: AnalysisResult, age: number): GlowReport {
  const plan = candidates(result, age)
    .filter((c) => c.when && c.steps.length)
    .sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id))
    .map(({ when: _when, ...item }) => item);
  const visible = plan.slice(0, FREE_PLAN_ITEMS + PREMIUM_PLAN_ITEMS);
  return {
    strengths: findStrengths(result),
    free: visible.slice(0, FREE_PLAN_ITEMS),
    premium: visible.slice(FREE_PLAN_ITEMS),
    routine: buildRoutine(result, visible, age),
  };
}
