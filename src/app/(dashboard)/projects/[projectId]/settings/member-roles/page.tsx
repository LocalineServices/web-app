import ProjectNavigation from "@/components/dashboard/projects/project/ProjectNavigation"
import CreateMemberRoleDialog from "@/components/dashboard/projects/project/settings/CreateMemberRoleDialog"
import ProjectMemberRolesTable from "@/components/dashboard/projects/project/settings/MemberRolesTable"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ProjectMemberRoleSettingsPage")
  return {
    title: t("metadata.title"),
  }
}

export default async function ProjectMemberRoleSettingsPage() {
  const t = await getTranslations("ProjectMemberRoleSettingsPage")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full items-start justify-between gap-4">
        <ProjectNavigation description={t("description")} />

        <div className="flex gap-2">
          <CreateMemberRoleDialog />
        </div>
      </div>

      <div>
        <ProjectMemberRolesTable />
      </div>
    </div>
  )
}
