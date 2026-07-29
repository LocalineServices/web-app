"use client"

import { deleteProjectTerm, updateProjectTerm } from "@/actions/project-terms"
import TablePagination from "@/components/dashboard/TablePagination"
import { useProject } from "@/components/project-provider"
import { useSession } from "@/components/session-provider"
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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { authClient } from "@/lib/auth-client"
import { hasPermission, ProjectPermission } from "@/lib/project-permissions"
import { cn } from "@/lib/utils"
import { ProjectTerm } from "@prisma/client"
import {
  LockIcon,
  LockOpenIcon,
  PencilIcon,
  SearchIcon,
  TrashIcon,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { SubmitEvent, useState } from "react"
import { toast } from "sonner"

const PAGE_SIZE = 10

export default function ProjectTermsTable() {
  const router = useRouter()
  const t = useTranslations("ProjectTermsTable")

  const { user } = useSession()
  const { project, member } = useProject()

  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const filteredTerms = normalizedSearchQuery
    ? project.terms.filter(
      (term) =>
        (term.id ?? "").toLowerCase().includes(normalizedSearchQuery) ||
        (term.key ?? "").toLowerCase().includes(normalizedSearchQuery) ||
        (term.context ?? "").toLowerCase().includes(normalizedSearchQuery)
    )
    : project.terms

  const total = filteredTerms.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = Math.min(total, currentPage * PAGE_SIZE)
  const currentTerms = filteredTerms.slice(startIndex, endIndex)
  const displayStartIndex = total === 0 ? 0 : startIndex + 1

  const canLockTerms =
    hasPermission(
      member?.role.permissions ?? 0n,
      ProjectPermission.LOCK_TERMS
    ) ||
    authClient.admin.checkRolePermission({
      // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
      role: user?.role ?? "user",
      permissions: {
        projects: ["update"],
      },
    })

  async function handleUpdateLockTerm(term: ProjectTerm) {
    setLoading(true)

    await updateProjectTerm({
      projectId: term.projectId,
      termId: term.id,
      locked: !term.locked,
    })
      .then((updatedTerm) => {
        toast.success(updatedTerm.locked ?
          t("toast.lockSuccess", { termKey: updatedTerm.key, termId: updatedTerm.id.slice(0, 8) }) :
          t("toast.unlockSuccess", { termKey: updatedTerm.key, termId: updatedTerm.id.slice(0, 8) })
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message ||
          t("toast.updateLockedFailed", { termKey: term.key, termId: term.id.slice(0, 8) })
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }

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
              <TableHead>{t("tableHeader.key")}</TableHead>
              <TableHead>{t("tableHeader.context")}</TableHead>
              <TableHead className="text-center">
                <HoverCard openDelay={10} closeDelay={10}>
                  <HoverCardTrigger asChild>
                    <Button variant="ghost">{t("tableHeader.locked")}</Button>
                  </HoverCardTrigger>

                  <HoverCardContent>
                    {t("tableHeader.lockedHoverContent")}
                  </HoverCardContent>
                </HoverCard>
              </TableHead>
              <TableHead className="max-w-24 text-center">{t("tableHeader.actions")}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentTerms.length > 0 ? (
              currentTerms.map((term) => (
                <TableRow key={term.id}>
                  <TableCell className="text-center">
                    {term.id.slice(0, 8)}
                  </TableCell>

                  <TableCell className="min-w-40">{term.key}</TableCell>

                  <TableCell className="min-w-80">
                    {term.context || (
                      <span className="text-muted-foreground italic">{t("noContext")}</span>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer rounded-full p-0"
                          disabled={loading || !canLockTerms}
                          onClick={(event) => {
                            event.preventDefault()
                            handleUpdateLockTerm(term)
                          }}
                        >
                          {term.locked ? (
                            <LockIcon className="size-4 shrink-0 text-red-600 dark:text-red-400" />
                          ) : (
                            <LockOpenIcon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      {!canLockTerms && (
                        <TooltipContent>
                          {t("tooltip.noPermissionLock")}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <UpdateTermSheet
                        term={term}
                        loading={loading}
                        setLoading={setLoading}
                      />
                      <DeleteTermDialog
                        term={term}
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
                  {searchQuery
                    ? t("table.noTermsFound", { query: searchQuery })
                    : t("table.noTermsFoundGeneric")}
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

function UpdateTermSheet({
  term,
  loading,
  setLoading,
}: {
  term: ProjectTerm
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()
  const t = useTranslations("ProjectTermsTable")

  const { user } = useSession()
  const { member } = useProject()

  const [updatingTerm, setUpdatingTerm] = useState<ProjectTerm | null>(null)

  const [key, setKey] = useState("")
  const [context, setContext] = useState<string | null>(null)
  const [locked, setLocked] = useState(false)

  const canUpdateTerms =
    hasPermission(
      member?.role.permissions ?? 0n,
      ProjectPermission.UPDATE_TERMS
    ) ||
    authClient.admin.checkRolePermission({
      // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
      role: user?.role ?? "user",
      permissions: {
        projects: ["update"],
      },
    })

  function openEditor(currentTerm: ProjectTerm) {
    setKey(currentTerm.key)
    setContext(currentTerm.context ?? null)
    setLocked(currentTerm.locked)
    setUpdatingTerm(currentTerm)
  }

  function closeEditor() {
    setUpdatingTerm(null)
    setKey("")
    setContext(null)
    setLocked(false)
  }

  async function handleUpdateTerm(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!updatingTerm) return

    setLoading(true)
    await updateProjectTerm({
      projectId: updatingTerm.projectId,
      termId: updatingTerm.id,
      key: key.trim(),
      context: context?.trim() || null,
      locked,
    })
      .then((updatedTerm) => {
        toast.success(t("toast.updateSuccess", { termKey: updatedTerm.key, termId: updatedTerm.id.slice(0, 8) }))
        closeEditor()
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message || t("toast.updateFailed", { termKey: updatingTerm.key, termId: updatingTerm.id.slice(0, 8) })
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <Sheet
      open={updatingTerm?.id === term.id}
      onOpenChange={(open) => !open && closeEditor()}
    >
      <Tooltip>
        <TooltipTrigger
          asChild
          className={!canUpdateTerms || loading ? "cursor-not-allowed" : ""}
        >
          <SheetTrigger asChild>
            <span className="inline-block">
              <Button
                variant="outline"
                size="icon"
                className="inline-flex items-center p-1 text-sm"
                disabled={!canUpdateTerms || loading}
                onClick={() => openEditor(term)}
              >
                <PencilIcon size={16} />
              </Button>
            </span>
          </SheetTrigger>
        </TooltipTrigger>
        {!canUpdateTerms && (
          <TooltipContent>
            {t("tooltip.noPermissionUpdate")}
          </TooltipContent>
        )}
      </Tooltip>

      <SheetContent className="flex flex-col overflow-hidden">
        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleUpdateTerm}
        >
          <SheetHeader className="shrink-0">
            <SheetTitle>
              {t("sheet.updateTerm.title", { termKey: updatingTerm?.key ?? "", termId: updatingTerm?.id.slice(0, 8) ?? "" })}
            </SheetTitle>
            <SheetDescription>
              {t("sheet.updateTerm.description", { termKey: updatingTerm?.key ?? "", termId: updatingTerm?.id.slice(0, 8) ?? "" })}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="min-h-0 flex-1 overflow-hidden">
            <div className="grid auto-rows-min gap-6 px-4 py-4">
              <div className="grid gap-3">
                <Label htmlFor="termKey">{t("sheet.updateTerm.keyLabel")}</Label>
                <Input
                  id="termKey"
                  value={key}
                  required
                  disabled={loading}
                  onChange={({ target: { value } }) => setKey(value)}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="termContext">{t("sheet.updateTerm.contextLabel")}</Label>
                <Input
                  id="termContext"
                  value={context || ""}
                  disabled={loading}
                  onChange={({ target: { value } }) => setContext(value)}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="termLocked">{t("sheet.updateTerm.lockedLabel")}</Label>
                <ToggleGroup
                  type="single"
                  className="grid w-full grid-cols-2 border-2"
                  value={locked ? "true" : "false"}
                  disabled={loading}
                  onValueChange={(value) => {
                    if (value === "true" || value === "false") {
                      setLocked(value === "true")
                    }
                  }}
                >
                  <ToggleGroupItem
                    value="true"
                    className="w-full data-[state=on]:bg-emerald-400! data-[state=on]:text-white!"
                  >
                    {t("sheet.updateTerm.lockedYes")}
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="false"
                    className="w-full data-[state=on]:bg-red-400! data-[state=on]:text-white!"
                  >
                    {t("sheet.updateTerm.lockedNo")}
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </ScrollArea>

          <SheetFooter className="shrink-0">
            <Button
              type="submit"
              disabled={loading || !updatingTerm || !key.trim()}
            >
              {loading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  {t("sheet.updateTerm.updatingTerm")}
                </>
              ) : (
                <>
                  <PencilIcon className="h-4 w-4" />
                  {t("sheet.updateTerm.updateTerm")}
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

function DeleteTermDialog({
  term,
  loading,
  setLoading,
}: {
  term: ProjectTerm
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()
  const t = useTranslations("ProjectTermsTable")

  const { user } = useSession()
  const { member } = useProject()

  const [deletingTerm, setDeletingTerm] = useState<ProjectTerm | null>(null)

  const canDeleteTerms =
    hasPermission(
      member?.role.permissions ?? 0n,
      ProjectPermission.DELETE_TERMS
    ) ||
    authClient.admin.checkRolePermission({
      // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
      role: user?.role ?? "user",
      permissions: {
        projects: ["update"],
      },
    })

  async function handleDeleteTerm(term: ProjectTerm) {
    setLoading(true)

    await deleteProjectTerm({
      projectId: term.projectId,
      termId: term.id,
    })
      .then(() => {
        toast.success(t("toast.deleteSuccess", { termKey: term.key, termId: term.id.slice(0, 8) }))
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message || t("toast.deleteFailed", { termKey: term.key, termId: term.id.slice(0, 8) })
        )
      })
      .finally(() => {
        setLoading(false)
        setDeletingTerm(null)
      })
  }

  return (
    <AlertDialog
      open={!!deletingTerm}
      onOpenChange={(open) => !open && setDeletingTerm(null)}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex",
              !canDeleteTerms || loading ? "cursor-not-allowed" : ""
            )}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="inline-flex items-center p-1 text-sm"
                disabled={!canDeleteTerms || loading}
                onClick={() => setDeletingTerm(term)}
              >
                <TrashIcon size={16} />
              </Button>
            </AlertDialogTrigger>
          </span>
        </TooltipTrigger>
        {!canDeleteTerms && (
          <TooltipContent>
            {t("tooltip.noPermissionDelete")}
          </TooltipContent>
        )}
      </Tooltip>

      <AlertDialogPortal>
        <AlertDialogOverlay className="bg-red-950/30 backdrop-blur-sm" />

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dialog.deleteTerm.title", {
              termKey: deletingTerm?.key ?? "",
              termId: deletingTerm?.id.slice(0, 8) ?? ""
            })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialog.deleteTerm.description", {
                termKey: deletingTerm?.key ?? "",
                termId: deletingTerm?.id.slice(0, 8) ?? ""
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              variant="outline"
              disabled={loading}
              onClick={() => setDeletingTerm(null)}
            >
              {t("dialog.cancel")}
            </AlertDialogCancel>

            <Button
              variant="destructive"
              disabled={loading || deletingTerm === null}
              onClick={(event) => {
                event.preventDefault()
                if (!deletingTerm) return

                void handleDeleteTerm(deletingTerm)
              }}
            >
              {loading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  {t("dialog.deleteTerm.deletingTerm")}
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4" />
                  {t("dialog.deleteTerm.deleteTerm")}
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  )
}
