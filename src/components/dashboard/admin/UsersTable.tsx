"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { authClient } from "@/lib/auth-client"
import {
  AlertTriangleIcon,
  BadgeCheckIcon,
  BadgeXIcon,
  PencilIcon,
  ScanFaceIcon,
  SearchIcon,
  TrashIcon,
  UserCogIcon,
  UserIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { SubmitEvent, useState } from "react"
import { toast } from "sonner"
import TablePagination from "@/components/dashboard/TablePagination"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"
import { UserWithRole } from "better-auth/plugins"
import { useSession } from "@/components/session-provider"
import { useTranslations } from "next-intl"

const PAGE_SIZE = 10

export default function AdminUsersTable({ users }: { users: UserWithRole[] }) {
  const t = useTranslations("AdminUsersTable")
  const { user: currentUser } = useSession()

  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const filteredUsers = normalizedSearchQuery
    ? users.filter(
        (user) =>
          (user.id ?? "").toLowerCase().includes(normalizedSearchQuery) ||
          (user.name ?? "").toLowerCase().includes(normalizedSearchQuery) ||
          (user.email ?? "").toLowerCase().includes(normalizedSearchQuery)
      )
    : users

  const total = filteredUsers.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = Math.min(total, currentPage * PAGE_SIZE)
  const currentUsers = filteredUsers.slice(startIndex, endIndex)
  const displayStartIndex = total === 0 ? 0 : startIndex + 1

  return (
    <div>
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
              <TableHead>{t("tableHeader.email")}</TableHead>
              <TableHead className="text-center">
                {t("tableHeader.role")}
              </TableHead>
              <TableHead className="text-center">
                {t("tableHeader.banned")}
              </TableHead>
              <TableHead className="max-w-24 text-center">
                {t("tableHeader.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => {
                return (
                  <TableRow key={user.id}>
                    <TableCell className="text-center">
                      {user.id.slice(0, 8)}
                    </TableCell>

                    <TableCell className="min-w-40">
                      <div className="flex gap-2">
                        <span className="font-mono text-sm">{user.name}</span>
                        {user.id === currentUser?.id && (
                          <Badge>{t("you")}</Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{user.email}</span>
                        {user.emailVerified ? (
                          <BadgeCheckIcon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <BadgeXIcon className="size-4 shrink-0 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        {user.role === "admin" ? (
                          <UserCogIcon className="mr-1 size-4" />
                        ) : (
                          <UserIcon className="mr-1 size-4" />
                        )}
                        <span className="font-mono text-sm">
                          {(user.role?.trim().charAt(0).toUpperCase() || "") +
                            user.role?.trim().slice(1) || "N/A"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-center">
                        {user.banned ? (
                          <BadgeCheckIcon className="size-4 shrink-0 text-red-600 dark:text-red-400" />
                        ) : (
                          <BadgeXIcon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <EditUserSheet
                          user={user}
                          loading={loading}
                          setLoading={setLoading}
                        />
                        <ImpersonateUserButton
                          user={user}
                          loading={loading}
                          setLoading={setLoading}
                        />
                        <DeleteUserDialog
                          user={user}
                          loading={loading}
                          setLoading={setLoading}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  {searchQuery
                    ? t("table.noUsersFound", { query: searchQuery })
                    : t("table.noUsersFoundGeneric")}
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
    </div>
  )
}

function EditUserSheet({
  user,
  loading,
  setLoading,
}: {
  user: UserWithRole
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()
  const t = useTranslations("AdminUsersTable")
  const { user: currentUser } = useSession()

  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailVerified, setEmailVerified] = useState(false)
  const [role, setRole] = useState<"user" | "admin">("user")
  const [banned, setBanned] = useState(false)
  const [banReason, setBanReason] = useState("")
  const [banExpires, setBanExpires] = useState("")
  const [projectsLimit, setProjectsLimit] = useState<number>()

  function getProjectsLimit(user: UserWithRole) {
    /** @ts-expect-error - projectsLimit is a custom field added to the user object, which is not reflected in this type definition. */
    return user.projectsLimit ?? null
  }

  function toDateTimeLocalValue(value: Date | string | null | undefined) {
    if (!value) return ""

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return ""
    }

    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    )

    return localDate.toISOString().slice(0, 16)
  }

  function openEditor(user: UserWithRole) {
    setName(user.name ?? "")
    setEmail(user.email ?? "")
    setPassword("")
    setEmailVerified(Boolean(user.emailVerified))
    setRole(user.role === "admin" ? "admin" : "user")
    setBanned(Boolean(user.banned))
    setBanReason(user.banReason ?? "")
    setBanExpires(toDateTimeLocalValue(user.banExpires))
    setProjectsLimit(getProjectsLimit(user))
    setEditingUser(user)
  }

  function closeEditor() {
    setEditingUser(null)
    setName("")
    setEmail("")
    setPassword("")
    setEmailVerified(false)
    setRole("user")
    setBanned(false)
    setBanReason("")
    setBanExpires("")
    setProjectsLimit(undefined)
  }

  async function handleUpdateUser(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!editingUser) return

    const initialName = editingUser.name?.trim() ?? ""
    const initialEmail = editingUser.email?.trim() ?? ""
    const initialEmailVerified = Boolean(editingUser.emailVerified)
    const initialRole = editingUser.role === "admin" ? "admin" : "user"
    const initialBanned = Boolean(editingUser.banned)
    const initialBanReason = (editingUser.banReason ?? "").trim()
    const initialBanExpires = toDateTimeLocalValue(editingUser.banExpires)
    const initialProjectsLimit = getProjectsLimit(editingUser)

    const currentName = name.trim()
    const currentEmail = email.trim()
    const currentPassword = password.trim()
    const currentBanReason = banReason.trim()
    const currentBanExpires = banExpires.trim()
    const currentProjectsLimit = projectsLimit

    if (!currentName || !currentEmail) {
      toast.error(t("toast.nameAndEmailRequired"))
      return
    }

    if (currentProjectsLimit === undefined && initialProjectsLimit !== null) {
      toast.error(t("toast.projectsLimitEmpty"))
      return
    }

    if (Number.isNaN(currentProjectsLimit)) {
      toast.error(t("toast.projectsLimitInvalid"))
      return
    }

    if (banned && currentBanExpires !== "") {
      const parsedBanExpires = new Date(currentBanExpires)

      if (Number.isNaN(parsedBanExpires.getTime())) {
        toast.error(t("toast.banExpiresInvalid"))
        return
      }

      if (parsedBanExpires.getTime() <= Date.now()) {
        toast.error(t("toast.banExpiresFuture"))
        return
      }
    }

    const hasChanges =
      currentName !== initialName ||
      currentEmail !== initialEmail ||
      currentPassword !== "" ||
      emailVerified !== initialEmailVerified ||
      role !== initialRole ||
      banned !== initialBanned ||
      (banned &&
        (currentBanReason !== initialBanReason ||
          currentBanExpires !== initialBanExpires)) ||
      currentProjectsLimit !== initialProjectsLimit

    if (!hasChanges) {
      toast.info(t("toast.noChanges"))
      closeEditor()
      return
    }

    setLoading(true)

    try {
      const updateData: Record<string, unknown> = {}

      if (currentName !== initialName) {
        updateData.name = currentName
      }

      if (currentEmail !== initialEmail) {
        updateData.email = currentEmail
      }

      if (emailVerified !== initialEmailVerified) {
        updateData.emailVerified = emailVerified
      }

      if (currentProjectsLimit !== initialProjectsLimit) {
        updateData.projectsLimit = currentProjectsLimit
      }

      if (Object.keys(updateData).length > 0) {
        const updateResult = await authClient.admin.updateUser({
          userId: editingUser.id,
          data: updateData,
        })

        if (updateResult.error) {
          throw new Error(
            updateResult.error.message || t("toast.updateGenericFailed")
          )
        }
      }

      if (role !== initialRole) {
        const roleResult = await authClient.admin.setRole({
          userId: editingUser.id,
          role,
        })

        if (roleResult.error) {
          throw new Error(
            roleResult.error.message || t("toast.updateRoleFailed")
          )
        }
      }

      if (currentPassword !== "") {
        const passwordResult = await authClient.admin.setUserPassword({
          userId: editingUser.id,
          newPassword: currentPassword,
        })

        if (passwordResult.error) {
          throw new Error(
            passwordResult.error.message || t("toast.updatePasswordFailed")
          )
        }
      }

      if (
        banned !== initialBanned ||
        (banned &&
          (currentBanReason !== initialBanReason ||
            currentBanExpires !== initialBanExpires))
      ) {
        if (banned) {
          const banExpiresIn =
            currentBanExpires === ""
              ? undefined
              : Math.ceil(
                  (new Date(currentBanExpires).getTime() - Date.now()) / 1000
                )

          const banResult = await authClient.admin.banUser({
            userId: editingUser.id,
            banReason: currentBanReason || undefined,
            banExpiresIn,
          })

          if (banResult.error) {
            throw new Error(
              banResult.error.message || t("toast.updateBanFailed")
            )
          }
        } else {
          const unbanResult = await authClient.admin.unbanUser({
            userId: editingUser.id,
          })

          if (unbanResult.error) {
            throw new Error(
              unbanResult.error.message || t("toast.updateBanFailed")
            )
          }
        }
      }

      toast.success(
        t("toast.updateSuccess", {
          userName: currentName,
          userId: editingUser.id.slice(0, 8),
        })
      )
      closeEditor()
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("toast.updateGenericFailed", {
              userName: editingUser?.name ?? "",
              userId: editingUser?.id.slice(0, 8) ?? "",
            })
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet
      open={editingUser?.id === user.id}
      onOpenChange={(open) => {
        if (!open) {
          closeEditor()
        }
      }}
    >
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="inline-flex items-center p-1 text-sm"
          disabled={loading}
          onClick={() => openEditor(user)}
        >
          <PencilIcon size={16} />
        </Button>
      </SheetTrigger>

      <SheetContent className="flex flex-col overflow-hidden">
        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleUpdateUser}
        >
          <SheetHeader className="shrink-0">
            <SheetTitle>
              {t("sheet.editUser.title", {
                userName: editingUser?.name ?? "",
                userId: editingUser?.id.slice(0, 8) ?? "",
              })}
            </SheetTitle>
            <SheetDescription>
              {t("sheet.editUser.description", {
                userName: editingUser?.name ?? "",
                userId: editingUser?.id.slice(0, 8) ?? "",
              })}
            </SheetDescription>
            {editingUser?.id === currentUser?.id && (
              <Alert className="mt-2 border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-50">
                <AlertTriangleIcon className="size-4 text-amber-600 dark:text-amber-300" />
                <AlertTitle>{t("alert.editingSelfTitle")}</AlertTitle>
                <AlertDescription className="text-amber-900/80 dark:text-amber-100/80">
                  {t("alert.editingSelfDescription")}
                </AlertDescription>
              </Alert>
            )}
          </SheetHeader>

          <ScrollArea className="min-h-0 flex-1 overflow-hidden">
            <div className="grid auto-rows-min gap-6 px-4 py-4">
              <div className="grid gap-3">
                <Label htmlFor="name">{t("sheet.editUser.nameLabel")}</Label>
                <Input
                  id="name"
                  value={name}
                  placeholder={t("sheet.editUser.namePlaceholder")}
                  required
                  disabled={loading}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="email">{t("sheet.editUser.emailLabel")}</Label>
                <Input
                  id="email"
                  value={email}
                  placeholder={t("sheet.editUser.emailPlaceholder")}
                  required
                  disabled={loading}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="password">
                  {t("sheet.editUser.passwordLabel")}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  placeholder={t("sheet.editUser.passwordPlaceholder")}
                  disabled={loading}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="emailVerified">
                  {t("sheet.editUser.emailVerifiedLabel")}
                </Label>
                <ToggleGroup
                  type="single"
                  className="grid w-full grid-cols-2 border-2"
                  value={emailVerified ? "true" : "false"}
                  disabled={loading}
                  onValueChange={(value) => {
                    if (value === "true" || value === "false") {
                      setEmailVerified(value === "true")
                    }
                  }}
                >
                  <ToggleGroupItem
                    value="true"
                    className="w-full data-[state=on]:bg-emerald-400! data-[state=on]:text-white!"
                  >
                    {t("sheet.editUser.emailVerifiedYes")}
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="false"
                    className="w-full data-[state=on]:bg-red-400! data-[state=on]:text-white!"
                  >
                    {t("sheet.editUser.emailVerifiedNo")}
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="role">{t("sheet.editUser.roleLabel")}</Label>
                <NativeSelect
                  id="role"
                  value={role}
                  required
                  disabled={loading}
                  onChange={(event) =>
                    setRole(event.target.value === "admin" ? "admin" : "user")
                  }
                >
                  <NativeSelectOption value="user">
                    {t("sheet.editUser.roleUser")}
                  </NativeSelectOption>
                  <NativeSelectOption value="admin">
                    {t("sheet.editUser.roleAdmin")}
                  </NativeSelectOption>
                </NativeSelect>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="banned">
                  {t("sheet.editUser.bannedLabel")}
                </Label>
                <ToggleGroup
                  type="single"
                  className="grid w-full grid-cols-2 border-2"
                  value={banned ? "true" : "false"}
                  disabled={loading}
                  onValueChange={(value) => {
                    if (value === "true" || value === "false") {
                      setBanned(value === "true")
                    }
                  }}
                >
                  <ToggleGroupItem
                    value="true"
                    className="w-full data-[state=on]:bg-red-400! data-[state=on]:text-white!"
                  >
                    {t("sheet.editUser.bannedYes")}
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="false"
                    className="w-full data-[state=on]:bg-emerald-400! data-[state=on]:text-white!"
                  >
                    {t("sheet.editUser.bannedNo")}
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {banned && (
                <>
                  <div className="grid gap-3">
                    <Label htmlFor="banReason">
                      {t("sheet.editUser.banReasonLabel")}
                    </Label>
                    <Input
                      id="banReason"
                      value={banReason}
                      placeholder={t("sheet.editUser.banReasonPlaceholder")}
                      disabled={loading}
                      onChange={(event) => setBanReason(event.target.value)}
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="banExpires">
                      {t("sheet.editUser.banExpiresLabel")}
                    </Label>
                    <Input
                      id="banExpires"
                      type="datetime-local"
                      value={banExpires}
                      placeholder={t("sheet.editUser.banExpiresPlaceholder")}
                      disabled={loading}
                      onChange={(event) => setBanExpires(event.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="grid gap-3">
                <Label htmlFor="projectsLimit">
                  {t("sheet.editUser.projectsLimitLabel")}
                </Label>
                <Input
                  id="projectsLimit"
                  type="number"
                  value={projectsLimit ?? ""}
                  placeholder={t("sheet.editUser.projectsLimitPlaceholder")}
                  disabled={loading}
                  onChange={(event) =>
                    setProjectsLimit(
                      event.target.value
                        ? Number(event.target.value)
                        : undefined
                    )
                  }
                />
              </div>
            </div>
          </ScrollArea>

          <SheetFooter className="shrink-0">
            <Button
              type="submit"
              disabled={
                loading || !editingUser || !name.trim() || !email.trim()
              }
            >
              {loading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  {t("sheet.editUser.updatingUser")}
                </>
              ) : (
                <>
                  <PencilIcon className="mr-1 size-4" />
                  {t("sheet.editUser.updateUser")}
                </>
              )}
            </Button>

            <SheetClose asChild>
              <Button
                variant="outline"
                disabled={loading}
                onClick={() => setEditingUser(null)}
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

function ImpersonateUserButton({
  user,
  loading,
  setLoading,
}: {
  user: UserWithRole
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()
  const t = useTranslations("AdminUsersTable")
  const { user: currentUser } = useSession()

  const canImpersonateUser = user.id !== currentUser?.id && !user.banned

  function handleImpersonateUser(user: { id: string; name: string }) {
    setLoading(true)

    authClient.admin.impersonateUser({
      userId: user.id,
      fetchOptions: {
        onSuccess: () => {
          toast.success(
            t("toast.impersonationSuccess", {
              userName: user.name,
              userId: user.id.slice(0, 8),
            })
          )
          router.push("/")
          router.refresh()
        },
        onError: ({ error }) => {
          toast.error(
            error?.message ||
              t("toast.impersonationError", {
                userName: user.name,
                userId: user.id.slice(0, 8),
              })
          )
          setLoading(false)
        },
      },
    })
  }

  return (
    <Tooltip>
      <TooltipTrigger
        asChild
        className={!canImpersonateUser || loading ? "cursor-not-allowed" : ""}
      >
        <span className="inline-block">
          <Button
            variant="outline"
            size="icon"
            className="inline-flex items-center p-1 text-sm"
            disabled={user.id === currentUser?.id || user.banned || loading}
            onClick={() => handleImpersonateUser(user)}
          >
            <ScanFaceIcon size={16} />
          </Button>
        </span>
      </TooltipTrigger>

      {!canImpersonateUser && (
        <TooltipContent>
          {user.id === currentUser?.id
            ? t("tooltip.cannotImpersonateSelf")
            : t("tooltip.cannotImpersonateBanned")}
        </TooltipContent>
      )}
    </Tooltip>
  )
}

function DeleteUserDialog({
  user,
  loading,
  setLoading,
}: {
  user: UserWithRole
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()
  const t = useTranslations("AdminUsersTable")
  const { user: currentUser } = useSession()

  const [deletingUser, setDeletingUser] = useState<UserWithRole | null>(null)

  const canDeleteUser = user.id !== currentUser?.id

  async function handleDeleteUser(user: { id: string; name: string }) {
    setLoading(true)
    await authClient.admin.removeUser({
      userId: user.id,
      fetchOptions: {
        onSuccess: () => {
          toast.success(
            t("toast.deleteSuccess", {
              userName: user.name,
              userId: user.id.slice(0, 8),
            })
          )
          setLoading(false)
          setDeletingUser(null)
          router.refresh()
        },
        onError: ({ error }) => {
          toast.error(
            error?.message ||
              t("toast.deleteFailed", {
                userName: user.name,
                userId: user.id.slice(0, 8),
              })
          )
          setLoading(false)
          setDeletingUser(null)
        },
      },
    })
  }

  return (
    <AlertDialog
      open={!!deletingUser}
      onOpenChange={(open) => !open && setDeletingUser(null)}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex",
              !canDeleteUser || loading ? "cursor-not-allowed" : ""
            )}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="inline-flex items-center p-1 text-sm"
                disabled={!canDeleteUser || loading}
                onClick={() => setDeletingUser(user)}
              >
                <TrashIcon size={16} />
              </Button>
            </AlertDialogTrigger>
          </span>
        </TooltipTrigger>
        {!canDeleteUser && (
          <TooltipContent>{t("tooltip.cannotDeleteSelf")}</TooltipContent>
        )}
      </Tooltip>

      <AlertDialogPortal>
        <AlertDialogOverlay className="bg-red-950/30 backdrop-blur-sm" />

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("dialog.deleteUser.title", {
                userName: deletingUser?.name ?? "",
                userId: deletingUser?.id.slice(0, 8) ?? "",
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialog.deleteUser.description", {
                userName: deletingUser?.name ?? "",
                userId: deletingUser?.id.slice(0, 8) ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              variant="outline"
              disabled={loading}
              onClick={() => setDeletingUser(null)}
            >
              {t("dialog.cancel")}
            </AlertDialogCancel>

            <Button
              variant="destructive"
              disabled={loading || deletingUser === null}
              onClick={(event) => {
                event.preventDefault()
                if (!deletingUser) return

                void handleDeleteUser(deletingUser)
              }}
            >
              {loading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  {t("dialog.deleteUser.deletingUser")}
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4" />
                  {t("dialog.deleteUser.deleteUser")}
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  )
}
