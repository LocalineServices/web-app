"use client"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { auth } from "@/lib/auth"
import { authClient } from "@/lib/auth-client"
import {
  BadgeCheckIcon,
  BadgeXIcon,
  InfinityIcon,
  KeyRoundIcon,
  SearchIcon,
  TrashIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import CreateApiKeyDialog from "@/components/dashboard/account/api-keys/CreateApiKeyDialog"
import TablePagination from "@/components/dashboard/TablePagination"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
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
import { Spinner } from "@/components/ui/spinner"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"
import { useFormatter, useTranslations } from "next-intl"

type ApiKey = NonNullable<
  Awaited<ReturnType<typeof auth.api.listApiKeys>>
>["apiKeys"][number]

const PAGE_SIZE = 10

export default function ApiKeysTable({
  apiKeys,
  apiKeysLimit,
}: {
  apiKeys: ApiKey[]
  apiKeysLimit: number
}) {
  const router = useRouter()
  const t = useTranslations("ApiKeysTable")
  const format = useFormatter()

  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const filteredApiKeys = normalizedSearchQuery
    ? apiKeys.filter(
        (apiKey) =>
          (apiKey.id ?? "").toLowerCase().includes(normalizedSearchQuery) ||
          (apiKey.name ?? "").toLowerCase().includes(normalizedSearchQuery)
      )
    : apiKeys

  const total = filteredApiKeys.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const endIndex = Math.min(total, currentPage * PAGE_SIZE)
  const currentApiKeys = filteredApiKeys.slice(startIndex, endIndex)
  const displayStartIndex = total === 0 ? 0 : startIndex + 1

  async function handleToggleEnabled(apiKey: ApiKey) {
    setLoading(true)

    await authClient.apiKey.update({
      keyId: apiKey.id,
      enabled: !apiKey.enabled,
      fetchOptions: {
        onSuccess: () => {
          toast.success(
            t(apiKey.enabled ? "toast.apiKeyDisabled" : "toast.apiKeyEnabled", {
              apiKeyName: apiKey.name ?? "",
              apiKeyId: apiKey.id.slice(0, 8),
            })
          )
          setLoading(false)
          router.refresh()
        },
        onError: ({ error }) => {
          toast.error(
            error?.message ||
              t("toast.apiKeyToggleFailed", {
                apiKeyName: apiKey.name ?? "",
                apiKeyId: apiKey.id.slice(0, 8),
              })
          )
          setLoading(false)
        },
      },
    })
  }

  if (total === 0 && searchQuery === "") {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <KeyRoundIcon />
          </EmptyMedia>

          <EmptyTitle>{t("empty.title")}</EmptyTitle>

          <EmptyDescription className="grid gap-2">
            {t("empty.description")}
            <CreateApiKeyDialog
              apiKeysCount={apiKeys.length}
              apiKeysLimit={apiKeysLimit}
            />
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
                {t("tableHeader.id")}
              </TableHead>
              <TableHead>{t("tableHeader.name")}</TableHead>
              <TableHead className="text-center">
                {t("tableHeader.enabled")}
              </TableHead>
              <TableHead className="text-center">
                {t("tableHeader.rateLimited")}
              </TableHead>
              <TableHead>{t("tableHeader.lastUsed")}</TableHead>
              <TableHead>{t("tableHeader.expiresAt")}</TableHead>
              <TableHead>{t("tableHeader.createdAt")}</TableHead>
              <TableHead className="max-w-24 text-center">
                {t("tableHeader.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentApiKeys.length > 0 ? (
              currentApiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell className="text-center">
                    {apiKey.id.slice(0, 8)}
                  </TableCell>

                  <TableCell className="min-w-40">{apiKey.name}</TableCell>

                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="cursor-pointer rounded-full p-0"
                      disabled={loading}
                      onClick={(event) => {
                        event.preventDefault()
                        handleToggleEnabled(apiKey)
                      }}
                    >
                      {apiKey.enabled ? (
                        <BadgeCheckIcon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <BadgeXIcon className="size-4 shrink-0 text-red-600 dark:text-red-400" />
                      )}
                    </Button>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {apiKey.configId === "no-rate-limit" ? (
                        <InfinityIcon className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                      ) : apiKey.remaining === 0 ? (
                        <BadgeCheckIcon className="size-4 shrink-0 text-red-600 dark:text-red-400" />
                      ) : (
                        <BadgeXIcon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </div>
                  </TableCell>

                  <TableCell
                    className={cn(
                      !apiKey.lastRequest && "text-muted-foreground italic"
                    )}
                  >
                    {apiKey.lastRequest
                      ? format.dateTime(new Date(apiKey.lastRequest), {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : t("never")}
                  </TableCell>

                  <TableCell
                    className={cn(
                      !apiKey.expiresAt && "text-muted-foreground italic"
                    )}
                  >
                    {apiKey.expiresAt
                      ? format.dateTime(new Date(apiKey.expiresAt), {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : t("never")}
                  </TableCell>

                  <TableCell>
                    {format.dateTime(new Date(apiKey.createdAt), {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>

                  <TableCell className="text-center">
                    <DeleteApiKeyDialog
                      apiKey={apiKey}
                      loading={loading}
                      setLoading={setLoading}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  {searchQuery
                    ? t("table.noApiKeysFound", { query: searchQuery })
                    : t("table.noApiKeysFoundGeneric")}
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

function DeleteApiKeyDialog({
  apiKey,
  loading,
  setLoading,
}: {
  apiKey: ApiKey
  loading: boolean
  setLoading: (loading: boolean) => void
}) {
  const router = useRouter()
  const t = useTranslations("ApiKeysTable")

  const [deletingApiKey, setDeletingApiKey] = useState<ApiKey | null>(null)

  async function handleDeleteApiKey(apiKey: {
    configId: string
    id: string
    name: string | null
  }) {
    setLoading(true)

    await authClient.apiKey.delete({
      configId: apiKey.configId,
      keyId: apiKey.id,
      fetchOptions: {
        onSuccess: () => {
          toast.success(
            t("toast.apiKeyDeleted", {
              apiKeyName: apiKey.name ?? "",
              apiKeyId: apiKey.id.slice(0, 8),
            })
          )
          setDeletingApiKey(null)
          setLoading(false)
          router.refresh()
        },
        onError: ({ error }) => {
          toast.error(
            error?.message ||
              t("toast.apiKeyDeleteFailed", {
                apiKeyName: apiKey.name ?? "",
                apiKeyId: apiKey.id.slice(0, 8),
              })
          )
          setLoading(false)
        },
      },
    })
  }

  return (
    <AlertDialog
      open={deletingApiKey !== null}
      onOpenChange={(open) => {
        if (!open) {
          setDeletingApiKey(null)
        }
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="icon"
          className="inline-flex items-center p-1 text-sm"
          disabled={loading}
          onClick={() => setDeletingApiKey(apiKey)}
        >
          <TrashIcon size={16} />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogPortal>
        <AlertDialogOverlay className="bg-red-950/30 backdrop-blur-sm" />

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("dialog.deleteApiKey.title", {
                apiKeyName: deletingApiKey?.name ?? "",
                apiKeyId: deletingApiKey?.id.slice(0, 8) ?? "",
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialog.deleteApiKey.description", {
                apiKeyName: deletingApiKey?.name ?? "",
                apiKeyId: deletingApiKey?.id.slice(0, 8) ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              variant="outline"
              disabled={loading}
              onClick={() => setDeletingApiKey(null)}
            >
              {t("dialog.cancel")}
            </AlertDialogCancel>

            <Button
              variant="destructive"
              disabled={loading || deletingApiKey === null}
              onClick={(event) => {
                event.preventDefault()
                if (!deletingApiKey) return

                void handleDeleteApiKey(deletingApiKey)
              }}
            >
              {loading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  {t("dialog.deleteApiKey.deletingApiKey")}
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4" />
                  {t("dialog.deleteApiKey.deleteApiKey")}
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  )
}
