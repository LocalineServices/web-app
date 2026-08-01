import { getAppName } from "@/actions/get-env"
import BackgroundPattern from "@/components/background-pattern"
import LocalineLogo from "@/components/logo"
import { KeyRoundIcon, LanguagesIcon, UsersIcon } from "lucide-react"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const t = await getTranslations("AuthLayout")
  const appName = await getAppName()

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col overflow-hidden bg-muted p-10 text-foreground lg:flex">
        <BackgroundPattern />

        <div className="relative z-10 flex items-center gap-2 font-semibold">
          <LocalineLogo />
          <span className="text-xl">{appName}</span>
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center">
          <blockquote className="space-y-4">
            <p className="text-lg">{t("description")}</p>
            <footer className="text-sm opacity-80">{t("subtitle")}</footer>
          </blockquote>
        </div>
        <div className="relative z-10 mt-auto">
          <div className="flex gap-8 text-sm opacity-80">
            <div className="flex items-center gap-2">
              <LanguagesIcon className="h-4 w-4" />
              <span>{t("features.formats")}</span>
            </div>
            <div className="flex items-center gap-2">
              <UsersIcon className="h-4 w-4" />
              <span>{t("features.team")}</span>
            </div>
            <div className="flex items-center gap-2">
              <KeyRoundIcon className="h-4 w-4" />
              <span>{t("features.api")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="mx-auto w-full max-w-md space-y-6">{children}</div>
      </div>
    </div>
  )
}
