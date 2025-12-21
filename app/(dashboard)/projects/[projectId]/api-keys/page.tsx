"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Key,
  KeyIcon,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  UserCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useProject } from "@/hooks/use-projects";
import { useProjectPermissions } from "@/hooks/use-project-permissions";
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from "@/hooks/use-api-keys";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ApiKey {
  id: string;
  name: string;
  role: string;
  createdAt: string;
}

const ROLE_ORDER = { admin: 0, editor: 1, 'read-only': 2 } as const;
const ITEMS_PER_PAGE = 5;

export default function ApiKeysPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { toast } = useToast();

  const { data: project, isLoading: isLoadingProject } = useProject(projectId);
  
  // Check permissions
  const permissions = useProjectPermissions(projectId);
  
  // Redirect non-admins away from this page
  React.useEffect(() => {
    if (!permissions.isLoading && !permissions.canManageApiKeys) {
      router.push(`/projects/${projectId}`);
    }
  }, [permissions.isLoading, permissions.canManageApiKeys, router, projectId]);

  const { data: apiKeys = [], isLoading: isLoadingApiKeys } = useApiKeys(projectId, permissions.canManageApiKeys);
  const createApiKeyMutation = useCreateApiKey(projectId);
  const revokeApiKeyMutation = useRevokeApiKey(projectId);

  const [revokeDialogOpen, setRevokeDialogOpen] = React.useState<string | null>(null);

  const [newKeyName, setNewKeyName] = React.useState("");
  const [newKeyRole, setNewKeyRole] = React.useState<"read-only" | "editor" | "admin">("read-only");
  const [generatedKey, setGeneratedKey] = React.useState<string | null>(null);
  const [isKeyDialogOpen, setIsKeyDialogOpen] = React.useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);

  // Sorted API keys (memoized separately)
  const sortedApiKeys = React.useMemo(() => {
    return [...apiKeys].sort((a, b) => {
      return ROLE_ORDER[a.role as keyof typeof ROLE_ORDER] - ROLE_ORDER[b.role as keyof typeof ROLE_ORDER];
    });
  }, [apiKeys]);

  // Paginated API keys
  const paginatedApiKeys = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedApiKeys.slice(startIndex, endIndex);
  }, [sortedApiKeys, currentPage]);

  const totalPages = Math.ceil(sortedApiKeys.length / ITEMS_PER_PAGE);

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "API key name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createApiKeyMutation.mutateAsync({
        name: newKeyName.trim(),
        role: newKeyRole,
      });

      setGeneratedKey(result.data.key);

      toast({
        title: "Success",
        description: "API key created successfully",
      });

      setNewKeyName("");
      setNewKeyRole("read-only");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create API key",
        variant: "destructive",
      });
    }
  };

  const handleRevokeApiKey = async (keyId: string) => {
    try {
      await revokeApiKeyMutation.mutateAsync(keyId);

      toast({
        title: "Success",
        description: "API key revoked successfully",
      });
      
      // Close the dialog after successful deletion
      setRevokeDialogOpen(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to revoke API key",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  if (isLoadingProject || permissions.isLoading) {
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
  
  // Don't render content for non-admins
  if (!permissions.canManageApiKeys) {
    return null;
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
            <p className="text-muted-foreground">Manage API keys for programmatic access</p>
          </div>
        </div>

        <Dialog open={isKeyDialogOpen} onOpenChange={(open) => {
          setIsKeyDialogOpen(open);
          if (!open) {
            setGeneratedKey(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {generatedKey ? "API Key Generated" : "Create API Key"}
              </DialogTitle>
              <DialogDescription>
                {generatedKey
                  ? "Save this API key now. You won't be able to see it again."
                  : "Generate a new API key for programmatic access to this project"}
              </DialogDescription>
            </DialogHeader>

            {generatedKey ? (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Your API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      value={generatedKey}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(generatedKey)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Make sure to copy your API key now. You won&apos;t be able to see it again!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="key-name">Key Name</Label>
                  <Input
                    id="key-name"
                    placeholder="e.g., Production API, CI/CD"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="key-role">Role</Label>
                  <Select
                    value={newKeyRole}
                    onValueChange={(value: string) => setNewKeyRole(value as "read-only" | "editor" | "admin")}
                  >
                    <SelectTrigger id="key-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read-only">
                        Read-only - Can only fetch translations
                      </SelectItem>
                      <SelectItem value="editor">
                        Editor - Can update translations and terms
                      </SelectItem>
                      <SelectItem value="admin">
                        Admin - Full project access
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <DialogFooter>
              {generatedKey ? (
                <Button variant="outline" onClick={() => {
                  setIsKeyDialogOpen(false);
                  setGeneratedKey(null);
                }}>
                  Done
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsKeyDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCreateApiKey}
                    disabled={createApiKeyMutation.isPending}
                  >
                    {createApiKeyMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Key"
                    )}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* API Keys Table */}
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Manage API keys for accessing this project programmatically
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingApiKeys ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Key className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No API keys yet</p>
              <Button variant="outline" onClick={() => setIsKeyDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First API Key
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-12.5"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedApiKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell className="font-medium truncate max-w-xs" title={key.name}>{key.name}</TableCell>
                        <TableCell className="font-medium text-left">
                          <Badge variant="outline" className="capitalize"  style={{
                            backgroundColor: `${key.role == 'admin' ? '#f87171' : key.role == 'editor' ? '#60a5fa' : '#a3a3a3'}20`, 
                            color: `${key.role == 'admin' ? '#f87171' : key.role == 'editor' ? '#60a5fa' : '#a3a3a3'}`, 
                            borderColor: `${key.role == 'admin' ? '#f87171' : key.role == 'editor' ? '#60a5fa' : '#a3a3a3'}` }}
                          >
                            {key.role === 'admin' ? (
                              <UserCog className="mr-1 h-3 w-3" />
                            ) : key.role === 'editor' ? (
                              <Pencil className="mr-1 h-3 w-3" />
                            ) : (
                              <KeyIcon className="mr-1 h-3 w-3" />
                            )}
                            {key.role.replace('-', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(key.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell>
                          <AlertDialog 
                            open={revokeDialogOpen === key.id} 
                            onOpenChange={(open) => {
                              if (open) {
                                setRevokeDialogOpen(key.id);
                              } else if (!revokeApiKeyMutation.isPending) {
                                // Only allow closing if not currently revoking
                                setRevokeDialogOpen(null);
                              }
                            }}
                          >
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will immediately revoke the API key &quot;{key.name}&quot;. Any applications using this key will lose access.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleRevokeApiKey(key.id)}
                                  disabled={revokeApiKeyMutation.isPending}
                                >
                                  {revokeApiKeyMutation.isPending ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Revoking...
                                    </>
                                  ) : (
                                    "Revoke Key"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>Using Your API Keys</CardTitle>
          <CardDescription>How to authenticate with your API keys</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm mb-2">Add the API key to your request headers:</p>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              Authorization: Bearer YOUR_API_KEY
            </div>
          </div>
          <div>
            <p className="text-sm mb-2">Example request:</p>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                {`curl -H "Authorization: Bearer YOUR_API_KEY" \\
                ${typeof window !== 'undefined' ? window.location.origin : 'https://yourapp.com'}/api/v1/projects/${projectId}/translations/en_US`}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
