import ResetPasswordForm from "@/components/auth/form/ResetPasswordForm"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ResetPasswordPage")
  return {
    title: t("metadata.title"),
  }
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}
