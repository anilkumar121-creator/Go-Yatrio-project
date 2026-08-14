import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type CardMediaProps = {
  src?: string;
  alt: string;
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  className?: string;
  aspect?: "landscape" | "portrait" | "square";
};

const aspectClasses = {
  landscape: "aspect-[16/10]",
  portrait: "aspect-[3/4]",
  square: "aspect-square",
};

export function CardMedia({
  src,
  alt,
  icon: Icon,
  className,
  aspect = "landscape",
}: CardMediaProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted image-zoom",
        aspectClasses[aspect],
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover"
        />
      ) : (
        <div className="flex size-full items-center justify-center bg-gradient-to-br from-muted to-muted/60">
          {Icon ? (
            <Icon className="size-10 text-muted-foreground/50" aria-hidden />
          ) : (
            <ImageIcon className="size-10 text-muted-foreground/50" aria-hidden="true" />
          )}
        </div>
      )}
    </div>
  );
}
