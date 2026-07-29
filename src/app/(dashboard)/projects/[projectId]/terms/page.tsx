import ProjectNavigation from "@/components/dashboard/projects/project/ProjectNavigation"
import CreateTermDialog from "@/components/dashboard/projects/project/terms/CreateTermDialog"
import ProjectTermsTable from "@/components/dashboard/projects/project/terms/TermsTable"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ProjectTermsPage")
  return {
    title: t("title"),
  }
}

export default async function ProjectTermsPage() {
  const t = await getTranslations("ProjectTermsPage")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full items-start justify-between gap-4">
        <ProjectNavigation description={t("description")} />

        <div className="flex gap-2">
          <CreateTermDialog />
        </div>
      </div>

      <div>
        <ProjectTermsTable />
      </div>
    </div>
  )
}
