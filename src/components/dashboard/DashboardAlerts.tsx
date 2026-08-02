import { useSession } from "@/components/session-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangleIcon } from "lucide-react"
import { useTranslations } from "next-intl"

export default function DashboardAlerts({
  emailVerificationRequired,
  hasUpdate,
  latestRelease,
  currentVersion,
}: {
  emailVerificationRequired: boolean
  hasUpdate: boolean
  latestRelease: string | null
  currentVersion: string
}) {
  const t = useTranslations("DashboardAlerts")

  const { user } = useSession()

  return (
    <>
      {emailVerificationRequired && !user?.emailVerified && (
        <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-50">
          <AlertTriangleIcon className="size-4 text-amber-600 dark:text-amber-300" />

          <AlertTitle>{t("emailVerification.title")}</AlertTitle>
          <AlertDescription className="text-amber-900/80 dark:text-amber-100/80">
            {t("emailVerification.description")}
          </AlertDescription>
        </Alert>
      )}

      {hasUpdate && (
        <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-50">
          <AlertTriangleIcon className="size-4 text-amber-600 dark:text-amber-300" />

          <AlertTitle>
            {t("updateAvailable.title", {
              latestRelease: latestRelease ?? "",
              currentVersion,
            })}
          </AlertTitle>
          <AlertDescription className="text-amber-900/80 dark:text-amber-100/80">
            {t("updateAvailable.description", {
              latestRelease: latestRelease ?? "",
              currentVersion,
            })}
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}
