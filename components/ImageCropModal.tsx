"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";

interface ImageCropModalProps {
  imageSrc: string;
  aspectRatio?: number;
  onCropComplete: (croppedImageBase64: string) => void;
  onCancel: () => void;
}

export default function ImageCropModal({
  imageSrc,
  aspectRatio = 95 / 115, // ID card photo ratio (~3:4)
  onCropComplete,
  onCancel,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropChange = useCallback((location: { x: number; y: number }) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const onCropAreaComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCrop = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);

    try {
      const croppedBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedBase64);
    } catch (err) {
      console.error("Error cropping image:", err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Crop Photo / وێنە ببڕە
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Adjust the photo to fit the ID card format (3:4 ratio)
            <br />
            <span dir="rtl">وێنەکە ڕێک بکەرەوە بۆ قەبارەی کارتی ناسنامە</span>
          </p>
        </div>

        <div className="relative w-full" style={{ height: "400px" }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropAreaComplete}
          />
        </div>

        <div className="px-6 py-3 border-t border-gray-200">
          <label className="block text-sm text-gray-600 mb-1">
            Zoom / زووم
          </label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-emerald-600"
          />
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCrop}
            disabled={processing}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium disabled:opacity-50"
          >
            {processing ? "Processing..." : "Crop & Use"}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Creates a cropped image from a base64 source and pixel area.
 */
function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const MAX_DIM = 800;
      let outWidth = pixelCrop.width;
      let outHeight = pixelCrop.height;
      if (outWidth > MAX_DIM || outHeight > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / outWidth, MAX_DIM / outHeight);
        outWidth = Math.round(outWidth * ratio);
        outHeight = Math.round(outHeight * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = outWidth;
      canvas.height = outHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        outWidth,
        outHeight
      );

      resolve(canvas.toDataURL("image/jpeg", 0.75));
    };
    image.onerror = () => reject(new Error("Failed to load image"));
    image.src = imageSrc;
  });
}
