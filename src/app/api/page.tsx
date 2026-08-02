"use client"

import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import Link from "next/link"

export default function ApiPage() {
  const t = useTranslations("ApiPage")

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("description")}</p>
      </div>

      <div className="flex min-w-40 flex-col gap-3">
        <Button asChild size="lg">
          <Link href="/api/v2">{t("button.v2")}</Link>
        </Button>

        <Button asChild variant="destructive" size="lg" className="h-auto py-2">
          <Link
            href="/api/v1"
            className="flex flex-col items-center leading-none"
          >
            <span>{t("button.v1")}</span>
            <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">
              {t("button.v1_deprecated")}
            </span>
          </Link>
        </Button>
      </div>
    </main>
  )
}
