const clamp = (value: number) => Math.max(0, Math.min(100, value));

export function brightnessFromPixels(data: Uint8ClampedArray): number | null {
  if (data.length < 4 || data.length % 4 !== 0) return null;
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) {
    sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  }
  return clamp((sum / (data.length / 4) / 255) * 100);
}

export function sharpnessFromImageData(image: ImageData): number | null {
  const { data, width, height } = image;
  if (width < 3 || height < 3 || data.length !== width * height * 4) return null;
  let gradient = 0;
  let samples = 0;
  const luminance = (index: number) =>
    0.2126 * data[index] + 0.7152 * data[index + 1] + 0.0722 * data[index + 2];
  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      const i = (y * width + x) * 4;
      gradient += Math.abs(luminance(i) - luminance(i - 4));
      gradient += Math.abs(luminance(i) - luminance(i - width * 4));
      samples += 2;
    }
  }
  if (!samples) return null;
  // A mean neighbor gradient near 18 is normally crisp for a resized portrait.
  return clamp((gradient / samples / 18) * 100);
}

export function getQualityMetrics(source: CanvasImageSource, width: number, height: number) {
  const maxSide = 360;
  const scale = Math.min(1, maxSide / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return { brightnessScore: null, sharpnessScore: null };
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  return {
    brightnessScore: brightnessFromPixels(imageData.data),
    sharpnessScore: sharpnessFromImageData(imageData),
  };
}
