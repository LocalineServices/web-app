"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  Edit2,
  Search,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useProject } from "@/hooks/use-projects";
import { useLabels, useCreateLabel, useDeleteLabel, useUpdateLabel } from "@/hooks/use-labels";
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

const PRESET_COLORS = [
  "#808080", "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A",
  "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2", "#F8B739"
];

const ITEMS_PER_PAGE = 10;

export default function LabelsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;

  const { data: project, isLoading: isLoadingProject } = useProject(projectId);
  const { data: labels = [], isLoading: isLoadingLabels } = useLabels(projectId);
  const createLabelMutation = useCreateLabel(projectId);
  const deleteLabelMutation = useDeleteLabel(projectId);
  const updateLabelMutation = useUpdateLabel(projectId);
  
  // Check permissions
  const permissions = useProjectPermissions(projectId);

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [newLabelName, setNewLabelName] = React.useState("");
  const [newLabelColor, setNewLabelColor] = React.useState("#808080");
  const [newLabelValue, setNewLabelValue] = React.useState("");
  const [deletingLabelId, setDeletingLabelId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editingLabel, setEditingLabel] = React.useState<{
    id: string;
    name: string;
    color: string;
    value?: string;
  } | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);

  // Filtered labels
  const filteredLabels = React.useMemo(() => {
    if (!searchQuery.trim()) return labels;
    const query = searchQuery.toLowerCase();
    return labels.filter(
      (label) =>
        label.name.toLowerCase().includes(query) ||
        label.value?.toLowerCase().includes(query)
    );
  }, [labels, searchQuery]);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Paginated labels
  const paginatedLabels = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredLabels.slice(startIndex, endIndex);
  }, [filteredLabels, currentPage]);

  const totalPages = Math.ceil(filteredLabels.length / ITEMS_PER_PAGE);

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) {
      toast.error("Label name is required");
      return;
    }

    try {
      await createLabelMutation.mutateAsync({
        name: newLabelName.trim(),
        color: newLabelColor,
        value: newLabelValue.trim() || undefined,
      });

      toast.success("Label created successfully");

      setIsCreateOpen(false);
      setNewLabelName("");
      setNewLabelColor("#808080");
      setNewLabelValue("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create label");
    }
  };

  const handleDeleteLabel = async (labelId: string) => {
    try {
      await deleteLabelMutation.mutateAsync(labelId);

      toast.success("Label deleted successfully");
      
      // Close the dialog after successful deletion
      setDeletingLabelId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete label");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openEditDialog = (label: any) => {
    setEditingLabel({ ...label });
    setIsEditOpen(true);
  };

  const handleUpdateLabel = async () => {
    if (!editingLabel || !editingLabel.name.trim()) {
      toast.error("Label name is required");
      return;
    }

    try {
      await updateLabelMutation.mutateAsync({
        labelId: editingLabel.id,
        data: {
          name: editingLabel.name.trim(),
          color: editingLabel.color,
          value: editingLabel.value?.trim() || undefined,
        },
      });

      toast.success("Label updated successfully");

      setIsEditOpen(false);
      setEditingLabel(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update label");
    }
  };

  if (isLoadingProject || isLoadingLabels) {
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
            <p className="text-muted-foreground">Manage labels for organizing translations</p>
          </div>
        </div>

        {permissions.canManageLabels && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Create Label
              </Button>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Label</DialogTitle>
              <DialogDescription>
                Create a new label to organize your translations and terms
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Label Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., common, auth, errors"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Value (Optional)</Label>
                <Input
                  id="value"
                  placeholder="Additional information shown on hover"
                  value={newLabelValue}
                  onChange={(e) => setNewLabelValue(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        newLabelColor === color ? "border-foreground scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewLabelColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  setNewLabelName("");
                  setNewLabelColor("#808080");
                  setNewLabelValue("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={handleCreateLabel}
                disabled={createLabelMutation.isPending}
              >
                {createLabelMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Label"
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
          placeholder="Search labels..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Labels Table */}
      <Card>
        <CardHeader>
          <CardTitle>Labels ({filteredLabels.length})</CardTitle>
          <CardDescription>
            All labels in your project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLabels.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No labels match your search" : "No labels yet"}
              </p>
              {!searchQuery && permissions.canManageLabels && (
                <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Label
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Preview</TableHead>
                    {permissions.canManageLabels && (
                      <TableHead className="w-20"></TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLabels.map((label) => (
                  <TableRow key={label.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full shrink-0"
                          style={{ backgroundColor: label.color }}
                        />
                        <span className="font-medium">{label.name}</span>
                      </div>
                    </TableCell>
                                        <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {label.value || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        style={{ 
                          backgroundColor: `${label.color}20`, 
                          color: label.color, 
                          borderColor: label.color 
                        }}
                      >
                        {label.name}
                      </Badge>
                    </TableCell>
                    {permissions.canManageLabels && (
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(label)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <AlertDialog
                            open={deletingLabelId === label.id}
                            onOpenChange={(open) => {
                              if (open) {
                                setDeletingLabelId(label.id);
                              } else if (!deleteLabelMutation.isPending) {
                                setDeletingLabelId(null);
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
                                <AlertDialogTitle>Delete Label</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this label? This will remove it from all associated terms and translations.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteLabel(label.id)}
                                  loading={deleteLabelMutation.isPending && deletingLabelId === label.id}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    )}
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

      {/* Edit Label Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Label</DialogTitle>
            <DialogDescription>
              Update the label name and color
            </DialogDescription>
          </DialogHeader>
          {editingLabel && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Label Name</Label>
                <Input
                  id="edit-name"
                  placeholder="e.g., common, auth, errors"
                  value={editingLabel.name}
                  onChange={(e) =>
                    setEditingLabel({ ...editingLabel, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-value">Value (Optional)</Label>
                <Input
                  id="edit-value"
                  placeholder="Additional information shown on hover"
                  value={editingLabel.value || ""}
                  onChange={(e) =>
                    setEditingLabel({ ...editingLabel, value: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        editingLabel.color === color ? "border-foreground scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() =>
                        setEditingLabel({ ...editingLabel, color })
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditOpen(false);
                setEditingLabel(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleUpdateLabel}
              disabled={updateLabelMutation.isPending}
            >
              {updateLabelMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Label"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
