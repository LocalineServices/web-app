import { getLocales } from "@/actions/locales"
import CreateLocaleDialog from "@/components/dashboard/admin/locales/CreateLocaleDialog"
import ImportLocalesDialog from "@/components/dashboard/admin/locales/ImportLocalesDialog"
import AdminLocalesTable from "@/components/dashboard/admin/locales/LocalesTable"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AdminLocalesPage")
  return {
    title: t("metadata.title"),
  }
}

export default async function AdminLocalesPage() {
  const t = await getTranslations("AdminLocalesPage")

  const locales = await getLocales({
    includeDisabled: true,
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>

        <div className="flex gap-2">
          <ImportLocalesDialog />
          <CreateLocaleDialog />
        </div>
      </div>

      <div>
        <AdminLocalesTable locales={locales} />
      </div>
    </div>
  )
}
