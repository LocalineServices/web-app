"use client"

import { createProjectInvitation } from "@/actions/project-invitations"
import { useProject } from "@/components/project-provider"
import { useSession } from "@/components/session-provider"
import { Button } from "@/components/ui/button"
import RolePickerField from "@/components/ui/custom/RolePickerField"
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

export default function InviteMemberDialog() {
  const router = useRouter()
  const t = useTranslations("InviteMemberDialog")
  const format = useFormatter()

  const { user } = useSession()
  const { project, member } = useProject()

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [roleId, setRoleId] = useState("")

  const canInviteMembers =
    hasPermission(
      member?.role.permissions ?? 0n,
      ProjectPermission.INVITE_MEMBERS
    ) ||
    authClient.admin.checkRolePermission({
      // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
      role: user?.role ?? "user",
      permissions: {
        projects: ["update"],
      },
    })

  const isLimitReached =
    project.plan.membersLimit !== null &&
    project.members.length >= project.plan.membersLimit

  const handleInviteMember = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    if (!roleId) return

    setLoading(true)
    await createProjectInvitation({
      projectId: project.id,
      email: email.trim(),
      roleId,
    })
      .then((invitation) => {
        toast.success(
          t("toast.inviteSuccess", {
            email: invitation.email,
            invitationId: invitation.id.slice(0, 8),
            roleName:
              project.memberRoles.find((r) => r.id === invitation.roleId)
                ?.name ?? "",
            roleId: invitation.roleId,
          })
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(error?.message || t("toast.inviteError", { email }))
      })
      .finally(() => {
        setLoading(false)
        setDialogOpen(false)
        setEmail("")
        setRoleId("")
      })
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <Tooltip>
        <TooltipTrigger
          asChild
          className={
            canInviteMembers && !isLimitReached && !loading
              ? ""
              : "cursor-not-allowed"
          }
        >
          <span className="inline-block">
            <DialogTrigger
              asChild
              disabled={!canInviteMembers || isLimitReached || loading}
            >
              <Button
                variant="outline"
                disabled={!canInviteMembers || isLimitReached || loading}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                {t("button.inviteMember")}
              </Button>
            </DialogTrigger>
          </span>
        </TooltipTrigger>
        {!canInviteMembers ? (
          <TooltipContent>{t("tooltip.noPermission")}</TooltipContent>
        ) : (
          isLimitReached && (
            <TooltipContent>
              {project.plan.membersLimit === 0
                ? t("tooltip.limitZero")
                : t("tooltip.limitReached", {
                    current: format.number(project.members.length),
                    limit: format.number(project.plan.membersLimit ?? 0),
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
          <Label htmlFor="email">{t("dialog.emailLabel")}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("dialog.emailPlaceholder")}
            value={email}
            onChange={({ target: { value } }) => setEmail(value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">{t("dialog.roleLabel")}</Label>
          <RolePickerField
            id="role"
            roles={project.memberRoles
              .filter((role) => role.id !== project.id)
              .sort((a, b) => {
                if (a.permissions !== b.permissions) {
                  return a.permissions > b.permissions ? -1 : 1
                }

                return a.name.localeCompare(b.name)
              })}
            value={roleId}
            onChange={setRoleId}
            disabled={loading}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDialogOpen(false)
              setEmail("")
              setRoleId("")
            }}
            disabled={loading}
          >
            {t("dialog.close")}
          </Button>
          <Button
            variant="outline"
            onClick={handleInviteMember}
            disabled={!email || loading}
          >
            {loading ? (
              <>
                <Spinner className="h-4 w-4" />
                {t("dialog.invitingMember")}
              </>
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                {t("dialog.inviteMember")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
