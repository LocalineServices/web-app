"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { RefreshCcwIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { MouseEvent, useState } from "react"
import { toast } from "sonner"

export default function DataExportCard() {
  const t = useTranslations("DataExportCard")

  const [loading, setLoading] = useState(false)

  const handleDataExport = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setLoading(true)

    setTimeout(() => {
      toast.success(t("toast.dataExportSuccess"))
      setLoading(false)
    }, 2000)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {t("card.title")}
          <span className="ml-1 rounded-md bg-muted px-1 text-xs text-muted-foreground">
            Coming soon
          </span>
        </CardTitle>
        <CardDescription>{t("card.description")}</CardDescription>
      </CardHeader>

      <CardContent>
        <Button
          variant="outline"
          disabled={loading || true}
          onClick={handleDataExport}
        >
          {loading ? (
            <>
              <Spinner className="me-1" />
              {t("button.exportingData")}
            </>
          ) : (
            <>
              <RefreshCcwIcon className="me-1" />
              {t("button.exportData")}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
