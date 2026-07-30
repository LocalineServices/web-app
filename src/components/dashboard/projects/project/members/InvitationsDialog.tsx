"use client"

import {
  revokeProjectInvitation,
  updateProjectInvitation,
} from "@/actions/project-invitations"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import RolePickerField from "@/components/ui/custom/RolePickerField"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { ProjectInvitationWithRole } from "@/types/project"
import { SendIcon, SquareArrowRightExitIcon, TrashIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { ProjectInvitation } from "@prisma/client"
import { useSession } from "@/components/session-provider"
import { useProject } from "@/components/project-provider"
import { hasPermission, ProjectPermission } from "@/lib/project-permissions"
import { authClient } from "@/lib/auth-client"
import { useFormatter, useTranslations } from "next-intl"

export default function InvitationsDialog() {
  const router = useRouter()
  const t = useTranslations("InvitationsDialog")
  const format = useFormatter()

  const { user } = useSession()
  const { project, member } = useProject()

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)

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

  async function handleUpdateInvitation(
    invitation: ProjectInvitationWithRole,
    roleId: string
  ) {
    setLoading(true)

    await updateProjectInvitation({
      projectId: invitation.projectId,
      invitationId: invitation.id,
      roleId,
    })
      .then(() => {
        toast.success(
          t("toast.updateSuccess", {
            email: invitation.email,
            roleName: invitation.role.name,
            invitationId: invitation.id.slice(0, 8),
          })
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message ||
            t("toast.updateError", {
              email: invitation.email,
              roleName: invitation.role.name,
              invitationId: invitation.id.slice(0, 8),
            })
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild disabled={!canInviteMembers || loading}>
        <Button
          variant="outline"
          className="disabled:pointer-events-auto disabled:cursor-not-allowed"
          disabled={!canInviteMembers || loading}
        >
          <SendIcon className="mr-2 h-4 w-4" />
          {t("button.viewInvitations")}
        </Button>
      </DialogTrigger>

      <DialogContent className="flex h-140 max-h-[calc(100dvh-4rem)] flex-col gap-0 overflow-hidden sm:max-w-230">
        <DialogHeader className="pb-4">
          <DialogTitle>{t("dialog.title")}</DialogTitle>
          <DialogDescription>{t("dialog.description")}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="max-w-28 text-center">
                  {t("table.header.id")}
                </TableHead>
                <TableHead>{t("table.header.email")}</TableHead>
                <TableHead className="text-center">
                  {t("table.header.role")}
                </TableHead>
                <TableHead>{t("table.header.expiresAt")}</TableHead>
                <TableHead className="max-w-24 text-center">
                  {t("table.header.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {project.invitations.length > 0 ? (
                project.invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="text-center">
                      {invitation.id.slice(0, 8)}
                    </TableCell>

                    <TableCell className="min-w-40">
                      {invitation.email}
                    </TableCell>

                    <TableCell className="text-center">
                      <RolePickerField
                        id={`role-${invitation.id}`}
                        roles={project.memberRoles
                          .filter((role) => role.id !== project.id)
                          .sort((a, b) => {
                            if (a.permissions !== b.permissions) {
                              return a.permissions > b.permissions ? -1 : 1
                            }

                            return a.name.localeCompare(b.name)
                          })}
                        value={invitation.role.id}
                        onChange={(roleId) => {
                          handleUpdateInvitation(invitation, roleId)
                        }}
                        disabled={loading}
                        allowNone={false}
                      />
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        {format.dateTime(invitation.expiresAt, {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {invitation.expiresAt < new Date() && (
                          <Badge variant="destructive" className="ml-2">
                            {t("table.row.badge.expired")}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <ResendInvitationDialog
                          invitation={invitation}
                          canInviteMembers={canInviteMembers}
                          loading={loading}
                          setLoading={setLoading}
                        />
                        <RevokeInvitationDialog
                          invitation={invitation}
                          canInviteMembers={canInviteMembers}
                          loading={loading}
                          setLoading={setLoading}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {t("table.noInvitationsFound")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ResendInvitationDialog({
  invitation,
  canInviteMembers,
  loading,
  setLoading,
}: {
  invitation: ProjectInvitation
  canInviteMembers: boolean
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()
  const t = useTranslations("InvitationsDialog")

  const isExpired = invitation.expiresAt < new Date()

  const handleResendInvitation = async (invitation: ProjectInvitation) => {
    setLoading(true)

    await updateProjectInvitation({
      projectId: invitation.projectId,
      invitationId: invitation.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })
      .then(() => {
        toast.success(
          t("toast.resendSuccess", {
            email: invitation.email,
            invitationId: invitation.id.slice(0, 8),
          })
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message ||
            t("toast.resendFailed", {
              email: invitation.email,
              invitationId: invitation.id.slice(0, 8),
            })
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex",
            !canInviteMembers || !isExpired || loading
              ? "cursor-not-allowed"
              : ""
          )}
        >
          <Button
            variant="outline"
            size="icon"
            className="inline-flex items-center p-1 text-sm"
            disabled={!canInviteMembers || !isExpired || loading}
            onClick={() => handleResendInvitation(invitation)}
          >
            <SendIcon className="h-4 w-4" />
          </Button>
        </span>
      </TooltipTrigger>
      {!canInviteMembers && (
        <TooltipContent>{t("tooltip.noPermission")}</TooltipContent>
      )}
      {!isExpired && <TooltipContent>{t("tooltip.notExpired")}</TooltipContent>}
    </Tooltip>
  )
}

function RevokeInvitationDialog({
  invitation,
  canInviteMembers,
  loading,
  setLoading,
}: {
  invitation: ProjectInvitationWithRole
  canInviteMembers: boolean
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()
  const t = useTranslations("InvitationsDialog")

  const [revokingInvitation, setRevokingInvitation] =
    useState<ProjectInvitationWithRole | null>(null)

  async function handleRevokeInvitation(invitation: ProjectInvitationWithRole) {
    setLoading(true)

    await revokeProjectInvitation({
      projectId: invitation.projectId,
      invitationId: invitation.id,
    })
      .then(() => {
        toast.success(
          t("toast.revokeSuccess", {
            email: invitation.email,
            invitationId: invitation.id.slice(0, 8),
          })
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message ||
            t("toast.revokeFailed", {
              email: invitation.email,
              invitationId: invitation.id.slice(0, 8),
            })
        )
      })
      .finally(() => {
        setLoading(false)
        setRevokingInvitation(null)
      })
  }

  return (
    <AlertDialog
      open={!!revokingInvitation}
      onOpenChange={(open) => !open && setRevokingInvitation(null)}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex",
              !canInviteMembers || loading ? "cursor-not-allowed" : ""
            )}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="inline-flex items-center p-1 text-sm"
                disabled={!canInviteMembers || loading}
                onClick={() => setRevokingInvitation(invitation)}
              >
                <SquareArrowRightExitIcon size={16} />
              </Button>
            </AlertDialogTrigger>
          </span>
        </TooltipTrigger>
        {!canInviteMembers && (
          <TooltipContent>{t("tooltip.noPermission")}</TooltipContent>
        )}
      </Tooltip>

      <AlertDialogPortal>
        <AlertDialogOverlay className="bg-red-950/30 backdrop-blur-sm" />

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("dialog.revokeInvitation.title", {
                email: invitation.email,
                invitationId: invitation.id.slice(0, 8),
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialog.revokeInvitation.description", {
                email: invitation.email,
                invitationId: invitation.id.slice(0, 8),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              variant="outline"
              disabled={loading}
              onClick={() => setRevokingInvitation(null)}
            >
              {t("dialog.cancel")}
            </AlertDialogCancel>

            <Button
              variant="destructive"
              disabled={loading || revokingInvitation === null}
              onClick={(event) => {
                event.preventDefault()
                if (!revokingInvitation) return

                void handleRevokeInvitation(revokingInvitation)
              }}
            >
              {loading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  {t("dialog.revokeInvitation.revokingInvitation")}
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4" />
                  {t("dialog.revokeInvitation.revokeInvitation")}
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  )
}
