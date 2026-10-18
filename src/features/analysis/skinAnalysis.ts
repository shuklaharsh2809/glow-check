import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { SkinMetrics } from './analysis.types';

export interface PixelSource { data: Uint8ClampedArray; width: number; height: number }
export interface PatchStats { mean: number; median: number; texture: number; chromaMean: number; chromaSpread: number; count: number }

const clamp = (value: number, low = 0, high = 100) => Math.round(Math.max(low, Math.min(high, value)));
const luminanceAt = (d: Uint8ClampedArray, i: number) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];

export function samplePatch(src: PixelSource, cx: number, cy: number, radius: number): PatchStats | null {
  const { data, width, height } = src;
  const r2 = radius * radius;
  const lum: number[] = [];
  const chroma: number[] = [];
  let residualSq = 0;
  let residualCount = 0;
  for (let y = Math.max(1, Math.floor(cy - radius)); y <= Math.min(height - 2, Math.ceil(cy + radius)); y++) {
    for (let x = Math.max(1, Math.floor(cx - radius)); x <= Math.min(width - 2, Math.ceil(cx + radius)); x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 > r2) continue;
      const i = (y * width + x) * 4;
      const l = luminanceAt(data, i);
      lum.push(l);
      chroma.push((data[i] - data[i + 1]) / (data[i] + data[i + 1] + 1));
      // A Laplacian residual isolates fine texture (pores, bumps, blemishes) from smooth shading.
      const neighbours = (luminanceAt(data, i - 4) + luminanceAt(data, i + 4) + luminanceAt(data, i - width * 4) + luminanceAt(data, i + width * 4)) / 4;
      residualSq += (l - neighbours) ** 2;
      residualCount++;
    }
  }
  if (lum.length < 12) return null;
  const mean = lum.reduce((s, v) => s + v, 0) / lum.length;
  const sorted = [...lum].sort((a, b) => a - b);
  const chromaMean = chroma.reduce((s, v) => s + v, 0) / chroma.length;
  const chromaSpread = Math.sqrt(chroma.reduce((s, v) => s + (v - chromaMean) ** 2, 0) / chroma.length);
  return {
    mean,
    median: sorted[Math.floor(sorted.length / 2)],
    texture: (Math.sqrt(residualSq / residualCount) / Math.max(mean, 1)) * 100,
    chromaMean,
    chromaSpread,
    count: lum.length,
  };
}

export function scoreSkin(cheeks: [PatchStats, PatchStats], underEyes: [PatchStats, PatchStats]): SkinMetrics | null {
  const cheekMean = (cheeks[0].mean + cheeks[1].mean) / 2;
  // Very dark or blown-out skin regions cannot support a fair reading.
  if (cheekMean < 35 || cheekMean > 235) return null;
  const texture = (cheeks[0].texture + cheeks[1].texture) / 2;
  // Colour is compared within each cheek only, so side lighting that tints one cheek is not mistaken for uneven skin.
  const spread = (cheeks[0].chromaSpread + cheeks[1].chromaSpread) / 2;
  const ratio = (underEyes[0].median + underEyes[1].median) / (cheeks[0].median + cheeks[1].median);
  const clarity = clamp(100 - Math.max(0, texture - 1.6) * 17, 30);
  const evenness = clamp(100 - Math.max(0, spread - 0.022) * 1500, 30);
  // Rested under-eyes still read roughly 15% darker than the cheek apex because of the orbital contour.
  const underEye = clamp(100 - Math.max(0, 0.86 - ratio) * 300, 30);
  return { clarity, evenness, underEye, score: clamp(clarity * 0.4 + evenness * 0.3 + underEye * 0.3) };
}

const TARGET_IPD = 120;

export interface SkinRegions { cheeks: [PatchStats, PatchStats]; underEyes: [PatchStats, PatchStats] }

export function sampleSkinRegions(image: CanvasImageSource, landmarks: NormalizedLandmark[], width: number, height: number): SkinRegions | null {
  if (landmarks.length < 468) return null;
  const px = (i: number) => ({ x: landmarks[i].x * width, y: landmarks[i].y * height });
  const lerp = (a: number, b: number, t: number) => { const p = px(a), q = px(b); return { x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t }; };
  const ipd = Math.hypot(px(263).x - px(33).x, px(263).y - px(33).y) * 0.7;
  if (ipd < 45) return null;
  // Resample so skin detail is measured at the same face scale regardless of camera resolution or distance.
  const s = Math.min(1, TARGET_IPD / ipd);
  const xs = landmarks.map((p) => p.x * width), ys = landmarks.map((p) => p.y * height);
  const left = Math.max(0, Math.min(...xs)), top = Math.max(0, Math.min(...ys));
  const cropW = Math.min(width, Math.max(...xs)) - left, cropH = Math.min(height, Math.max(...ys)) - top;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(cropW * s));
  canvas.height = Math.max(1, Math.round(cropH * s));
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;
  context.drawImage(image, left, top, cropW, cropH, 0, 0, canvas.width, canvas.height);
  const src = context.getImageData(0, 0, canvas.width, canvas.height);
  const local = (p: { x: number; y: number }) => ({ x: (p.x - left) * s, y: (p.y - top) * s });
  const patch = (p: { x: number; y: number }, r: number) => { const q = local(p); return samplePatch(src, q.x, q.y, r * ipd * s); };
  const cheekR = patch(lerp(119, 50, 0.6), 0.13), cheekL = patch(lerp(348, 280, 0.6), 0.13);
  const eyeR = patch(lerp(145, 119, 0.65), 0.06), eyeL = patch(lerp(374, 348, 0.65), 0.06);
  if (!cheekR || !cheekL || !eyeR || !eyeL) return null;
  return { cheeks: [cheekR, cheekL], underEyes: [eyeR, eyeL] };
}

export function getSkinMetrics(image: CanvasImageSource, landmarks: NormalizedLandmark[], width: number, height: number): SkinMetrics | null {
  const regions = sampleSkinRegions(image, landmarks, width, height);
  return regions && scoreSkin(regions.cheeks, regions.underEyes);
}
