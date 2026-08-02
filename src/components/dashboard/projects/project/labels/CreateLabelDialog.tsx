"use client"

import { createProjectLabel } from "@/actions/project-labels"
import { useProject } from "@/components/project-provider"
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
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { authClient } from "@/lib/auth-client"
import { hasPermission, ProjectPermission } from "@/lib/project-permissions"
import { PlusIcon } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { MouseEvent, useState } from "react"
import { toast } from "sonner"

export default function CreateLabelDialog() {
  const router = useRouter()
  const t = useTranslations("CreateLabelDialog")
  const format = useFormatter()

  const { user } = useSession()
  const { project, member } = useProject()

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState<string | null>(null)

  const canManageLabels =
    hasPermission(
      member?.role.permissions ?? 0n,
      ProjectPermission.MANAGE_LABELS
    ) ||
    authClient.admin.checkRolePermission({
      // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
      role: user?.role ?? "user",
      permissions: {
        projects: ["update"],
      },
    })

  const isLimitReached =
    project.plan.labelsLimit !== null &&
    project.labels.length >= project.plan.labelsLimit

  const handleCreateLabel = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    await createProjectLabel({
      projectId: project.id,
      name: name.trim(),
      description: description?.trim() || null,
    })
      .then((label) => {
        toast.success(
          t("toast.createSuccess", {
            labelName: label.name,
            labelId: label.id.slice(0, 8),
          })
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message || t("toast.createFailed", { labelName: name })
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
            canManageLabels && !isLimitReached && !loading
              ? ""
              : "cursor-not-allowed"
          }
        >
          <span className="inline-block">
            <DialogTrigger
              asChild
              disabled={!canManageLabels || isLimitReached || loading}
            >
              <Button
                variant="outline"
                disabled={!canManageLabels || isLimitReached || loading}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                {t("button.createLabel")}
              </Button>
            </DialogTrigger>
          </span>
        </TooltipTrigger>
        {!canManageLabels ? (
          <TooltipContent>{t("tooltip.noPermission")}</TooltipContent>
        ) : (
          isLimitReached && (
            <TooltipContent>
              {project.plan.labelsLimit === 0
                ? t("tooltip.limitZero")
                : t("tooltip.limitReached", {
                    current: format.number(project.labels.length),
                    limit: format.number(project.plan.labelsLimit ?? 0),
                  })}
            </TooltipContent>
          )
        )}
      </Tooltip>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dialog.title")}</DialogTitle>
          <DialogDescription>{t("dialog.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="labelName">{t("dialog.labelNameLabel")}</Label>
            <Input
              id="labelName"
              placeholder={t("dialog.labelNamePlaceholder")}
              value={name}
              onChange={({ target: { value } }) => setName(value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="labelDescription">
              {t("dialog.descriptionLabel")}
            </Label>
            <Input
              id="labelDescription"
              placeholder={t("dialog.descriptionPlaceholder")}
              value={description ?? ""}
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
            onClick={handleCreateLabel}
            disabled={!name || loading}
          >
            {loading ? (
              <>
                <Spinner className="h-4 w-4" />
                {t("dialog.creatingLabel")}
              </>
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                {t("dialog.createLabel")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
