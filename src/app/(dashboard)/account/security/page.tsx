import DataExportCard from "@/components/dashboard/account/security/DataExportCard"
import DeleteAccountCard from "@/components/dashboard/account/security/DeleteAccountCard"
import SecurityDetailsCard from "@/components/dashboard/account/security/SecurityDetailsCard"
import { auth } from "@/lib/auth"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { headers } from "next/headers"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("SecurityPage")
  return {
    title: t("metadata.title"),
  }
}

export default async function SecurityPage() {
  const t = await getTranslations("SecurityPage")

  const accounts = await auth.api.listUserAccounts({
    headers: await headers(),
  })

  const hasCredentialAccount = accounts.some(
    (account) => account.providerId === "credential"
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full gap-4 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <div className="flex w-full flex-row gap-4 max-[700px]:flex-col">
        <div className="w-full min-w-0 xl:flex-1">
          <SecurityDetailsCard hasCredentialAccount={hasCredentialAccount} />
        </div>
        <div className="w-full min-w-0 flex-col gap-4 space-y-4 xl:flex-1">
          <DataExportCard />
          <DeleteAccountCard />
        </div>
      </div>
    </div>
  )
}
