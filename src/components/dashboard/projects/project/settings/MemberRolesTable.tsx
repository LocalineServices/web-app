"use client"

import TablePagination from "@/components/dashboard/TablePagination"
import ColorPickerField from "@/components/ui/custom/ColorPickerField"
import IconPickerField from "@/components/ui/custom/IconPickerField"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { HoverCard, HoverCardTrigger } from "@/components/ui/hover-card"
import { HoverCardContent } from "@/components/ui/hover-card"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
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
import {
  ProjectPermission,
  ProjectPermissionValue,
  getPermissions,
  hasPermission,
} from "@/lib/project-permissions"
import { getColorClassName, getColorStyle, getIcon } from "@/lib/project-utils"
import { cn } from "@/lib/utils"
import { Project, ProjectMemberRole } from "@prisma/client"
import {
  PencilIcon,
  SearchIcon,
  ShieldIcon,
  StarIcon,
  TrashIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { MouseEvent, SubmitEvent, useState } from "react"
import { toast } from "sonner"
import {
  deleteProjectMemberRole,
  updateProjectMemberRole,
} from "@/actions/project-member-roles"
import { useProject } from "@/components/project-provider"
import { useSession } from "@/components/session-provider"
import { authClient } from "@/lib/auth-client"
import { useTranslations } from "next-intl"

const PAGE_SIZE = 10

const PERMISSION_GROUPS: {
  label: string
  items: { key: string; label: string; value: ProjectPermissionValue }[]
}[] = [
  {
    label: "General",
    items: [
      {
        key: "TRANSLATE",
        label: "Translate",
        value: ProjectPermission.TRANSLATE,
      },
      {
        key: "TRANSLATE_LOCKED",
        label: "Translate locked terms",
        value: ProjectPermission.TRANSLATE_LOCKED,
      },
    ],
  },
  {
    label: "Terms",
    items: [
      {
        key: "CREATE_TERMS",
        label: "Create",
        value: ProjectPermission.CREATE_TERMS,
      },
      {
        key: "UPDATE_TERMS",
        label: "Update",
        value: ProjectPermission.UPDATE_TERMS,
      },
      {
        key: "ASSIGN_LABELS",
        label: "Assign Labels",
        value: ProjectPermission.ASSIGN_LABELS,
      },
      {
        key: "LOCK_TERMS",
        label: "Lock",
        value: ProjectPermission.LOCK_TERMS,
      },
      {
        key: "DELETE_TERMS",
        label: "Delete",
        value: ProjectPermission.DELETE_TERMS,
      },
    ],
  },
  {
    label: "Members",
    items: [
      {
        key: "INVITE_MEMBERS",
        label: "Invite",
        value: ProjectPermission.INVITE_MEMBERS,
      },
      {
        key: "UPDATE_MEMBERS",
        label: "Update",
        value: ProjectPermission.UPDATE_MEMBERS,
      },
      {
        key: "REMOVE_MEMBERS",
        label: "Remove",
        value: ProjectPermission.REMOVE_MEMBERS,
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        key: "MANAGE_LOCALES",
        label: "Manage locales",
        value: ProjectPermission.MANAGE_LOCALES,
      },
      {
        key: "MANAGE_LABELS",
        label: "Manage labels",
        value: ProjectPermission.MANAGE_LABELS,
      },
      {
        key: "MANAGE_PROJECT",
        label: "Manage project",
        value: ProjectPermission.MANAGE_PROJECT,
      },
      {
        key: "MANAGE_ROLES",
        label: "Manage roles",
        value: ProjectPermission.MANAGE_ROLES,
      },
      {
        key: "MANAGE_WORKFLOWS",
        label: "Manage workflows",
        value: ProjectPermission.MANAGE_WORKFLOWS,
      },
    ],
  },
] as const

const PERMISSION_ITEMS = PERMISSION_GROUPS.flatMap((group) => group.items)

export default function ProjectMemberRolesTable() {
  const t = useTranslations("ProjectMemberRolesTable")

  const { user } = useSession()
  const { project, member } = useProject()

  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const memberRoles = [...project.memberRoles].sort((a, b) => {
    if (a.id === project.id) return -1
    if (b.id === project.id) return 1

    return Number(b.permissions) - Number(a.permissions)
  })

  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const filteredMemberRoles = normalizedSearchQuery
    ? memberRoles.filter(
        (role) =>
          (role.id ?? "").toLowerCase().includes(normalizedSearchQuery) ||
          (role.name ?? "").toLowerCase().includes(normalizedSearchQuery)
      )
    : memberRoles

  const total = filteredMemberRoles.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = Math.min(total, currentPage * PAGE_SIZE)
  const currentRoles = filteredMemberRoles.slice(startIndex, endIndex)
  const displayStartIndex = total === 0 ? 0 : startIndex + 1

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

  return (
    <>
      <InputGroup className="relative mb-2 max-w-md">
        <InputGroupInput
          placeholder={t("input.searchPlaceholder")}
          value={searchQuery}
          onChange={({ target: { value } }) => {
            setSearchQuery(value)
            setPage(1)
          }}
        />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>

      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-28 text-center">
                {t("tableHeader.id")}
              </TableHead>
              <TableHead>{t("tableHeader.name")}</TableHead>
              <TableHead className="text-center">
                {t("tableHeader.color")}
              </TableHead>
              <TableHead className="text-center">
                {t("tableHeader.icon")}
              </TableHead>
              <TableHead className="max-w-32 text-center">
                {t("tableHeader.permissions")}
              </TableHead>
              <TableHead className="max-w-24 text-center">
                {t("tableHeader.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentRoles.length > 0 ? (
              currentRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="text-center">
                    {role.id.slice(0, 8)}
                  </TableCell>

                  <TableCell className="min-w-40">
                    {role.name}
                    {role.id === project.id && (
                      <HoverCard openDelay={10} closeDelay={10}>
                        <HoverCardTrigger asChild>
                          <StarIcon className="ml-2 inline h-4 w-4 cursor-pointer text-yellow-500 hover:opacity-80" />
                        </HoverCardTrigger>
                        <HoverCardContent>
                          {t("tooltip.ownerRoleHover")}
                        </HoverCardContent>
                      </HoverCard>
                    )}
                  </TableCell>

                  <TableCell
                    className={cn(
                      "max-w-16 text-center",
                      !role.color && "text-muted-foreground italic"
                    )}
                  >
                    {role.color ? (
                      <>
                        <Badge
                          variant="outline"
                          style={getColorStyle(role.color)}
                          className={getColorClassName(role.color)}
                        >
                          {role.name}
                        </Badge>
                        <p className="sr-only">{role.color}</p>
                      </>
                    ) : (
                      <p>{t("noColor")}</p>
                    )}
                  </TableCell>

                  <TableCell
                    className={cn(
                      "max-w-16 text-center",
                      !role.icon && "text-muted-foreground italic"
                    )}
                  >
                    {role.icon ? (
                      (() => {
                        const RoleIcon = getIcon(role.icon)
                        return RoleIcon ? (
                          <RoleIcon
                            className="mx-auto h-5 w-5"
                            aria-hidden="true"
                          />
                        ) : (
                          <p>{t("invalidIcon")}</p>
                        )
                      })()
                    ) : (
                      <p>{t("noIcon")}</p>
                    )}
                  </TableCell>

                  <TableCell
                    className={cn(
                      "max-w-16 text-center",
                      role.permissions === BigInt(0) &&
                        "text-muted-foreground italic"
                    )}
                  >
                    {role.permissions === BigInt(0) ? (
                      <p>{t("noPermissions")}</p>
                    ) : (
                      <>{getPermissions(role.permissions).length}</>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <UpdateMemberRoleSheet
                        projectId={project.id}
                        role={role}
                        canUpdateRoles={canManageRoles}
                        loading={loading}
                        setLoading={setLoading}
                      />
                      <UpdateMemberRolePermissionsSheet
                        project={project}
                        role={role}
                        canUpdateRoles={canManageRoles}
                        loading={loading}
                        setLoading={setLoading}
                      />
                      <DeleteMemberRoleDialog
                        project={project}
                        role={role}
                        canDeleteRoles={canManageRoles}
                        isOwnerRole={role.id === project.id}
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
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  {searchQuery
                    ? t("table.noRolesFound", { query: searchQuery })
                    : t("table.noRolesFoundGeneric")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={displayStartIndex}
        endIndex={endIndex}
        total={total}
        setPage={setPage}
      />
    </>
  )
}

function UpdateMemberRoleSheet({
  projectId,
  role,
  canUpdateRoles,
  loading,
  setLoading,
}: {
  projectId: string
  role: ProjectMemberRole
  canUpdateRoles: boolean
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()
  const t = useTranslations("ProjectMemberRolesTable")

  const [updatingRole, setUpdatingRole] = useState<ProjectMemberRole | null>(
    null
  )

  const [name, setName] = useState("")
  const [color, setColor] = useState("")
  const [icon, setIcon] = useState("")

  function openEditor(currentRole: ProjectMemberRole) {
    setName(currentRole.name ?? "")
    setColor(currentRole.color ?? "")
    setIcon(currentRole.icon ?? "")
    setUpdatingRole(currentRole)
  }

  function closeEditor() {
    setUpdatingRole(null)
    setName("")
    setColor("")
    setIcon("")
  }

  async function handleUpdateRole(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!updatingRole) return

    setLoading(true)
    await updateProjectMemberRole({
      projectId,
      roleId: updatingRole.id,
      name: name.trim(),
      color,
      icon,
    })
      .then((updatedRole) => {
        toast.success(
          t("toast.updateRoleSuccess", {
            roleName: updatedRole.name,
            roleId: updatedRole.id.slice(0, 8),
          })
        )
        closeEditor()
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message ||
            t("toast.updateRoleFailed", {
              roleName: updatingRole.name,
              roleId: updatingRole.id.slice(0, 8),
            })
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <Sheet
      open={updatingRole?.id === role.id}
      onOpenChange={(open) => {
        if (!open) {
          closeEditor()
        }
      }}
    >
      <Tooltip>
        <TooltipTrigger
          asChild
          className={!canUpdateRoles || loading ? "cursor-not-allowed" : ""}
        >
          <SheetTrigger asChild>
            <span className="inline-block">
              <Button
                variant="outline"
                size="icon"
                className="inline-flex items-center p-1 text-sm"
                disabled={!canUpdateRoles || loading}
                onClick={() => openEditor(role)}
              >
                <PencilIcon size={16} />
              </Button>
            </span>
          </SheetTrigger>
        </TooltipTrigger>
        {!canUpdateRoles && (
          <TooltipContent>{t("tooltip.noPermissionEditRole")}</TooltipContent>
        )}
      </Tooltip>

      <SheetContent className="flex flex-col overflow-hidden">
        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleUpdateRole}
        >
          <SheetHeader className="shrink-0">
            <SheetTitle>
              {t("sheet.updateRole.title", {
                roleName: updatingRole?.name || "",
                roleId: updatingRole?.id.slice(0, 8) || "",
              })}
            </SheetTitle>
            <SheetDescription>
              {t("sheet.updateRole.description", {
                roleName: updatingRole?.name || "",
                roleId: updatingRole?.id.slice(0, 8) || "",
              })}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="min-h-0 flex-1 overflow-hidden">
            <div className="grid auto-rows-min gap-6 px-4 py-4">
              <div className="grid gap-3">
                <Label htmlFor="roleName">
                  {t("sheet.updateRole.nameLabel")}
                </Label>
                <Input
                  id="roleName"
                  value={name}
                  required
                  disabled={loading}
                  onChange={({ target: { value } }) => setName(value)}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="roleColor">
                  {t("sheet.updateRole.colorLabel")}
                </Label>
                <ColorPickerField
                  id="roleColor"
                  value={color}
                  onChange={setColor}
                  disabled={loading}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="roleIcon">
                  {t("sheet.updateRole.iconLabel")}
                </Label>
                <IconPickerField
                  id="roleIcon"
                  value={icon}
                  onChange={setIcon}
                  disabled={loading}
                />
              </div>
            </div>
          </ScrollArea>

          <SheetFooter className="shrink-0">
            <Button
              type="submit"
              disabled={loading || !updatingRole || !name.trim()}
            >
              {loading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  {t("sheet.updateRole.updatingRole")}
                </>
              ) : (
                <>
                  <PencilIcon className="h-4 w-4" />
                  {t("sheet.updateRole.updateRole")}
                </>
              )}
            </Button>

            <SheetClose asChild>
              <Button
                variant="outline"
                disabled={loading}
                onClick={closeEditor}
              >
                {t("sheet.close")}
              </Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function UpdateMemberRolePermissionsSheet({
  project,
  role,
  canUpdateRoles,
  loading,
  setLoading,
}: {
  project: Project
  role: ProjectMemberRole
  canUpdateRoles: boolean
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()
  const t = useTranslations("ProjectMemberRolesTable")

  const isOwnerRole = role.id === project.id
  const [updatingRole, setUpdatingRole] = useState<ProjectMemberRole | null>(
    null
  )
  const [selectedPermissions, setSelectedPermissions] = useState<Set<bigint>>(
    new Set()
  )

  function openEditor(currentRole: ProjectMemberRole) {
    setSelectedPermissions(
      new Set(
        PERMISSION_ITEMS.filter(
          (permission) => (currentRole.permissions & permission.value) !== 0n
        ).map((permission) => permission.value)
      )
    )
    setUpdatingRole(currentRole)
  }

  function closeEditor() {
    setUpdatingRole(null)
    setSelectedPermissions(new Set())
  }

  function togglePermission(permission: bigint) {
    setSelectedPermissions((current) => {
      const next = new Set(current)
      if (next.has(permission)) {
        next.delete(permission)
      } else {
        next.add(permission)
      }
      return next
    })
  }

  async function handleSavePermissions(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()

    if (!updatingRole || isOwnerRole) return

    const permissions = Array.from(selectedPermissions).reduce(
      (combined, permission) => combined | permission,
      0n
    )

    setLoading(true)
    await updateProjectMemberRole({
      projectId: project.id,
      roleId: updatingRole.id,
      permissions,
    })
      .then((updatedRole) => {
        toast.success(
          t("toast.updatePermissionsSuccess", {
            roleName: updatedRole.name,
            roleId: updatedRole.id.slice(0, 8),
          })
        )

        closeEditor()
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message ||
            t("toast.updatePermissionsFailed", {
              roleName: updatingRole.name,
              roleId: updatingRole.id.slice(0, 8),
            })
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <Sheet
      open={updatingRole?.id === role.id}
      onOpenChange={(open) => !open && closeEditor()}
    >
      <Tooltip>
        <TooltipTrigger
          asChild
          className={
            !canUpdateRoles || isOwnerRole || loading
              ? "cursor-not-allowed"
              : ""
          }
        >
          <SheetTrigger asChild>
            <span className="inline-block">
              <Button
                variant="outline"
                size="icon"
                className="inline-flex items-center p-1 text-sm"
                disabled={!canUpdateRoles || isOwnerRole || loading}
                onClick={() => openEditor(role)}
              >
                <ShieldIcon size={16} />
              </Button>
            </span>
          </SheetTrigger>
        </TooltipTrigger>
        {!canUpdateRoles && (
          <TooltipContent>
            {t("tooltip.noPermissionUpdatePermissions")}
          </TooltipContent>
        )}
        {isOwnerRole && (
          <TooltipContent>
            {t("tooltip.ownerRoleUpdatePermissions")}
          </TooltipContent>
        )}
      </Tooltip>

      <SheetContent className="flex flex-col overflow-hidden">
        <SheetHeader className="shrink-0">
          <SheetTitle>
            {t("sheet.updatePermissions.title", {
              roleName: updatingRole?.name || "",
              roleId: updatingRole?.id.slice(0, 8) || "",
            })}
          </SheetTitle>
          <SheetDescription>
            {t("sheet.updatePermissions.description", {
              roleName: updatingRole?.name || "",
              roleId: updatingRole?.id.slice(0, 8) || "",
            })}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1 overflow-hidden">
          <div className="grid gap-4 px-4 py-4">
            {PERMISSION_GROUPS.map((group) => (
              <div key={group.label} className="grid gap-2">
                <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {group.label}
                </div>
                <div className="grid gap-2">
                  {group.items.map((permission) => (
                    <label
                      key={permission.key}
                      className="flex items-center gap-3 rounded-md border border-border px-3 py-2"
                    >
                      <Checkbox
                        checked={selectedPermissions.has(permission.value)}
                        disabled={loading || isOwnerRole}
                        onCheckedChange={() =>
                          togglePermission(permission.value)
                        }
                      />
                      <div className="text-sm">{permission.label}</div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <SheetFooter className="shrink-0">
          <Button
            onClick={handleSavePermissions}
            disabled={loading || !updatingRole || isOwnerRole}
          >
            {loading ? (
              <>
                <Spinner className="h-4 w-4" />
                {t("sheet.updatePermissions.updatingPermissions")}
              </>
            ) : (
              <>
                <ShieldIcon className="h-4 w-4" />
                {t("sheet.updatePermissions.updatePermissions")}
              </>
            )}
          </Button>

          <SheetClose asChild>
            <Button variant="outline" disabled={loading} onClick={closeEditor}>
              {t("sheet.close")}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function DeleteMemberRoleDialog({
  project,
  role,
  canDeleteRoles,
  isOwnerRole,
  loading,
  setLoading,
}: {
  project: Project
  role: ProjectMemberRole
  canDeleteRoles: boolean
  isOwnerRole: boolean
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()
  const t = useTranslations("ProjectMemberRolesTable")

  const [deletingRole, setDeletingRole] = useState<ProjectMemberRole | null>(
    null
  )

  async function handleDeleteRole(currentRole: ProjectMemberRole) {
    setLoading(true)

    await deleteProjectMemberRole({
      projectId: project.id,
      roleId: currentRole.id,
    })
      .then((deletedRole) => {
        toast.success(
          t("toast.deleteRoleSuccess", {
            roleName: deletedRole.name,
            roleId: deletedRole.id.slice(0, 8),
          })
        )
        setDeletingRole(null)
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message ||
            t("toast.deleteRoleFailed", {
              roleName: currentRole.name,
              roleId: currentRole.id.slice(0, 8),
            })
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <AlertDialog
      open={!!deletingRole}
      onOpenChange={(open) => !open && setDeletingRole(null)}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex",
              !canDeleteRoles || isOwnerRole || loading
                ? "cursor-not-allowed"
                : ""
            )}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="inline-flex items-center p-1 text-sm"
                disabled={!canDeleteRoles || isOwnerRole || loading}
                onClick={() => setDeletingRole(role)}
              >
                <TrashIcon size={16} />
              </Button>
            </AlertDialogTrigger>
          </span>
        </TooltipTrigger>
        {!canDeleteRoles && (
          <TooltipContent>{t("tooltip.noPermissionDeleteRole")}</TooltipContent>
        )}
        {isOwnerRole && (
          <TooltipContent>{t("tooltip.ownerRoleDelete")}</TooltipContent>
        )}
      </Tooltip>

      <AlertDialogPortal>
        <AlertDialogOverlay className="bg-red-950/30 backdrop-blur-sm" />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("dialog.deleteRole.title", {
                roleName: deletingRole?.name || "",
                roleId: deletingRole?.id.slice(0, 8) || "",
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialog.deleteRole.description", {
                roleName: deletingRole?.name || "",
                roleId: deletingRole?.id.slice(0, 8) || "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              variant="outline"
              disabled={loading}
              onClick={() => setDeletingRole(null)}
            >
              {t("dialog.cancel")}
            </AlertDialogCancel>

            <Button
              variant="destructive"
              disabled={loading || deletingRole === null}
              onClick={(event) => {
                event.preventDefault()
                if (!deletingRole) return

                void handleDeleteRole(deletingRole)
              }}
            >
              {loading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  {t("dialog.deleteRole.deletingRole")}
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4" />
                  {t("dialog.deleteRole.deleteRole")}
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  )
}
