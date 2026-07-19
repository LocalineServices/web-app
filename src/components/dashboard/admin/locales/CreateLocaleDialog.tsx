"use client"

import { createLocale } from "@/actions/locales"
import { useSession } from "@/components/session-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { authClient } from "@/lib/auth-client"
import { PlusIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { MouseEvent, useState } from "react"
import { toast } from "sonner"

export default function CreateLocaleDialog() {
  const router = useRouter()
  const t = useTranslations("CreateLocaleDialog")
  const { user } = useSession()

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [language, setLanguage] = useState("")
  const [region, setRegion] = useState<string | null>(null)
  const [code, setCode] = useState("")

  const canCreateLocales = authClient.admin.checkRolePermission({
    // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
    role: user?.role ?? "user",
    permissions: {
      locales: ["create"],
    },
  })

  const handleCreateLocale = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    const displayName = `${language}${region ? ` (${region})` : ""}`

    await createLocale({
      displayName,
      language,
      region: region || undefined,
      code,
      enabled: true,
    })
      .then((locale) => {
        toast.success(
          t("toast.creationSuccess", {
            localeDisplayName: displayName,
            localeCode: code,
            localeId: locale.id.slice(0, 8),
          })
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message ||
            t("toast.creationFailed", {
              localeDisplayName: displayName,
            })
        )
      })
      .finally(() => {
        setLoading(false)
        setDialogOpen(false)
        setLanguage("")
        setRegion(null)
        setCode("")
      })
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <Tooltip>
        <TooltipTrigger
          asChild
          className={canCreateLocales || loading ? "" : "cursor-not-allowed"}
        >
          <span className="inline-block">
            <DialogTrigger asChild disabled={!canCreateLocales || loading}>
              <Button variant="outline" disabled={!canCreateLocales || loading}>
                <PlusIcon className="mr-2 h-4 w-4" />
                {t("button.createLocale")}
              </Button>
            </DialogTrigger>
          </span>
        </TooltipTrigger>
        {!canCreateLocales && (
          <TooltipContent>{t("tooltip.noPermission")}</TooltipContent>
        )}
      </Tooltip>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dialog.title")}</DialogTitle>
          <DialogDescription>{t("dialog.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="localeLanguage">{t("dialog.languageLabel")}</Label>
            <Input
              id="localeLanguage"
              placeholder={t("dialog.languagePlaceholder")}
              value={language}
              onChange={({ target: { value } }) => setLanguage(value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="localeRegion">{t("dialog.regionLabel")}</Label>
            <Input
              id="localeRegion"
              placeholder={t("dialog.regionPlaceholder")}
              value={region || ""}
              onChange={({ target: { value } }) => setRegion(value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="localeCode">{t("dialog.codeLabel")}</Label>
            <Input
              id="localeCode"
              placeholder={t("dialog.codePlaceholder")}
              value={code}
              onChange={({ target: { value } }) => setCode(value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDialogOpen(false)
              setLanguage("")
              setRegion("")
              setCode("")
            }}
            disabled={loading}
          >
            {t("dialog.close")}
          </Button>

          <Button
            variant="outline"
            onClick={handleCreateLocale}
            disabled={!language || !code || loading}
          >
            {loading ? (
              <>
                <Spinner className="h-4 w-4" />
                {t("dialog.creatingLocale")}
              </>
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                {t("dialog.createLocale")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
