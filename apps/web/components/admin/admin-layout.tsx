"use client";

import { useState } from "react";
import { AdminGuard } from "./admin-guard";
import { AdminSidebar } from "./admin-sidebar";
import { AdminNavbar } from "./admin-navbar";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export function AdminLayout({ children }: AdminLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-muted/20">
        <AdminSidebar
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
        <div className="flex flex-1 flex-col min-w-0">
          <AdminNavbar onMenuToggle={() => setMobileSidebarOpen((prev) => !prev)} />
          <main className="flex-1 p-4 tablet:p-6 desktop:p-8">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}