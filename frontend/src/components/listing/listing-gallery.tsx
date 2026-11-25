"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

export interface ListingGalleryProps {
  images: string[];
  title: string;
}

export function ListingGallery({ images, title }: ListingGalleryProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="flex h-80 w-full items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <ImageIcon className="h-10 w-10" />
      </div>
    );
  }

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="space-y-3">
      {/* Main Image Display */}
      <div className="relative aspect-16/9 sm:aspect-21/9 w-full overflow-hidden rounded-xl bg-slate-900 shadow-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[selectedIndex]}
          alt={`${title} - hình ${selectedIndex + 1}`}
          className="h-full w-full object-cover transition-opacity duration-200"
        />

        {/* Gallery Counter */}
        <div className="absolute bottom-3 right-3 rounded-md bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-xs">
          {selectedIndex + 1} / {images.length}
        </div>

        {/* Prev / Next controls */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-800 shadow-sm backdrop-blur-xs transition hover:bg-white cursor-pointer"
              aria-label="Hình trước"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-800 shadow-sm backdrop-blur-xs transition hover:bg-white cursor-pointer"
              aria-label="Hình kế tiếp"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails row */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 transition-all cursor-pointer ${
                selectedIndex === idx
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
