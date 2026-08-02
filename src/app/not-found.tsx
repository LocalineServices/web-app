import Link from "next/link"
import { Button } from "@/components/ui/button"
import BackgroundPattern from "@/components/background-pattern"
import { AlertCircleIcon, HomeIcon, LogInIcon } from "lucide-react"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import LocalineLogo from "@/components/logo"
import { getAppName } from "@/actions/get-env"
import { getTranslations } from "next-intl/server"

export default async function NotFoundPage() {
  const t = await getTranslations("NotFoundPage")

  const [appName, session] = await Promise.all([
    getAppName(),
    auth.api.getSession({
      headers: await headers(),
    }),
  ])
  const isAuthenticated = !!session?.session

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted">
      <BackgroundPattern />

      <div className="relative z-10 space-y-8 px-4 text-center">
        <div className="mb-8 inline-flex items-center gap-2 font-semibold">
          <LocalineLogo />
          <span className="text-2xl">{appName}</span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <AlertCircleIcon className="h-16 w-16 text-muted-foreground" />
            <h1 className="text-8xl font-bold text-muted-foreground">
              {t("title")}
            </h1>
          </div>
          <h2 className="text-3xl font-semibold">{t("subtitle")}</h2>
          <p className="mx-auto max-w-lg text-lg text-muted-foreground">
            {t("description")}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
          {isAuthenticated ? (
            <Button asChild size="lg">
              <Link href="/">
                <HomeIcon className="mr-2 h-5 w-5" />
                {t("button.goToDashboard")}
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/signin">
                <LogInIcon className="mr-2 h-5 w-5" />
                {t("button.signIn")}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
