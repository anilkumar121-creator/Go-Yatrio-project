"use client";

import Link from "next/link";
import { Menu, ExternalLink } from "lucide-react";
import { Button } from "@/components/common/button";

type AdminNavbarProps = {
  onMenuToggle: () => void;
};

export function AdminNavbar({ onMenuToggle }: AdminNavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-md tablet:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground desktop:hidden"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="size-5" />
        </button>
        <div className="hidden tablet:flex items-center gap-2 text-sm text-muted-foreground">
          <span>GoYatrio Portal</span>
          <span>/</span>
          <span className="font-semibold text-foreground">Management Console</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button asChild variant="outline" size="sm" className="hidden tablet:inline-flex text-xs gap-1.5">
          <Link href="/" target="_blank">
            <ExternalLink className="size-3.5" />
            View Live Site
          </Link>
        </Button>

        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
          AD
        </div>
      </div>
    </header>
  );
}