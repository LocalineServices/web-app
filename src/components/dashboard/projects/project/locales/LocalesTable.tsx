"use client"

import { removeProjectLocale } from "@/actions/project-locales"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
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
import { authClient } from "@/lib/auth-client"
import { hasPermission, ProjectPermission } from "@/lib/project-permissions"
import { getFlag } from "@/lib/project-utils"
import { cn } from "@/lib/utils"
import { ProjectLocaleWithLocale } from "@/types/project"
import { SearchIcon, TrashIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

const PAGE_SIZE = 10

export default function ProjectLocalesTable() {
  const t = useTranslations("ProjectLocalesTable")

  const { user } = useSession()
  const { project, member } = useProject()

  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const filteredProjectLocales = normalizedSearchQuery
    ? project.locales.filter(
        (projectLocale) =>
          (projectLocale.id ?? "")
            .toLowerCase()
            .includes(normalizedSearchQuery) ||
          (projectLocale.locale.displayName ?? "")
            .toLowerCase()
            .includes(normalizedSearchQuery) ||
          (projectLocale.locale.code ?? "")
            .toLowerCase()
            .includes(normalizedSearchQuery)
      )
    : project.locales

  const total = filteredProjectLocales.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = Math.min(total, currentPage * PAGE_SIZE)
  const currentProjectLocales = filteredProjectLocales.slice(
    startIndex,
    endIndex
  )
  const displayStartIndex = total === 0 ? 0 : startIndex + 1

  const canManageLocales =
    hasPermission(
      member?.role.permissions ?? 0n,
      ProjectPermission.MANAGE_LOCALES
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
              <TableHead>{t("tableHeader.code")}</TableHead>
              <TableHead className="text-center">
                {t("tableHeader.flag")}
              </TableHead>
              <TableHead className="max-w-24 text-center">
                {t("tableHeader.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentProjectLocales.length > 0 ? (
              currentProjectLocales.map((projectLocale) => (
                <TableRow key={projectLocale.id}>
                  <TableCell className="text-center">
                    {projectLocale.id.slice(0, 8)}
                  </TableCell>

                  <TableCell className="min-w-40">
                    {projectLocale.locale.displayName}
                  </TableCell>

                  <TableCell className="min-w-32">
                    <Badge variant="outline">{projectLocale.locale.code}</Badge>
                  </TableCell>

                  <TableCell
                    className={cn(
                      "max-w-24 text-center",
                      !projectLocale.locale.flag &&
                        "text-muted-foreground italic"
                    )}
                  >
                    {projectLocale.locale.flag ? (
                      (() => {
                        const FlagIcon = getFlag(projectLocale.locale.flag)
                        return FlagIcon ? (
                          <FlagIcon
                            className="mx-auto h-5 w-5"
                            aria-hidden="true"
                          />
                        ) : (
                          <p>{t("invalidFlag")}</p>
                        )
                      })()
                    ) : (
                      <p>{t("noFlag")}</p>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <RemoveLocaleDialog
                        projectLocale={projectLocale}
                        canManageLocales={canManageLocales}
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
                    ? t("table.noLocalesFound", { query: searchQuery })
                    : t("table.noLocalesFoundGeneric")}
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

function RemoveLocaleDialog({
  projectLocale,
  canManageLocales,
  loading,
  setLoading,
}: {
  projectLocale: ProjectLocaleWithLocale
  canManageLocales: boolean
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()
  const t = useTranslations("ProjectLocalesTable")

  const [removingLocale, setRemovingLocale] =
    useState<ProjectLocaleWithLocale | null>(null)

  async function handleRemoveLocale(projectLocale: ProjectLocaleWithLocale) {
    setLoading(true)

    await removeProjectLocale({
      projectId: projectLocale.projectId,
      projectLocaleId: projectLocale.id,
    })
      .then(() => {
        toast.success(
          t("toast.removeSuccess", {
            localeDisplayName: projectLocale.locale.displayName,
            localeId: projectLocale.locale.id.slice(0, 8),
          })
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message ||
            t("toast.removeFailed", {
              localeDisplayName: projectLocale.locale.displayName ?? "",
              localeId: projectLocale.locale.id.slice(0, 8) ?? "",
            })
        )
      })
      .finally(() => {
        setLoading(false)
        setRemovingLocale(null)
      })
  }

  return (
    <AlertDialog
      open={!!removingLocale}
      onOpenChange={(open) => !open && setRemovingLocale(null)}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex",
              !canManageLocales || loading ? "cursor-not-allowed" : ""
            )}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="inline-flex items-center p-1 text-sm"
                disabled={!canManageLocales || loading}
                onClick={() => setRemovingLocale(projectLocale)}
              >
                <TrashIcon size={16} />
              </Button>
            </AlertDialogTrigger>
          </span>
        </TooltipTrigger>
        {!canManageLocales && (
          <TooltipContent>{t("tooltip.noPermission")}</TooltipContent>
        )}
      </Tooltip>

      <AlertDialogPortal>
        <AlertDialogOverlay className="bg-red-950/30 backdrop-blur-sm" />

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("dialog.removeLocale.title", {
                localeName: removingLocale?.locale.displayName ?? "",
                localeId: removingLocale?.id.slice(0, 8) ?? "",
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialog.removeLocale.description", {
                localeName: removingLocale?.locale.displayName ?? "",
                localeId: removingLocale?.id.slice(0, 8) ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              variant="outline"
              disabled={loading}
              onClick={() => setRemovingLocale(null)}
            >
              {t("dialog.cancel")}
            </AlertDialogCancel>

            <Button
              variant="destructive"
              disabled={loading || removingLocale === null}
              onClick={(event) => {
                event.preventDefault()
                if (!removingLocale) return

                void handleRemoveLocale(removingLocale)
              }}
            >
              {loading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  {t("dialog.removeLocale.removingLocale")}
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4" />
                  {t("dialog.removeLocale.removeLocale")}
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  )
}
