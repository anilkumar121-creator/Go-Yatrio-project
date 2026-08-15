"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Compass,
  Calendar,
  Hotel,
  Car,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const adminNavItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Destinations", href: "/admin/destinations", icon: MapPin },
  { name: "Packages", href: "/admin/packages", icon: Compass },
  { name: "Itineraries", href: "/admin/itineraries", icon: Calendar },
  { name: "Hotels", href: "/admin/hotels", icon: Hotel },
  { name: "Cabs", href: "/admin/cabs", icon: Car },
  { name: "Blogs", href: "/admin/blogs", icon: FileText },
  { name: "Media", href: "/admin/media", icon: ImageIcon },
  { name: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

type AdminSidebarProps = {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  className?: string;
};

export function AdminSidebar({ mobileOpen = false, onMobileClose, className }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("goyatrio_token");
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch {
      // Ignore API disconnect
    } finally {
      localStorage.removeItem("goyatrio_token");
      router.push("/login");
    }
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between p-4 bg-card border-r border-border">
      <div>
        <div className="flex items-center justify-between px-2 py-3">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Image
              src="/brand/goyatrio-logo.png"
              alt="GoYatrio Logo"
              width={140}
              height={40}
              className="h-8 w-auto object-contain"
            />
          </Link>
          {onMobileClose ? (
            <button
              onClick={onMobileClose}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground desktop:hidden"
              aria-label="Close sidebar"
            >
              <X className="size-5" />
            </button>
          ) : null}
        </div>

        <div className="mt-2 mb-4 px-2">
          <span className="inline-block rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary uppercase tracking-wider">
            Admin Panel
          </span>
        </div>

        <nav className="mt-2 space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="size-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn("hidden desktop:block w-64 shrink-0 h-screen sticky top-0", className)}>
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 flex desktop:hidden bg-black/50">
          <div className="w-64 h-full animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
          <div className="flex-1" onClick={onMobileClose} />
        </div>
      ) : null}
    </>
  );
}