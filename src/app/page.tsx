"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    async function checkAuth() {
      try {
        const response = await fetch('/api/users/me', {
          credentials: 'include',
        });
        
        if (response.ok) {
          // User is authenticated, redirect to projects
          router.push('/projects');
        } else {
          // User is not authenticated, redirect to login
          router.push('/login');
        }
      } catch {
        // On error, redirect to login
        router.push('/login');
      }
    }

    checkAuth();
  }, [router]);

  // Show loading while checking
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
