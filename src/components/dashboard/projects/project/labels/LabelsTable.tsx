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
import { getColorClassName, getColorStyle, getIcon } from "@/lib/project-utils"
import { cn } from "@/lib/utils"
import { ProjectLabel } from "@prisma/client"
import { PencilIcon, SearchIcon, TrashIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { SubmitEvent, useState } from "react"
import { toast } from "sonner"
import {
  deleteProjectLabel,
  updateProjectLabel,
} from "@/actions/project-labels"
import { authClient } from "@/lib/auth-client"
import { useSession } from "@/components/session-provider"
import { useProject } from "@/components/project-provider"
import { hasPermission, ProjectPermission } from "@/lib/project-permissions"
import { useTranslations } from "next-intl"

const PAGE_SIZE = 10

export default function ProjectLabelsTable() {
  const t = useTranslations("ProjectLabelsTable")

  const { user } = useSession()
  const { project, member } = useProject()

  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const filteredLabels = normalizedSearchQuery
    ? project.labels.filter(
        (label) =>
          (label.id ?? "").toLowerCase().includes(normalizedSearchQuery) ||
          (label.name ?? "").toLowerCase().includes(normalizedSearchQuery)
      )
    : project.labels

  const total = filteredLabels.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = Math.min(total, currentPage * PAGE_SIZE)
  const currentLabels = filteredLabels.slice(startIndex, endIndex)
  const displayStartIndex = total === 0 ? 0 : startIndex + 1

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
              <TableHead>{t("tableHeader.description")}</TableHead>
              <TableHead className="text-center">
                {t("tableHeader.color")}
              </TableHead>
              <TableHead className="text-center">
                {t("tableHeader.icon")}
              </TableHead>
              <TableHead className="max-w-24 text-center">
                {t("tableHeader.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentLabels.length > 0 ? (
              currentLabels.map((label) => (
                <TableRow key={label.id}>
                  <TableCell className="text-center">
                    {label.id.slice(0, 8)}
                  </TableCell>

                  <TableCell className="min-w-40">{label.name}</TableCell>

                  <TableCell>
                    {label.description ? (
                      <span className="line-clamp-2">{label.description}</span>
                    ) : (
                      <span className="text-muted-foreground italic">
                        {t("noDescription")}
                      </span>
                    )}
                  </TableCell>

                  <TableCell
                    className={cn(
                      "max-w-16 text-center",
                      !label.color && "text-muted-foreground italic"
                    )}
                  >
                    {label.color ? (
                      <>
                        <Badge
                          variant="outline"
                          style={getColorStyle(label.color)}
                          className={getColorClassName(label.color)}
                        >
                          {label.name}
                        </Badge>
                        <p className="sr-only">{label.color}</p>
                      </>
                    ) : (
                      <p>{t("noColor")}</p>
                    )}
                  </TableCell>

                  <TableCell
                    className={cn(
                      "max-w-16 text-center",
                      !label.icon && "text-muted-foreground italic"
                    )}
                  >
                    {label.icon ? (
                      (() => {
                        const LabelIcon = getIcon(label.icon)
                        return LabelIcon ? (
                          <LabelIcon
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

                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <UpdateLabelSheet
                        projectId={project.id}
                        label={label}
                        canUpdateLabels={canManageLabels}
                        loading={loading}
                        setLoading={setLoading}
                      />
                      <DeleteLabelDialog
                        projectId={project.id}
                        label={label}
                        canDeleteLabels={canManageLabels}
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
                    ? t("table.noLabelsFound", { query: searchQuery })
                    : t("table.noLabelsFoundGeneric")}
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

function UpdateLabelSheet({
  projectId,
  label,
  canUpdateLabels,
  loading,
  setLoading,
}: {
  projectId: string
  label: ProjectLabel
  canUpdateLabels: boolean
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()
  const t = useTranslations("ProjectLabelsTable")

  const [updatingLabel, setUpdatingLabel] = useState<ProjectLabel | null>(null)

  const [name, setName] = useState("")
  const [description, setDescription] = useState<string | null>(null)
  const [color, setColor] = useState("")
  const [icon, setIcon] = useState("")

  function openEditor(currentLabel: ProjectLabel) {
    setName(currentLabel.name ?? "")
    setDescription(currentLabel.description ?? null)
    setColor(currentLabel.color ?? "")
    setIcon(currentLabel.icon ?? "")
    setUpdatingLabel(currentLabel)
  }

  function closeEditor() {
    setUpdatingLabel(null)
    setName("")
    setDescription(null)
    setColor("")
    setIcon("")
  }

  async function handleUpdateLabel(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!updatingLabel) return

    setLoading(true)
    await updateProjectLabel({
      projectId,
      labelId: updatingLabel.id,
      name: name.trim(),
      description: description?.trim() || null,
      color,
      icon,
    })
      .then((updatedLabel) => {
        toast.success(
          t("toast.updateSuccess", {
            labelName: updatedLabel.name,
            labelId: updatedLabel.id.slice(0, 8),
          })
        )

        closeEditor()
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message ||
            t("toast.updateFailed", {
              labelName: updatingLabel.name,
              labelId: updatingLabel.id.slice(0, 8),
            })
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <Sheet
      open={updatingLabel?.id === label.id}
      onOpenChange={(open) => !open && closeEditor()}
    >
      <Tooltip>
        <TooltipTrigger
          asChild
          className={!canUpdateLabels || loading ? "cursor-not-allowed" : ""}
        >
          <SheetTrigger asChild>
            <span className="inline-block">
              <Button
                variant="outline"
                size="icon"
                className="inline-flex items-center p-1 text-sm"
                disabled={!canUpdateLabels || loading}
                onClick={() => openEditor(label)}
              >
                <PencilIcon size={16} />
              </Button>
            </span>
          </SheetTrigger>
        </TooltipTrigger>
        {!canUpdateLabels && (
          <TooltipContent>{t("tooltip.noPermissionUpdate")}</TooltipContent>
        )}
      </Tooltip>

      <SheetContent className="flex flex-col overflow-hidden">
        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleUpdateLabel}
        >
          <SheetHeader className="shrink-0">
            <SheetTitle>
              {t("sheet.updateLabel.title", {
                labelName: updatingLabel?.name ?? "",
                labelId: updatingLabel?.id.slice(0, 8) ?? "",
              })}
            </SheetTitle>
            <SheetDescription>
              {t("sheet.updateLabel.description", {
                labelName: updatingLabel?.name ?? "",
                labelId: updatingLabel?.id.slice(0, 8) ?? "",
              })}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="min-h-0 flex-1 overflow-hidden">
            <div className="grid auto-rows-min gap-6 px-4 py-4">
              <div className="grid gap-3">
                <Label htmlFor="labelName">
                  {t("sheet.updateLabel.labelNameLabel")}
                </Label>
                <Input
                  id="labelName"
                  value={name}
                  placeholder={t("sheet.updateLabel.labelNamePlaceholder")}
                  required
                  disabled={loading}
                  onChange={({ target: { value } }) => setName(value)}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="labelDescription">
                  {t("sheet.updateLabel.descriptionLabel")}
                </Label>
                <Input
                  id="labelDescription"
                  value={description || ""}
                  placeholder={t("sheet.updateLabel.descriptionPlaceholder")}
                  disabled={loading}
                  onChange={({ target: { value } }) => setDescription(value)}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="labelColor">
                  {t("sheet.updateLabel.colorLabel")}
                </Label>
                <ColorPickerField
                  id="labelColor"
                  value={color}
                  onChange={setColor}
                  disabled={loading}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="labelIcon">
                  {t("sheet.updateLabel.iconLabel")}
                </Label>
                <IconPickerField
                  id="labelIcon"
                  value={icon}
                  onChange={setIcon}
                  disabled={loading}
                />
              </div>
            </div>
          </ScrollArea>

          <SheetFooter className="shrink-0">
            <SheetClose asChild>
              <Button
                variant="outline"
                disabled={loading}
                onClick={closeEditor}
              >
                {t("sheet.close")}
              </Button>
            </SheetClose>

            <Button
              type="submit"
              disabled={loading || !updatingLabel || !name.trim()}
            >
              {loading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  {t("sheet.updateLabel.updatingLabel")}
                </>
              ) : (
                <>
                  <PencilIcon className="h-4 w-4" />
                  {t("sheet.updateLabel.updateLabel")}
                </>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function DeleteLabelDialog({
  projectId,
  label,
  canDeleteLabels,
  loading,
  setLoading,
}: {
  projectId: string
  label: ProjectLabel
  canDeleteLabels: boolean
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()
  const t = useTranslations("ProjectLabelsTable")

  const [deletingLabel, setDeletingLabel] = useState<ProjectLabel | null>(null)

  async function handleDeleteLabel(deletingLabel: ProjectLabel) {
    setLoading(true)

    await deleteProjectLabel({
      projectId,
      labelId: deletingLabel.id,
    })
      .then((deletedLabel) => {
        toast.success(
          t("toast.deleteSuccess", {
            labelName: deletedLabel.name,
            labelId: deletedLabel.id.slice(0, 8),
          })
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message ||
            t("toast.deleteFailed", {
              labelName: deletingLabel.name,
              labelId: deletingLabel.id.slice(0, 8),
            })
        )
      })
      .finally(() => {
        setLoading(false)
        setDeletingLabel(null)
      })
  }

  return (
    <AlertDialog
      open={!!deletingLabel}
      onOpenChange={(open) => !open && setDeletingLabel(null)}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex",
              !canDeleteLabels || loading ? "cursor-not-allowed" : ""
            )}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="inline-flex items-center p-1 text-sm"
                disabled={!canDeleteLabels || loading}
                onClick={() => setDeletingLabel(label)}
              >
                <TrashIcon size={16} />
              </Button>
            </AlertDialogTrigger>
          </span>
        </TooltipTrigger>
        {!canDeleteLabels && (
          <TooltipContent>{t("tooltip.noPermissionDelete")}</TooltipContent>
        )}
      </Tooltip>

      <AlertDialogPortal>
        <AlertDialogOverlay className="bg-red-950/30 backdrop-blur-sm" />

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("dialog.deleteLabel.title", {
                labelName: deletingLabel?.name ?? "",
                labelId: deletingLabel?.id.slice(0, 8) ?? "",
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialog.deleteLabel.description", {
                labelName: deletingLabel?.name ?? "",
                labelId: deletingLabel?.id.slice(0, 8) ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              variant="outline"
              disabled={loading}
              onClick={() => setDeletingLabel(null)}
            >
              {t("dialog.cancel")}
            </AlertDialogCancel>

            <Button
              variant="destructive"
              disabled={loading || deletingLabel === null}
              onClick={(event) => {
                event.preventDefault()
                if (!deletingLabel) return
                void handleDeleteLabel(deletingLabel)
              }}
            >
              {loading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  {t("dialog.deleteLabel.deletingLabel")}
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4" />
                  {t("dialog.deleteLabel.deleteLabel")}
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  )
}
