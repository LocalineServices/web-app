import FirstStepsCards from "@/components/dashboard/projects/project/FirstStepsCards"
import MemberInfoCards from "@/components/dashboard/projects/project/MemberInfoCards"
import ProjectNavigation from "@/components/dashboard/projects/project/ProjectNavigation"
import StatisticCards from "@/components/dashboard/projects/project/StatisticCards"
import { Separator } from "@/components/ui/separator"
import { getTranslations } from "next-intl/server"

export default async function ProjectPage() {
  const t = await getTranslations("ProjectPage")

  return (
    <div className="flex flex-col gap-4">
      <ProjectNavigation />

      <div className="grid gap-4 md:grid-cols-4">
        <StatisticCards />

        <div className="col-span-full flex items-center py-4">
          <Separator className="w-full" />
        </div>

        <div className="col-span-full grid grid-cols-2 gap-4">
          <div>
            <h2 className="mb-2 text-lg font-medium">
              {t("title.firstSteps")}
            </h2>

            <FirstStepsCards />
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="mb-2 text-lg font-medium">
              {t("title.yourMembership")}
            </h2>

            <MemberInfoCards />
          </div>
        </div>
      </div>
    </div>
  )
}
