'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface ClipRegion {
  xFrac: number;
  yFrac: number;
  wFrac: number;
  hFrac: number;
}

interface FabricOverlayProps {
  fabricImageUrl?: string;
  fabricColor?: string;
  /** SVG silhouette dimensions in pixels */
  width: number;
  height: number;
  /** Clip region as fractions of width/height: [x, y, w, h] for garment torso area */
  clipRegion?: ClipRegion;
}

// Default clip region covers the torso area of the silhouette
const DEFAULT_CLIP: ClipRegion = {
  xFrac: 0.2,
  yFrac: 0.2,
  wFrac: 0.6,
  hFrac: 0.65,
};

export function FabricOverlay({
  fabricImageUrl,
  fabricColor = '#4f46e5',
  width,
  height,
  clipRegion,
}: FabricOverlayProps) {
  const activeClip: ClipRegion = clipRegion ?? DEFAULT_CLIP;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [opacity, setOpacity] = useState(0.65);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const clipX = activeClip.xFrac * canvas.width;
    const clipY = activeClip.yFrac * canvas.height;
    const clipW = activeClip.wFrac * canvas.width;
    const clipH = activeClip.hFrac * canvas.height;

    ctx.save();
    // Rounded clip region
    ctx.beginPath();
    const r = clipW * 0.12;
    ctx.moveTo(clipX + r, clipY);
    ctx.arcTo(clipX + clipW, clipY, clipX + clipW, clipY + clipH, r);
    ctx.arcTo(clipX + clipW, clipY + clipH, clipX, clipY + clipH, r * 0.5);
    ctx.arcTo(clipX, clipY + clipH, clipX, clipY, r * 0.5);
    ctx.arcTo(clipX, clipY, clipX + clipW, clipY, r);
    ctx.closePath();
    ctx.clip();

    ctx.globalAlpha = opacity;

    if (imgRef.current) {
      // Tile the fabric image as a pattern
      const pattern = ctx.createPattern(imgRef.current, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(clipX, clipY, clipW, clipH);
      }
    } else {
      // Fallback: solid color
      ctx.fillStyle = fabricColor;
      ctx.fillRect(clipX, clipY, clipW, clipH);
    }

    ctx.restore();
  }, [fabricColor, opacity, activeClip]);

  // Load fabric image
  useEffect(() => {
    if (!fabricImageUrl) {
      imgRef.current = null;
      draw();
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      draw();
    };
    img.onerror = () => {
      imgRef.current = null;
      draw();
    };
    img.src = fabricImageUrl;
  }, [fabricImageUrl, draw]);

  // Re-draw when opacity changes or dimensions change
  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [draw, width, height]);

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative z-10 mt-2 flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-neutral-200">
        <label htmlFor="overlay-opacity" className="text-xs text-neutral-600 whitespace-nowrap font-medium">
          Fabric opacity
        </label>
        <input
          id="overlay-opacity"
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={opacity}
          onChange={(e) => setOpacity(parseFloat(e.target.value))}
          className="w-24 accent-primary-600"
        />
        <span className="text-xs text-neutral-500 w-8 text-right">{Math.round(opacity * 100)}%</span>
      </div>
    </div>
  );
}
