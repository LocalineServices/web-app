import { Icons } from "@/components/icons";
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-col bg-muted p-10 text-foreground relative overflow-hidden">
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
        <Link href="/" className="flex items-center gap-2 font-semibold relative z-10">
          <Image src="/logo.png" alt="Localine Logo" width={24} height={24} className="object-contain" />
          <span className="text-xl">Localine</span>
        </Link>
        <div className="flex-1 flex flex-col justify-center relative z-10">
          <blockquote className="space-y-4">
            <p className="text-lg">
              &ldquo;The open translation management platform that helps teams
              collaborate on localization. Simple, fast, and developer-friendly.&rdquo;
            </p>
            <footer className="text-sm opacity-80">
              — Manage translations across all your projects
            </footer>
          </blockquote>
        </div>
        <div className="mt-auto relative z-10">
          <div className="flex gap-8 text-sm opacity-80">
            <div className="flex items-center gap-2">
              <Icons.languages className="h-4 w-4" />
              <span>Multiple formats</span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.users className="h-4 w-4" />
              <span>Team collaboration</span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.key className="h-4 w-4" />
              <span>API access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex items-center justify-center p-8">
        <div className="mx-auto w-full max-w-md space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
