import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  variant?: "full" | "mark";
  className?: string;
  priority?: boolean;
};

export function Logo({ variant = "full", className, priority = false }: LogoProps) {
  const isMark = variant === "mark";

  return (
    <Link
      href="/"
      aria-label="GoYatrio home"
      className={cn("inline-flex shrink-0 items-center", className)}
    >
      <Image
        src={isMark ? "/brand/goyatrio-mark.png" : "/brand/goyatrio-logo.png"}
        alt="GoYatrio"
        width={isMark ? 64 : 220}
        height={isMark ? 64 : 124}
        priority={priority}
        className={cn("h-auto w-auto object-contain", isMark ? "max-h-12" : "max-h-14")}
      />
    </Link>
  );
}
