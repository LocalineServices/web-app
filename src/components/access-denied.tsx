"use client"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { AlertTriangleIcon, HomeIcon, LogInIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"

export function AccessDeniedPage({
  isAuthenticated,
}: {
  isAuthenticated: boolean
}) {
  const t = useTranslations("AccessDeniedPage")

  return (
    <div className="flex min-h-full flex-col">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertTriangleIcon />
          </EmptyMedia>

          <EmptyTitle className="text-4xl">{t("title")}</EmptyTitle>

          <EmptyDescription className="text-lg">
            {t("description")}
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent className="flex-row justify-center gap-2">
          {isAuthenticated ? (
            <Button asChild size="lg">
              <Link href="/">
                <HomeIcon className="mr-2 h-5 w-5" />
                {t("button.goToDashboard")}
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/signin">
                <LogInIcon className="mr-2 h-5 w-5" />
                {t("button.signIn")}
              </Link>
            </Button>
          )}
        </EmptyContent>
      </Empty>
    </div>
  )
}
