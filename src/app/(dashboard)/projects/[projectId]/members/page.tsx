import { getProjectMembers } from "@/actions/project-members"
import InvitationsDialog from "@/components/dashboard/projects/project/members/InvitationsDialog"
import InviteMemberDialog from "@/components/dashboard/projects/project/members/InviteMemberDialog"
import ProjectMembersTable from "@/components/dashboard/projects/project/members/MembersTable"
import ProjectNavigation from "@/components/dashboard/projects/project/ProjectNavigation"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ProjectMembersPage")
  return {
    title: t("metadata.title"),
  }
}

export default async function ProjectMembersPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const t = await getTranslations("ProjectMembersPage")

  const { projectId } = await params
  const projectMembers = await getProjectMembers({ projectId })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full items-start justify-between gap-4">
        <ProjectNavigation description={t("description")} />

        <div className="flex gap-2">
          <InvitationsDialog />
          <InviteMemberDialog />
        </div>
      </div>

      <div>
        <ProjectMembersTable members={projectMembers} />
      </div>
    </div>
  )
}
