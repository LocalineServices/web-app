import {
  areSignUpsDisabled,
  isGoogleLoginEnabled,
  isGitHubLoginEnabled,
  isDiscordLoginEnabled,
} from "@/actions/get-env"
import SignUpForm from "@/components/auth/form/SignUpForm"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("SignUpPage")
  return {
    title: t("title"),
  }
}

export default async function SignUpPage() {
  const [googleEnabled, githubEnabled, discordEnabled, signUpsDisabled] =
    await Promise.all([
      isGoogleLoginEnabled(),
      isGitHubLoginEnabled(),
      isDiscordLoginEnabled(),
      areSignUpsDisabled(),
    ])

  const showSocialButtons = googleEnabled || githubEnabled || discordEnabled

  return (
    <SignUpForm
      showSocialButtons={showSocialButtons}
      signUpsDisabled={signUpsDisabled}
      googleEnabled={googleEnabled}
      githubEnabled={githubEnabled}
      discordEnabled={discordEnabled}
    />
  )
}
