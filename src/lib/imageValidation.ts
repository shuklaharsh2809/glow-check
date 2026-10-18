export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function validateImageFile(file: File): string | null {
  if (!TYPES.has(file.type)) return 'Choose a JPEG, PNG, or WebP image.';
  if (file.size > MAX_IMAGE_BYTES) return 'Choose an image smaller than 10 MB.';
  if (file.size === 0) return 'This image appears to be empty or corrupted.';
  return null;
}

export function decodeImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => image.naturalWidth && image.naturalHeight ? resolve(image) : reject(new Error('Invalid dimensions'));
    image.onerror = () => reject(new Error('Image decoding failed'));
    image.src = url;
  });
}
