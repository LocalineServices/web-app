"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GitHubIcon } from "@/components/icons"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Spinner } from "@/components/ui/spinner"
import { Separator } from "@/components/ui/separator"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import {
  EyeIcon,
  EyeOffIcon,
  ImageIcon,
  MailIcon,
  PencilIcon,
  AlertTriangleIcon,
  TagIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { MouseEvent, useEffect, useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Account } from "better-auth"
import { useSession } from "@/components/session-provider"
import { useTranslations } from "next-intl"

type AvatarSource = "none" | "gravatar" | "github" | "custom"

const UI_AVATAR_IMAGE_PREFIX = "https://ui-avatars.com/api/"
const GRAVATAR_IMAGE_PREFIX = "https://www.gravatar.com/avatar/"
const GITHUB_IMAGE_PREFIX = "https://avatars.githubusercontent.com/u/"

async function createGravatarAvatarUrl(email: string) {
  const normalizedEmail = email.trim().toLowerCase()

  if (!normalizedEmail || !globalThis.crypto?.subtle) {
    return ""
  }

  const hashBuffer = await globalThis.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(normalizedEmail)
  )

  const hash = Array.from(new Uint8Array(hashBuffer), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("")

  return `${GRAVATAR_IMAGE_PREFIX}${hash}?s=200&d=identicon&r=x`
}

function getAvatarSource({
  currentAvatarUrl,
}: {
  currentAvatarUrl?: string
}): AvatarSource {
  if (!currentAvatarUrl || currentAvatarUrl.startsWith(UI_AVATAR_IMAGE_PREFIX))
    return "none"
  else if (currentAvatarUrl.startsWith(GRAVATAR_IMAGE_PREFIX)) return "gravatar"
  else if (currentAvatarUrl.startsWith(GITHUB_IMAGE_PREFIX)) return "github"
  else return "custom"
}

export default function ProfileDetailsCard({
  githubAccount,
}: {
  githubAccount: Account | undefined
}) {
  const router = useRouter()
  const t = useTranslations("ProfileDetailsCard")
  const { user } = useSession()

  const currentAvatarUrl = user?.image || undefined
  const currentAvatarSource = getAvatarSource({ currentAvatarUrl })

  const uiAvatarUrl = user?.name
    ? `${UI_AVATAR_IMAGE_PREFIX}?name=${encodeURIComponent(user.name.trim())}&background=random&color=fff`
    : undefined
  const githubAvatarUrl = githubAccount
    ? `${GITHUB_IMAGE_PREFIX}${githubAccount.accountId}?v=4`
    : undefined

  const [nameLoading, setNameLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [isNameDialogOpen, setNameDialogOpen] = useState(false)
  const [isAvatarDialogOpen, setAvatarDialogOpen] = useState(false)
  const [name, setName] = useState(user?.name ?? "")
  const [isEmailVisible, setEmailVisible] = useState(false)
  const [avatarSource, setAvatarSource] =
    useState<AvatarSource>(currentAvatarSource)
  const [gravatarAvatarUrl, setGravatarAvatarUrl] = useState<
    string | undefined
  >()

  useEffect(() => {
    if (user?.email) {
      createGravatarAvatarUrl(user.email).then((url) => {
        setGravatarAvatarUrl(url || undefined)
      })
    }
  }, [user?.email])

  const selectedAvatarUrl =
    avatarSource === "none"
      ? uiAvatarUrl
      : avatarSource === "gravatar"
        ? gravatarAvatarUrl ||
          (currentAvatarSource === "gravatar" ? currentAvatarUrl : undefined)
        : avatarSource === "github"
          ? githubAvatarUrl ||
            (currentAvatarSource === "github" ? currentAvatarUrl : undefined)
          : avatarSource === "custom"
            ? currentAvatarUrl
            : undefined

  const handleUpdateName = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setNameLoading(true)

    await authClient.updateUser({
      name: name.trim(),
      fetchOptions: {
        onSuccess: () => {
          toast.success(t("toast.nameUpdated", { name: name.trim() }))
          setNameDialogOpen(false)
          setNameLoading(false)
          router.refresh()
        },
        onError: ({ error }) => {
          toast.error(error?.message || t("toast.nameUpdateFailed"))
          setNameDialogOpen(false)
          setNameLoading(false)
        },
      },
    })
  }

  const handleUpdateAvatar = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setAvatarLoading(true)

    await authClient.updateUser({
      image: selectedAvatarUrl ?? null,
      fetchOptions: {
        onSuccess: () => {
          toast.success(t("toast.avatarUpdated"))
          setAvatarDialogOpen(false)
          setAvatarLoading(false)
          router.refresh()
        },
        onError: ({ error }) => {
          toast.error(error?.message || t("toast.avatarUpdateFailed"))
          setAvatarLoading(false)
        },
      },
    })
  }

  return (
    <Card className="w-full">
      <CardContent className="flex items-center justify-between">
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <TagIcon className="size-4" />
          <p>{t("card.name")}</p>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <p className="min-w-0 font-mono text-sm break-all text-foreground">
            {user?.name ?? "Unknown"}
          </p>
          <Dialog open={isNameDialogOpen} onOpenChange={setNameDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon-xs" className="shrink-0">
                <PencilIcon className="size-4" />
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("dialog.updateName.title")}</DialogTitle>
                <DialogDescription>
                  {t("dialog.updateName.description")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2 py-2">
                <Label htmlFor="name">{t("dialog.updateName.inputLabel")}</Label>
                <Input
                  id="name"
                  value={name}
                  placeholder={t("dialog.updateName.inputPlaceholder")}
                  disabled={nameLoading}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setNameDialogOpen(false)}
                  disabled={nameLoading}
                >
                  {t("dialog.close")}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleUpdateName}
                  disabled={
                    !name.trim() ||
                    name.trim() === user?.name?.trim() ||
                    nameLoading
                  }
                >
                  {nameLoading ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      {t("dialog.updateName.updatingName")}
                    </>
                  ) : (
                    <>
                      <PencilIcon className="h-4 w-4" />
                      {t("dialog.updateName.updateName")}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>

      <Separator />

      <CardContent className="flex items-center justify-between">
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <MailIcon className="size-4" />
          <p>{t("card.email")}</p>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="ghost"
            className="relative inline-flex h-6 min-w-0 flex-1 items-center justify-between gap-2 overflow-hidden rounded-md px-2 py-1 text-left transition hover:bg-muted/50"
            aria-pressed={isEmailVisible}
            onClick={() => {
              setEmailVisible((current) => !current)
            }}
          >
            <span
              className={cn(
                "min-w-0 font-mono text-sm break-all transition",
                isEmailVisible
                  ? "text-foreground"
                  : "text-foreground/40 blur-sm select-none"
              )}
            >
              {user?.email ?? "Unknown"}
            </span>

            <span className="shrink-0 text-muted-foreground">
              {isEmailVisible ? (
                <EyeIcon className="size-4" />
              ) : (
                <EyeOffIcon className="size-4" />
              )}
            </span>

            {!isEmailVisible ? (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-md bg-muted/55 shadow-inner shadow-black/20"
              />
            ) : null}
          </Button>
        </div>
      </CardContent>

      <Separator />

      <CardContent className="flex items-center justify-between gap-4">
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <ImageIcon className="size-4" />
          <p>{t("card.avatar")}</p>
        </div>

        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-10">
            <AvatarImage
              src={currentAvatarUrl}
              alt={`${user?.name ?? "User"} avatar`}
            />
          </Avatar>

          <Dialog open={isAvatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon-xs" className="shrink-0">
                <PencilIcon className="size-4" />
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>{t("dialog.updateAvatar.title")}</DialogTitle>
                <DialogDescription>
                  {t("dialog.updateAvatar.description")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {currentAvatarSource === "custom" ? (
                  <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-50">
                    <AlertTriangleIcon className="size-4 text-amber-600 dark:text-amber-300" />
                    <AlertTitle>
                      {t("dialog.updateAvatar.customUrl.title")}
                    </AlertTitle>
                    <AlertDescription className="text-amber-900/80 dark:text-amber-100/80">
                      {t("dialog.updateAvatar.customUrl.description")}
                    </AlertDescription>
                  </Alert>
                ) : null}

                <div className="flex items-center gap-4 rounded-lg border bg-muted/40 p-4">
                  <Avatar className="size-16">
                    <AvatarImage
                      src={selectedAvatarUrl}
                      alt={`${user?.name ?? "User"} avatar preview`}
                    />
                  </Avatar>

                  <p className="font-medium">
                    {t("dialog.updateAvatar.preview")}
                  </p>
                </div>

                <RadioGroup
                  value={avatarSource}
                  onValueChange={(value) => {
                    setAvatarSource(value as AvatarSource)
                  }}
                  className="grid gap-3"
                >
                  <Label
                    htmlFor="avatar-source-none"
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-3 transition",
                      avatarSource === "none" && "border-primary bg-primary/5"
                    )}
                  >
                    <RadioGroupItem
                      id="avatar-source-none"
                      value="none"
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <span className="text-sm font-medium">
                        {t("dialog.updateAvatar.avatar.none.label")}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {t("dialog.updateAvatar.avatar.none.description")}
                      </p>
                    </div>
                  </Label>

                  <Label
                    htmlFor="avatar-source-gravatar"
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-3 transition",
                      avatarSource === "gravatar" &&
                        "border-primary bg-primary/5"
                    )}
                  >
                    <RadioGroupItem
                      id="avatar-source-gravatar"
                      value="gravatar"
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <span className="text-sm font-medium">
                        {t("dialog.updateAvatar.avatar.gravatar.label")}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {t("dialog.updateAvatar.avatar.gravatar.description")}
                      </p>
                    </div>
                  </Label>

                  <Label
                    htmlFor="avatar-source-github"
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-3 transition",
                      avatarSource === "github" &&
                        "border-primary bg-primary/5",
                      !githubAvatarUrl && "cursor-not-allowed opacity-60"
                    )}
                  >
                    <RadioGroupItem
                      id="avatar-source-github"
                      value="github"
                      className="mt-1"
                      disabled={!githubAvatarUrl}
                    />
                    <div className="space-y-1">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <GitHubIcon className="size-4" />
                        {t("dialog.updateAvatar.avatar.github.label")}
                        {!githubAvatarUrl && (
                          <Badge variant="outline">
                            {t("dialog.updateAvatar.avatar.github.notLinked")}
                          </Badge>
                        )}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {t("dialog.updateAvatar.avatar.github.description")}
                      </p>
                    </div>
                  </Label>
                </RadioGroup>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setAvatarDialogOpen(false)}
                  disabled={avatarLoading}
                >
                  {t("dialog.close")}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleUpdateAvatar}
                  disabled={
                    avatarLoading ||
                    !selectedAvatarUrl ||
                    selectedAvatarUrl === currentAvatarUrl
                  }
                >
                  {avatarLoading ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      {t("dialog.updateAvatar.updatingAvatar")}
                    </>
                  ) : (
                    <>
                      <PencilIcon className="h-4 w-4" />
                      {t("dialog.updateAvatar.updateAvatar")}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
