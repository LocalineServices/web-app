"use client"

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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { authClient } from "@/lib/auth-client"
import { ClipboardIcon, PlusIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { MouseEvent, useState } from "react"
import { toast } from "sonner"

export default function CreateApiKeyDialog({
  apiKeysCount,
  apiKeysLimit,
}: {
  apiKeysCount: number
  apiKeysLimit: number
}) {
  const router = useRouter()
  const t = useTranslations("CreateApiKeyDialog")
  const { user } = useSession()

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState("")
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined)
  const [disableRateLimiting, setDisableRateLimiting] = useState(false)

  const [apiKey, setApiKey] = useState("")

  const hasUnlimitedApiKeys = authClient.admin.checkRolePermission({
    // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
    role: user?.role ?? "user",
    permissions: {
      apiKeys: ["unlimited"],
    },
  })

  const canDisableRateLimiting = authClient.admin.checkRolePermission({
    // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
    role: user?.role ?? "user",
    permissions: {
      apiKeys: ["no-rate-limit"],
    },
  })

  const userApiKeysLimit = hasUnlimitedApiKeys ? Infinity : apiKeysLimit
  const canCreateApiKey = apiKeysCount < userApiKeysLimit

  const handleCreateApiKey = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    if (!canCreateApiKey) {
      toast.error(
        userApiKeysLimit === 0
          ? t("limitZero")
          : t("limitExceeded", { count: apiKeysCount, limit: userApiKeysLimit })
      )
      setLoading(false)
      setName("")
      setExpiryDate(undefined)
      return
    }

    await authClient.apiKey.create({
      configId: disableRateLimiting ? "no-rate-limit" : "default",
      name,
      expiresIn: expiryDate
        ? Math.floor((expiryDate.getTime() - Date.now()) / 1000)
        : undefined,
      fetchOptions: {
        onSuccess: ({ data: { key } }) => {
          toast.success(
            t("toast.creationSuccess", {
              apiKeyName: name,
              apiKeyId: key.slice(0, 8),
            })
          )
          setLoading(false)
          setName("")
          setExpiryDate(undefined)

          setApiKey(key)
        },
        onError: ({ error }) => {
          toast.error(
            error?.message || t("toast.creationFailed", { apiKeyName: name })
          )
          setLoading(false)
          setDialogOpen(false)
          setName("")
          setExpiryDate(undefined)
        },
      },
    })
  }

  return (
    <Dialog open={isDialogOpen || !!apiKey} onOpenChange={setDialogOpen}>
      <Tooltip>
        <TooltipTrigger
          asChild
          className={!canCreateApiKey || loading ? "cursor-not-allowed" : ""}
        >
          <span className="inline-block">
            <DialogTrigger asChild disabled={!canCreateApiKey || loading}>
              <Button variant="outline" disabled={!canCreateApiKey || loading}>
                <PlusIcon className="mr-2 h-4 w-4" />
                {t("button.createApiKey")}
              </Button>
            </DialogTrigger>
          </span>
        </TooltipTrigger>
        {!canCreateApiKey && (
          <TooltipContent>
            {userApiKeysLimit === 0
              ? t("limitZero")
              : t("limitExceeded", {
                  count: apiKeysCount,
                  limit: userApiKeysLimit,
                })}
          </TooltipContent>
        )}
      </Tooltip>

      <DialogContent>
        {apiKey ? (
          <>
            <DialogHeader>
              <DialogTitle>
                {t("dialog.successTitle", { apiKeyName: name })}
              </DialogTitle>
              <DialogDescription>
                {t("dialog.successDescription", { apiKeyName: name })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("dialog.apiKey")}</Label>
                <InputGroup>
                  <InputGroupInput value={apiKey} readOnly />
                  <InputGroupAddon align="inline-end">
                    <ClipboardIcon
                      className="h-4 w-4 cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(apiKey)
                        toast.success(t("toast.copiedToClipboard"))
                      }}
                    />
                  </InputGroupAddon>
                </InputGroup>
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={() => {
                  setDialogOpen(false)
                  setApiKey("")

                  router.refresh()
                }}
              >
                {t("dialog.close")}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t("dialog.createTitle")}</DialogTitle>
              <DialogDescription>
                {t("dialog.createDescription")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="apiKeyName">{t("dialog.apiKeyName")}</Label>
                <Input
                  id="apiKeyName"
                  placeholder={t("dialog.apiKeyNamePlaceholder")}
                  value={name}
                  onChange={({ target: { value } }) => setName(value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">{t("dialog.expiryDate")}</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={
                    expiryDate ? expiryDate.toISOString().split("T")[0] : ""
                  }
                  onChange={({ target: { value } }) =>
                    setExpiryDate(value ? new Date(value) : undefined)
                  }
                  disabled={loading}
                />
              </div>

              {canDisableRateLimiting && (
                <div className="flex items-center gap-2">
                  <Switch
                    id="disableRateLimiting"
                    checked={disableRateLimiting}
                    onCheckedChange={setDisableRateLimiting}
                    disabled={loading}
                  />
                  <Label htmlFor="disableRateLimiting">
                    {t("dialog.disableRateLimiting")}
                    <span className="text-xs text-muted-foreground">
                      (Admin only)
                    </span>
                  </Label>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false)
                  setName("")
                  setExpiryDate(undefined)
                }}
                disabled={loading}
              >
                {t("dialog.close")}
              </Button>

              <Button
                variant="outline"
                onClick={handleCreateApiKey}
                disabled={
                  !name ||
                  // eslint-disable-next-line react-hooks/purity
                  (expiryDate && expiryDate.getTime() <= Date.now()) ||
                  loading
                }
              >
                {loading ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    {t("dialog.creatingApiKey")}
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-4 w-4" />
                    {t("dialog.createApiKey")}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
