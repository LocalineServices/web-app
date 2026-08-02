"use client"

import { createProject } from "@/actions/projects"
import { useSession } from "@/components/session-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import { Plan } from "@prisma/client"
import { PlusIcon } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { MouseEvent, useState } from "react"
import { toast } from "sonner"

export default function CreateProjectDialog({
  projectCount,
  defaultPlan,
}: {
  projectCount: number
  defaultPlan: Plan | null
}) {
  const router = useRouter()
  const t = useTranslations("CreateProjectDialog")
  const format = useFormatter()

  const { user } = useSession()

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState<string | null>(null)

  const projectLimit = user?.projectsLimit ?? Infinity
  const canCreateProject = projectCount < projectLimit

  const handleCreateProject = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    await createProject({
      name: name,
      description: description || undefined,
      planId: defaultPlan?.id || "",
    })
      .then((project) => {
        toast.success(
          t("toast.creationSuccess", {
            projectName: project.name,
            projectId: project.id,
          })
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message || t("toast.creationFailed", { projectName: name })
        )
      })
      .finally(() => {
        setLoading(false)
        setDialogOpen(false)
        setName("")
        setDescription(null)
      })
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <Tooltip>
        <TooltipTrigger
          asChild
          className={
            canCreateProject && defaultPlan && !loading
              ? ""
              : "cursor-not-allowed"
          }
        >
          <span className="inline-block">
            <DialogTrigger
              asChild
              disabled={!canCreateProject || !defaultPlan || loading}
            >
              <Button
                variant="outline"
                disabled={!canCreateProject || !defaultPlan || loading}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                {t("button.createProject")}
              </Button>
            </DialogTrigger>
          </span>
        </TooltipTrigger>
        {!canCreateProject ? (
          <TooltipContent>
            {projectLimit === 0
              ? t("tooltip.limitZero")
              : t("tooltip.limitExceeded", {
                  current: format.number(projectCount),
                  limit: format.number(projectLimit),
                })}
          </TooltipContent>
        ) : (
          !defaultPlan && (
            <TooltipContent>{t("tooltip.noDefaultPlan")}</TooltipContent>
          )
        )}
      </Tooltip>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dialog.createProject.title")}</DialogTitle>
          <DialogDescription>
            {t("dialog.createProject.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">
              {t("dialog.createProject.nameLabel")}
            </Label>
            <Input
              id="projectName"
              placeholder={t("dialog.createProject.namePlaceholder")}
              value={name}
              minLength={1}
              maxLength={32}
              required
              onChange={({ target: { value } }) => setName(value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectDescription">
              {t("dialog.createProject.descriptionLabel")}
            </Label>
            <Input
              id="projectDescription"
              placeholder={t("dialog.createProject.descriptionPlaceholder")}
              value={description ?? ""}
              minLength={1}
              maxLength={255}
              onChange={({ target: { value } }) => setDescription(value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDialogOpen(false)
              setName("")
              setDescription(null)
            }}
            disabled={loading}
          >
            {t("dialog.close")}
          </Button>

          <Button
            variant="outline"
            onClick={handleCreateProject}
            disabled={!name || loading}
          >
            {loading ? (
              <>
                <Spinner className="h-4 w-4" />
                {t("dialog.createProject.creatingProject")}
              </>
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                {t("dialog.createProject.createProject")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
