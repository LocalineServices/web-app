"use client"

import { createPlan } from "@/actions/plans"
import { useSession } from "@/components/session-provider"
import { Button } from "@/components/ui/button"
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
import { PlusIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { MouseEvent, useState } from "react"
import { toast } from "sonner"

export default function CreatePlanDialog() {
  const router = useRouter()
  const t = useTranslations("CreatePlanDialog")
  const { user } = useSession()

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [description, setDescription] = useState<string | null>(null)

  const canCreatePlans = authClient.admin.checkRolePermission({
    // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
    role: user?.role ?? "user",
    permissions: {
      plans: ["create"],
    },
  })

  const handleCreatePlan = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    await createPlan({
      displayName,
      description: description || undefined,
    })
      .then((plan) => {
        toast.success(
          t("toast.creationSuccess", {
            planDisplayName: displayName,
            planId: plan.id.slice(0, 8),
          })
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message ||
            t("toast.creationFailed", {
              planDisplayName: displayName,
            })
        )
      })
      .finally(() => {
        setLoading(false)
        setDialogOpen(false)
        setDisplayName("")
        setDescription(null)
      })
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <Tooltip>
        <TooltipTrigger
          asChild
          className={!canCreatePlans || loading ? "cursor-not-allowed" : ""}
        >
          <span className="inline-block">
            <DialogTrigger asChild disabled={!canCreatePlans || loading}>
              <Button
                variant="outline"
                aria-disabled={!canCreatePlans || loading}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                {t("button.createPlan")}
              </Button>
            </DialogTrigger>
          </span>
        </TooltipTrigger>
        {!canCreatePlans && (
          <TooltipContent>{t("tooltip.noPermission")}</TooltipContent>
        )}
      </Tooltip>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dialog.title")}</DialogTitle>
          <DialogDescription>{t("dialog.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="planName">{t("dialog.planNameLabel")}</Label>
            <Input
              id="planName"
              placeholder={t("dialog.planNamePlaceholder")}
              value={displayName}
              onChange={({ target: { value } }) => setDisplayName(value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="planDescription">
              {t("dialog.planDescriptionLabel")}
            </Label>
            <Input
              id="planDescription"
              placeholder={t("dialog.planDescriptionPlaceholder")}
              value={description || ""}
              onChange={({ target: { value } }) => setDescription(value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDialogOpen(false)
              setDisplayName("")
              setDescription(null)
            }}
            disabled={loading}
          >
            {t("dialog.close")}
          </Button>

          <Button
            variant="outline"
            onClick={handleCreatePlan}
            disabled={!displayName || loading}
          >
            {loading ? (
              <>
                <Spinner className="h-4 w-4" />
                {t("dialog.creatingPlan")}
              </>
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                {t("dialog.createPlan")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
