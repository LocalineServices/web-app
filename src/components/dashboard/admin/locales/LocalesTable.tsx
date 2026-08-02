"use client"

import { deleteLocale, updateLocale } from "@/actions/locales"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Locale } from "@prisma/client"
import {
  BadgeCheckIcon,
  BadgeXIcon,
  GlobeIcon,
  PencilIcon,
  SearchIcon,
  TrashIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { SubmitEvent, useState } from "react"
import { toast } from "sonner"
import CreateLocaleDialog from "@/components/dashboard/admin/locales/CreateLocaleDialog"
import { cn } from "@/lib/utils"
import TablePagination from "@/components/dashboard/TablePagination"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import FlagPickerField from "@/components/ui/custom/FlagPickerField"
import { getFlag } from "@/lib/project-utils"
import { useSession } from "@/components/session-provider"
import { authClient } from "@/lib/auth-client"
import { useTranslations } from "next-intl"

const PAGE_SIZE = 10

export default function AdminLocalesTable({ locales }: { locales: Locale[] }) {
  const t = useTranslations("AdminLocalesTable")

  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const filteredLocales = normalizedSearchQuery
    ? locales.filter(
        (locale) =>
          (locale.id ?? "").toLowerCase().includes(normalizedSearchQuery) ||
          (locale.displayName ?? "")
            .toLowerCase()
            .includes(normalizedSearchQuery) ||
          (locale.language ?? "")
            .toLowerCase()
            .includes(normalizedSearchQuery) ||
          (locale.region ?? "").toLowerCase().includes(normalizedSearchQuery) ||
          (locale.code ?? "").toLowerCase().includes(normalizedSearchQuery)
      )
    : locales

  const total = filteredLocales.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = Math.min(total, currentPage * PAGE_SIZE)
  const currentLocales = filteredLocales.slice(startIndex, endIndex)
  const displayStartIndex = total === 0 ? 0 : startIndex + 1

  if (total === 0 && searchQuery === "") {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <GlobeIcon />
          </EmptyMedia>

          <EmptyTitle>{t("empty.title")}</EmptyTitle>

          <EmptyDescription className="grid gap-2">
            {t("empty.description")}
            <CreateLocaleDialog />
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div>
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
              <TableHead>{t("table.header.displayName")}</TableHead>
              <TableHead>{t("table.header.language")}</TableHead>
              <TableHead>{t("table.header.region")}</TableHead>
              <TableHead>{t("table.header.code")}</TableHead>
              <TableHead className="text-center">
                {t("table.header.flag")}
              </TableHead>
              <TableHead className="text-center">
                <HoverCard openDelay={10} closeDelay={10}>
                  <HoverCardTrigger asChild>
                    <Button variant="ghost">{t("table.header.enabled")}</Button>
                  </HoverCardTrigger>

                  <HoverCardContent>
                    {t("table.header.enabledHoverContent")}
                  </HoverCardContent>
                </HoverCard>
              </TableHead>
              <TableHead className="max-w-24 text-center">
                {t("table.header.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentLocales.length > 0 ? (
              currentLocales.map((locale) => (
                <TableRow key={locale.id}>
                  <TableCell className="text-center">
                    {locale.id.slice(0, 8)}
                  </TableCell>

                  <TableCell className="min-w-40">
                    {locale.displayName}
                  </TableCell>

                  <TableCell className="min-w-32">{locale.language}</TableCell>

                  <TableCell
                    className={cn(
                      "min-w-32",
                      !locale.region && "text-muted-foreground italic"
                    )}
                  >
                    {locale.region ?? t("table.row.noRegion")}
                  </TableCell>

                  <TableCell className="min-w-32">
                    <Badge variant="outline">{locale.code}</Badge>
                  </TableCell>

                  <TableCell
                    className={cn(
                      "max-w-24 text-center",
                      !locale.flag && "text-muted-foreground italic"
                    )}
                  >
                    {locale.flag ? (
                      (() => {
                        const FlagIcon = getFlag(locale.flag)
                        return FlagIcon ? (
                          <FlagIcon
                            className="mx-auto h-5 w-5"
                            aria-hidden="true"
                          />
                        ) : (
                          <p>{t("table.row.invalidFlag")}</p>
                        )
                      })()
                    ) : (
                      <p>{t("table.row.noFlag")}</p>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      {locale.enabled ? (
                        <BadgeCheckIcon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <BadgeXIcon className="size-4 shrink-0 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <UpdateLocaleSheet
                        locale={locale}
                        loading={loading}
                        setLoading={setLoading}
                      />
                      <DeleteLocaleDialog
                        locale={locale}
                        loading={loading}
                        setLoading={setLoading}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  {searchQuery
                    ? t("table.noLocalesFound", { query: searchQuery })
                    : t("table.noLocalesFoundGeneric")}
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

function UpdateLocaleSheet({
  locale,
  loading,
  setLoading,
}: {
  locale: Locale
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const t = useTranslations("AdminLocalesTable")

  const router = useRouter()
  const { user } = useSession()

  const [updatingLocale, setUpdatingLocale] = useState<Locale | null>(null)

  const [displayName, setDisplayName] = useState("")
  const [language, setLanguage] = useState("")
  const [region, setRegion] = useState<string | null>(null)
  const [code, setCode] = useState("")
  const [flag, setFlag] = useState<string | null>(null)
  const [enabled, setEnabled] = useState(false)

  const canUpdateLocales = authClient.admin.checkRolePermission({
    // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
    role: user?.role ?? "user",
    permissions: {
      locales: ["update"],
    },
  })

  function openEditor(locale: Locale) {
    setDisplayName(locale.displayName ?? "")
    setLanguage(locale.language ?? "")
    setRegion(locale.region)
    setCode(locale.code ?? "")
    setFlag(locale.flag)
    setEnabled(locale.enabled)
    setUpdatingLocale(locale)
  }

  function closeEditor() {
    setUpdatingLocale(null)
    setDisplayName("")
    setLanguage("")
    setRegion(null)
    setCode("")
    setFlag(null)
    setEnabled(false)
  }

  async function handleUpdateLocale(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!updatingLocale) return

    setLoading(true)
    await updateLocale(updatingLocale.id, {
      displayName,
      language,
      region: region || null,
      code,
      flag: flag || null,
      enabled,
    })
      .then((updatedLocale) => {
        toast.success(
          t("toast.updateSuccess", {
            localeDisplayName: updatedLocale.displayName,
            localeId: updatedLocale.id.slice(0, 8),
          })
        )

        closeEditor()
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message ||
            t("toast.updateFailed", {
              localeDisplayName: updatingLocale.displayName,
              localeId: updatingLocale.id.slice(0, 8),
            })
        )
      })
      .finally(() => {
        setLoading(false)
        setUpdatingLocale(null)
      })
  }

  return (
    <Sheet
      open={updatingLocale !== null}
      onOpenChange={(open) => !open && closeEditor()}
    >
      <Tooltip>
        <TooltipTrigger
          asChild
          className={!canUpdateLocales || loading ? "cursor-not-allowed" : ""}
        >
          <SheetTrigger asChild>
            <span className="inline-block">
              <Button
                variant="outline"
                size="icon"
                className="inline-flex items-center p-1 text-sm"
                disabled={!canUpdateLocales || loading}
                onClick={() => openEditor(locale)}
              >
                <PencilIcon size={16} />
              </Button>
            </span>
          </SheetTrigger>
        </TooltipTrigger>
        {!canUpdateLocales && (
          <TooltipContent>{t("tooltip.noPermissionUpdate")}</TooltipContent>
        )}
      </Tooltip>

      <SheetContent className="flex flex-col overflow-hidden">
        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onSubmit={handleUpdateLocale}
        >
          <SheetHeader className="shrink-0">
            <SheetTitle>
              {t("sheet.updateLocale.title", {
                localeDisplayName: updatingLocale?.displayName ?? "",
                localeId: updatingLocale?.id.slice(0, 8) ?? "",
              })}
            </SheetTitle>
            <SheetDescription>
              {t("sheet.updateLocale.description", {
                localeDisplayName: updatingLocale?.displayName ?? "",
                localeId: updatingLocale?.id.slice(0, 8) ?? "",
              })}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="min-h-0 flex-1 overflow-hidden">
            <div className="grid auto-rows-min gap-6 px-4 py-4">
              <div className="grid gap-3">
                <Label htmlFor="localeName">
                  {t("sheet.updateLocale.displayNameLabel")}
                </Label>
                <Input
                  id="localeName"
                  value={displayName}
                  placeholder={t("sheet.updateLocale.displayNamePlaceholder")}
                  required
                  disabled={loading}
                  onChange={(event) => setDisplayName(event.target.value)}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="localeLanguage">
                  {t("sheet.updateLocale.languageLabel")}
                </Label>
                <Input
                  id="localeLanguage"
                  value={language}
                  placeholder={t("sheet.updateLocale.languagePlaceholder")}
                  required
                  disabled={loading}
                  onChange={(event) => setLanguage(event.target.value)}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="localeRegion">
                  {t("sheet.updateLocale.regionLabel")}
                </Label>
                <Input
                  id="localeRegion"
                  value={region || ""}
                  placeholder={t("sheet.updateLocale.regionPlaceholder")}
                  disabled={loading}
                  onChange={(event) => setRegion(event.target.value)}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="localeCode">
                  {t("sheet.updateLocale.codeLabel")}
                </Label>
                <Input
                  id="localeCode"
                  value={code}
                  placeholder={t("sheet.updateLocale.codePlaceholder")}
                  required
                  disabled={loading}
                  onChange={(event) => setCode(event.target.value)}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="localeFlag">
                  {t("sheet.updateLocale.flagLabel")}
                </Label>
                <FlagPickerField
                  id="localeFlag"
                  value={flag || ""}
                  onChange={setFlag}
                  disabled={loading}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="enabled">
                  {t("sheet.updateLocale.enabledLabel")}
                </Label>
                <ToggleGroup
                  type="single"
                  className="grid w-full grid-cols-2 border-2"
                  value={enabled ? "true" : "false"}
                  disabled={loading}
                  onValueChange={(value) => {
                    if (value === "true" || value === "false") {
                      setEnabled(value === "true")
                    }
                  }}
                >
                  <ToggleGroupItem
                    value="true"
                    className="w-full data-[state=on]:bg-emerald-400! data-[state=on]:text-white!"
                  >
                    {t("sheet.updateLocale.enabledYes")}
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="false"
                    className="w-full data-[state=on]:bg-red-400! data-[state=on]:text-white!"
                  >
                    {t("sheet.updateLocale.enabledNo")}
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </ScrollArea>

          <SheetFooter className="shrink-0">
            <Button
              type="submit"
              disabled={
                loading || !updatingLocale || !displayName || !language || !code
              }
            >
              {loading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  {t("sheet.updateLocale.updatingLocale")}
                </>
              ) : (
                <>
                  <PencilIcon className="h-4 w-4" />
                  {t("sheet.updateLocale.updateLocale")}
                </>
              )}
            </Button>

            <SheetClose asChild>
              <Button
                variant="outline"
                disabled={loading}
                onClick={closeEditor}
              >
                {t("sheet.close")}
              </Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function DeleteLocaleDialog({
  locale,
  loading,
  setLoading,
}: {
  locale: Locale
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const t = useTranslations("AdminLocalesTable")

  const router = useRouter()
  const { user } = useSession()

  const [deletingLocale, setDeletingLocale] = useState<Locale | null>(null)

  const canDeleteLocales = authClient.admin.checkRolePermission({
    // @ts-expect-error - user.role can be any string, but the API expects a defined set of strings.
    role: user?.role ?? "user",
    permissions: {
      locales: ["delete"],
    },
  })

  async function handleDeleteLocale(locale: Locale) {
    setLoading(true)
    await deleteLocale(locale.id)
      .then(() => {
        toast.success(
          t("toast.deleteSuccess", {
            localeDisplayName: locale.displayName,
            localeId: locale.id.slice(0, 8),
          })
        )
        router.refresh()
      })
      .catch((error) => {
        toast.error(
          error?.message ||
            t("toast.deleteFailed", {
              localeDisplayName: locale.displayName,
              localeId: locale.id.slice(0, 8),
            })
        )
      })
      .finally(() => {
        setLoading(false)
        setDeletingLocale(null)
      })
  }

  return (
    <AlertDialog
      open={!!deletingLocale}
      onOpenChange={(open) => !open && setDeletingLocale(null)}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex",
              !canDeleteLocales || loading ? "cursor-not-allowed" : ""
            )}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="inline-flex items-center p-1 text-sm"
                disabled={!canDeleteLocales || loading}
                onClick={() => setDeletingLocale(locale)}
              >
                <TrashIcon size={16} />
              </Button>
            </AlertDialogTrigger>
          </span>
        </TooltipTrigger>
        {!canDeleteLocales && (
          <TooltipContent>{t("tooltip.noPermissionDelete")}</TooltipContent>
        )}
      </Tooltip>

      <AlertDialogPortal>
        <AlertDialogOverlay className="bg-red-950/30 backdrop-blur-sm" />

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("dialog.deleteLocale.title", {
                localeDisplayName: deletingLocale?.displayName ?? "",
                localeId: deletingLocale?.id.slice(0, 8) ?? "",
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialog.deleteLocale.description", {
                localeDisplayName: deletingLocale?.displayName ?? "",
                localeId: deletingLocale?.id.slice(0, 8) ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              variant="outline"
              disabled={loading}
              onClick={() => setDeletingLocale(null)}
            >
              {t("dialog.cancel")}
            </AlertDialogCancel>

            <Button
              variant="destructive"
              disabled={loading || deletingLocale === null}
              onClick={(event) => {
                event.preventDefault()
                if (!deletingLocale) return

                void handleDeleteLocale(deletingLocale)
              }}
            >
              {loading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  {t("dialog.deleteLocale.deletingLocale")}
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4" />
                  {t("dialog.deleteLocale.deleteLocale")}
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  )
}
