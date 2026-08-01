import ProjectNavigation from "@/components/dashboard/projects/project/ProjectNavigation"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ProjectWorkflowSettingsPage")
  return {
    title: t("metadata.title"),
  }
}

export default async function ProjectWorkflowSettingsPage() {
  const t = await getTranslations("ProjectWorkflowSettingsPage")

  return (
    <div className="flex flex-col gap-4">
      <ProjectNavigation description={t("description")} />

      <div>
        <p>Not implemented yet.</p>
      </div>
    </div>
  )
}
