"use client"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useTranslations } from "next-intl"

export default function TablePagination({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  total,
  setPage,
}: {
  currentPage: number
  totalPages: number
  startIndex: number
  endIndex: number
  total: number
  setPage: (page: number) => void
}) {
  const t = useTranslations("TablePagination")

  return (
    <div className="mt-2 flex items-center justify-between px-2 text-sm text-muted-foreground">
      <div>{t("page", { currentPage, totalPages })}</div>

      <div className="flex items-center gap-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                text={t("button.previous")}
                onClick={(event) => {
                  event.preventDefault()
                  if (currentPage > 1) setPage(currentPage - 1)
                }}
                className={
                  currentPage === 1
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            <div className="text-sm text-muted-foreground">
              {t("showingResults", {
                from: startIndex,
                to: endIndex,
                total,
              })}
            </div>

            <PaginationItem>
              <PaginationNext
                text={t("button.next")}
                onClick={(event) => {
                  event.preventDefault()
                  if (currentPage < totalPages) setPage(currentPage + 1)
                }}
                className={
                  currentPage === totalPages
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
