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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/lib/auth-client"
import { TrashIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { MouseEvent, useState } from "react"
import { toast } from "sonner"

export default function DeleteAccountCard() {
  const t = useTranslations("DeleteAccountCard")
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setDialogOpen] = useState(false)

  const handleDeleteAccount = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    setLoading(true)
    await authClient.deleteUser({
      fetchOptions: {
        onSuccess: () => {
          toast.success(t("toast.accountDeleted"))
          setDialogOpen(false)
          setLoading(false)

          router.push("/")
        },
        onError: ({ error }) => {
          toast.error(error?.message || t("toast.deleteFailed"))
          setDialogOpen(false)
          setLoading(false)
        },
      },
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("card.title")}</CardTitle>
        <CardDescription>{t("card.description")}</CardDescription>
      </CardHeader>

      <CardContent>
        <AlertDialog open={isDialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={loading}>
              <TrashIcon className="me-1" />
              {t("button.deleteAccount")}
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
                  onClick={handleDeleteAccount}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      {t("dialog.deletingAccount")}
                    </>
                  ) : (
                    <>
                      <TrashIcon className="h-4 w-4" />
                      {t("dialog.deleteAccount")}
                    </>
                  )}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogPortal>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
