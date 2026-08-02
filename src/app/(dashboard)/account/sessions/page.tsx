import {
  RevokeAllSessionsDialog,
  RevokeOtherSessionsDialog,
} from "@/components/dashboard/account/sessions/RevokeSessionsDialogs"
import SessionsTable from "@/components/dashboard/account/sessions/SessionsTable"
import { auth } from "@/lib/auth"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { headers } from "next/headers"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("SessionsPage")
  return {
    title: t("metadata.title"),
  }
}

export default async function SessionsPage() {
  const t = await getTranslations("SessionsPage")

  const sessions = await auth.api.listSessions({
    headers: await headers(),
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>

        <div className="flex gap-2">
          <RevokeOtherSessionsDialog />
          <RevokeAllSessionsDialog />
        </div>
      </div>

      <div>
        <SessionsTable sessions={sessions} />
      </div>
    </div>
  )
}
