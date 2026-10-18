import { describe, expect, it } from 'vitest';
import { samplePatch, scoreSkin, type PixelSource } from './skinAnalysis';

function image(fill: (x: number, y: number) => [number, number, number], size = 40): PixelSource {
  const data = new Uint8ClampedArray(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) data.set([...fill(x, y), 255], (y * size + x) * 4);
  return { data, width: size, height: size };
}

// Deterministic pseudo-noise so texture tests are repeatable.
const noise = (x: number, y: number) => ((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1 + 1) % 1;
const smooth = image(() => [200, 160, 140]);
const rough = image((x, y) => { const n = (noise(x, y) - 0.5) * 50; return [200 + n, 160 + n, 140 + n]; });
const blotchy = image((x, y) => (noise(x, y) > 0.5 ? [215, 150, 140] : [190, 165, 140]));
const patch = (src: PixelSource) => samplePatch(src, 20, 20, 12)!;

describe('skin analysis', () => {
  it('measures more texture on a rough patch than a smooth one', () => {
    expect(patch(rough).texture).toBeGreaterThan(patch(smooth).texture);
    expect(patch(smooth).texture).toBe(0);
  });

  it('scores smooth, even skin with bright under-eyes highly', () => {
    const skin = scoreSkin([patch(smooth), patch(smooth)], [patch(smooth), patch(smooth)])!;
    expect(skin).toEqual({ clarity: 100, evenness: 100, underEye: 100, score: 100 });
  });

  it('lowers clarity for texture, evenness for blotches, and under-eye for darkness', () => {
    const dark = patch(image(() => [140, 110, 95]));
    expect(scoreSkin([patch(rough), patch(rough)], [patch(rough), patch(rough)])!.clarity).toBeLessThan(80);
    const skin = scoreSkin([patch(blotchy), patch(blotchy)], [dark, dark])!;
    expect(skin.evenness).toBeLessThan(70);
    expect(skin.underEye).toBeLessThan(75);
  });

  it('refuses to score underexposed skin', () => {
    const black = patch(image(() => [10, 8, 8]));
    expect(scoreSkin([black, black], [black, black])).toBeNull();
  });
});
