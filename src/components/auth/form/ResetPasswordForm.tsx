"use client"

import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/lib/auth-client"
import { AlertCircleIcon, EyeIcon, EyeOffIcon, LockIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { redirect, useSearchParams } from "next/navigation"
import { SubmitEvent, useState } from "react"
import { toast } from "sonner"

export default function ResetPasswordForm() {
  const t = useTranslations("ResetPasswordForm")

  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  if (!token) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-4">
          <AlertCircleIcon className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-3xl font-semibold">{t("missingToken.title")}</h2>
        </div>

        <p className="mx-auto max-w-lg text-center text-lg text-muted-foreground">
          {t("missingToken.description")}
        </p>

        <div className="relative inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("missingToken.footer.backToForgotPassword")}{" "}
          <Link href="/auth/forgot-password" className="text-primary underline">
            {t("missingToken.footer.forgotPassword")}
          </Link>
        </p>
      </div>
    )
  }

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    setLoading(true)
    await authClient.resetPassword({
      fetchOptions: {
        onSuccess: () => {
          toast.success(t("toast.resetPasswordSuccess"))
          redirect("/auth/signin")
        },
        onError: ({ error }) => {
          toast.error(
            error?.message || t("toast.resetPasswordFailed")
          )
          setLoading(false)
        },
      },
      newPassword: password,
      token,
    })
  }

  return (
    <>
      <div className="flex flex-col items-center">
        <h1 className="mb-4 text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-1">
          <Label htmlFor="password">{t("passwordLabel")}</Label>

          <InputGroup>
            <InputGroupInput
              id="password"
              placeholder={t("passwordPlaceholder")}
              type={showPassword && !loading ? "text" : "password"}
              required
              value={password}
              disabled={loading}
              onChange={({ target: { value } }) => setPassword(value)}
            />

            <InputGroupAddon>
              <LockIcon />
            </InputGroupAddon>

            <InputGroupAddon align="inline-end">
              <Button
                disabled={loading}
                onClick={() => setShowPassword(!showPassword)}
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground disabled:hover:text-muted-foreground"
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </div>

        <Button
          className="w-full disabled:cursor-not-allowed"
          type="submit"
          disabled={loading}
        >
          {loading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
          {t("button.reset")}
        </Button>
      </form>
    </>
  )
}
