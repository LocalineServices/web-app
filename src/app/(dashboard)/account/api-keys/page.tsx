import { getApiKeysLimit } from "@/actions/get-env"
import ApiKeysTable from "@/components/dashboard/account/api-keys/ApiKeysTable"
import CreateApiKeyDialog from "@/components/dashboard/account/api-keys/CreateApiKeyDialog"
import { auth } from "@/lib/auth"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { headers } from "next/headers"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ApiKeysPage")
  return {
    title: t("metadata.title"),
  }
}

export default async function ApiKeysPage() {
  const t = await getTranslations("ApiKeysPage")
  const [apiKeys, apiKeysLimit] = await Promise.all([
    auth.api.listApiKeys({
      headers: await headers(),
    }),
    getApiKeysLimit(),
  ])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>

        <div className="flex gap-2">
          <CreateApiKeyDialog
            apiKeysCount={apiKeys.total}
            apiKeysLimit={apiKeysLimit}
          />
        </div>
      </div>

      <div>
        <ApiKeysTable apiKeys={apiKeys.apiKeys} apiKeysLimit={apiKeysLimit} />
      </div>
    </div>
  )
}
