"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from "lucide-react"
import { createElement, useMemo, useState } from "react"
import { getAllFlagCodes, getFlag } from "@/lib/project-utils"
import { useFormatter, useTranslations } from "next-intl"

const allFlagCodes = getAllFlagCodes()

const displayNames: Intl.DisplayNames | null =
  typeof Intl !== "undefined" && (Intl as any).DisplayNames
    ? new (Intl as any).DisplayNames(["en"], { type: "region" })
    : null

function getFlagLabel(code: string) {
  const region = code.split(/[_-]/)[0]
  if (displayNames && region.length === 2) {
    try {
      const maybe = displayNames.of(region)
      if (maybe) return `${maybe} (${code})`
    } catch {}
  }

  return code
}

export default function FlagPickerField({
  id,
  value,
  onChange,
  disabled,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  const t = useTranslations("FlagPickerField")
  const format = useFormatter()

  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const selectedFlagComponent = getFlag(value)
  const selectedPreview = selectedFlagComponent
    ? createElement(selectedFlagComponent, {
        className: "h-4 w-4 shrink-0",
        "aria-hidden": true,
      })
    : null

  const filteredFlagCodes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return allFlagCodes

    return allFlagCodes.filter((code) => {
      const label = getFlagLabel(code).toLowerCase()
      return label.includes(q) || code.toLowerCase().includes(q)
    })
  }, [searchQuery])

  function selectFlag(nextValue: string) {
    const normalized = nextValue ? nextValue.toUpperCase() : ""
    onChange(normalized)
    setOpen(false)
    setSearchQuery("")
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) setSearchQuery("")
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-auto min-h-10 w-full justify-between gap-3 px-3 py-2 text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <span className="flex min-w-0 items-center gap-3">
            {selectedPreview}
            <span className="truncate">
              {value ? getFlagLabel(value.toUpperCase()) : t("placeholder")}
            </span>
          </span>
          <ChevronDownIcon className="h-4 w-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>

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
                aria-label="Clear flag search"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            ) : null}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {t("searchAmount", {
                count: format.number(filteredFlagCodes.length),
              })}
            </span>
            {value ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => selectFlag("")}
              >
                {t("button.clearSelection")}
              </Button>
            ) : null}
          </div>

          <ScrollArea className="h-72 w-full min-w-0 pr-1">
            <div className="grid gap-1">
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors outline-none hover:bg-muted focus-visible:bg-muted",
                  !value && "bg-muted"
                )}
                onClick={() => selectFlag("")}
              >
                <span className="flex h-8 w-12 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground">
                  <XIcon className="h-4 w-4" aria-hidden="true" />
                </span>

                <span className="min-w-0 flex-1 truncate">
                  {t("button.none")}
                </span>

                {!value ? (
                  <CheckIcon
                    className="h-4 w-4 shrink-0 text-foreground"
                    aria-hidden="true"
                  />
                ) : null}
              </button>

              {filteredFlagCodes.length > 0 ? (
                filteredFlagCodes.map((code) => {
                  const Flag = getFlag(code)
                  const selectedFlag = (value || "").toUpperCase() === code
                  return (
                    <button
                      key={code}
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors outline-none hover:bg-muted focus-visible:bg-muted",
                        selectedFlag && "bg-muted"
                      )}
                      onClick={() => selectFlag(code)}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
                        {Flag ? (
                          <Flag className="h-4 w-4" aria-hidden />
                        ) : (
                          <span className="text-sm">{code}</span>
                        )}
                      </span>

                      <span className="min-w-0 flex-1 truncate">
                        {getFlagLabel(code)}
                      </span>

                      {selectedFlag ? (
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
                  {t("noFlagsFound", {
                    query: searchQuery,
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
}
