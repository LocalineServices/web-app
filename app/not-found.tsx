"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/users/me', {
          credentials: 'include',
        });
        
        setIsAuthenticated(response.ok);
      } catch {
        setIsAuthenticated(false);
      }
    }

    checkAuth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted relative overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-[10%] left-[15%]">
          <Icons.languages className="h-16 w-16" />
        </div>
        <div className="absolute top-[25%] right-[20%]">
          <Icons.globe className="h-12 w-12" />
        </div>
        <div className="absolute top-[45%] left-[10%]">
          <Icons.file className="h-14 w-14" />
        </div>
        <div className="absolute top-[60%] right-[15%]">
          <Icons.key className="h-10 w-10" />
        </div>
        <div className="absolute bottom-[20%] left-[25%]">
          <Icons.users className="h-12 w-12" />
        </div>
        <div className="absolute top-[35%] right-[35%]">
          <Icons.tag className="h-8 w-8" />
        </div>
        <div className="absolute top-[70%] right-[40%]">
          <Icons.zap className="h-11 w-11" />
        </div>
        <div className="absolute bottom-[35%] left-[40%]">
          <Icons.globe className="h-9 w-9" />
        </div>
        <div className="absolute top-[15%] left-[45%]">
          <Icons.languages className="h-10 w-10" />
        </div>
        <div className="absolute bottom-[45%] right-[25%]">
          <Icons.file className="h-13 w-13" />
        </div>
      </div>

      {/* Content */}
      <div className="text-center space-y-8 relative z-10 px-4">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 font-semibold mb-8">
          <Image src="/logo.png" alt="Localine Logo" width={32} height={32} className="object-contain" />
          <span className="text-2xl">Localine</span>
        </Link>

        {/* 404 Message */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <Icons.alertCircle className="h-16 w-16 text-muted-foreground" />
            <h1 className="text-8xl font-bold text-muted-foreground">404</h1>
          </div>
          <h2 className="text-3xl font-semibold">Page Not Found</h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          {isAuthenticated && (
            <Button asChild size="lg">
              <Link href="/projects">
                <Icons.home className="mr-2 h-5 w-5" />
                Go to Projects
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <Icons.arrowLeft className="mr-2 h-5 w-5" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Additional Info */}
        <div className="pt-8 text-sm text-muted-foreground">
          <p>Need help? Contact support or check our documentation.</p>
        </div>
      </div>
    </div>
  );
}
