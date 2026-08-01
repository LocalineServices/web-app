import { getDefaultPlan } from "@/actions/plans"
import { getProjects } from "@/actions/projects"
import CreateProjectDialog from "@/components/dashboard/projects/CreateProjectDialog"
import ProjectsList from "@/components/dashboard/projects/ProjectsList"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ProjectsPage")
  return {
    title: t("metadata.title"),
  }
}

export default async function ProjectsPage() {
  const t = await getTranslations("ProjectsPage")

  const [projects, defaultPlan] = await Promise.all([
    getProjects({
      includeAll: false,
    }),
    getDefaultPlan(),
  ])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>

        <div>
          <CreateProjectDialog
            projectCount={projects.length}
            defaultPlan={defaultPlan}
          />
        </div>
      </div>

      <div>
        <ProjectsList projects={projects} defaultPlan={defaultPlan} />
      </div>
    </div>
  )
}
