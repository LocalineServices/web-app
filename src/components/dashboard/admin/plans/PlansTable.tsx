"use client"

import { deletePlan, updateDefaultPlan, updatePlan } from "@/actions/plans"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Plan } from "@prisma/client"
import {
  AlertTriangleIcon,
  BadgeCheckIcon,
  BadgeXIcon,
  PackageIcon,
  PencilIcon,
  SearchIcon,
  TrashIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { SubmitEvent, useState } from "react"
import { toast } from "sonner"
import CreatePlanDialog from "@/components/dashboard/admin/plans/CreatePlanDialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
import { Spinner } from "@/components/ui/spinner"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import TablePagination from "@/components/dashboard/TablePagination"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { useSession } from "@/components/session-provider"
import { authClient } from "@/lib/auth-client"
import { useFormatter, useTranslations } from "next-intl"

const PAGE_SIZE = 10

export default function AdminPlansTable({
  plans,
  existsDefaultPlan,
}: {
  plans: Plan[]
  existsDefaultPlan: boolean
}) {
  const router = useRouter()
  const t = useTranslations("AdminPlansTable")
  const format = useFormatter()

  const { user } = useSession()

  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const filteredPlans = normalizedSearchQuery
    ? plans.filter(
        (plan) =>
          (plan.id ?? "").toLowerCase().includes(normalizedSearchQuery) ||
          (plan.displayName ?? "")
            .toLowerCase()
            .includes(normalizedSearchQuery) ||
          (plan.description ?? "").toLowerCase().includes(normalizedSearchQuery)
      )
    : plans

  const total = filteredPlans.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = Math.min(total, currentPage * PAGE_SIZE)
  const currentPlans = filteredPlans.slice(startIndex, endIndex)
  const displayStartIndex = total === 0 ? 0 : startIndex + 1

  const canUpdatePlans = authClient.admin.checkRolePermission({
    // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
    role: user?.role ?? "user",
    permissions: {
      plans: ["update"],
    },
  })

  async function handleUpdateDefaultPlan(plan: {
    id: string
    displayName: string
    default?: boolean
  }) {
    if (plan.default) {
      toast.error(
        t("toast.alreadyDefault", {
          planDisplayName: plan.displayName,
          planId: plan.id.slice(0, 8),
        })
      )
      return
    }

    setLoading(true)

    await updateDefaultPlan(plan.id)
      .then(() => {
        toast.success(
          t("toast.setDefaultSuccess", {
            planDisplayName: plan.displayName,
            planId: plan.id.slice(0, 8),
          })
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message ||
            t("toast.setDefaultFailed", {
              planDisplayName: plan.displayName,
              planId: plan.id.slice(0, 8),
            })
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }

  if (total === 0 && searchQuery === "") {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PackageIcon />
          </EmptyMedia>

          <EmptyTitle>{t("empty.title")}</EmptyTitle>

          <EmptyDescription className="grid gap-2">
            {t("empty.description")}
            <CreatePlanDialog />
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div>
      {!existsDefaultPlan && (
        <Alert className="mt-2 mb-2 max-w-xl border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-50">
          <AlertTriangleIcon className="size-4 text-amber-600 dark:text-amber-300" />
          <AlertTitle>{t("noDefaultPlanAlert.title")}</AlertTitle>
          <AlertDescription className="text-amber-900/80 dark:text-amber-100/80">
            {t("noDefaultPlanAlert.description")}
          </AlertDescription>
        </Alert>
      )}

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
              <TableHead>{t("tableHeader.displayName")}</TableHead>
              <TableHead>{t("tableHeader.description")}</TableHead>
              <TableHead className="text-center">
                <HoverCard openDelay={10} closeDelay={10}>
                  <HoverCardTrigger asChild>
                    <Button variant="ghost">{t("tableHeader.default")}</Button>
                  </HoverCardTrigger>

                  <HoverCardContent>
                    {t("tableHeader.defaultHover")}
                  </HoverCardContent>
                </HoverCard>
              </TableHead>
              <TableHead className="text-center">
                {t("tableHeader.localesLimit")}
              </TableHead>
              <TableHead className="text-center">
                {t("tableHeader.termsLimit")}
              </TableHead>
              <TableHead className="text-center">
                {t("tableHeader.labelsLimit")}
              </TableHead>
              <TableHead className="text-center">
                {t("tableHeader.membersLimit")}
              </TableHead>
              <TableHead className="max-w-24 text-center">
                {t("tableHeader.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentPlans.length > 0 ? (
              currentPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="text-center">
                    {plan.id.slice(0, 8)}
                  </TableCell>

                  <TableCell className="min-w-40">{plan.displayName}</TableCell>

                  <TableCell
                    className={cn(
                      "min-w-32",
                      !plan.description && "text-muted-foreground italic"
                    )}
                  >
                    {plan.description ?? "None"}
                  </TableCell>

                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="cursor-pointer rounded-full p-0"
                      disabled={!canUpdatePlans || loading}
                      onClick={(event) => {
                        event.preventDefault()
                        handleUpdateDefaultPlan(plan)
                      }}
                    >
                      {plan.default ? (
                        <BadgeCheckIcon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <BadgeXIcon className="size-4 shrink-0 text-red-600 dark:text-red-400" />
                      )}
                    </Button>
                  </TableCell>

                  <TableCell className="text-center">
                    {plan.localesLimit !== null
                      ? format.number(plan.localesLimit)
                      : t("unlimited")}
                  </TableCell>

                  <TableCell className="text-center">
                    {plan.termsLimit !== null
                      ? format.number(plan.termsLimit)
                      : t("unlimited")}
                  </TableCell>

                  <TableCell className="text-center">
                    {plan.labelsLimit !== null
                      ? format.number(plan.labelsLimit)
                      : t("unlimited")}
                  </TableCell>

                  <TableCell className="text-center">
                    {plan.membersLimit !== null
                      ? format.number(plan.membersLimit)
                      : t("unlimited")}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <EditPlanSheet
                        plan={plan}
                        canUpdatePlans={canUpdatePlans}
                        loading={loading}
                        setLoading={setLoading}
                      />
                      <DeletePlanDialog
                        plan={plan}
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
                  colSpan={9}
                  className="h-24 text-center text-muted-foreground"
                >
                  {searchQuery
                    ? t("table.noPlansFound", { query: searchQuery })
                    : t("table.noPlansFoundGeneric")}
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

function EditPlanSheet({
  plan,
  canUpdatePlans,
  loading,
  setLoading,
}: {
  plan: Plan
  canUpdatePlans: boolean
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()
  const t = useTranslations("AdminPlansTable")

  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)

  const [displayName, setDisplayName] = useState("")
  const [description, setDescription] = useState<string | null>(null)
  const [localesLimit, setLocalesLimit] = useState<number | null>(null)
  const [termsLimit, setTermsLimit] = useState<number | null>(null)
  const [labelsLimit, setLabelsLimit] = useState<number | null>(null)
  const [membersLimit, setMembersLimit] = useState<number | null>(null)

  function openEditor(plan: Plan) {
    setDisplayName(plan.displayName ?? "")
    setDescription(plan.description)
    setLocalesLimit(plan.localesLimit)
    setTermsLimit(plan.termsLimit)
    setLabelsLimit(plan.labelsLimit)
    setMembersLimit(plan.membersLimit)
    setEditingPlan(plan)
  }

  async function handleUpdatePlan(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!editingPlan) return

    setLoading(true)
    await updatePlan(editingPlan.id, {
      displayName,
      description: description || null,
      localesLimit: localesLimit || null,
      termsLimit: termsLimit || null,
      labelsLimit: labelsLimit || null,
      membersLimit: membersLimit || null,
    })
      .then(() => {
        toast.success(
          t("toast.updateSuccess", {
            planDisplayName: editingPlan.displayName,
            planId: editingPlan.id.slice(0, 8),
          })
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message ||
            t("toast.updateFailed", {
              planDisplayName: editingPlan.displayName,
              planId: editingPlan.id.slice(0, 8),
            })
        )
      })
      .finally(() => {
        setLoading(false)
        setEditingPlan(null)
      })
  }

  return (
    <Sheet
      open={editingPlan !== null}
      onOpenChange={(open) => {
        if (!open) {
          setEditingPlan(null)
        }
      }}
    >
      <Tooltip>
        <TooltipTrigger
          asChild
          className={!canUpdatePlans || loading ? "cursor-not-allowed" : ""}
        >
          <SheetTrigger asChild>
            <span className="inline-block">
              <Button
                variant="outline"
                size="icon"
                className="inline-flex items-center p-1 text-sm"
                disabled={!canUpdatePlans || loading}
                onClick={() => openEditor(plan)}
              >
                <PencilIcon size={16} />
              </Button>
            </span>
          </SheetTrigger>
        </TooltipTrigger>
        {!canUpdatePlans && (
          <TooltipContent>{t("tooltip.noPermissionUpdate")}</TooltipContent>
        )}
      </Tooltip>

      <SheetContent className="flex flex-col overflow-hidden">
        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleUpdatePlan}
        >
          <SheetHeader className="shrink-0">
            <SheetTitle>
              {t("sheet.editPlan.title", {
                planDisplayName: editingPlan?.displayName ?? "",
                planId: editingPlan?.id.slice(0, 8) ?? "",
              })}
            </SheetTitle>
            <SheetDescription>
              {t("sheet.editPlan.description", {
                planDisplayName: editingPlan?.displayName ?? "",
                planId: editingPlan?.id.slice(0, 8) ?? "",
              })}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="min-h-0 flex-1 overflow-hidden">
            <div className="grid auto-rows-min gap-6 px-4 py-4">
              <div className="grid gap-3">
                <Label htmlFor="planName">
                  {t("sheet.editPlan.displayNameLabel")}
                </Label>
                <Input
                  id="planName"
                  value={displayName}
                  placeholder={t("sheet.editPlan.displayNamePlaceholder")}
                  required
                  disabled={loading}
                  onChange={(event) => setDisplayName(event.target.value)}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="planDescription">
                  {t("sheet.editPlan.descriptionLabel")}
                </Label>
                <Input
                  id="planDescription"
                  value={description || ""}
                  placeholder={t("sheet.editPlan.descriptionPlaceholder")}
                  disabled={loading}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="planLocalesLimit">
                  {t("sheet.editPlan.localesLimitLabel")}
                </Label>
                <Input
                  id="planLocalesLimit"
                  type="number"
                  value={localesLimit ?? ""}
                  placeholder={t("sheet.editPlan.localesLimitPlaceholder")}
                  disabled={loading}
                  onChange={(event) =>
                    setLocalesLimit(
                      event.target.value ? Number(event.target.value) : null
                    )
                  }
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="planTermsLimit">
                  {t("sheet.editPlan.termsLimitLabel")}
                </Label>
                <Input
                  id="planTermsLimit"
                  type="number"
                  value={termsLimit ?? ""}
                  placeholder={t("sheet.editPlan.termsLimitPlaceholder")}
                  disabled={loading}
                  onChange={(event) =>
                    setTermsLimit(
                      event.target.value ? Number(event.target.value) : null
                    )
                  }
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="planLabelsLimit">
                  {t("sheet.editPlan.labelsLimitLabel")}
                </Label>
                <Input
                  id="planLabelsLimit"
                  type="number"
                  value={labelsLimit ?? ""}
                  placeholder={t("sheet.editPlan.labelsLimitPlaceholder")}
                  disabled={loading}
                  onChange={(event) =>
                    setLabelsLimit(
                      event.target.value ? Number(event.target.value) : null
                    )
                  }
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="planMembersLimit">
                  {t("sheet.editPlan.membersLimitLabel")}
                </Label>
                <Input
                  id="planMembersLimit"
                  type="number"
                  value={membersLimit ?? ""}
                  placeholder={t("sheet.editPlan.membersLimitPlaceholder")}
                  disabled={loading}
                  onChange={(event) =>
                    setMembersLimit(
                      event.target.value ? Number(event.target.value) : null
                    )
                  }
                />
              </div>
            </div>
          </ScrollArea>

          <SheetFooter className="shrink-0">
            <Button
              type="submit"
              disabled={loading || !editingPlan || !displayName}
            >
              {loading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  {t("sheet.editPlan.updatingPlan")}
                </>
              ) : (
                <>
                  <PencilIcon className="h-4 w-4" />
                  {t("sheet.editPlan.updatePlan")}
                </>
              )}
            </Button>

            <SheetClose asChild>
              <Button
                variant="outline"
                disabled={loading}
                onClick={() => setEditingPlan(null)}
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

function DeletePlanDialog({
  plan,
  loading,
  setLoading,
}: {
  plan: Plan
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()
  const t = useTranslations("AdminPlansTable")
  const { user } = useSession()

  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null)

  const canDeletePlans = authClient.admin.checkRolePermission({
    // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
    role: user?.role ?? "user",
    permissions: {
      plans: ["delete"],
    },
  })

  async function handleDeletePlan(plan: Plan) {
    setLoading(true)

    await deletePlan(plan.id)
      .then(() => {
        toast.success(
          t("toast.deleteSuccess", {
            planDisplayName: plan.displayName,
            planId: plan.id.slice(0, 8),
          })
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message ||
            t("toast.deleteFailed", {
              planDisplayName: plan.displayName,
              planId: plan.id.slice(0, 8),
            })
        )
      })
      .finally(() => {
        setLoading(false)
        setDeletingPlan(null)
      })
  }

  return (
    <AlertDialog
      open={!!deletingPlan}
      onOpenChange={(open) => !open && setDeletingPlan(null)}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex",
              !canDeletePlans || loading ? "cursor-not-allowed" : ""
            )}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="inline-flex items-center p-1 text-sm"
                disabled={!canDeletePlans || loading}
                onClick={() => setDeletingPlan(plan)}
              >
                <TrashIcon size={16} />
              </Button>
            </AlertDialogTrigger>
          </span>
        </TooltipTrigger>
        {!canDeletePlans && (
          <TooltipContent>{t("tooltip.noPermissionDelete")}</TooltipContent>
        )}
      </Tooltip>

      <AlertDialogPortal>
        <AlertDialogOverlay className="bg-red-950/30 backdrop-blur-sm" />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("dialog.deletePlan.title", {
                planDisplayName: deletingPlan?.displayName ?? "",
                planId: deletingPlan?.id.slice(0, 8) ?? "",
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialog.deletePlan.description", {
                planDisplayName: deletingPlan?.displayName ?? "",
                planId: deletingPlan?.id.slice(0, 8) ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              variant="outline"
              disabled={loading}
              onClick={() => setDeletingPlan(null)}
            >
              {t("dialog.cancel")}
            </AlertDialogCancel>

            <Button
              variant="destructive"
              disabled={loading || deletingPlan === null}
              onClick={(event) => {
                event.preventDefault()
                if (!deletingPlan) return

                void handleDeletePlan(deletingPlan)
              }}
            >
              {loading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  {t("dialog.deletePlan.deletingPlan")}
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4" />
                  {t("dialog.deletePlan.deletePlan")}
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  )
}
