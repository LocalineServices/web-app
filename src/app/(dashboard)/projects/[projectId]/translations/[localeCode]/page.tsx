import ProjectNavigation from "@/components/dashboard/projects/project/ProjectNavigation"
import ProjectTranslationsCard from "@/components/dashboard/projects/project/translations/TranslationsCard"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ProjectTranslationsPage")
  return {
    title: t("title"),
  }
}

export default async function ProjectTranslationsPage({
  params,
}: {
  params: Promise<{ localeCode: string }>
}) {
  const { localeCode } = await params
  const t = await getTranslations("ProjectTranslationsPage")

  return (
    <div className="flex flex-col gap-4">
      <ProjectNavigation description={t("description")} />

      <div>
        <ProjectTranslationsCard localeCode={localeCode} />
      </div>
    </div>
  )
}
