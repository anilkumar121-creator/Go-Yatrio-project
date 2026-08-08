import { Logo } from "@/components/common/logo";

export function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6" role="status">
      <div className="flex flex-col items-center gap-6">
        <Logo variant="mark" priority />
        <div className="h-1 w-40 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
        </div>
        <span className="sr-only">Loading GoYatrio</span>
      </div>
    </div>
  );
}
