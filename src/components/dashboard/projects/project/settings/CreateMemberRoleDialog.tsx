"use client"

import { createProjectMemberRole } from "@/actions/project-member-roles"
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
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { MouseEvent, useState } from "react"
import { toast } from "sonner"

export default function CreateMemberRoleDialog() {
  const router = useRouter()
  const t = useTranslations("CreateMemberRoleDialog")

  const { user } = useSession()
  const { project, member } = useProject()

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState("")

  const canManageRoles =
    hasPermission(
      member?.role.permissions ?? 0n,
      ProjectPermission.MANAGE_ROLES
    ) ||
    authClient.admin.checkRolePermission({
      // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
      role: user?.role ?? "user",
      permissions: {
        projects: ["update"],
      },
    })

  const isLimitReached = project.memberRoles.length >= 100 // Arbitrary limit to prevent too many roles

  const handleCreateRole = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    await createProjectMemberRole({
      projectId: project.id,
      name: name.trim(),
    })
      .then((role) => {
        toast.success(t("toast.createSuccess", { roleName: role.name }))
        router.refresh()
      })
      .catch((error) => {
        toast.error(error?.message || t("toast.createFailed"))
      })
      .finally(() => {
        setLoading(false)
        setDialogOpen(false)
        setName("")
      })
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <Tooltip>
        <TooltipTrigger
          asChild
          className={
            canManageRoles && !isLimitReached && !loading
              ? ""
              : "cursor-not-allowed"
          }
        >
          <span className="inline-block">
            <DialogTrigger
              asChild
              disabled={!canManageRoles || isLimitReached || loading}
            >
              <Button
                variant="outline"
                disabled={!canManageRoles || isLimitReached || loading}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                {t("button.createMemberRole")}
              </Button>
            </DialogTrigger>
          </span>
        </TooltipTrigger>
        {!canManageRoles ? (
          <TooltipContent>{t("tooltip.noPermission")}</TooltipContent>
        ) : (
          isLimitReached && (
            <TooltipContent>
              {t("tooltip.limitReached", {
                current: project.memberRoles.length,
                limit: 100,
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

        <div className="space-y-2">
          <Label htmlFor="roleName">{t("dialog.nameLabel")}</Label>
          <Input
            id="roleName"
            type="text"
            placeholder={t("dialog.namePlaceholder")}
            value={name}
            onChange={({ target: { value } }) => setName(value)}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDialogOpen(false)
              setName("")
            }}
            disabled={loading}
          >
            {t("dialog.close")}
          </Button>
          <Button
            variant="outline"
            onClick={handleCreateRole}
            disabled={!name || loading}
          >
            {loading ? (
              <>
                <Spinner className="h-4 w-4" />
                {t("dialog.creatingMemberRole")}
              </>
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                {t("dialog.createMemberRole")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
