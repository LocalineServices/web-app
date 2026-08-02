"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BadgeAlertIcon,
  BadgeCheckIcon,
  BadgeXIcon,
  BanIcon,
  CalendarIcon,
  CopyIcon,
  FoldersIcon,
  IdCardIcon,
  Link2Icon,
  MailCheckIcon,
  TagIcon,
  UserCogIcon,
  UserIcon,
} from "lucide-react"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useSession } from "@/components/session-provider"
import { Spinner } from "@/components/ui/spinner"
import { useFormatter, useTranslations } from "next-intl"

export default function ProfileInformationCard() {
  const t = useTranslations("ProfileInformationCard")
  const format = useFormatter()

  const { user } = useSession()

  if (!user) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center gap-2">
          <Spinner />
          <p>{t("card.loadingUserInformation")}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardContent className="flex items-center justify-between">
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <IdCardIcon className="size-4" />
          <p>{t("card.id")}</p>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <p className="min-w-0 font-mono text-sm break-all text-foreground">
            {user.id.slice(0, 8)}
          </p>

          <Button
            variant="ghost"
            size="icon-xs"
            className="shrink-0"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(user.id)
                toast.success(t("toast.copyToClipboard"))
              } catch {
                toast.error(t("toast.copyFailed"))
              }
            }}
          >
            <CopyIcon />
          </Button>
        </div>
      </CardContent>

      <Separator />

      <CardContent className="flex items-center justify-between">
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <TagIcon className="size-4" />
          <p>{t("card.role")}</p>
        </div>

        <div className="flex min-w-0 items-center gap-2 text-foreground">
          {user.role === "admin" ? (
            <UserCogIcon className="size-4 shrink-0" />
          ) : (
            <UserIcon className="size-4 shrink-0" />
          )}
          <p className="min-w-0 font-mono text-sm break-all text-foreground capitalize">
            {user.role ?? "Unknown"}
          </p>
        </div>
      </CardContent>

      <Separator />

      <CardContent className="flex items-center justify-between">
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <Link2Icon className="size-4" />
          <p>{t("card.lastLoginMethod")}</p>
        </div>

        <p className="min-w-0 font-mono text-sm break-all text-foreground capitalize">
          {user.lastLoginMethod ?? "Unknown"}
        </p>
      </CardContent>

      <Separator />

      <CardContent className="flex items-center justify-between">
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <FoldersIcon className="size-4" />
          <p>{t("card.projectsLimit")}</p>
        </div>

        <p className="min-w-0 font-mono text-sm break-all text-foreground">
          {user.projectsLimit !== null
            ? format.number(user.projectsLimit)
            : t("card.projectsLimitUnlimited")}
        </p>
      </CardContent>

      <Separator />

      <CardContent className="flex items-center justify-between">
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <MailCheckIcon className="size-4" />
          <p>{t("card.emailVerified")}</p>
        </div>

        <div className="flex min-w-0 items-center gap-2 text-foreground">
          {user.emailVerified ? (
            <BadgeCheckIcon className="size-4 shrink-0" />
          ) : (
            <BadgeXIcon className="size-4 shrink-0" />
          )}
          <p
            className={cn(
              "min-w-0 font-mono text-sm break-all text-foreground capitalize",
              user.emailVerified
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {user.emailVerified
              ? t("card.emailVerifiedYes")
              : t("card.emailVerifiedNo")}
          </p>
        </div>
      </CardContent>

      <Separator />

      <CardContent className="flex items-center justify-between">
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <BanIcon className="size-4" />
          <p>{t("card.banned")}</p>
        </div>

        <div className="flex min-w-0 items-center gap-2 text-foreground">
          {user.banned ? (
            <BadgeAlertIcon className="size-4 shrink-0" />
          ) : (
            <BadgeCheckIcon className="size-4 shrink-0" />
          )}
          <p
            className={cn(
              "min-w-0 font-mono text-sm break-all text-foreground capitalize",
              user.banned
                ? "text-red-600 dark:text-red-400"
                : "text-emerald-600 dark:text-emerald-400"
            )}
          >
            {user.banned ? t("card.bannedYes") : t("card.bannedNo")}
          </p>
        </div>
      </CardContent>

      <Separator />

      <CardContent className="flex items-center justify-between">
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <CalendarIcon className="size-4" />
          <p>{t("card.createdAt")}</p>
        </div>

        <p className="min-w-0 font-mono text-sm break-all text-foreground">
          {format.dateTime(new Date(user.createdAt), {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </CardContent>
    </Card>
  )
}
