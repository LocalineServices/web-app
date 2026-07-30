import { getProjectInvitation } from "@/actions/project-invitations"
import BackgroundPattern from "@/components/background-pattern"
import InvitationInformation from "@/components/dashboard/projects/invitations/InvitationInformation"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { AlertTriangleIcon, CalendarClockIcon, HomeIcon } from "lucide-react"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Link from "next/link"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>
}): Promise<Metadata> {
  const { token } = await params
  const t = await getTranslations("InvitationPage")

  const invitation = await getProjectInvitation(token)

  if (!invitation) {
    return {
      title: t("metadata.notFoundTitle"),
      robots: "noindex",
    }
  }

  return {
    title: t("metadata.title", { projectName: invitation.project.name }),
    robots: "noindex",
  }
}

export default async function InvitationsPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const t = await getTranslations("InvitationPage")

  const invitation = await getProjectInvitation(token)

  if (!invitation) {
    return (
      <div className="flex min-h-full flex-col">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertTriangleIcon />
            </EmptyMedia>

            <EmptyTitle className="text-4xl">
              {t("empty.notFound.title")}
            </EmptyTitle>

            <EmptyDescription className="text-lg">
              {t("empty.notFound.description")}
            </EmptyDescription>
          </EmptyHeader>

          <EmptyContent className="flex-row justify-center gap-2">
            <Button asChild size="lg">
              <Link href="/">
                <HomeIcon className="mr-2 h-5 w-5" />
                {t("empty.button.goToDashboard")}
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  if (invitation.expiresAt < new Date()) {
    return (
      <div className="flex min-h-full flex-col">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarClockIcon />
            </EmptyMedia>

            <EmptyTitle className="text-4xl">
              {t("empty.expired.title", {
                projectName: invitation.project.name,
                projectId: invitation.project.id,
                roleName: invitation.role.name,
                roleId: invitation.role.id,
              })}
            </EmptyTitle>

            <EmptyDescription className="text-lg">
              {t("empty.expired.description", {
                projectName: invitation.project.name,
                projectId: invitation.project.id,
                roleName: invitation.role.name,
                roleId: invitation.role.id,
              })}
            </EmptyDescription>
          </EmptyHeader>

          <EmptyContent className="flex-row justify-center gap-2">
            <Button asChild size="lg">
              <Link href="/">
                <HomeIcon className="mr-2 h-5 w-5" />
                {t("empty.button.goToDashboard")}
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return (
    <main className="relative flex min-h-full overflow-hidden bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.14),transparent_38%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--muted)/0.22)_100%)]">
      <BackgroundPattern />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full space-y-6">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
              {t("title", {
                projectName: invitation.project.name,
                projectId: invitation.project.id,
                roleName: invitation.role.name,
                roleId: invitation.role.id,
              })}
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
              {t("description", {
                projectName: invitation.project.name,
                projectId: invitation.project.id,
                roleName: invitation.role.name,
                roleId: invitation.role.id,
              })}
            </p>
          </div>

          <InvitationInformation invitation={invitation} />
        </div>
      </div>
    </main>
  )
}
