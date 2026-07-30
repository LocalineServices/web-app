"use client"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ProjectInvitationWithProjectAndRole } from "@/types/project"
import { EyeIcon, SearchIcon } from "lucide-react"
import { useState } from "react"
import TablePagination from "@/components/dashboard/TablePagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { generateRoleBadge } from "@/lib/project-utils"
import { useFormatter, useTranslations } from "next-intl"

const PAGE_SIZE = 10

export default function InvitationsTable({
  invitations,
}: {
  invitations: ProjectInvitationWithProjectAndRole[]
}) {
  const t = useTranslations("InvitationsTable")
  const format = useFormatter()

  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")

  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const filteredInvitations = normalizedSearchQuery
    ? invitations.filter(
        (invitation) =>
          (invitation.id ?? "").toLowerCase().includes(normalizedSearchQuery) ||
          (invitation.project?.name ?? "")
            .toLowerCase()
            .includes(normalizedSearchQuery)
      )
    : invitations

  const total = filteredInvitations.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = Math.min(total, currentPage * PAGE_SIZE)
  const currentInvitations = filteredInvitations.slice(startIndex, endIndex)
  const displayStartIndex = total === 0 ? 0 : startIndex + 1

  return (
    <>
      <InputGroup className="relative mb-2 max-w-md">
        <InputGroupInput
          placeholder={t("input.searchPlaceholder")}
          value={searchQuery}
          onChange={({ target: { value } }) => {
            setSearchQuery(value)
            setPage(1)
          }}
        />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>

      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-28 text-center">
                {t("table.header.id")}
              </TableHead>
              <TableHead>{t("table.header.projectName")}</TableHead>
              <TableHead>{t("table.header.role")}</TableHead>
              <TableHead>{t("table.header.expiresAt")}</TableHead>
              <TableHead className="max-w-24 text-center">
                {t("table.header.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredInvitations.length > 0 ? (
              currentInvitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="text-center">
                    {invitation.id.slice(0, 8)}
                  </TableCell>

                  <TableCell className="min-w-40">
                    {invitation.project?.name}
                  </TableCell>

                  <TableCell>
                    {generateRoleBadge(
                      invitation.role.name,
                      invitation.role.color ?? undefined,
                      invitation.role.icon ?? undefined
                    )}
                  </TableCell>

                  <TableCell>
                    {format.dateTime(invitation.expiresAt, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="outline" asChild>
                        <Link
                          className="text-sm font-medium text-primary"
                          href={`/projects/invitations/${invitation.token}`}
                          prefetch={false}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  {searchQuery
                    ? t("table.noInvitationsFound", { query: searchQuery })
                    : t("table.noInvitationsFoundGeneric")}
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
    </>
  )
}
