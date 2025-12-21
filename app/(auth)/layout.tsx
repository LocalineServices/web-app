import { Icons } from "@/components/icons";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-col bg-primary p-10 text-primary-foreground">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Icons.globe className="h-6 w-6" />
          <span className="text-xl">Traduora</span>
        </Link>
        <div className="flex-1 flex flex-col justify-center">
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
        <div className="mt-auto">
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
