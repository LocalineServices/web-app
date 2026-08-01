import AdminUsersTable from "@/components/dashboard/admin/UsersTable"
import { auth } from "@/lib/auth"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { headers } from "next/headers"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AdminUsersPage")
  return {
    title: t("metadata.title"),
  }
}

export default async function AdminUsersPage() {
  const t = await getTranslations("AdminUsersPage")

  const users = await auth.api
    .listUsers({
      headers: await headers(),
      query: {
        sortBy: "createdAt",
        sortDirection: "asc",
      },
    })
    .then((users) => users.users)

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full gap-4 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <div>
        <AdminUsersTable users={users} />
      </div>
    </div>
  )
}
