/**
 * Compresses a base64 data URI image using the Canvas API.
 * PDFs pass through unmodified since they cannot be canvas-compressed.
 */
export function compressImage(
  base64DataUri: string,
  maxWidth = 1200,
  maxHeight = 1600,
  quality = 0.7
): Promise<string> {
  // Pass through PDFs and non-image data URIs
  if (!base64DataUri.startsWith("data:image/")) {
    return Promise.resolve(base64DataUri);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Scale down if exceeding max dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => reject(new Error("Failed to load image for compression"));
    img.src = base64DataUri;
  });
}
