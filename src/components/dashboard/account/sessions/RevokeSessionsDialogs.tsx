"use client"

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Trash2Icon, TrashIcon } from "lucide-react"
import { MouseEvent, useState } from "react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

export function RevokeOtherSessionsDialog() {
  const t = useTranslations("RevokeOtherSessionsDialog")
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)

  const handleRevokeSessions = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    setLoading(true)
    await authClient.revokeOtherSessions({
      fetchOptions: {
        onSuccess: () => {
          toast.success(t("toast.sessionsRevoked"))
          setDialogOpen(false)
          setLoading(false)
          router.refresh()
        },
        onError: ({ error }) => {
          toast.error(error?.message || t("toast.revokeFailed"))
          setDialogOpen(false)
          setLoading(false)
        },
      },
    })
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <TrashIcon className="mr-2 h-4 w-4" />
          {t("button.revokeOtherSessions")}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dialog.title")}</DialogTitle>
          <DialogDescription>{t("dialog.description")}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setDialogOpen(false)}
            disabled={loading}
          >
            {t("dialog.close")}
          </Button>

          <Button
            variant="destructive"
            onClick={handleRevokeSessions}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner className="h-4 w-4" />
                {t("dialog.revokingOtherSessions")}
              </>
            ) : (
              <>
                <TrashIcon className="h-4 w-4" />
                {t("dialog.revokeOtherSessions")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function RevokeAllSessionsDialog() {
  const t = useTranslations("RevokeAllSessionsDialog")
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)

  const handleRevokeSessions = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    setLoading(true)
    await authClient.revokeSessions({
      fetchOptions: {
        onSuccess: () => {
          toast.success(t("toast.sessionsRevoked"))
          setDialogOpen(false)
          setLoading(false)
          router.refresh()
        },
        onError: ({ error }) => {
          toast.error(error?.message || t("toast.revokeFailed"))
          setDialogOpen(false)
          setLoading(false)
        },
      },
    })
  }

  return (
    <>
      <AlertDialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">
            <Trash2Icon className="mr-2 h-4 w-4" />
            {t("button.revokeAllSessions")}
          </Button>
        </AlertDialogTrigger>

        <AlertDialogPortal>
          <AlertDialogOverlay className="bg-red-950/30 backdrop-blur-sm" />

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("dialog.title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("dialog.description")}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={loading}
              >
                {t("dialog.cancel")}
              </AlertDialogCancel>

              <Button
                variant="destructive"
                onClick={handleRevokeSessions}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    {t("dialog.revokingAllSessions")}
                  </>
                ) : (
                  <>
                    <Trash2Icon className="h-4 w-4" />
                    {t("dialog.revokeAllSessions")}
                  </>
                )}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    </>
  )
}
