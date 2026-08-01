import {
  isDiscordLoginEnabled,
  isGitHubLoginEnabled,
  isGoogleLoginEnabled,
} from "@/actions/get-env"
import ConnectionsCard from "@/components/dashboard/account/connections/ConnectionsCard"
import { auth } from "@/lib/auth"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { headers } from "next/headers"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ConnectionsPage")
  return {
    title: t("metadata.title"),
  }
}

export default async function ConnectionsPage() {
  const t = await getTranslations("ConnectionsPage")

  const [accounts, googleEnabled, githubEnabled, discordEnabled] =
    await Promise.all([
      auth.api.listUserAccounts({
        headers: await headers(),
      }),
      isGoogleLoginEnabled(),
      isGitHubLoginEnabled(),
      isDiscordLoginEnabled(),
    ])

  const enabledProviders = [
    googleEnabled ? "google" : null,
    githubEnabled ? "github" : null,
    discordEnabled ? "discord" : null,
  ].filter(Boolean) as string[]

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full gap-4 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <div>
        <ConnectionsCard
          accounts={accounts}
          enabledProviders={enabledProviders}
        />
      </div>
    </div>
  )
}
