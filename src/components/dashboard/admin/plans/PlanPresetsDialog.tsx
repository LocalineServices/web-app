"use client"

import { createPlans } from "@/actions/plans"
import { useSession } from "@/components/session-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { Plan } from "@prisma/client"
import { ImportIcon } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

type ImportablePlanProps = {
  displayName: string
  description?: string
  localesLimit?: number
  termsLimit?: number
  labelsLimit?: number
  membersLimit?: number
}

const IMPORTABLE_PLANS: ImportablePlanProps[] = [
  {
    displayName: "Basic",
    description: "A basic plan with limited features.",
    localesLimit: 5,
    termsLimit: 500,
    labelsLimit: 20,
    membersLimit: 5,
  },
  {
    displayName: "Pro",
    description: "A pro plan with more features and higher limits.",
    localesLimit: 20,
    termsLimit: 5000,
    labelsLimit: 50,
    membersLimit: 50,
  },
  {
    displayName: "Enterprise",
    description: "An enterprise plan with all features and the highest limits.",
    localesLimit: 100,
    termsLimit: 50000,
    labelsLimit: 150,
    membersLimit: 300,
  },
  {
    displayName: "Unlimited",
    description: "A plan with unlimited features and limits.",
  },
]

export default function PlanPresetsDialog({ plans }: { plans: Plan[] }) {
  const t = useTranslations("PlanPresetsDialog")
  const format = useFormatter()

  const router = useRouter()
  const { user } = useSession()

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [selectedPlans, setSelectedPlans] = useState<ImportablePlanProps[]>([])

  const canCreatePlans = authClient.admin.checkRolePermission({
    // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
    role: user?.role ?? "user",
    permissions: {
      plans: ["create"],
    },
  })

  const isPlanAlreadyImported = (plan: ImportablePlanProps) => {
    return plans.some(
      (existingPlan) => existingPlan.displayName === plan.displayName
    )
  }

  const allPlansAlreadyImported = IMPORTABLE_PLANS.every(isPlanAlreadyImported)

  const togglePlan = (plan: ImportablePlanProps) => {
    setSelectedPlans((prev) =>
      prev.includes(plan)
        ? prev.filter((selectedPlan) => selectedPlan !== plan)
        : [...prev, plan]
    )
  }

  const handleImportPlans = async () => {
    setLoading(true)
    try {
      const result = await createPlans(
        selectedPlans
          .sort((a, b) => {
            const aLimit = a.termsLimit ?? Infinity
            const bLimit = b.termsLimit ?? Infinity

            return aLimit - bLimit
          })
          .map((plan) => ({
            displayName: plan.displayName,
            description: plan.description,
            localesLimit: plan.localesLimit,
            termsLimit: plan.termsLimit,
            labelsLimit: plan.labelsLimit,
            membersLimit: plan.membersLimit,
          }))
      )

      toast.success(
        t("toast.importSuccess", {
          count: selectedPlans.length,
          created: result.count,
          updated: selectedPlans.length - result.count,
        })
      )
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("toast.importFailed")
      )
    } finally {
      setLoading(false)
      setDialogOpen(false)
      setSelectedPlans([])
    }
  }

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setDialogOpen(open)
        if (!open) {
          setSelectedPlans([])
        }
      }}
    >
      <Tooltip>
        <TooltipTrigger
          asChild
          className={
            !canCreatePlans || allPlansAlreadyImported || loading
              ? "cursor-not-allowed"
              : ""
          }
        >
          <span className="inline-block">
            <DialogTrigger
              asChild
              disabled={!canCreatePlans || allPlansAlreadyImported || loading}
            >
              <Button
                variant="outline"
                disabled={!canCreatePlans || allPlansAlreadyImported || loading}
              >
                <ImportIcon className="mr-2 h-4 w-4" />
                {t("button.importPresets")}
              </Button>
            </DialogTrigger>
          </span>
        </TooltipTrigger>
        {!canCreatePlans ? (
          <TooltipContent>{t("tooltip.noPermission")}</TooltipContent>
        ) : allPlansAlreadyImported ? (
          <TooltipContent>{t("tooltip.noPresets")}</TooltipContent>
        ) : null}
      </Tooltip>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("dialog.title")}</DialogTitle>
          <DialogDescription>{t("dialog.description")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          {IMPORTABLE_PLANS.map((plan) => (
            <Card
              key={plan.displayName}
              role="button"
              tabIndex={0}
              aria-disabled={isPlanAlreadyImported(plan) || loading}
              aria-pressed={selectedPlans.includes(plan)}
              onClick={() => {
                if (isPlanAlreadyImported(plan) || loading) return
                togglePlan(plan)
              }}
              className={cn(
                "cursor-pointer transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
                selectedPlans.includes(plan) && "bg-primary/5",
                isPlanAlreadyImported(plan) &&
                  "cursor-not-allowed opacity-50 hover:bg-transparent"
              )}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{plan.displayName}</span>
                  {selectedPlans.includes(plan) && (
                    <Badge variant="outline">
                      {t("dialog.card.planSelected")}
                    </Badge>
                  )}
                  {isPlanAlreadyImported(plan) && (
                    <Badge variant="destructive">
                      {t("dialog.card.alreadyImported")}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className={cn(!plan.description && "italic")}>
                  {plan.description ?? t("dialog.card.noDescription")}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-1">
                  <li>
                    <strong>{t("dialog.card.localesLimit")}</strong>{" "}
                    {plan.localesLimit !== undefined
                      ? format.number(plan.localesLimit)
                      : t("dialog.card.unlimited")}
                  </li>

                  <li>
                    <strong>{t("dialog.card.termsLimit")}</strong>{" "}
                    {plan.termsLimit !== undefined
                      ? format.number(plan.termsLimit)
                      : t("dialog.card.unlimited")}
                  </li>

                  <li>
                    <strong>{t("dialog.card.labelsLimit")}</strong>{" "}
                    {plan.labelsLimit !== undefined
                      ? format.number(plan.labelsLimit)
                      : t("dialog.card.unlimited")}
                  </li>

                  <li>
                    <strong>{t("dialog.card.membersLimit")}</strong>{" "}
                    {plan.membersLimit !== undefined
                      ? format.number(plan.membersLimit)
                      : t("dialog.card.unlimited")}
                  </li>
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDialogOpen(false)
              setSelectedPlans([])
            }}
            disabled={loading}
          >
            {t("dialog.close")}
          </Button>

          <Button
            variant="outline"
            onClick={handleImportPlans}
            disabled={loading || selectedPlans.length === 0}
          >
            {loading ? (
              <>
                <Spinner className="h-4 w-4" />
                {t("dialog.importingPlans")}
              </>
            ) : (
              <>
                <ImportIcon className="h-4 w-4" />
                {t("dialog.importPlans", { count: selectedPlans.length })}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
