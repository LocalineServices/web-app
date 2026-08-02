"use client"

import { useProject } from "@/components/project-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  ClockAlertIcon,
  GlobeIcon,
  LibraryIcon,
  PercentIcon,
  UsersIcon,
} from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"

export default function StatisticCards() {
  const t = useTranslations("StatisticCards")
  const format = useFormatter()

  const { project } = useProject()

  const terms = project?.terms
  const locales = project?.locales
  const members = project?.members
  const plan = project?.plan

  const localeCount = locales?.length ?? 0
  const totalTranslations = (terms?.length ?? 0) * localeCount
  const translatedCount =
    terms?.reduce(
      (acc, term) =>
        acc +
        term.translations.filter((translation) => translation.value).length,
      0
    ) ?? 0
  const progress =
    totalTranslations > 0 ? (translatedCount / totalTranslations) * 100 : 0

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {t("progress.title")}
          </CardTitle>
          <PercentIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>

        <CardContent>
          {totalTranslations === 0 ? (
            <p className="text-muted-foreground italic">
              {t("progress.noTranslations")}
            </p>
          ) : (
            <>
              <div className="text-2xl font-bold">
                {format.number(progress, { maximumFractionDigits: 1 })}
              </div>
              <Progress value={progress} className="mt-2" />
              <p className="mt-2 text-xs text-muted-foreground">
                {t("progress.description", {
                  translated: format.number(translatedCount),
                  total: format.number(totalTranslations),
                })}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Terms</CardTitle>
          <LibraryIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>

        <CardContent>
          {terms?.length === 0 ? (
            <p className="text-muted-foreground italic">{t("terms.noTerms")}</p>
          ) : (
            <>
              <div className="flex items-baseline gap-1">
                <div className="text-2xl font-bold">
                  {format.number(terms?.length ?? 0)}
                </div>
                <div className="h-2">
                  /{format.number(plan?.termsLimit ?? Infinity)}
                </div>
                {plan?.termsLimit && terms?.length >= plan?.termsLimit && (
                  <LimitReachedBadge />
                )}
              </div>
              <p>{t("terms.description")}</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {t("locales.title")}
          </CardTitle>
          <GlobeIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>

        <CardContent>
          {locales?.length === 0 ? (
            <p className="text-muted-foreground italic">
              {t("locales.noLocales")}
            </p>
          ) : (
            <>
              <div className="flex items-baseline gap-1">
                <div className="text-2xl font-bold">
                  {format.number(locales?.length ?? 0)}
                </div>
                <div className="h-2">
                  /{format.number(plan?.localesLimit ?? Infinity)}
                </div>
                {plan?.localesLimit &&
                  locales?.length >= plan?.localesLimit && (
                    <LimitReachedBadge />
                  )}
              </div>
              <p>{t("locales.description")}</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {t("member.title")}
          </CardTitle>
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>

        <CardContent>
          {members?.length === 0 ? (
            <p className="text-muted-foreground italic">
              {t("member.noMembers")}
            </p>
          ) : (
            <>
              <div className="flex items-baseline gap-1">
                <div className="text-2xl font-bold">
                  {format.number(members?.length ?? 0)}
                </div>
                <div className="h-2">
                  /{format.number(plan?.membersLimit ?? Infinity)}
                </div>
                {plan?.membersLimit &&
                  members?.length >= plan?.membersLimit && (
                    <LimitReachedBadge />
                  )}
              </div>
              <p>
                {t("member.description", {
                  members: format.number(members?.length ?? 0),
                  limit: format.number(plan?.membersLimit ?? Infinity),
                })}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function LimitReachedBadge() {
  const t = useTranslations("StatisticCards")
  return (
    <span className="ml-2 inline-flex items-center rounded bg-red-200 px-2 py-0.5 text-xs font-medium text-red-800">
      <ClockAlertIcon className="mr-1 h-3 w-3" />
      {t("limitReached")}
    </span>
  )
}
