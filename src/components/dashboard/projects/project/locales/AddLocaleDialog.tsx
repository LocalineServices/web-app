"use client"

import { addProjectLocale } from "@/actions/project-locales"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Locale } from "@prisma/client"
import { PlusIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { MouseEvent, useState } from "react"
import { toast } from "sonner"
import LocalePickerField from "@/components/ui/custom/LocalePickerField"
import { useSession } from "@/components/session-provider"
import { useProject } from "@/components/project-provider"
import { hasPermission, ProjectPermission } from "@/lib/project-permissions"
import { authClient } from "@/lib/auth-client"
import { useFormatter, useTranslations } from "next-intl"

export default function AddLocaleDialog({ locales }: { locales: Locale[] }) {
  const router = useRouter()
  const t = useTranslations("AddLocaleDialog")
  const format = useFormatter()

  const { user } = useSession()
  const { project, member } = useProject()

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [locale, setLocale] = useState<Locale | null>(null)

  const canManageLocales =
    hasPermission(
      member?.role.permissions ?? 0n,
      ProjectPermission.MANAGE_LOCALES
    ) ||
    authClient.admin.checkRolePermission({
      // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
      role: user?.role ?? "user",
      permissions: {
        projects: ["update"],
      },
    })

  const isLimitReached =
    project.plan.localesLimit !== null &&
    project.locales.length >= project.plan.localesLimit

  const handleAddLocale = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    if (!locale) {
      toast.error(t("toast.noLocaleSelected"))
      return
    }

    setLoading(true)
    await addProjectLocale({
      projectId: project.id,
      localeId: locale.id,
    })
      .then(() => {
        toast.success(
          t("toast.addSuccess", {
            localeDisplayName: locale.displayName,
            localeId: locale.id.slice(0, 8),
          })
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message ||
            t("toast.addFailed", {
              localeDisplayName: locale.displayName,
              localeId: locale.id.slice(0, 8),
            })
        )
      })
      .finally(() => {
        setLoading(false)
        setDialogOpen(false)
        setLocale(null)
      })
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <Tooltip>
        <TooltipTrigger
          asChild
          className={
            canManageLocales && !isLimitReached && !loading
              ? ""
              : "cursor-not-allowed"
          }
        >
          <span className="inline-block">
            <DialogTrigger
              asChild
              disabled={!canManageLocales || isLimitReached || loading}
            >
              <Button
                variant="outline"
                disabled={!canManageLocales || isLimitReached || loading}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                {t("button.addLocale")}
              </Button>
            </DialogTrigger>
          </span>
        </TooltipTrigger>
        {!canManageLocales ? (
          <TooltipContent>{t("tooltip.noPermission")}</TooltipContent>
        ) : (
          isLimitReached && (
            <TooltipContent>
              {project.plan.localesLimit === 0
                ? t("tooltip.limitZero")
                : t("tooltip.limitReached", {
                    current: format.number(project.locales.length),
                    limit: format.number(project.plan.localesLimit ?? 0),
                  })}
            </TooltipContent>
          )
        )}
      </Tooltip>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dialog.title")}</DialogTitle>
          <DialogDescription>{t("dialog.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="locale">{t("dialog.localeLabel")}</Label>
          <LocalePickerField
            id="locale"
            locales={locales}
            value={locale}
            onChange={setLocale}
            disabled={loading}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDialogOpen(false)
              setLocale(null)
            }}
            disabled={loading}
          >
            {t("button.close")}
          </Button>

          <Button
            variant="outline"
            onClick={handleAddLocale}
            disabled={!locale || loading}
          >
            {loading ? (
              <>
                <Spinner className="h-4 w-4" />
                {t("dialog.addingLocale")}
              </>
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                {t("dialog.addLocale")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
