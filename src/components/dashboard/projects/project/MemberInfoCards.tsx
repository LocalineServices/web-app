"use client"

import { useProject } from "@/components/project-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getColorClassName, getColorStyle, getIcon } from "@/lib/project-utils"
import { FullProject } from "@/types/project"
import { ProjectMemberRole } from "@prisma/client"
import { CalendarIcon, FlagIcon, Globe2Icon, TagIcon } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { createElement } from "react"

export default function MemberInfoCards() {
  const { member } = useProject()
  const isMember = !!member

  return (
    <>
      <RoleCard role={member?.role} isMember={isMember} />
      <LocalesCard locales={member?.locales ?? []} isMember={isMember} />
      <JoinedAtCard joinedAt={member?.createdAt} isMember={isMember} />
    </>
  )
}

function RoleCard({
  role,
  isMember,
}: {
  role: ProjectMemberRole | undefined
  isMember: boolean
}) {
  const t = useTranslations("MemberInfoCards")

  const roleColor = role?.color
  const roleIcon = getIcon(role?.icon)
  const colorStyle = getColorStyle(roleColor)
  const colorClassName = getColorClassName(roleColor)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">{t("role.title")}</CardTitle>
        <TagIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        {!isMember ? (
          <p className="text-muted-foreground italic">{t("role.noMember")}</p>
        ) : (
          <div
            className={`inline-flex items-center gap-2 text-2xl leading-none font-medium ${colorClassName}`}
            style={colorStyle}
          >
            {roleIcon
              ? createElement(roleIcon, {
                  className: "h-5 w-5 shrink-0",
                  "aria-hidden": true,
                })
              : null}
            {role?.name}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function LocalesCard({
  locales,
  isMember,
}: {
  locales: FullProject["members"][number]["locales"]
  isMember: boolean
}) {
  const t = useTranslations("MemberInfoCards")

  const hasLocales = locales.length > 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">
          {t("locales.title")}
        </CardTitle>

        <div className="flex items-center gap-1">
          {hasLocales && (
            <span className="mr-1 text-sm">{locales?.length ?? 0}</span>
          )}

          <Globe2Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>

      <CardContent>
        {!isMember ? (
          <p className="text-muted-foreground italic">
            {t("locales.noMember")}
          </p>
        ) : !hasLocales ? (
          <p className="text-muted-foreground italic">
            {t("locales.noLocales")}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {locales.map(({ locale: { id, displayName } }) => (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded bg-muted/50 px-2 py-1 text-sm font-medium"
              >
                <FlagIcon className="h-3 w-3 text-muted-foreground" />
                {displayName}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function JoinedAtCard({
  joinedAt,
  isMember,
}: {
  joinedAt: Date | undefined
  isMember: boolean
}) {
  const t = useTranslations("MemberInfoCards")
  const format = useFormatter()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">
          {t("joinedAt.title")}
        </CardTitle>
        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        {!isMember || !joinedAt ? (
          <p className="text-muted-foreground italic">
            {t("joinedAt.noMember")}
          </p>
        ) : (
          <div className="text-2xl font-medium">
            {format.dateTime(joinedAt ?? new Date(0), {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
