"use client"

import { useProject } from "@/components/project-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getFlag } from "@/lib/project-utils"
import { cn } from "@/lib/utils"
import { ProjectLocaleWithLocale } from "@/types/project"
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { createElement, useMemo, useState } from "react"

export default function ReferencePopover({
  currentLocale,
  referenceLocale,
  setReferenceLocale,
}: {
  currentLocale: ProjectLocaleWithLocale
  referenceLocale: ProjectLocaleWithLocale | null
  setReferenceLocale: (locale: ProjectLocaleWithLocale | null) => void
}) {
  const t = useTranslations("ProjectTranslationReferencePopover")
  const format = useFormatter()

  const { project } = useProject()

  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredLocales = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase()

    if (!normalizedSearchQuery)
      return project.locales.filter((pl) => pl.id !== currentLocale.id)

    return project.locales
      .filter(({ id }) => id !== currentLocale.id)
      .filter(({ locale }) => {
        const displayName = (locale.displayName ?? "").toLowerCase()
        const code = (locale.code ?? "").toLowerCase()
        const region = (locale.region ?? "").toLowerCase()
        return (
          displayName.includes(normalizedSearchQuery) ||
          code.includes(normalizedSearchQuery) ||
          region.includes(normalizedSearchQuery)
        )
      })
  }, [project.locales, searchQuery, currentLocale])

  function clearSelection() {
    setOpen(false)
    setSearchQuery("")
    setReferenceLocale(null)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) setSearchQuery("")
      }}
    >
      <Tooltip>
        <TooltipTrigger
          asChild
          className={project.locales.length > 1 ? "" : "cursor-not-allowed"}
        >
          <span className="inline-block">
            <PopoverTrigger asChild disabled={project.locales.length <= 1}>
              <Button
                type="button"
                variant="outline"
                disabled={project.locales.length <= 1}
                className={cn(
                  "h-auto min-h-10 w-full justify-between gap-3 px-3 py-2 text-left font-normal",
                  !referenceLocale && "text-muted-foreground"
                )}
              >
                <span className="flex min-w-0 items-center gap-3">
                  {referenceLocale ? (
                    <>
                      <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
                        {referenceLocale.locale.flag ? (
                          // @ts-expect-error - getFlag can return undefined, but in this case we know it won't because we check for referenceLocale.locale.flag
                          createElement(getFlag(referenceLocale.locale.flag), {
                            className: "h-4 w-4",
                            "aria-hidden": true,
                          })
                        ) : (
                          <span className="h-2.5 w-2.5 rounded-full bg-current opacity-70" />
                        )}
                      </span>

                      <span className="min-w-0 flex-1 truncate">
                        {referenceLocale.locale.displayName}
                      </span>
                    </>
                  ) : (
                    t("button.selectReferenceLocale")
                  )}
                </span>
                <ChevronDownIcon className="h-4 w-4 shrink-0 opacity-60" />
              </Button>
            </PopoverTrigger>
          </span>
        </TooltipTrigger>
        {project.locales.length <= 1 && (
          <TooltipContent>
            {t("tooltip.onlyOneLocale")}
          </TooltipContent>
        )}
      </Tooltip>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <div className="grid gap-3 p-3">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={({ target: { value: nextValue } }) =>
                setSearchQuery(nextValue)
              }
              placeholder={t("input.searchPlaceholder")}
              className="pr-9 pl-9"
              autoComplete="off"
            />
            {searchQuery ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
                onClick={() => setSearchQuery("")}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            ) : null}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {t("availableLocales", {
                count: format.number(filteredLocales.length)
              })}
            </span>
            {referenceLocale && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={clearSelection}
              >
                {t("button.clearReferenceLocale")}
              </Button>
            )}
          </div>

          <ScrollArea className="h-72 w-full min-w-0 pr-1">
            <div className="grid gap-1">
              {filteredLocales.length > 0 ? (
                filteredLocales.map((projectLocale) => {
                  const selected = referenceLocale?.id === projectLocale.id
                  const Flag = projectLocale.locale.flag
                    ? getFlag(projectLocale.locale.flag)
                    : undefined

                  return (
                    <button
                      key={projectLocale.id}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors outline-none hover:bg-muted focus-visible:bg-muted",
                        selected && "bg-muted"
                      )}
                      onClick={() => {
                        setReferenceLocale(projectLocale)
                        setOpen(false)
                      }}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
                        {Flag ? (
                          createElement(Flag, {
                            className: "h-4 w-4",
                            "aria-hidden": true,
                          })
                        ) : (
                          <span className="h-2.5 w-2.5 rounded-full bg-current opacity-70" />
                        )}
                      </span>

                      <span className="min-w-0 flex-1 truncate">
                        {projectLocale.locale.displayName}
                      </span>

                      <span className="shrink-0 text-xs text-muted-foreground">
                        {projectLocale.locale.code}
                      </span>

                      {selected ? (
                        <CheckIcon
                          className="h-4 w-4 shrink-0 text-foreground"
                          aria-hidden="true"
                        />
                      ) : null}
                    </button>
                  )
                })
              ) : (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  {t("noLocalesFound")}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
}
