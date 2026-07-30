"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getIcon } from "@/lib/project-utils"
import { cn } from "@/lib/utils"
import { ProjectMemberRole } from "@prisma/client"
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { useMemo, useState } from "react"

export default function RolePickerField({
  id,
  roles,
  value,
  onChange,
  disabled,
  allowNone = true,
}: {
  id: string
  roles: Pick<ProjectMemberRole, "id" | "name" | "color" | "icon">[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  allowNone?: boolean
}) {
  const t = useTranslations("RolePickerField")
  const format = useFormatter()

  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === value),
    [roles, value]
  )

  const selectedRolePreview = selectedRole
    ? (() => {
        const Icon = selectedRole.icon ? getIcon(selectedRole.icon) : null
        return (
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground"
            style={{ backgroundColor: selectedRole.color || undefined }}
            aria-hidden="true"
          >
            {Icon ? (
              <Icon
                className="h-4 w-4 text-black dark:text-white"
                aria-hidden="true"
              />
            ) : (
              <span className="h-2.5 w-2.5 rounded-full bg-current opacity-70" />
            )}
          </span>
        )
      })()
    : null

  const filteredRoles = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase()

    if (!normalizedSearchQuery) {
      return roles
    }

    return roles.filter((role) => {
      const name = (role.name ?? "").toLowerCase()
      const idValue = role.id.toLowerCase()
      return (
        name.includes(normalizedSearchQuery) ||
        idValue.includes(normalizedSearchQuery)
      )
    })
  }, [roles, searchQuery])

  function selectRole(nextValue: string) {
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
            {selectedRolePreview}
            <span className="truncate">
              {selectedRole ? selectedRole.name : t("placeholder")}
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
                aria-label="Clear role search"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            ) : null}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {t("searchAmount", {
                count: format.number(filteredRoles.length),
              })}
            </span>
            {allowNone && value ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => selectRole("")}
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
                  onClick={() => selectRole("")}
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

              {filteredRoles.length > 0 ? (
                filteredRoles.map((role) => {
                  const selected = value === role.id
                  const RoleIcon = role.icon ? getIcon(role.icon) : null

                  return (
                    <button
                      key={role.id}
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors outline-none hover:bg-muted focus-visible:bg-muted",
                        selected && "bg-muted"
                      )}
                      onClick={() => selectRole(role.id)}
                    >
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground"
                        style={{ backgroundColor: role.color || undefined }}
                      >
                        {RoleIcon ? (
                          <RoleIcon
                            className="h-4 w-4 text-black dark:text-white"
                            aria-hidden="true"
                          />
                        ) : (
                          <span className="h-2.5 w-2.5 rounded-full bg-current opacity-70" />
                        )}
                      </span>

                      <span className="min-w-0 flex-1 truncate">
                        {role.name}
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
                  {t("noRolesFound", {
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
