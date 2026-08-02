"use client"

import { useState } from "react"
import { CopyIcon, TrashIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { authClient } from "@/lib/auth-client"
import TablePagination from "@/components/dashboard/TablePagination"
import { Session } from "better-auth"
import { useSession } from "@/components/session-provider"
import { useFormatter, useTranslations } from "next-intl"

const PAGE_SIZE = 10

function getDeviceLabel(userAgent?: string | null) {
  if (!userAgent) return "Unknown device"

  const normalized = userAgent.toLowerCase()

  if (normalized.includes("iphone") || normalized.includes("ipad"))
    return "Apple Mobile"
  if (normalized.includes("android")) return "Android"
  if (normalized.includes("windows")) return "Windows"
  if (normalized.includes("macintosh") || normalized.includes("mac os"))
    return "Mac"
  if (normalized.includes("linux")) return "Linux"

  return "Desktop"
}

function getBrowserLabel(userAgent?: string | null) {
  if (!userAgent) return null

  const normalized = userAgent.toLowerCase()

  if (normalized.includes("edg/")) return "Edge"
  if (normalized.includes("chrome/") && !normalized.includes("edg/"))
    return "Chrome"
  if (normalized.includes("firefox/")) return "Firefox"
  if (normalized.includes("safari/") && !normalized.includes("chrome/"))
    return "Safari"

  return null
}

export default function SessionsTable({ sessions }: { sessions: Session[] }) {
  const t = useTranslations("SessionsTable")
  const format = useFormatter()

  const router = useRouter()
  const { session: currentSession } = useSession()

  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  const total = sessions.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = Math.min(total, currentPage * PAGE_SIZE)
  const currentSessions = sessions.slice(startIndex, endIndex)
  const displayStartIndex = total === 0 ? 0 : startIndex + 1

  async function copySessionId(sessionId: string) {
    try {
      await navigator.clipboard.writeText(sessionId)
      toast.success(t("toast.copyToClipboard"))
    } catch {
      toast.error(t("toast.copyFailed"))
    }
  }

  async function handleRevokeSession(token: string) {
    setLoading(true)

    await authClient.revokeSession({
      token,
      fetchOptions: {
        onSuccess: () => {
          toast.success(t("toast.revokeSuccess"))
          setLoading(false)
          router.refresh()
        },
        onError: ({ error }) => {
          toast.error(error?.message || t("toast.revokeFailed"))
          setLoading(false)
        },
      },
    })
  }

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-28 text-center">
                {t("table.header.session")}
              </TableHead>
              <TableHead>{t("table.header.device")}</TableHead>
              <TableHead>{t("table.header.ipAddress")}</TableHead>
              <TableHead>{t("table.header.expiresAt")}</TableHead>
              <TableHead className="max-w-24 text-center">
                {t("table.header.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentSessions.length > 0 ? (
              currentSessions.map((session) => {
                const isCurrentSession = session.id === currentSession?.id
                const browserLabel = getBrowserLabel(session.userAgent)

                return (
                  <TableRow key={session.id}>
                    <TableCell className="text-center font-medium">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-mono text-sm"
                            title={session.id}
                          >
                            {session.id.slice(0, 8)}
                          </span>
                          <Badge
                            variant={isCurrentSession ? "default" : "outline"}
                          >
                            {isCurrentSession
                              ? t("table.row.badge.currentSession")
                              : t("table.row.badge.activeSession")}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {t("table.row.createdAt", {
                            date: format.dateTime(new Date(session.createdAt), {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }),
                          })}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span>{getDeviceLabel(session.userAgent)}</span>
                        <span
                          className="max-w-[18rem] truncate text-xs text-muted-foreground"
                          title={session.userAgent ?? undefined}
                        >
                          {browserLabel && session.userAgent
                            ? t("table.row.userAgent", {
                                browserLabel,
                                userAgent: session.userAgent,
                              })
                            : t("table.row.noUserAgent")}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {session.ipAddress ?? t("table.row.noIpAddress")}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span>
                          {t("table.row.expiresAt", {
                            date: format.dateTime(new Date(session.expiresAt), {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }),
                          })}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {t("table.row.updatedAt", {
                            date: format.dateTime(new Date(session.updatedAt), {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }),
                          })}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="inline-flex items-center p-1 text-sm"
                          onClick={() => {
                            void copySessionId(session.id)
                          }}
                        >
                          <CopyIcon size={16} />
                        </Button>

                        {isCurrentSession ? (
                          <Tooltip>
                            <TooltipTrigger
                              asChild
                              className="cursor-not-allowed"
                            >
                              <span className="inline-block">
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="inline-flex items-center p-1 text-sm"
                                  disabled
                                >
                                  <TrashIcon size={16} />
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {t("tooltip.cannotRevokeCurrentSession")}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Button
                            variant="destructive"
                            size="icon"
                            className="inline-flex items-center p-1 text-sm"
                            disabled={loading}
                            onClick={(event) => {
                              event.preventDefault()
                              void handleRevokeSession(session.token)
                            }}
                          >
                            <TrashIcon size={16} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  {t("table.noSessions")}
                </TableCell>
              </TableRow>
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
    </div>
  )
}
