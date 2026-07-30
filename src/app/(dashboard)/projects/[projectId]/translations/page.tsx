import ProjectNavigation from "@/components/dashboard/projects/project/ProjectNavigation"
import ProjectTranslationLocalesCards from "@/components/dashboard/projects/project/translations/LocalesCards"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ProjectTranslationLocalesPage")
  return {
    title: t("title"),
  }
}

export default async function ProjectTranslationLocalesPage() {
  const t = await getTranslations("ProjectTranslationLocalesPage")

  return (
    <div className="flex flex-col gap-4">
      <ProjectNavigation description={t("description")} />

      <div>
        <ProjectTranslationLocalesCards />
      </div>
    </div>
  )
}
