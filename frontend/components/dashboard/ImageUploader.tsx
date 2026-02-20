'use client';

import React, { useRef, useState } from 'react';
import { uploadApi } from '../../lib/api';
import { useToast } from '../ui/Toast';

interface ImageUploaderProps {
  onUpload: (url: string) => void;
  label?: string;
  currentImageUrl?: string;
}

export function ImageUploader({ onUpload, label = 'Upload Image', currentImageUrl }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast('error', 'Please select an image file');
      return;
    }
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const { url } = await uploadApi.uploadImage(file);
      onUpload(url);
      toast('success', 'Image uploaded successfully');
    } catch {
      toast('error', 'Failed to upload image');
      setPreview(currentImageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer relative"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="text-sm text-neutral-500">Uploading…</p>
        </div>
      ) : preview ? (
        <div className="flex flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="h-32 object-contain rounded" />
          <p className="text-xs text-neutral-500">Click or drag to replace</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-neutral-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs">Drag & drop or click to browse</p>
        </div>
      )}
    </div>
  );
}
