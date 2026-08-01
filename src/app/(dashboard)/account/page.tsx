import ProfileDetailsCard from "@/components/dashboard/account/ProfileDetailsCard"
import ProfileInformationCard from "@/components/dashboard/account/ProfileInformatioCard"
import { auth } from "@/lib/auth"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { headers } from "next/headers"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PublicProfilePage")
  return {
    title: t("metadata.title"),
  }
}

export default async function PublicProfilePage() {
  const t = await getTranslations("PublicProfilePage")

  const accounts = await auth.api.listUserAccounts({
    headers: await headers(),
  })

  const githubAccount = accounts.find(
    (account) => account.providerId === "github"
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full gap-4 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <div className="flex w-full flex-row gap-4 max-[700px]:flex-col">
        <div className="w-full min-w-0 xl:flex-1">
          <ProfileDetailsCard githubAccount={githubAccount} />
        </div>
        <div className="w-full min-w-0 xl:flex-1">
          <ProfileInformationCard />
        </div>
      </div>
    </div>
  )
}
