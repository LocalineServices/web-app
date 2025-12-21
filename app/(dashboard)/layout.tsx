"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [isChecking, setIsChecking] = React.useState(true);
  const router = useRouter();

  // Client-side authentication check (backup for middleware)
  React.useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/users/me', {
          credentials: 'include',
        });
        
        if (!response.ok) {
          // Not authenticated, redirect to login
          router.push('/login');
          return;
        }
        
        setIsChecking(false);
      } catch {
        router.push('/login');
      }
    }

    checkAuth();
  }, [router]);

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar isCollapsed={isCollapsed} />
      </div>

      {/* Sidebar - Mobile */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar isCollapsed={false} />
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onToggleSidebar={() => setIsMobileOpen(!isMobileOpen)} />
        <main className="flex-1 overflow-auto bg-muted/30 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
