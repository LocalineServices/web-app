"use client"

import { useSession } from "@/components/session-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import {
  EyeIcon,
  EyeOffIcon,
  FingerprintIcon,
  KeySquareIcon,
  LockKeyholeIcon,
  MailIcon,
  PencilIcon,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { MouseEvent, useState } from "react"
import { toast } from "sonner"

export default function SecurityDetailsCard({
  hasCredentialAccount,
}: {
  hasCredentialAccount: boolean
}) {
  const router = useRouter()
  const t = useTranslations("SecurityDetailsCard")

  const { user } = useSession()

  const [loading, setLoading] = useState(false)
  const [isEmailVisible, setEmailVisible] = useState(false)
  const [isEmailDialogOpen, setEmailDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setPasswordDialogOpen] = useState(false)

  const [email, setEmail] = useState(user?.email ?? "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("") // Used for both new password and confirm new password when the user doesn't have a password yet
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  const handleUpdateEmail = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    await authClient.changeEmail({
      newEmail: email.trim(),
      callbackURL: `${window.location.origin}/account/security`,
      fetchOptions: {
        onSuccess: () => {
          // TODO: Add a check if it got directly updated or if the user needs to confirm via email first and show a different message accordingly
          toast.success(t("toast.emailUpdated"))
          setEmailDialogOpen(false)
          setLoading(false)
          router.refresh()
        },
        onError: ({ error }) => {
          toast.error(error?.message || t("toast.emailUpdateFailed"))
          setEmailDialogOpen(false)
          setLoading(false)

          setEmail(user?.email ?? "")
        },
      },
    })
  }

  const handleUpdatePassword = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    await authClient.changePassword({
      currentPassword: currentPassword.trim(),
      newPassword: newPassword.trim(),
      revokeOtherSessions: true,
      fetchOptions: {
        onSuccess: () => {
          toast.success(t("toast.passwordUpdated"))
          setPasswordDialogOpen(false)
          setLoading(false)

          setCurrentPassword("")
          setNewPassword("")
        },
        onError: ({ error }) => {
          toast.error(error?.message || t("toast.passwordUpdateFailed"))
          setPasswordDialogOpen(false)
          setLoading(false)

          setCurrentPassword("")
          setNewPassword("")
        },
      },
    })
  }

  const handleAddPassword = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    setTimeout(() => {
      toast.error(
        t("toast.passwordAddFailed", {
          message: "Adding a password to an account is not supported yet.",
        })
      )
      setPasswordDialogOpen(false)
      setLoading(false)

      setNewPassword("")
      setConfirmNewPassword("")
    }, 1000)
  }

  return (
    <Card className="w-full">
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
          <Dialog open={isEmailDialogOpen} onOpenChange={setEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon-xs" className="shrink-0">
                <PencilIcon className="size-4" />
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("dialog.updateEmail.title")}</DialogTitle>
                <DialogDescription>
                  {t("dialog.updateEmail.description")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2 py-2">
                <Label htmlFor="email">
                  {t("dialog.updateEmail.inputLabel")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  placeholder={t("dialog.updateEmail.inputPlaceholder")}
                  disabled={loading}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEmailDialogOpen(false)
                    setEmail(user?.email ?? "")
                  }}
                  disabled={loading}
                >
                  {t("dialog.close")}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleUpdateEmail}
                  disabled={
                    !email.trim() ||
                    email.trim() === user?.email?.trim() ||
                    loading
                  }
                >
                  {loading ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      {t("dialog.updateEmail.updatingEmail")}
                    </>
                  ) : (
                    <>
                      <PencilIcon className="h-4 w-4" />
                      {t("dialog.updateEmail.updateEmail")}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>

      <CardContent className="flex items-center justify-between">
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <KeySquareIcon className="size-4" />
          <p>{t("card.password")}</p>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          {hasCredentialAccount ? (
            <Dialog
              open={isPasswordDialogOpen}
              onOpenChange={setPasswordDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline">{t("button.changePassword")}</Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("dialog.changePassword.title")}</DialogTitle>
                  <DialogDescription>
                    {t("dialog.changePassword.description")}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">
                      {t("dialog.changePassword.currentPasswordLabel")}
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      placeholder={t(
                        "dialog.changePassword.currentPasswordPlaceholder"
                      )}
                      disabled={loading}
                      onChange={({ target: { value } }) =>
                        setCurrentPassword(value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">
                      {t("dialog.changePassword.newPasswordLabel")}
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      placeholder={t(
                        "dialog.changePassword.newPasswordPlaceholder"
                      )}
                      disabled={loading}
                      onChange={({ target: { value } }) =>
                        setNewPassword(value)
                      }
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPasswordDialogOpen(false)
                      setCurrentPassword("")
                      setNewPassword("")
                    }}
                    disabled={loading}
                  >
                    {t("dialog.close")}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleUpdatePassword}
                    disabled={
                      !newPassword.trim() ||
                      currentPassword.trim() === newPassword.trim() ||
                      loading
                    }
                  >
                    {loading ? (
                      <>
                        <Spinner className="h-4 w-4" />
                        {t("dialog.changePassword.updatingPassword")}
                      </>
                    ) : (
                      <>
                        <PencilIcon className="h-4 w-4" />
                        {t("dialog.changePassword.updatePassword")}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog
              open={isPasswordDialogOpen}
              onOpenChange={setPasswordDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline">{t("button.addPassword")}</Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("dialog.addPassword.title")}</DialogTitle>
                  <DialogDescription>
                    {t("dialog.addPassword.description")}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">
                      {t("dialog.addPassword.passwordLabel")}
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      placeholder={t("dialog.addPassword.passwordPlaceholder")}
                      disabled={loading}
                      onChange={({ target: { value } }) =>
                        setNewPassword(value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPasswordConfirm">
                      {t("dialog.addPassword.confirmPasswordLabel")}
                    </Label>
                    <Input
                      id="newPasswordConfirm"
                      type="password"
                      value={confirmNewPassword}
                      placeholder={t(
                        "dialog.addPassword.confirmPasswordPlaceholder"
                      )}
                      disabled={loading}
                      onChange={({ target: { value } }) =>
                        setConfirmNewPassword(value)
                      }
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPasswordDialogOpen(false)
                      setNewPassword("")
                      setConfirmNewPassword("")
                    }}
                    disabled={loading}
                  >
                    {t("dialog.close")}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleAddPassword}
                    disabled={
                      !newPassword.trim() ||
                      newPassword.trim() !== confirmNewPassword.trim() ||
                      loading
                    }
                  >
                    {loading ? (
                      <>
                        <Spinner className="h-4 w-4" />
                        {t("dialog.addPassword.addingPassword")}
                      </>
                    ) : (
                      <>
                        <PencilIcon className="h-4 w-4" />
                        {t("dialog.addPassword.addPassword")}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>

      <CardContent className="flex items-center justify-between">
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <LockKeyholeIcon className="size-4" />
          <p>{t("card.twoFactor")}</p>

          <span className="rounded-md bg-muted px-1 text-xs text-muted-foreground">
            Coming soon
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          {false ? (
            <Button variant="outline">{t("button.manageTwoFactor")}</Button>
          ) : (
            <Button variant="outline" disabled>
              {t("button.setupTwoFactor")}
            </Button>
          )}
        </div>
      </CardContent>

      <CardContent className="flex items-center justify-between">
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <FingerprintIcon className="size-4" />
          <p>{t("card.passkey")}</p>

          <span className="rounded-md bg-muted px-1 text-xs text-muted-foreground">
            Coming soon
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          {false ? (
            <Button variant="outline">{t("button.managePasskeys")}</Button>
          ) : (
            <Button variant="outline" disabled>
              {t("button.setupPasskey")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
