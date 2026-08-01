import ProjectNavigation from "@/components/dashboard/projects/project/ProjectNavigation"
import DeleteProjectCard from "@/components/dashboard/projects/project/settings/DeleteProjectCard"
import ProjectDetailsCard from "@/components/dashboard/projects/project/settings/ProjectDetailsCard"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ProjectGeneralSettingsPage")
  return {
    title: t("metadata.title"),
  }
}

export default async function ProjectGeneralSettingsPage() {
  const t = await getTranslations("ProjectGeneralSettingsPage")

  return (
    <div className="flex flex-col gap-4">
      <ProjectNavigation description={t("description")} />

      <div className="flex w-full flex-row gap-4 max-[700px]:flex-col">
        <div className="w-full min-w-0 xl:flex-1">
          <ProjectDetailsCard />
        </div>
        <div className="w-full min-w-0 xl:flex-1">
          <DeleteProjectCard />
        </div>
      </div>
    </div>
  )
}
