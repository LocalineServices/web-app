"use client"

import { setRole } from "@/actions/development"
import { Button } from "@/components/ui/button"
import { AlertTriangleIcon, CrownIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { MouseEvent, useState } from "react"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSession } from "@/components/session-provider"
import { useTranslations } from "next-intl"

export default function ToggleAdminButton() {
  const t = useTranslations("ToggleAdminButton")

  const router = useRouter()
  const { user } = useSession()

  const [loading, setLoading] = useState(false)

  const handleGrantAdminAccess = async (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()

    if (!user) return

    setLoading(true)
    await setRole(user.id, user.role === "admin" ? "user" : "admin")
      .then(() => {
        toast.success(
          user.role === "admin"
            ? t("toast.revokeSuccess")
            : t("toast.grantSuccess")
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(error?.message || t("toast.updateFailed"))
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="destructive"
          disabled={loading}
          onClick={handleGrantAdminAccess}
        >
          <CrownIcon className="mr-1 h-4 w-4" />
          {user?.role === "admin"
            ? t("button.revokeAdmin")
            : t("button.grantAdmin")}
        </Button>
      </TooltipTrigger>

      <TooltipContent className="flex items-center gap-2">
        <AlertTriangleIcon className="size-4 shrink-0 text-red-500 dark:text-red-400" />
        <span>{t("tooltip.warning")}</span>
      </TooltipContent>
    </Tooltip>
  )
}
