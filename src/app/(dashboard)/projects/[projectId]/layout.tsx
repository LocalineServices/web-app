import { getProject } from "@/actions/projects"
import { ProjectProvider } from "@/components/project-provider"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>
}): Promise<Metadata> {
  const { projectId } = await params
  const t = await getTranslations("ProjectLayout")

  const project = await getProject(projectId)

  if (!project) {
    return {
      title: t("notFoundTitle"),
      robots: "noindex",
    }
  }

  return {
    title: {
      default: project.name,
      template: `%s | ${project.name} | Localine`,
    },
    robots: "noindex",
  }
}

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  const project = await getProject(projectId)

  if (!project) {
    return notFound()
  }

  return <ProjectProvider project={project}>{children}</ProjectProvider>
}
