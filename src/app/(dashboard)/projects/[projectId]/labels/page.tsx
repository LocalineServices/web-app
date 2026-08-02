import CreateLabelDialog from "@/components/dashboard/projects/project/labels/CreateLabelDialog"
import ProjectLabelsTable from "@/components/dashboard/projects/project/labels/LabelsTable"
import ProjectNavigation from "@/components/dashboard/projects/project/ProjectNavigation"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ProjectLabelsPage")
  return {
    title: t("metadata.title"),
  }
}

export default async function ProjectLabelsPage() {
  const t = await getTranslations("ProjectLabelsPage")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full items-start justify-between gap-4">
        <ProjectNavigation description={t("description")} />

        <div className="flex gap-2">
          <CreateLabelDialog />
        </div>
      </div>

      <div>
        <ProjectLabelsTable />
      </div>
    </div>
  )
}
