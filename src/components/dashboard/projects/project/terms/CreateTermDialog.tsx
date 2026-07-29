"use client"

import { createProjectTerm } from "@/actions/project-terms"
import { useProject } from "@/components/project-provider"
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
import { hasPermission, ProjectPermission } from "@/lib/project-permissions"
import { PlusIcon } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { MouseEvent, useState } from "react"
import { toast } from "sonner"

export default function CreateTermDialog() {
  const router = useRouter()
  const t = useTranslations("CreateTermDialog")
  const format = useFormatter()

  const { user } = useSession()
  const { project, member } = useProject()

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [key, setKey] = useState("")
  const [context, setContext] = useState<string | null>(null)

  const canCreateTerms =
    hasPermission(
      member?.role.permissions ?? 0n,
      ProjectPermission.CREATE_TERMS
    ) ||
    authClient.admin.checkRolePermission({
      // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
      role: user?.role ?? "user",
      permissions: {
        projects: ["update"],
      },
    })

  const isLimitReached =
    project.plan.termsLimit !== null &&
    project.terms.length >= project.plan.termsLimit

  const handleCreateTerm = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    await createProjectTerm({
      projectId: project.id,
      key: key.trim(),
      context: context?.trim() || null,
    })
      .then((term) => {
        toast.success(t("toast.createSuccess", { 
          termKey: term.key, 
          termId: term.id.slice(0, 8)
        }))
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message || t("toast.createFailed")
        )
      })
      .finally(() => {
        setLoading(false)
        setDialogOpen(false)
        setKey("")
        setContext(null)
      })
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <Tooltip>
        <TooltipTrigger
          asChild
          className={
            canCreateTerms && !isLimitReached && !loading
              ? ""
              : "cursor-not-allowed"
          }
        >
          <span className="inline-block">
            <DialogTrigger
              asChild
              disabled={!canCreateTerms || isLimitReached || loading}
            >
              <Button
                variant="outline"
                disabled={!canCreateTerms || isLimitReached || loading}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                {t("button.createTerm")}
              </Button>
            </DialogTrigger>
          </span>
        </TooltipTrigger>
        {!canCreateTerms ? (
          <TooltipContent>
            {t("tooltip.noPermission")}
          </TooltipContent>
        ) : (
          isLimitReached && (
            <TooltipContent>
              {project.plan.termsLimit === 0
                ? t("tooltip.limitZero")
                : t("tooltip.limitReached", {
                    current: format.number(project.terms.length),
                    limit: format.number(project.plan.termsLimit ?? 0),
                  })}
            </TooltipContent>
          )
        )}
      </Tooltip>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dialog.title")}</DialogTitle>
          <DialogDescription>{t("dialog.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="termKey">{t("dialog.keyLabel")}</Label>
            <Input
              id="termKey"
              placeholder={t("dialog.keyPlaceholder")}
              value={key}
              onChange={({ target: { value } }) => setKey(value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="termContext">{t("dialog.contextLabel")}</Label>
            <Input
              id="termContext"
              placeholder={t("dialog.contextPlaceholder")}
              value={context ?? ""}
              onChange={({ target: { value } }) => setContext(value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDialogOpen(false)
              setKey("")
              setContext(null)
            }}
            disabled={loading}
          >
            {t("dialog.close")}
          </Button>

          <Button
            variant="outline"
            onClick={handleCreateTerm}
            disabled={!key || loading}
          >
            {loading ? (
              <>
                <Spinner className="h-4 w-4" />
                {t("dialog.creatingTerm")}
              </>
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                {t("dialog.createTerm")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
