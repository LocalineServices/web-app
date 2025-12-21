"use client";

import * as React from "react";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = React.useState<boolean>(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    // Simulate password reset request - replace with actual API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1000);
  }

  if (isSubmitted) {
    return (
      <>
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="rounded-full bg-primary/10 p-3">
            <Icons.mail className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
          <p className="text-sm text-muted-foreground max-w-sm">
            We&apos;ve sent a password reset link to your email address. Please check
            your inbox and follow the instructions.
          </p>
        </div>

        <Button variant="outline" className="w-full" asChild>
          <Link href="/login">
            <Icons.arrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Didn&apos;t receive the email?{" "}
          <button
            onClick={() => setIsSubmitted(false)}
            className="text-primary hover:underline"
          >
            Try again
          </button>
        </p>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <div className="flex items-center justify-center gap-2 lg:hidden mb-4">
          <Icons.globe className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">Traduora</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Forgot password?</h1>
        <p className="text-sm text-muted-foreground">
          No worries, we&apos;ll send you reset instructions
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Icons.mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              className="pl-10"
              required
            />
          </div>
        </div>

        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading && (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          )}
          Send reset link
        </Button>
      </form>

      <Button variant="outline" className="w-full" asChild>
        <Link href="/login">
          <Icons.arrowLeft className="mr-2 h-4 w-4" />
          Back to login
        </Link>
      </Button>
    </>
  );
}
