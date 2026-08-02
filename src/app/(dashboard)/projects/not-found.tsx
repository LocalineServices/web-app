import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { AlertTriangleIcon, HomeIcon } from "lucide-react"
import { getTranslations } from "next-intl/server"
import Link from "next/link"

export default async function ProjectNotFoundPage() {
  const t = await getTranslations("ProjectNotFoundPage")

  return (
    <div className="flex min-h-full flex-col">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertTriangleIcon />
          </EmptyMedia>

          <EmptyTitle className="text-4xl font-bold">{t("title")}</EmptyTitle>

          <EmptyDescription className="text-lg">
            {t("description")}
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent className="flex-row justify-center gap-2">
          <Button asChild size="lg">
            <Link href="/">
              <HomeIcon className="mr-2 h-5 w-5" />
              {t("button.goToDashboard")}
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
