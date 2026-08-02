import {
  isEmailVerificationRequired,
  isProduction,
  getVersion,
} from "@/actions/get-env"
import ToggleAdminButton from "@/components/dashboard/ToggleAdminButton"
import { Metadata } from "next"
import DashboardCards from "@/components/dashboard/DashboardCards"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("DashboardPage")
  return {
    title: t("metadata.title"),
  }
}

export default async function DashboardPage() {
  const t = await getTranslations("DashboardPage")

  const [emailVerificationRequired, version] = await Promise.all([
    isEmailVerificationRequired(),
    getVersion(),
  ])

  const startYear = 2026
  const currentYear = new Date().getFullYear()

  const dateRange =
    startYear === currentYear ? `${currentYear}` : `${startYear}-${currentYear}`

  return (
    <div className="flex h-full flex-col">
      <div className="mx-auto flex w-full flex-1 flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <p className="mt-1 text-muted-foreground">{t("description")}</p>
          </div>

          {!(await isProduction()) && <ToggleAdminButton />}
        </div>

        <DashboardCards
          emailVerificationRequired={emailVerificationRequired}
          currentVersion={version}
        />

        <footer className="mt-auto border-t pt-6 text-center text-sm text-muted-foreground">
          © {dateRange} Localine. All rights reserved.
        </footer>
      </div>
    </div>
  )
}
