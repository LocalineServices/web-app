import { getProjectInvitations } from "@/actions/project-invitations"
import InvitationsTable from "@/components/dashboard/projects/invitations/InvitationsTable"
import { decrypt } from "@/lib/crypto"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("InvitationsPage")
  return {
    title: t("metadata.title"),
  }
}

export default async function InvitationsPage() {
  const t = await getTranslations("InvitationsPage")

  const invitations = await getProjectInvitations()

  const invitationsWithDecryptedTokens = await Promise.all(
    invitations.map(async (invitation) => ({
      ...invitation,
      token: decrypt(invitation.token),
    }))
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full gap-4 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <div>
        <InvitationsTable invitations={invitationsWithDecryptedTokens} />
      </div>
    </div>
  )
}
