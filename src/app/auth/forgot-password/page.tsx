import ForgotPasswordForm from "@/components/auth/form/ForgotPasswordForm"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ForgotPasswordPage")
  return {
    title: t("title"),
  }
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
