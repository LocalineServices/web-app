"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Search,
  Tag,
  Lock,
  Unlock,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useProject } from "@/hooks/use-projects";
import { useTerms, useCreateTerm, useUpdateTerm, useDeleteTerm } from "@/hooks/use-terms";
import { useLabels } from "@/hooks/use-labels";
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

const ITEMS_PER_PAGE = 25;
const DIALOG_ITEMS_PER_PAGE = 5;

export default function TermsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;
  const { toast } = useToast();

  const { data: project, isLoading: isLoadingProject } = useProject(projectId);
  const { data: terms = [], isLoading: isLoadingTerms, refetch: refetchTerms } = useTerms(projectId);
  const { data: labels = [] } = useLabels(projectId);
  const createTermMutation = useCreateTerm(projectId);
  const updateTermMutation = useUpdateTerm(projectId);
  const deleteTermMutation = useDeleteTerm(projectId);
  
  // Check permissions
  const permissions = useProjectPermissions(projectId);

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isLabelsOpen, setIsLabelsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [newTermValue, setNewTermValue] = React.useState("");
  const [newTermContext, setNewTermContext] = React.useState("");
  const [editingTerm, setEditingTerm] = React.useState<{
    id: string;
    value: string;
    context?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    labels?: any[];
  } | null>(null);
  const [labelingTerm, setLabelingTerm] = React.useState<{
    id: string;
    value: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    labels?: any[];
  } | null>(null);
  const [selectedLabelIds, setSelectedLabelIds] = React.useState<string[]>([]);
  const [deletingTermId, setDeletingTermId] = React.useState<string | null>(null);
  const [isSavingLabels, setIsSavingLabels] = React.useState(false);
  const [togglingLockTermId, setTogglingLockTermId] = React.useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const [labelsDialogPage, setLabelsDialogPage] = React.useState(1);
  const [labelsSearchQuery, setLabelsSearchQuery] = React.useState("");

  const filteredTerms = React.useMemo(() => {
    if (!searchQuery.trim()) return terms;
    const query = searchQuery.toLowerCase();
    return terms.filter(
      (term) =>
        term.value.toLowerCase().includes(query) ||
        term.context?.toLowerCase().includes(query)
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

  const handleCreateTerm = async () => {
    if (!newTermValue.trim()) {
      toast({
        title: "Error",
        description: "Term value is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTermMutation.mutateAsync({
        value: newTermValue.trim(),
        context: newTermContext.trim() || undefined,
      });

      toast({
        title: "Success",
        description: "Term created successfully",
      });

      setIsCreateOpen(false);
      setNewTermValue("");
      setNewTermContext("");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create term",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTerm = async () => {
    if (!editingTerm || !editingTerm.value.trim()) {
      toast({
        title: "Error",
        description: "Term value is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateTermMutation.mutateAsync({
        termId: editingTerm.id,
        data: {
          value: editingTerm.value.trim(),
          context: editingTerm.context?.trim() || undefined,
        },
      });

      toast({
        title: "Success",
        description: "Term updated successfully",
      });

      setIsEditOpen(false);
      setEditingTerm(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update term",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTerm = async (termId: string) => {
    try {
      await deleteTermMutation.mutateAsync(termId);

      toast({
        title: "Success",
        description: "Term deleted successfully",
      });
      
      // Close the dialog after successful deletion
      setDeletingTermId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete term",
        variant: "destructive",
      });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openEditDialog = (term: any) => {
    setEditingTerm({ ...term });
    setIsEditOpen(true);
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

      toast({
        title: "Success",
        description: "Labels updated successfully",
      });

      // Refresh terms to show updated labels
      refetchTerms();
      
      setIsLabelsOpen(false);
      setLabelingTerm(null);
      setSelectedLabelIds([]);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update labels",
        variant: "destructive",
      });
    } finally {
      setIsSavingLabels(false);
    }
  };

  const toggleTermLock = async (termId: string, currentLockState: boolean) => {
    setTogglingLockTermId(termId);
    try {
      const response = await fetch(
        `/api/v1/projects/${projectId}/terms/${termId}/lock`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ isLocked: !currentLockState }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to toggle lock');
      }

      toast({
        title: "Success",
        description: `Term ${!currentLockState ? 'locked' : 'unlocked'} successfully`,
      });

      // Refresh terms to show updated lock status
      refetchTerms();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to toggle lock",
        variant: "destructive",
      });
    } finally {
      setTogglingLockTermId(null);
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

  if (isLoadingProject || isLoadingTerms) {
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
            <p className="text-muted-foreground">Manage translation keys and terms</p>
          </div>
        </div>

        {permissions.canManageTerms && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Term
              </Button>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Term</DialogTitle>
              <DialogDescription>
                Create a new translation key for your project
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="value">Term Key</Label>
                <Input
                  id="value"
                  placeholder="e.g., common.welcome, auth.login"
                  value={newTermValue}
                  onChange={(e) => setNewTermValue(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="context">Context (Optional)</Label>
                <Textarea
                  id="context"
                  placeholder="Provide additional context for translators"
                  value={newTermContext}
                  onChange={(e) => setNewTermContext(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  setNewTermValue("");
                  setNewTermContext("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={handleCreateTerm}
                disabled={createTermMutation.isPending}
              >
                {createTermMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Add Term"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search terms..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Terms Table */}
      <Card>
        <CardHeader>
          <CardTitle>Terms ({filteredTerms.length})</CardTitle>
          <CardDescription>
            All translation keys in your project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTerms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No terms match your search" : "No terms yet"}
              </p>
              {!searchQuery && (
                <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Term
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Context</TableHead>
                    <TableHead>Labels</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTerms.map((term) => (
                  <TableRow key={term.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {term.value}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {term.context || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {term.labels?.length && term.labels.length > 0 ? (
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          term.labels.map((label: any) => (
                            <Badge key={label.id} variant="outline" style={{ backgroundColor: `${label.color}20`, color: label.color, borderColor: label.color }}>
                              {label.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">No labels</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {permissions.canManageTerms && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleTermLock(term.id, term.isLocked || false)}
                            title={term.isLocked ? "Unlock term" : "Lock term"}
                            disabled={togglingLockTermId === term.id}
                          >
                            {togglingLockTermId === term.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : term.isLocked ? (
                              <Lock className="h-4 w-4" />
                            ) : (
                              <Unlock className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openLabelsDialog(term)}
                          title="Manage labels"
                          disabled={term.isLocked && !permissions.canManageTerms}
                        >
                          <Tag className="h-4 w-4" />
                        </Button>
                        {permissions.canManageTerms && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditDialog(term)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <AlertDialog
                              open={deletingTermId === term.id}
                              onOpenChange={(open) => {
                                if (open) {
                                  setDeletingTermId(term.id);
                                } else if (!deleteTermMutation.isPending) {
                                  setDeletingTermId(null);
                                }
                              }}
                            >
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Term</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this term? This will also delete all translations associated with it.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteTerm(term.id)}
                                    loading={deleteTermMutation.isPending && deletingTermId === term.id}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
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
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
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

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Term</DialogTitle>
            <DialogDescription>
              Update the translation key or context
            </DialogDescription>
          </DialogHeader>
          {editingTerm && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-value">Term Key</Label>
                <Input
                  id="edit-value"
                  value={editingTerm.value}
                  onChange={(e) =>
                    setEditingTerm({ ...editingTerm, value: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-context">Context (Optional)</Label>
                <Textarea
                  id="edit-context"
                  value={editingTerm.context || ""}
                  onChange={(e) =>
                    setEditingTerm({ ...editingTerm, context: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditOpen(false);
                setEditingTerm(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleUpdateTerm}
              disabled={updateTermMutation.isPending}
            >
              {updateTermMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Term"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                                onClick={() => setLabelsDialogPage(p => Math.max(1, p - 1))}
                                disabled={labelsDialogPage === 1}
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
                                onClick={() => setLabelsDialogPage(p => Math.min(Math.ceil(filteredLabels.length / DIALOG_ITEMS_PER_PAGE), p + 1))}
                                disabled={labelsDialogPage === Math.ceil(filteredLabels.length / DIALOG_ITEMS_PER_PAGE)}
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
