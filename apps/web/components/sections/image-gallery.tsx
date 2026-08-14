"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/common/button";

type GalleryImage = {
  src: string;
  alt: string;
};

type ImageGalleryProps = {
  images: GalleryImage[];
  className?: string;
};

export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return null;
  }

  const activeImage = images[activeIndex];

  const goTo = (index: number) => {
    setActiveIndex((index + images.length) % images.length);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-muted">
        <Image
          key={activeImage.src}
          src={activeImage.src}
          alt={activeImage.alt}
          fill
          sizes="(max-width: 1280px) 100vw, 80rem"
          className="object-cover animate-fade-in"
        />
        {images.length > 1 ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50"
              aria-label="Previous image"
              onClick={() => goTo(activeIndex - 1)}
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50"
              aria-label="Next image"
              onClick={() => goTo(activeIndex + 1)}
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </Button>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Gallery thumbnails">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`View image ${index + 1}`}
              className={cn(
                "relative h-16 w-24 overflow-hidden rounded-md border-2 transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2",
                index === activeIndex
                  ? "border-primary"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
              onClick={() => setActiveIndex(index)}
            >
              <Image
                src={image.src}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
