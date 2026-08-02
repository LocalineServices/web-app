"use client"

import { updateProjectPlan } from "@/actions/projects"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import {
  ExternalLinkIcon,
  FoldersIcon,
  PackageSearchIcon,
  PencilIcon,
  SearchIcon,
} from "lucide-react"
import Link from "next/link"
import { MouseEvent, useState } from "react"
import TablePagination from "@/components/dashboard/TablePagination"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Plan } from "@prisma/client"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { toast } from "sonner"
import { FullProject } from "@/types/project"
import { useSession } from "@/components/session-provider"
import { authClient } from "@/lib/auth-client"
import { useTranslations } from "next-intl"

const PAGE_SIZE = 10

export default function AdminProjectsTable({
  projects,
  plans,
}: {
  projects: FullProject[]
  plans: Plan[]
}) {
  const t = useTranslations("AdminProjectsTable")

  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const filteredProjects = normalizedSearchQuery
    ? projects.filter(
        (project) =>
          (project.id ?? "").toLowerCase().includes(normalizedSearchQuery) ||
          (project.name ?? "").toLowerCase().includes(normalizedSearchQuery)
      )
    : projects

  const total = filteredProjects.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = Math.min(total, currentPage * PAGE_SIZE)
  const currentProjects = filteredProjects.slice(startIndex, endIndex)
  const displayStartIndex = total === 0 ? 0 : startIndex + 1

  if (total === 0 && searchQuery === "") {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FoldersIcon />
          </EmptyMedia>

          <EmptyTitle>{t("empty.title")}</EmptyTitle>

          <EmptyDescription>{t("empty.description")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

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
                {t("table.header.id")}
              </TableHead>
              <TableHead>{t("table.header.name")}</TableHead>
              <TableHead>{t("table.header.description")}</TableHead>
              <TableHead>{t("table.header.owner")}</TableHead>
              <TableHead className="max-w-24 text-center">
                {t("table.header.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentProjects.length > 0 ? (
              currentProjects.map((project) => {
                const owner = project.members.find(
                  (member) => member.roleId === project.id
                )?.user

                return (
                  <TableRow key={project.id}>
                    <TableCell className="text-center">
                      {project.id.slice(0, 8)}
                    </TableCell>

                    <TableCell className="min-w-40">{project.name}</TableCell>

                    <TableCell
                      className={cn(
                        !project.description && "text-muted-foreground italic"
                      )}
                    >
                      {project.description ?? t("table.row.noDescription")}
                    </TableCell>

                    <TableCell className="max-w-30">
                      {owner ? (
                        <>
                          <span className="text-sm font-medium text-foreground sm:hidden">
                            {owner.name || t("table.row.unknownUser")}
                          </span>

                          <div className="hidden w-fit items-center gap-2 rounded-full bg-muted px-3 py-1 sm:inline-flex">
                            <Avatar className="h-6 w-6 shrink-0">
                              <AvatarImage
                                src={owner.image || undefined}
                                alt={owner.name || t("table.row.unknownUser")}
                              />
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {owner.name
                                  ? owner.name.charAt(0).toUpperCase()
                                  : "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="max-w-full truncate text-sm font-medium text-foreground">
                              {owner.name || t("table.row.unknownUser")}
                            </span>
                          </div>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">
                          {t("table.row.noOwner")}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="inline-flex items-center p-1 text-sm"
                        >
                          <Link
                            href={`/projects/${project.id}`}
                            className="flex items-center"
                          >
                            <ExternalLinkIcon size={16} />
                          </Link>
                        </Button>
                        <ChangePlanDialog
                          project={project}
                          plans={plans}
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
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  {searchQuery
                    ? t("table.noProjectsFound", { query: searchQuery })
                    : t("table.noProjectsFoundGeneric")}
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

function ChangePlanDialog({
  project,
  plans,
  loading,
  setLoading,
}: {
  project: FullProject
  plans: Plan[]
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const t = useTranslations("AdminProjectsTable")

  const router = useRouter()
  const { user } = useSession()

  const [editingProject, setEditingProject] = useState<FullProject | null>(null)
  const [plan, setPlan] = useState<Plan | null>(null)

  const canUpdatePlan = authClient.admin.checkRolePermission({
    // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
    role: user?.role ?? "user",
    permissions: {
      projects: ["update:plan"],
    },
  })

  const handleUpdatePlan = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    if (!plan) return

    setLoading(true)
    await updateProjectPlan({
      projectId: project.id,
      planId: plan.id,
    })
      .then(() => {
        toast.success(
          t("toast.updatePlanSuccess", {
            projectName: project.name,
            projectId: project.id,
            planName: plan.displayName,
          })
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message ||
            t("toast.updatePlanFailed", {
              projectName: project.name,
              projectId: project.id,
              planName: plan.displayName,
            })
        )
      })
      .finally(() => {
        setLoading(false)
        setEditingProject(null)
        setPlan(null)
      })
  }

  return (
    <Dialog
      open={editingProject !== null}
      onOpenChange={(open) => {
        if (!open) {
          setEditingProject(null)
          setPlan(null)
        }
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex",
              !canUpdatePlan || loading ? "cursor-not-allowed" : ""
            )}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="inline-flex items-center p-1 text-sm"
                disabled={!canUpdatePlan || loading}
                onClick={() => setEditingProject(project)}
              >
                <PackageSearchIcon size={16} />
              </Button>
            </DialogTrigger>
          </span>
        </TooltipTrigger>
        {!canUpdatePlan && (
          <TooltipContent>{t("tooltip.noPermissionUpdatePlan")}</TooltipContent>
        )}
      </Tooltip>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("dialog.updatePlan.title", {
              projectName: project.name,
              projectId: project.id.slice(0, 8),
            })}
          </DialogTitle>
          <DialogDescription>
            {t("dialog.updatePlan.description", {
              projectName: project.name,
              projectId: project.id.slice(0, 8),
            })}
          </DialogDescription>
        </DialogHeader>

        <NativeSelect
          className="w-full"
          value={plan?.id ?? project.planId ?? ""}
          onChange={({ target: { value } }) => {
            const selectedPlan = plans.find((plan) => plan.id === value) || null
            setPlan(selectedPlan)
          }}
        >
          {plans.map(({ id, displayName }) => (
            <NativeSelectOption key={id} value={id}>
              {displayName}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setEditingProject(null)}
            disabled={loading}
          >
            {t("dialog.close")}
          </Button>

          <Button
            variant="outline"
            onClick={handleUpdatePlan}
            disabled={loading || !plan || plan.id === project.planId}
          >
            {loading ? (
              <>
                <Spinner className="h-4 w-4" />
                {t("dialog.updatePlan.updatingPlan")}
              </>
            ) : (
              <>
                <PencilIcon className="h-4 w-4" />
                {t("dialog.updatePlan.updatePlan")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
