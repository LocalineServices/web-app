"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Loader2,
  Search,
  Globe,
  Save,
  Trash2,
  Tag,
  Lock,
  Info,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useProject } from "@/hooks/use-projects";
import { useLocales, useAddLocale, useDeleteLocale, useTranslations, useUpdateTranslation } from "@/hooks/use-translations";
import { useTerms } from "@/hooks/use-terms";
import { useLabels } from "@/hooks/use-labels";
import { SUPPORTED_LOCALES } from "@/lib/locales";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useProjectPermissions } from "@/hooks/use-project-permissions";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 15;
const DIALOG_ITEMS_PER_PAGE = 5;

// Type for translation data
type TranslationData = { termId: string; value?: string };

export default function TranslationsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;

  const { data: project, isLoading: isLoadingProject } = useProject(projectId);
  const { data: locales = [], isLoading: isLoadingLocales } = useLocales(projectId);
  const { data: terms = [], isLoading: isLoadingTerms, refetch: refetchTerms } = useTerms(projectId);
  const { data: labels = [] } = useLabels(projectId);
  const addLocaleMutation = useAddLocale(projectId);
  const deleteLocaleMutation = useDeleteLocale(projectId);
  const updateTranslationMutation = useUpdateTranslation(projectId);
  
  // Check permissions
  const permissions = useProjectPermissions(projectId);

  const [isAddLocaleOpen, setIsAddLocaleOpen] = React.useState(false);
  const [newLocaleCode, setNewLocaleCode] = React.useState("");
  const [selectedLocale, setSelectedLocale] = React.useState<string>("");
  const [referenceLocale, setReferenceLocale] = React.useState<string>("none");
  const [focusedTermId, setFocusedTermId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [editingTranslations, setEditingTranslations] = React.useState<Record<string, string>>({});
  const [deletingLocale, setDeletingLocale] = React.useState<string | null>(null);
  const [isLabelsOpen, setIsLabelsOpen] = React.useState(false);
  const [labelingTerm, setLabelingTerm] = React.useState<{
    id: string;
    value: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    labels?: any[];
  } | null>(null);
  const [selectedLabelIds, setSelectedLabelIds] = React.useState<string[]>([]);
  const [isSavingLabels, setIsSavingLabels] = React.useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const [labelsDialogPage, setLabelsDialogPage] = React.useState(1);
  const [labelsSearchQuery, setLabelsSearchQuery] = React.useState("");

  // Get translations for selected locale
  const { data: translations = [] } = useTranslations(
    projectId,
    selectedLocale || locales[0]?.locale?.code || ""
  );

  // Get translations for reference locale (only when a valid locale is selected)
  const { data: referenceTranslations = [] } = useTranslations(
    projectId,
    referenceLocale && referenceLocale !== "none" ? referenceLocale : ""
  );

  // Set default locale
  React.useEffect(() => {
    if (locales.length > 0 && !selectedLocale) {
      setSelectedLocale(locales[0].locale.code);
    }
  }, [locales, selectedLocale]);

  // Track previous selected locale and swap with reference locale if needed
  const prevSelectedLocaleRef = React.useRef<string>("");
  React.useEffect(() => {
    // If the new selected locale matches the reference locale, swap them
    if (selectedLocale && referenceLocale && referenceLocale !== "none" && referenceLocale === selectedLocale) {
      const previousLocale = prevSelectedLocaleRef.current;
      if (previousLocale && previousLocale !== selectedLocale) {
        setReferenceLocale(previousLocale);
      }
    }
    // Update the previous locale reference
    if (selectedLocale) {
      prevSelectedLocaleRef.current = selectedLocale;
    }
  }, [selectedLocale, referenceLocale]);

  const filteredTerms = React.useMemo(() => {
    if (!searchQuery.trim()) return terms;
    const query = searchQuery.toLowerCase();
    return terms.filter(
      (term: { value: string }) => term.value.toLowerCase().includes(query)
    );
  }, [terms, searchQuery]);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Reset labels dialog page when labels search changes
  React.useEffect(() => {
    setLabelsDialogPage(1);
  }, [labelsSearchQuery]);

  // Paginated terms
  const paginatedTerms = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredTerms.slice(startIndex, endIndex);
  }, [filteredTerms, currentPage]);

  const totalPages = Math.ceil(filteredTerms.length / ITEMS_PER_PAGE);

  const getTranslationForTerm = (termId: string) => {
    if (editingTranslations[termId] !== undefined) {
      return editingTranslations[termId];
    }
    const translation = translations.find((t: TranslationData) => t.termId === termId);
    return translation?.value || "";
  };

  // Memoized lookup map for reference translations for better performance
  const referenceTranslationsMap = React.useMemo(() => {
    const map = new Map<string, string>();
    referenceTranslations.forEach((t: TranslationData) => {
      // Include all translations, even empty strings (they are valid translations)
      if (t.value !== undefined && t.value !== null) {
        map.set(t.termId, t.value);
      }
    });
    return map;
  }, [referenceTranslations]);

  const getReferenceTranslationForTerm = React.useCallback((termId: string) => {
    return referenceTranslationsMap.get(termId) || "";
  }, [referenceTranslationsMap]);

  // Memoized focus handlers for better performance
  const handleFocus = React.useCallback((termId: string) => {
    setFocusedTermId(termId);
  }, []);

  const handleBlur = React.useCallback(() => {
    setFocusedTermId(null);
  }, []);

  const handleAddLocale = async () => {
    if (!newLocaleCode.trim()) {
      toast.error("Locale code is required");
      return;
    }

    try {
      await addLocaleMutation.mutateAsync({
        code: newLocaleCode.trim(),
      });

      toast.success("Locale added successfully");

      setIsAddLocaleOpen(false);
      setNewLocaleCode("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add locale");
    }
  };

  const handleDeleteLocale = async (localeCode: string) => {
    try {
      await deleteLocaleMutation.mutateAsync(localeCode);

      toast.success("Locale deleted successfully");

      // Reset selected locale if deleted
      if (selectedLocale === localeCode) {
        setSelectedLocale("");
      }
      
      // Close the dialog after successful deletion
      setDeletingLocale(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete locale");
    }
  };

  const handleUpdateTranslation = async (termId: string) => {
    const value = editingTranslations[termId];
    if (value === undefined) return;

    // Check if editor can access this locale
    if (!permissions.canAccessLocale(selectedLocale)) {
      toast.error("You don't have permission to translate this locale");
      return;
    }

    try {
      await updateTranslationMutation.mutateAsync({
        localeCode: selectedLocale,
        termId,
        data: { value },
      });

      toast.success("Translation updated successfully");

      // Clear editing state
      const newEditing = { ...editingTranslations };
      delete newEditing[termId];
      setEditingTranslations(newEditing);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update translation");
    }
  };

  const handleTranslationChange = (termId: string, value: string) => {
    setEditingTranslations({
      ...editingTranslations,
      [termId]: value,
    });
  };

  const isTranslationModified = (termId: string) => {
    if (editingTranslations[termId] === undefined) return false;
    const original = translations.find((t: { termId: string; value?: string }) => t.termId === termId);
    return editingTranslations[termId] !== (original?.value || "");
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openLabelsDialog = (term: any) => {
    setLabelingTerm(term);
    setSelectedLabelIds(term.labels?.map((l: { id: string }) => l.id) || []);
    setLabelsDialogPage(1);
    setLabelsSearchQuery("");
    setIsLabelsOpen(true);
  };

  const handleUpdateLabels = async () => {
    if (!labelingTerm) return;

    setIsSavingLabels(true);
    try {
      const response = await fetch(
        `/api/v1/projects/${projectId}/terms/${labelingTerm.id}/labels`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ labelIds: selectedLabelIds }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to update labels');
      }

      toast.success("Labels updated successfully");

      // Refresh terms to show updated labels
      refetchTerms();
      
      setIsLabelsOpen(false);
      setLabelingTerm(null);
      setSelectedLabelIds([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update labels");
    } finally {
      setIsSavingLabels(false);
    }
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabelIds(prev =>
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  // Filter labels based on search query
  const filteredLabels = React.useMemo(() => {
    if (!labelsSearchQuery.trim()) return labels;
    const query = labelsSearchQuery.toLowerCase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return labels.filter((label: any) => label.name.toLowerCase().includes(query));
  }, [labels, labelsSearchQuery]);

  if (isLoadingProject || isLoadingLocales || isLoadingTerms) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Project not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/projects')}>
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/projects/${projectId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">Translate your content</p>
          </div>
        </div>

        {permissions.canManageLocales && (
          <Dialog open={isAddLocaleOpen} onOpenChange={setIsAddLocaleOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Locale
              </Button>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Locale</DialogTitle>
              <DialogDescription>
                Add a new language to your project
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="locale-code">Locale</Label>
                <Select value={newLocaleCode} onValueChange={setNewLocaleCode}>
                  <SelectTrigger id="locale-code">
                    <SelectValue placeholder="Select a locale" />
                  </SelectTrigger>
                  <SelectContent className="max-h-75">
                    {SUPPORTED_LOCALES.filter(
                      (locale) => !locales.some((l) => l.locale.code === locale.code)
                    ).map((locale) => (
                      <SelectItem key={locale.code} value={locale.code}>
                        {locale.displayName} ({locale.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose from predefined locale codes with language and region
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddLocaleOpen(false);
                  setNewLocaleCode("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={handleAddLocale}
                disabled={addLocaleMutation.isPending}
              >
                {addLocaleMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Locale"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        )}
      </div>

      {locales.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Globe className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No locales yet</h3>
            <p className="text-muted-foreground mb-4">Add your first locale to start translating</p>
            <Button variant="outline" onClick={() => setIsAddLocaleOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Locale
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Locale Selector and Search */}
          <div className="flex gap-4">
            <div className="w-64">
              <Select value={selectedLocale} onValueChange={setSelectedLocale}>
                <SelectTrigger>
                  <SelectValue placeholder="Select locale" />
                </SelectTrigger>
                <SelectContent>
                  {locales.map((localeItem) => (
                    <SelectItem key={localeItem.id} value={localeItem.locale.code}>
                      {localeItem.locale.code.toUpperCase()} - {localeItem.locale.language || localeItem.locale.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search terms..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Translations Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Translations</CardTitle>
                  <CardDescription>
                    Editing {selectedLocale.toUpperCase()} translations
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {/* Reference Locale Selector */}
                  <div className="flex items-center gap-2">
                    <Label htmlFor="reference-locale" className="text-sm whitespace-nowrap">
                      Reference:
                    </Label>
                    <Select value={referenceLocale} onValueChange={setReferenceLocale}>
                      <SelectTrigger id="reference-locale" className="w-45">
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {locales
                          .filter((localeItem) => localeItem.locale.code !== selectedLocale)
                          .map((localeItem) => (
                            <SelectItem key={localeItem.id} value={localeItem.locale.code}>
                              {localeItem.locale.code.toUpperCase()} - {localeItem.locale.language || localeItem.locale.code}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {permissions.canManageLocales && locales.length > 0 && (
                  <AlertDialog
                    open={deletingLocale !== null}
                    onOpenChange={(open) => {
                      if (open) {
                        const locale = locales.find((l) => l.locale.code === selectedLocale);
                        if (locale && 'id' in locale) setDeletingLocale((locale as { id: string }).id);
                      } else if (!deleteLocaleMutation.isPending) {
                        setDeletingLocale(null);
                      }
                    }}
                  >
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Locale
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Locale</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this locale? All translations for this language will be permanently removed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            const locale = locales.find((l) => l.locale.code === selectedLocale);
                            if (locale && 'locale' in locale && 'code' in locale.locale) {
                              handleDeleteLocale(locale.locale.code);
                            }
                          }}
                          disabled={deleteLocaleMutation.isPending && deletingLocale !== null}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deleteLocaleMutation.isPending && deletingLocale !== null ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            "Delete"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredTerms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? "No terms match your search" : "No terms yet"}
                  </p>
                  {!searchQuery && (
                    <Button variant="outline" onClick={() => router.push(`/projects/${projectId}/terms`)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Terms
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/3">Term Key</TableHead>
                        <TableHead>Translation</TableHead>
                        <TableHead className="w-20"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTerms.map((term) => {
                        const isTermLocked = term.isLocked || false;
                        const canEditLockedTerm = permissions.isOwner || permissions.isAdmin;
                        const isDisabled = isTermLocked && !canEditLockedTerm;
                        
                        return (
                      <TableRow key={term.id}>
                        <TableCell className="font-mono text-sm align-top pt-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{term.value}</span>
                              {isTermLocked && (
                                <span title="This term is locked">
                                  <Lock className="h-3 w-3 text-muted-foreground" />
                                </span>
                              )}
                            </div>
                            {term.labels && term.labels.length > 0 && (
                              <TooltipProvider delayDuration={0}>
                                <div className="flex items-center gap-1 flex-wrap">
                                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                  {term.labels.map((label: any) => (
                                    label.value ? (
                                      <Tooltip key={label.id}>
                                        <TooltipTrigger>
                                          <Badge 
                                            variant="outline" 
                                            style={{ backgroundColor: `${label.color}20`, color: label.color, borderColor: label.color }}
                                          >
                                            {label.name}
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>{label.value}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    ) : (
                                      <Badge 
                                        key={label.id} 
                                        variant="outline" 
                                        style={{ backgroundColor: `${label.color}20`, color: label.color, borderColor: label.color }}
                                      >
                                        {label.name}
                                      </Badge>
                                    )
                                  ))}
                                </div>
                              </TooltipProvider>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <Textarea
                              value={getTranslationForTerm(term.id)}
                              onChange={(e) => handleTranslationChange(term.id, e.target.value)}
                              onFocus={() => handleFocus(term.id)}
                              onBlur={handleBlur}
                              placeholder="Enter translation..."
                              className="min-h-15"
                              rows={2}
                              disabled={!permissions.canAccessLocale(selectedLocale) || isDisabled}
                            />
                            {/* Reference Translation - shown only when focused and reference locale is selected */}
                            {focusedTermId === term.id && referenceLocale && referenceLocale !== "none" && (
                              <div className="space-y-1">
                                {getReferenceTranslationForTerm(term.id) ? (
                                  <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">
                                      Reference ({referenceLocale.toUpperCase()}):
                                    </Label>
                                    <div className="flex gap-2">
                                      <Textarea
                                        value={getReferenceTranslationForTerm(term.id)}
                                        readOnly
                                        onMouseDown={(e) => e.preventDefault()}
                                        className="min-h-15 bg-muted cursor-text flex-1"
                                        rows={2}
                                      />
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onMouseDown={(e) => e.preventDefault()}
                                        className="h-auto"
                                        onClick={() => {
                                          navigator.clipboard.writeText(getReferenceTranslationForTerm(term.id));
                                          toast.success("Reference translation copied to clipboard");
                                        }}
                                        title="Copy to clipboard"
                                      >
                                        <Copy className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Info className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                                    <p className="text-xs text-amber-600 dark:text-amber-500 italic">
                                      No reference translation available
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="align-top pt-4">
                          {!isDisabled && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-5"
                                onClick={() => openLabelsDialog(term)}
                                title="Manage labels"
                              >
                                <Tag className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleUpdateTranslation(term.id)}
                                disabled={updateTranslationMutation.isPending || !isTranslationModified(term.id)}
                              >
                                {updateTranslationMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4" />
                                )}
                              </Button>
                            </>
                          )}
                          {isDisabled && (
                            <div className="flex items-center gap-2 text-muted-foreground text-xs">
                              <Lock className="h-3 w-3" />
                              <span>Locked</span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                      );
                      })}
                  </TableBody>
                </Table>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={currentPage === 1 ? undefined : () => setCurrentPage(p => Math.max(1, p - 1))}
                            aria-disabled={currentPage === 1}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Show first page, last page, current page, and pages around current page
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => setCurrentPage(page)}
                                  isActive={currentPage === page}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          } else if (page === currentPage - 2 || page === currentPage + 2) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          return null;
                        })}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={currentPage === totalPages ? undefined : () => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            aria-disabled={currentPage === totalPages}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Labels Dialog */}
      <Dialog open={isLabelsOpen} onOpenChange={setIsLabelsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Labels</DialogTitle>
            <DialogDescription>
              Assign labels to {labelingTerm?.value}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {labels.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No labels available</p>
                <Button
                  variant="link"
                  onClick={() => router.push(`/projects/${projectId}/labels`)}
                >
                  Create labels first →
                </Button>
              </div>
            ) : (
              <>
                {/* Search bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search labels..."
                    className="pl-10"
                    value={labelsSearchQuery}
                    onChange={(e) => setLabelsSearchQuery(e.target.value)}
                  />
                </div>

                {filteredLabels.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No labels match your search</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {filteredLabels.slice((labelsDialogPage - 1) * DIALOG_ITEMS_PER_PAGE, labelsDialogPage * DIALOG_ITEMS_PER_PAGE).map((label: any) => (
                      <div
                        key={label.id}
                        className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleLabel(label.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedLabelIds.includes(label.id)}
                          onChange={() => toggleLabel(label.id)}
                          className="h-4 w-4"
                        />
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: label.color }}
                        />
                        <span className="flex-1">{label.name}</span>
                      </div>
                    ))}
                    
                    {/* Pagination for labels */}
                    {filteredLabels.length > DIALOG_ITEMS_PER_PAGE && (
                      <div className="mt-4">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious 
                                onClick={labelsDialogPage === 1 ? undefined : () => setLabelsDialogPage(p => Math.max(1, p - 1))}
                                aria-disabled={labelsDialogPage === 1}
                                className={labelsDialogPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              />
                            </PaginationItem>
                            
                            {(() => {
                              const totalPages = Math.ceil(filteredLabels.length / DIALOG_ITEMS_PER_PAGE);
                              return Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                // Show first page, last page, current page, and pages around current page
                                if (
                                  page === 1 ||
                                  page === totalPages ||
                                  (page >= labelsDialogPage - 1 && page <= labelsDialogPage + 1)
                                ) {
                                  return (
                                    <PaginationItem key={page}>
                                      <PaginationLink
                                        onClick={() => setLabelsDialogPage(page)}
                                        isActive={labelsDialogPage === page}
                                        className="cursor-pointer"
                                      >
                                        {page}
                                      </PaginationLink>
                                    </PaginationItem>
                                  );
                                } else if (page === labelsDialogPage - 2 || page === labelsDialogPage + 2) {
                                  return (
                                    <PaginationItem key={page}>
                                      <PaginationEllipsis />
                                    </PaginationItem>
                                  );
                                }
                                return null;
                              });
                            })()}
                            
                            <PaginationItem>
                              <PaginationNext 
                                onClick={labelsDialogPage === Math.ceil(filteredLabels.length / DIALOG_ITEMS_PER_PAGE) ? undefined : () => setLabelsDialogPage(p => Math.min(Math.ceil(filteredLabels.length / DIALOG_ITEMS_PER_PAGE), p + 1))}
                                aria-disabled={labelsDialogPage === Math.ceil(filteredLabels.length / DIALOG_ITEMS_PER_PAGE)}
                                className={labelsDialogPage === Math.ceil(filteredLabels.length / DIALOG_ITEMS_PER_PAGE) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsLabelsOpen(false);
                setLabelingTerm(null);
                setSelectedLabelIds([]);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleUpdateLabels}
              disabled={labels.length === 0 || isSavingLabels}
            >
              {isSavingLabels ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Labels"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
