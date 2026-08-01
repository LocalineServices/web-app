"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircleIcon, EyeIcon, EyeOffIcon, LockIcon } from "lucide-react"
import Link from "next/link"
import { SubmitEvent, useState } from "react"
import SocialAuthButtons from "@/components/auth/SocialAuthButtons"
import { signUp } from "@/lib/auth-client"
import { toast } from "sonner"
import { redirect } from "next/navigation"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { useTranslations } from "next-intl"

export default function SignUpForm({
  showSocialButtons,
  signUpsDisabled,
  googleEnabled,
  githubEnabled,
  discordEnabled,
}: {
  showSocialButtons?: boolean
  signUpsDisabled?: boolean
  googleEnabled?: boolean
  githubEnabled?: boolean
  discordEnabled?: boolean
}) {
  const t = useTranslations("SignUpForm")

  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  if (signUpsDisabled) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-4">
          <AlertCircleIcon className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-3xl font-semibold">{t("disabled.title")}</h2>
        </div>

        <p className="mx-auto max-w-lg text-center text-lg text-muted-foreground">
          {t("disabled.description")}
        </p>

        <div className="relative inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("disabled.footer.goBackToSignIn")}{" "}
          <Link href="/auth/signin" className="text-primary underline">
            {t("disabled.footer.signIn")}
          </Link>
        </p>
      </div>
    )
  }

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)

    await signUp.email({
      callbackURL: "/",
      name,
      email,
      password,
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
      fetchOptions: {
        onSuccess: () => {
          toast.success(t("toast.signUpSuccess"))
          redirect("/")
        },
        onError: ({ error }) => {
          toast.error(
            error?.message || t("toast.signUpFailed")
          )
          setLoading(false)
        },
      },
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
          <Label htmlFor="name">{t("nameLabel")}</Label>
          <Input
            id="name"
            type="text"
            required
            value={name}
            disabled={loading}
            onChange={({ target: { value } }) => setName(value)}
          />
        </div>

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
          {t("button.signUp")}
        </Button>
      </form>

      {showSocialButtons && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t("socialProviders.title")}
              </span>
            </div>
          </div>

          <div className="mt-3 flex justify-center">
            <SocialAuthButtons
              loading={loading}
              setLoading={setLoading}
              googleEnabled={googleEnabled}
              githubEnabled={githubEnabled}
              discordEnabled={discordEnabled}
            />
          </div>
        </>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("footer.alreadyHaveAccount")}{" "}
        <Link href="/auth/signin" className="text-primary underline">
          {t("footer.signIn")}
        </Link>
      </p>
    </>
  )
}
