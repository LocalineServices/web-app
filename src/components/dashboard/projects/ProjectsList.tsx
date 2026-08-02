"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CogIcon, ExternalLinkIcon, FolderCodeIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import CreateProjectDialog from "@/components/dashboard/projects/CreateProjectDialog"
import { Plan } from "@prisma/client"
import { cn } from "@/lib/utils"
import TablePagination from "@/components/dashboard/TablePagination"
import { FullProject } from "@/types/project"
import { generateRoleBadge } from "@/lib/project-utils"
import { useSession } from "@/components/session-provider"
import { useTranslations } from "next-intl"

interface ProjectsListProps {
  projects: FullProject[]
  page: number
  setPage: (page: number) => void
}

const PAGE_SIZE_TABLE: number = 10
const PAGE_SIZE_CARDS: number = 9
const COOKIE_NAME = "localine.projects_view"

function getCookie(name: string) {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"))
  return match ? decodeURIComponent(match[2]) : null
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return
  const expires = new Date(
    Date.now() + days * 24 * 60 * 60 * 1000
  ).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; samesite=lax`
}

export default function ProjectsList({
  projects = [],
  defaultPlan,
}: {
  projects: FullProject[]
  defaultPlan: Plan | null
}) {
  const t = useTranslations("ProjectsList")

  const [view, setView] = useState<"table" | "cards">("table")
  const [page, setPage] = useState<number>(1)

  useEffect(() => {
    const value = getCookie(COOKIE_NAME)

    if (value === "cards" || value === "table") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setView(value as "cards" | "table")
    }
  }, [])

  function selectView(next: "table" | "cards") {
    setView(next)
    setCookie(COOKIE_NAME, next, 365)
  }

  if (projects.length == 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderCodeIcon />
          </EmptyMedia>

          <EmptyTitle>{t("empty.title")}</EmptyTitle>

          <EmptyDescription className="grid gap-2">
            {t("empty.description")}
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent>
          <CreateProjectDialog
            projectCount={projects.length}
            defaultPlan={defaultPlan}
          />
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">View</span>
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => {
              if (v === "table" || v === "cards")
                selectView(v as "table" | "cards")
            }}
            className="ml-2"
          >
            <ToggleGroupItem value="table">
              {t("toggleGroup.tableView")}
            </ToggleGroupItem>
            <ToggleGroupItem value="cards">
              {t("toggleGroup.cardView")}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {view === "table" ? (
        <ProjectsTable projects={projects} page={page} setPage={setPage} />
      ) : (
        <ProjectCards projects={projects} page={page} setPage={setPage} />
      )}
    </div>
  )
}

export function ProjectCards({ projects, page, setPage }: ProjectsListProps) {
  const router = useRouter()
  const t = useTranslations("ProjectsList.cards")

  const total = projects.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE_CARDS))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE_CARDS
  const endIndex = Math.min(total, currentPage * PAGE_SIZE_CARDS)
  const currentProjects = projects.slice(startIndex, endIndex)
  const displayStartIndex = total === 0 ? 0 : startIndex + 1

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {currentProjects.map(({ id, name, description }) => (
          <Link key={id} href={`/projects/${id}`} className="block">
            <Card
              key={id}
              className="cursor-pointer transition hover:-translate-y-0.5 hover:opacity-80 hover:shadow-sm"
            >
              <CardHeader>
                <div>
                  <CardTitle>{name}</CardTitle>
                  <CardDescription
                    className={cn(
                      !description && "text-muted-foreground italic"
                    )}
                  >
                    {description ?? t("noDescription")}
                  </CardDescription>
                </div>

                <CardAction>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="inline-flex items-center p-1 text-sm"
                    onClick={(event) => {
                      event.stopPropagation()
                      event.preventDefault()
                      router.push(`/projects/${id}/settings`)
                    }}
                  >
                    <CogIcon size={16} />
                  </Button>
                </CardAction>
              </CardHeader>

              <CardContent>
                <div className="text-xs text-muted-foreground">
                  {t("id", { projectId: id.slice(0, 8) })}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={displayStartIndex}
        endIndex={endIndex}
        total={total}
        setPage={setPage}
      />
    </>
  )
}

export function ProjectsTable({ projects, page, setPage }: ProjectsListProps) {
  const t = useTranslations("ProjectsList.table")
  const { user } = useSession()

  const total = projects.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE_TABLE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE_TABLE
  const endIndex = Math.min(total, currentPage * PAGE_SIZE_TABLE)
  const currentProjects = projects.slice(startIndex, endIndex)
  const displayStartIndex = total === 0 ? 0 : startIndex + 1

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-28 text-center">
                {t("header.id")}
              </TableHead>
              <TableHead>{t("header.name")}</TableHead>
              <TableHead>{t("header.description")}</TableHead>
              <TableHead className="text-center">{t("header.role")}</TableHead>
              <TableHead>{t("header.plan")}</TableHead>
              <TableHead className="max-w-24 text-center">
                {t("header.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentProjects.map(
              ({ id, name, description, members, plan: { displayName } }) => {
                const member = members.find(
                  (member) => member.userId === user?.id
                )
                return (
                  <TableRow key={id}>
                    <TableCell className="text-center font-medium">
                      <Link
                        href={`/projects/${id}`}
                        className="block h-full w-full"
                      >
                        {id.slice(0, 8)}
                      </Link>
                    </TableCell>

                    <TableCell>
                      <Link
                        href={`/projects/${id}`}
                        className="block h-full w-full"
                      >
                        {name}
                      </Link>
                    </TableCell>

                    <TableCell>
                      <Link
                        href={`/projects/${id}`}
                        className={cn(
                          "block h-full w-full",
                          !description && "text-muted-foreground italic"
                        )}
                      >
                        {description ?? t("noDescription")}
                      </Link>
                    </TableCell>

                    <TableCell className="text-center">
                      <Link
                        href={`/projects/${id}`}
                        className="block h-full w-full"
                      >
                        {generateRoleBadge(
                          member?.role.name ?? "N/A",
                          member?.role.color ?? undefined,
                          member?.role.icon ?? undefined
                        )}
                      </Link>
                    </TableCell>

                    <TableCell>
                      <Link
                        href={`/projects/${id}`}
                        className="block h-full w-full"
                      >
                        {displayName}
                      </Link>
                    </TableCell>

                    <TableCell className="cursor-default text-center">
                      <Link
                        href={`/projects/${id}`}
                        className="inline-flex items-center px-2 py-1 text-sm"
                      >
                        <ExternalLinkIcon size={16} />
                      </Link>

                      <Link
                        href={`/projects/${id}/settings`}
                        className="inline-flex items-center px-2 py-1 text-sm"
                      >
                        <CogIcon size={16} />
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              }
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={displayStartIndex}
        endIndex={endIndex}
        total={total}
        setPage={setPage}
      />
    </>
  )
}
