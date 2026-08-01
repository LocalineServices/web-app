import { getPlans } from "@/actions/plans"
import CreatePlanDialog from "@/components/dashboard/admin/plans/CreatePlanDialog"
import PlanPresetsDialog from "@/components/dashboard/admin/plans/PlanPresetsDialog"
import AdminPlansTable from "@/components/dashboard/admin/plans/PlansTable"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AdminPlansPage")
  return {
    title: t("metadata.title"),
  }
}

export default async function AdminPlansPage() {
  const t = await getTranslations("AdminPlansPage")

  const plans = await getPlans()
  const existsDefaultPlan = plans.some((plan) => plan.default)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>

        <div className="flex gap-2">
          <PlanPresetsDialog plans={plans} />
          <CreatePlanDialog />
        </div>
      </div>

      <div>
        <AdminPlansTable plans={plans} existsDefaultPlan={existsDefaultPlan} />
      </div>
    </div>
  )
}
