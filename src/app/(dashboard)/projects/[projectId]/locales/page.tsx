import { getLocales } from "@/actions/locales"
import AddLocaleDialog from "@/components/dashboard/projects/project/locales/AddLocaleDialog"
import ProjectLocalesTable from "@/components/dashboard/projects/project/locales/LocalesTable"
import ProjectNavigation from "@/components/dashboard/projects/project/ProjectNavigation"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ProjectLocalesPage")
  return {
    title: t("metadata.title"),
  }
}

export default async function ProjectLocalesPage() {
  const t = await getTranslations("ProjectLocalesPage")

  const locales = await getLocales({
    includeDisabled: false,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full items-start justify-between gap-4">
        <ProjectNavigation description={t("description")} />

        <div className="flex gap-2">
          <AddLocaleDialog locales={locales} />
        </div>
      </div>

      <div>
        <ProjectLocalesTable />
      </div>
    </div>
  )
}
