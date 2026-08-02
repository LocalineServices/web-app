import { getPlans } from "@/actions/plans"
import { getProjects } from "@/actions/projects"
import AdminProjectsTable from "@/components/dashboard/admin/ProjectsTable"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AdminProjectsPage")
  return {
    title: t("metadata.title"),
  }
}

export default async function AdminProjectsPage() {
  const t = await getTranslations("AdminProjectsPage")

  const [projects, plans] = await Promise.all([
    getProjects({
      includeAll: true,
    }),
    getPlans(),
  ])

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full gap-4 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <div>
        <AdminProjectsTable projects={projects} plans={plans} />
      </div>
    </div>
  )
}
