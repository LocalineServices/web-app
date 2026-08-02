"use client"

import { useProject } from "@/components/project-provider"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"

export default function ProjectNavigation({
  description,
  href = "/projects",
}: {
  description?: string
  href?: string
}) {
  const t = useTranslations("ProjectNavigation")
  const { project } = useProject()

  return (
    <div className="flex w-full items-center gap-4">
      <Button variant="ghost" size="icon" asChild>
        <Link href={href}>
          <ArrowLeftIcon />
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-bold">
          {project?.name ?? t("invalidProject")}
        </h1>
        <p className="text-muted-foreground">
          {description ?? project?.description ?? t("noDescription")}
        </p>
      </div>
    </div>
  )
}
