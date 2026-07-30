"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getFlag } from "@/lib/project-utils"
import { cn } from "@/lib/utils"
import { Locale } from "@prisma/client"
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { createElement, useMemo, useState } from "react"

export default function LocalePickerField({
  id,
  locales,
  value,
  onChange,
  disabled,
  allowNone = true,
}: {
  id: string
  locales: Locale[]
  value: Locale | null
  onChange: (value: Locale | null) => void
  disabled?: boolean
  allowNone?: boolean
}) {
  const t = useTranslations("LocalePickerField")
  const format = useFormatter()

  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const selectedLocalePreview = value
    ? (() => {
        const Flag = value.flag ? getFlag(value.flag) : undefined

        return (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
            {Flag ? (
              createElement(Flag, {
                className: "h-4 w-4",
                "aria-hidden": true,
              })
            ) : (
              <span className="h-2.5 w-2.5 rounded-full bg-current opacity-70" />
            )}
          </span>
        )
      })()
    : null

  const filteredLocales = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase()

    if (!normalizedSearchQuery) {
      return locales
    }

    return locales.filter((locale) => {
      const displayName = (locale.displayName ?? "").toLowerCase()
      const code = locale.code.toLowerCase()
      const region = (locale.region ?? "").toLowerCase()
      return (
        displayName.includes(normalizedSearchQuery) ||
        code.includes(normalizedSearchQuery) ||
        region.includes(normalizedSearchQuery)
      )
    })
  }, [locales, searchQuery])

  function selectLocale(nextValue: Locale | null) {
    onChange(nextValue)
    setOpen(false)
    setSearchQuery("")
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          setSearchQuery("")
        }
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
            {selectedLocalePreview}
            <span className="truncate">
              {value ? value.displayName : t("placeholder")}
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
                aria-label="Clear locale search"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            ) : null}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {t("searchAmount", {
                count: format.number(filteredLocales.length),
              })}
            </span>
            {allowNone && value ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => selectLocale(null)}
              >
                {t("button.clearSelection")}
              </Button>
            ) : null}
          </div>

          <ScrollArea className="h-72 w-full min-w-0 pr-1">
            <div className="grid gap-1">
              {allowNone ? (
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors outline-none hover:bg-muted focus-visible:bg-muted",
                    !value && "bg-muted"
                  )}
                  onClick={() => selectLocale(null)}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground">
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
              ) : null}

              {filteredLocales.length > 0 ? (
                filteredLocales.map((locale) => {
                  const selected = value?.id === locale.id
                  const Flag = locale.flag ? getFlag(locale.flag) : undefined

                  return (
                    <button
                      key={locale.id}
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors outline-none hover:bg-muted focus-visible:bg-muted",
                        selected && "bg-muted"
                      )}
                      onClick={() => selectLocale(locale)}
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
                        {locale.displayName}
                      </span>

                      <span className="shrink-0 text-xs text-muted-foreground">
                        {locale.code}
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
                  {t("noLocalesFound", { query: searchQuery })}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
}
