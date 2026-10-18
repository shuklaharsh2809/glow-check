import { describe, expect, it } from 'vitest';
import { brightnessFromPixels, sharpnessFromImageData } from './imageQuality';

describe('image quality', () => {
  it('normalizes black and white brightness', () => {
    expect(brightnessFromPixels(new Uint8ClampedArray([0, 0, 0, 255]))).toBe(0);
    expect(brightnessFromPixels(new Uint8ClampedArray([255, 255, 255, 255]))).toBeCloseTo(100);
  });
  it('rejects malformed input', () => expect(brightnessFromPixels(new Uint8ClampedArray([1, 2]))).toBeNull());
  it('reports more detail for a high-contrast pattern', () => {
    const flat = { data: new Uint8ClampedArray(5 * 5 * 4).fill(100), width: 5, height: 5 } as ImageData;
    const patterned = new Uint8ClampedArray(5 * 5 * 4);
    for (let i=0;i<patterned.length;i+=4) { const v=(Math.floor(i/4)%2)*255; patterned.set([v,v,v,255],i); }
    expect(sharpnessFromImageData({ data: patterned, width: 5, height: 5 } as ImageData)!).toBeGreaterThan(sharpnessFromImageData(flat)!);
  });
});
