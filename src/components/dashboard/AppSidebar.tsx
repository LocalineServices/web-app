"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ChevronRightIcon, CogIcon, SendIcon } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Project, ProjectInvitation } from "@prisma/client"
import { MouseEvent, useEffect, useState } from "react"
import { getProject } from "@/actions/projects"
import { getProjectInvitations } from "@/actions/project-invitations"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import LocalineLogo from "@/components/logo"
import {
  accountNavigationItems,
  adminNavigationItems,
  navigationItems,
  projectNavigationItems,
  projectSettingsNavigationItems,
} from "@/components/dashboard/navigation-items"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTranslations } from "next-intl"

const isActive = (pathname: string, href: string, matchSubRoutes = false) => {
  if (!pathname) return false

  if (matchSubRoutes) {
    return pathname === href || pathname.startsWith(href + "/")
  }

  return pathname === href
}

export default function AppSidebar({ appName }: { appName: string }) {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const { state, toggleSidebar } = useSidebar()

  const isExpanded = state === "expanded"

  const handleLinkClick = (_: MouseEvent<HTMLAnchorElement>) => {
    if (isExpanded && isMobile) {
      toggleSidebar()
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex h-16 items-center justify-center border-b px-4">
        <Link
          href="/"
          className={cn(
            "flex items-center data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
            isExpanded ? "gap-2" : "justify-center"
          )}
        >
          <div className="flex size-8 items-center justify-center rounded-lg">
            <LocalineLogo />
          </div>

          {isExpanded && (
            <div className="grid flex-1 text-left">
              <span className="truncate text-lg font-semibold">{appName}</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navigationItems.map(({ name, icon: Icon, href }) => (
              <SidebarMenuItem key={name}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      asChild
                      size="sm"
                      className={cn(
                        "w-full justify-start gap-4 py-4 text-base font-medium",
                        isActive(pathname, href)
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Link href={href} passHref onClick={handleLinkClick}>
                        <Icon className="h-4 w-4" />
                        {name}
                      </Link>
                    </SidebarMenuButton>
                  </TooltipTrigger>

                  {!isExpanded && (
                    <TooltipContent side="right">{name}</TooltipContent>
                  )}
                </Tooltip>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <InvitationsMenu
          isExpanded={isExpanded}
          handleLinkClick={handleLinkClick}
        />
        <AccountMenu
          isExpanded={isExpanded}
          handleLinkClick={handleLinkClick}
        />
        <ProjectMenu
          isExpanded={isExpanded}
          handleLinkClick={handleLinkClick}
        />
        <AdminMenu isExpanded={isExpanded} handleLinkClick={handleLinkClick} />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}

function InvitationsMenu({
  isExpanded,
  handleLinkClick,
}: {
  isExpanded: boolean
  handleLinkClick: (event: MouseEvent<HTMLAnchorElement>) => void
}) {
  const t = useTranslations("AppSidebar")
  const pathname = usePathname()

  const [invitations, setInvitations] = useState<ProjectInvitation[]>([])

  useEffect(() => {
    const loadInvitations = async () => {
      try {
        const invitations = await getProjectInvitations()
        setInvitations(invitations)
      } catch {
        setInvitations([])
      }
    }

    loadInvitations()
  }, [pathname])

  return (
    <>
      {(isActive(pathname, "/projects/invitations", true) ||
        invitations.length > 0) && (
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    asChild
                    size="sm"
                    className={cn(
                      "w-full justify-start gap-4 py-4 text-base font-medium",
                      isActive(pathname, "/projects/invitations") &&
                        "bg-primary/10 text-primary"
                    )}
                  >
                    <Link
                      href="/projects/invitations"
                      passHref
                      onClick={handleLinkClick}
                    >
                      <SendIcon className="h-4 w-4" />
                      <span>{t("sidebar.invitations")}</span>
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-md bg-muted px-1.5 text-xs font-medium">
                        {invitations.length}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>

                {!isExpanded && (
                  <TooltipContent side="right">
                    {t("tooltip.invitations", { count: invitations.length })}
                  </TooltipContent>
                )}
              </Tooltip>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      )}
    </>
  )
}

function AccountMenu({
  isExpanded,
  handleLinkClick,
}: {
  isExpanded: boolean
  handleLinkClick: (event: MouseEvent<HTMLAnchorElement>) => void
}) {
  const t = useTranslations("AppSidebar")
  const pathname = usePathname()

  const isAccountPage = accountNavigationItems.some(({ href }) =>
    isActive(pathname, href)
  )

  return (
    <>
      {isAccountPage && (
        <SidebarGroup>
          {isExpanded && (
            <SidebarGroupLabel>{t("sidebar.accountLabel")}</SidebarGroupLabel>
          )}

          <SidebarMenu>
            {accountNavigationItems.map(({ name, icon: Icon, href }) => (
              <SidebarMenuItem key={name}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      asChild
                      size="sm"
                      className={cn(
                        "w-full justify-start gap-4 py-4 text-base font-medium",
                        isActive(pathname, href)
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Link href={href} passHref onClick={handleLinkClick}>
                        <Icon className="h-4 w-4" />
                        {name}
                      </Link>
                    </SidebarMenuButton>
                  </TooltipTrigger>

                  {!isExpanded && (
                    <TooltipContent side="right">{name}</TooltipContent>
                  )}
                </Tooltip>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      )}
    </>
  )
}

function ProjectMenu({
  isExpanded,
  handleLinkClick,
}: {
  isExpanded: boolean
  handleLinkClick: (event: MouseEvent<HTMLAnchorElement>) => void
}) {
  const t = useTranslations("AppSidebar")
  const pathname = usePathname()

  const [project, setProject] = useState<Project | null>(null)
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false)

  const isProjectPage = projectNavigationItems.some(
    ({ href, matchSubRoutes }) => {
      const projectHref = href.replace("[projectId]", project?.id || "")
      return isActive(pathname, projectHref, matchSubRoutes)
    }
  )

  const isProjectSettingsPage = projectSettingsNavigationItems.some(
    ({ href }) => {
      const projectHref = href.replace("[projectId]", project?.id || "")
      return isActive(pathname, projectHref)
    }
  )

  useEffect(() => {
    const match = pathname?.match(/\/projects\/([^/]+)/)
    const projectId = match ? match[1] : null

    if (!projectId || projectId === "invitations") return

    const loadProject = async () => {
      try {
        const project = await getProject(projectId)
        setProject(project)
      } catch {
        setProject(null)
      }
    }

    loadProject()
  }, [pathname])

  return (
    <>
      {(isProjectPage || isProjectSettingsPage) && project && (
        <SidebarGroup>
          {isExpanded && <SidebarGroupLabel>{project.name}</SidebarGroupLabel>}

          <SidebarMenu>
            {projectNavigationItems.map(
              ({ name, icon: Icon, href, matchSubRoutes }) => {
                const projectHref = href.replace("[projectId]", project.id)
                return (
                  <SidebarMenuItem key={name}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          asChild
                          size="sm"
                          className={cn(
                            "w-full justify-start gap-4 py-4 text-base font-medium",
                            isActive(pathname, projectHref, matchSubRoutes)
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <Link
                            href={projectHref}
                            passHref
                            onClick={handleLinkClick}
                          >
                            <Icon className="h-4 w-4" />
                            {name}
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>

                      {!isExpanded && (
                        <TooltipContent side="right">{name}</TooltipContent>
                      )}
                    </Tooltip>
                  </SidebarMenuItem>
                )
              }
            )}

            {isExpanded ? (
              <Collapsible
                asChild
                className="group/collapsible"
                open={isSettingsExpanded || isProjectSettingsPage}
                onOpenChange={setIsSettingsExpanded}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      size="sm"
                      className={cn(
                        "w-full justify-start gap-4 py-4 text-base",
                        isProjectSettingsPage
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <CogIcon className="h-4 w-4" />
                      {t("sidebar.projectSettings")}
                      <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {projectSettingsNavigationItems.map(
                        ({ name, icon: Icon, href }) => {
                          const projectHref = href.replace(
                            "[projectId]",
                            project.id
                          )
                          return (
                            <SidebarMenuSubItem key={name}>
                              <SidebarMenuSubButton
                                asChild
                                size="md"
                                className={cn(
                                  "w-full justify-start gap-2 py-2 text-base font-medium",
                                  isActive(pathname, projectHref)
                                    ? "bg-primary/10 text-primary"
                                    : "hover:bg-accent hover:text-accent-foreground"
                                )}
                              >
                                <Link
                                  href={projectHref}
                                  passHref
                                  onClick={handleLinkClick}
                                >
                                  <Icon className="h-4 w-4" />
                                  {name}
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        }
                      )}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ) : (
              <SidebarMenuItem>
                <HoverCard openDelay={10}>
                  <HoverCardTrigger asChild>
                    <SidebarMenuButton
                      size="sm"
                      className={cn(
                        "w-full justify-start gap-4 py-4 text-base",
                        isProjectSettingsPage
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <CogIcon className="h-4 w-4" />
                      <span>{t("sidebar.projectSettings")}</span>
                    </SidebarMenuButton>
                  </HoverCardTrigger>

                  <HoverCardContent
                    side="right"
                    align="start"
                    className="w-auto"
                  >
                    <h2 className="mb-2 text-sm font-semibold">
                      {t("sidebar.projectSettings")}
                    </h2>

                    <div className="flex flex-col gap-1">
                      {projectSettingsNavigationItems.map(
                        ({ name, icon: Icon, href }) => {
                          const projectHref = href.replace(
                            "[projectId]",
                            project.id
                          )
                          return (
                            <Link
                              key={name}
                              href={projectHref}
                              className={cn(
                                "flex items-center gap-2 rounded-md px-3 py-1 text-sm font-medium",
                                isActive(pathname, projectHref)
                                  ? "bg-primary/10 text-primary"
                                  : "hover:bg-accent hover:text-accent-foreground"
                              )}
                            >
                              <Icon className="h-4 w-4" />
                              {name}
                            </Link>
                          )
                        }
                      )}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
      )}
    </>
  )
}

function AdminMenu({
  isExpanded,
  handleLinkClick,
}: {
  isExpanded: boolean
  handleLinkClick: (event: React.MouseEvent<HTMLAnchorElement>) => void
}) {
  const t = useTranslations("AppSidebar")
  const pathname = usePathname()

  const [canAccessAdmin, setCanAccessAdmin] = useState(false)

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data, error } = await authClient.admin.hasPermission({
        permissions: {
          dashboard: ["admin"],
        },
      })

      if (error) {
        setCanAccessAdmin(false)
      } else {
        setCanAccessAdmin(data?.success || false)
      }
    }

    checkAdminAccess()
  })

  return (
    <>
      {canAccessAdmin && (
        <SidebarGroup>
          {isExpanded && (
            <SidebarGroupLabel>
              {t("sidebar.administrationLabel")}
            </SidebarGroupLabel>
          )}

          <SidebarMenu>
            {adminNavigationItems.map(({ name, icon: Icon, href }) => (
              <SidebarMenuItem key={name}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      asChild
                      size="sm"
                      className={cn(
                        "w-full justify-start gap-4 py-4 text-base font-medium",
                        isActive(pathname, href)
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Link href={href} passHref onClick={handleLinkClick}>
                        <Icon className="h-4 w-4" />
                        {name}
                      </Link>
                    </SidebarMenuButton>
                  </TooltipTrigger>

                  {!isExpanded && (
                    <TooltipContent side="right">
                      {t("tooltip.administration", { name })}
                    </TooltipContent>
                  )}
                </Tooltip>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      )}
    </>
  )
}
