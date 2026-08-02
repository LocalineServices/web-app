"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getAllLucideIconNames, getIcon } from "@/lib/project-utils"
import { cn } from "@/lib/utils"
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { createElement, useMemo, useState } from "react"

const allIconNames = getAllLucideIconNames()

export default function IconPickerField({
  id,
  value,
  onChange,
  disabled,
  allowNone = true,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  allowNone?: boolean
}) {
  const t = useTranslations("IconPickerField")
  const format = useFormatter()

  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const selectedIcon = getIcon(value)
  const selectedIconPreview = selectedIcon
    ? createElement(selectedIcon, {
        className: "h-4 w-4 shrink-0",
        "aria-hidden": true,
      })
    : null

  const filteredIconNames = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase()

    if (!normalizedSearchQuery) {
      return allIconNames
    }

    return allIconNames.filter((iconName) =>
      iconName.toLowerCase().includes(normalizedSearchQuery)
    )
  }, [searchQuery])

  function selectIcon(nextValue: string) {
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
            {selectedIconPreview}
            <span className="truncate">{value || t("placeholder")}</span>
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
                aria-label="Clear icon search"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            ) : null}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {t("searchAmount", {
                count: format.number(filteredIconNames.length),
              })}
            </span>
            {allowNone && value ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => selectIcon("")}
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
                  onClick={() => selectIcon("")}
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

              {filteredIconNames.length > 0 ? (
                filteredIconNames.map((iconName) => {
                  const Icon = getIcon(iconName)
                  const selected = value === iconName

                  return (
                    <button
                      key={iconName}
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors outline-none hover:bg-muted focus-visible:bg-muted",
                        selected && "bg-muted"
                      )}
                      onClick={() => selectIcon(iconName)}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
                        {Icon ? (
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        ) : null}
                      </span>

                      <span className="min-w-0 flex-1 truncate">
                        {iconName}
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
                  {t("noIconsFound", {
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
