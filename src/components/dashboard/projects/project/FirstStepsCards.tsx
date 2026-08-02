"use client"

import Link from "next/link"

import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { CheckIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useProject } from "@/components/project-provider"
import { useTranslations } from "next-intl"

export default function FirstStepsCards() {
  const t = useTranslations("FirstStepsCards")
  const { project } = useProject()

  const hasLocales = project.locales.length > 0
  const hasTerms = project.terms.length > 0
  const hasTranslations = project.terms.some(
    (term) => term.translations.length > 0
  )
  const hasMembers = project.members.length > 1

  return (
    <div className="grid gap-2">
      <StepCard
        title={t("locales.title")}
        description={t("locales.description")}
        href={`/projects/${project.id}/locales`}
        isCompleted={hasLocales}
      />
      <StepCard
        title={t("terms.title")}
        description={t("terms.description")}
        href={`/projects/${project.id}/terms`}
        isCompleted={hasTerms}
      />
      <StepCard
        title={t("translations.title")}
        description={t("translations.description")}
        href={`/projects/${project.id}/translations`}
        isCompleted={hasTranslations}
      />
      <StepCard
        title={t("members.title")}
        description={t("members.description")}
        href={`/projects/${project.id}/members`}
        isCompleted={hasMembers}
      />
    </div>
  )
}

function StepCard({
  title,
  description,
  href,
  isCompleted,
}: {
  title: string
  description: string
  href: string
  isCompleted: boolean
}) {
  const t = useTranslations("FirstStepsCards")

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
              isCompleted
                ? "border-green-500 bg-green-500/10 text-green-600"
                : "border-muted-foreground/30 bg-muted text-muted-foreground"
            )}
          >
            {isCompleted ? (
              <CheckIcon className="h-4 w-4" />
            ) : (
              <XIcon className="h-4 w-4" />
            )}
          </div>

          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        {!isCompleted && (
          <div className="flex items-center self-stretch">
            <Button variant="outline" asChild>
              <Link href={href} className="text-sm font-medium text-primary">
                {t("button.open")}
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
