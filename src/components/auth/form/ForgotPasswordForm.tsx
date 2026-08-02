"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/lib/auth-client"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { redirect } from "next/navigation"
import { SubmitEvent, useState } from "react"
import { toast } from "sonner"

export default function ForgotPasswordForm() {
  const t = useTranslations("ForgotPasswordForm")

  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    await authClient.requestPasswordReset({
      email,
      fetchOptions: {
        onSuccess: () => {
          toast.success(
            t("toast.resetLinkSentSuccess", {
              email,
            })
          )
          redirect("/auth/signin")
        },
        onError: ({ error }) => {
          toast.error(error?.message || t("toast.resetLinkSentFailed"))
          setLoading(false)
        },
      },
      redirectTo: "/auth/reset-password",
    })
  }

  return (
    <>
      <div className="flex flex-col items-center">
        <h1 className="mb-4 text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-1">
          <Label htmlFor="email">{t("emailLabel")}</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            disabled={loading}
            onChange={({ target: { value } }) => setEmail(value)}
          />
        </div>

        <Button
          className="w-full disabled:cursor-not-allowed"
          type="submit"
          disabled={loading}
        >
          {loading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
          {t("button.submit")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("footer.backToSignIn")}{" "}
        <Link href="/auth/signin" className="text-primary underline">
          {t("footer.signIn")}
        </Link>
      </p>
    </>
  )
}
