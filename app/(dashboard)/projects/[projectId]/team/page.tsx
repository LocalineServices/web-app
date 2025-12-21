"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Loader2,
  Users,
  Pencil,
  Trash2,
  Crown,
  UserCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useProject } from "@/hooks/use-projects";
import { useLocales } from "@/hooks/use-translations";
import { useProjectPermissions } from "@/hooks/use-project-permissions";
import { useTeamMembers, useInviteMember, useUpdateMember, useRemoveMember, type TeamMember } from "@/hooks/use-team-members";
import Image from "next/image";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 10;
const DIALOG_ITEMS_PER_PAGE = 5;

function getLocaleFlagUrl(localeCode: string): string {
  // Extract country code from locale (e.g., "en_US" -> "us", "de_DE" -> "de")
  const parts = localeCode.toLowerCase().split('_');
  const countryCode = parts.length > 1 ? parts[1] : parts[0];
  return `https://flagcdn.com/w320/${countryCode}.png`;
}

export default function TeamPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;

  const { data: project, isLoading: isLoadingProject } = useProject(projectId);
  const { data: locales = [], isLoading: isLoadingLocales } = useLocales(projectId);
  
  // Check permissions
  const permissions = useProjectPermissions(projectId);
  
  // Redirect editors away from this page
  React.useEffect(() => {
    if (!permissions.isLoading && permissions.isEditor) {
      router.push(`/projects/${projectId}`);
    }
  }, [permissions.isLoading, permissions.isEditor, router, projectId]);

  // Use React Query hooks for team members with live updates
  const { data: teamMembers = [], isLoading: isLoadingMembers, isError: isErrorMembers } = useTeamMembers(projectId);
  const inviteMember = useInviteMember(projectId);
  const updateMember = useUpdateMember(projectId);
  const removeMember = useRemoveMember(projectId);
  const [currentUser, setCurrentUser] = React.useState<{ id: string; email: string; name?: string } | null>(null);
  const [ownerInfo, setOwnerInfo] = React.useState<{ name?: string; email?: string } | null>(null);

  const [isInviteDialogOpen, setIsInviteDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = React.useState(false);

  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<"editor" | "admin">("editor");
  const [inviteLocales, setInviteLocales] = React.useState<string[]>([]);

  const [editingMember, setEditingMember] = React.useState<TeamMember | null>(null);
  const [editRole, setEditRole] = React.useState<"editor" | "admin">("editor");
  const [editLocales, setEditLocales] = React.useState<string[]>([]);

  const [removingMember, setRemovingMember] = React.useState<TeamMember | null>(null);

  // Check if current user can manage team (owner or admin)
  const canManageTeam = !isErrorMembers && teamMembers.length >= 0;

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const [inviteLocalesDialogPage, setInviteLocalesDialogPage] = React.useState(1);
  const [editLocalesDialogPage, setEditLocalesDialogPage] = React.useState(1);

  // Paginated team members
  const paginatedTeamMembers = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return teamMembers.slice(startIndex, endIndex);
  }, [teamMembers, currentPage]);

  const totalPages = Math.ceil(teamMembers.length / ITEMS_PER_PAGE);

  // Fetch current user and owner info
  React.useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/users/me', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      }
    };
    fetchUserInfo();
  }, []);

  // Fetch owner information when project is loaded
  React.useEffect(() => {
    const proj = project as { ownerId?: string; owner?: { name?: string; email?: string } } | null;
    if (!proj || !proj.ownerId) return;
    
    // Set owner info from project data if available
    if (proj.owner) {
      setOwnerInfo({
        name: proj.owner.name,
        email: proj.owner.email,
      });
    } else {
      setOwnerInfo({ name: undefined, email: undefined });
    }
  }, [project]);

  // Invite member
  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      await inviteMember.mutateAsync({
        email: inviteEmail,
        role: inviteRole,
        assignedLocales: inviteRole === 'editor' && inviteLocales.length > 0 ? inviteLocales : undefined,
      });

      toast.success("Team member invited successfully");

      setIsInviteDialogOpen(false);
      setInviteEmail("");
      setInviteRole("editor");
      setInviteLocales([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to invite member");
    }
  };

  // Update member
  const handleUpdate = async () => {
    if (!editingMember) return;

    try {
      await updateMember.mutateAsync({
        memberId: editingMember.userId,
        data: {
          role: editRole,
          assignedLocales: editRole === 'editor' && editLocales.length > 0 ? editLocales : [],
        },
      });

      toast.success("Team member updated successfully");

      setIsEditDialogOpen(false);
      setEditingMember(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update member");
    }
  };

  // Remove member
  const handleRemove = async () => {
    if (!removingMember) return;

    try {
      await removeMember.mutateAsync(removingMember.userId);

      toast.success("Team member removed successfully");

      setIsRemoveDialogOpen(false);
      setRemovingMember(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove member");
    }
  };

  const openEditDialog = (member: TeamMember) => {
    setEditingMember(member);
    setEditRole(member.role);
    setEditLocales(member.assignedLocales || []);
    setEditLocalesDialogPage(1);
    setIsEditDialogOpen(true);
  };

  const openRemoveDialog = (member: TeamMember) => {
    setRemovingMember(member);
    setIsRemoveDialogOpen(true);
  };

  if (isLoadingProject || isLoadingLocales || permissions.isLoading) {
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
  
  // Don't render content for editors
  if (permissions.isEditor) {
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
            <p className="text-muted-foreground">Manage team members and permissions</p>
          </div>
        </div>

        {canManageTeam && (
          <Dialog 
            open={isInviteDialogOpen} 
            onOpenChange={(open) => {
              setIsInviteDialogOpen(open);
              if (open) {
                setInviteLocalesDialogPage(1);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-125">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Invite a registered user to collaborate on this project
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    User must be registered to be invited
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as "editor" | "admin")}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="editor">Editor - Can only translate</SelectItem>
                      <SelectItem value="admin">Admin - Full access except deletion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {inviteRole === "editor" && locales.length > 0 && (
                  <div className="space-y-2">
                    <Label>Assigned Locales (Optional)</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      If no locales are selected, editor can translate all locales
                    </p>
                    <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                      {locales.slice((inviteLocalesDialogPage - 1) * DIALOG_ITEMS_PER_PAGE, inviteLocalesDialogPage * DIALOG_ITEMS_PER_PAGE).map((locale) => (
                        <div key={locale.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`invite-locale-${locale.id}`}
                            checked={inviteLocales.includes(locale.locale.code)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setInviteLocales([...inviteLocales, locale.locale.code]);
                              } else {
                                setInviteLocales(inviteLocales.filter(c => c !== locale.locale.code));
                              }
                            }}
                          />
                          <label
                            htmlFor={`invite-locale-${locale.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {locale.locale.code} - {locale.locale.language}
                          </label>
                        </div>
                      ))}
                    </div>
                    
                    {/* Pagination for invite locales */}
                    {locales.length > DIALOG_ITEMS_PER_PAGE && (
                      <div className="mt-2">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious 
                                onClick={inviteLocalesDialogPage === 1 ? undefined : () => setInviteLocalesDialogPage(p => Math.max(1, p - 1))}
                                aria-disabled={inviteLocalesDialogPage === 1}
                                className={inviteLocalesDialogPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              />
                            </PaginationItem>
                            
                            {(() => {
                              const totalPages = Math.ceil(locales.length / DIALOG_ITEMS_PER_PAGE);
                              return Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                // Show first page, last page, current page, and pages around current page
                                if (
                                  page === 1 ||
                                  page === totalPages ||
                                  (page >= inviteLocalesDialogPage - 1 && page <= inviteLocalesDialogPage + 1)
                                ) {
                                  return (
                                    <PaginationItem key={page}>
                                      <PaginationLink
                                        onClick={() => setInviteLocalesDialogPage(page)}
                                        isActive={inviteLocalesDialogPage === page}
                                        className="cursor-pointer"
                                      >
                                        {page}
                                      </PaginationLink>
                                    </PaginationItem>
                                  );
                                } else if (page === inviteLocalesDialogPage - 2 || page === inviteLocalesDialogPage + 2) {
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
                                onClick={inviteLocalesDialogPage === Math.ceil(locales.length / DIALOG_ITEMS_PER_PAGE) ? undefined : () => setInviteLocalesDialogPage(p => Math.min(Math.ceil(locales.length / DIALOG_ITEMS_PER_PAGE), p + 1))}
                                aria-disabled={inviteLocalesDialogPage === Math.ceil(locales.length / DIALOG_ITEMS_PER_PAGE)}
                                className={inviteLocalesDialogPage === Math.ceil(locales.length / DIALOG_ITEMS_PER_PAGE) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="outline" onClick={handleInvite} disabled={inviteMember.isPending}>
                  {inviteMember.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Inviting...
                    </>
                  ) : (
                    <>
                      Add Member
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage who has access to this project and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingMembers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !canManageTeam ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                You don&apos;t have permission to view team members
              </p>
            </div>
          ) : (
            <>
              {/* Project Owner */}
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Project Owner</h3>
                <div className="border rounded-md p-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Crown className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {(project as { ownerId?: string })?.ownerId === currentUser?.id 
                            ? `${ownerInfo?.name || currentUser?.name || 'You'} (You)` 
                            : ownerInfo?.name || "Project Owner"}
                        </p>
                        <p className="text-sm text-muted-foreground">Full access</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-primary/10" style={{
                      backgroundColor: '#ef444420',
                      color: '#ef4444', 
                      borderColor: '#ef4444'
                    }}>
                      <Crown className="mr-1 h-3 w-3" />
                      Owner
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Team Members List */}
              {teamMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md">
                  <Users className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-1">No team members yet</p>
                  <p className="text-sm text-muted-foreground">
                    Invite translators and collaborators to your project
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-medium mb-2">Members</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Assigned Locales</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTeamMembers.map((member) => {
                        const isCurrentUser = member.userId === currentUser?.id;
                        return (
                          <TableRow key={member.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{member.name} {isCurrentUser && "(You)"}</p>
                                <p className="text-sm text-muted-foreground">{member.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize" style={{
                                backgroundColor: `${member.role == 'admin' ? '#f87171' : '#60a5fa'}20`, 
                                color: `${member.role == 'admin' ? '#f87171' : member.role == 'editor' ? '#60a5fa' : '#a3a3a3'}`, 
                                borderColor: `${member.role == 'admin' ? '#f87171' : member.role == 'editor' ? '#60a5fa' : '#a3a3a3'}`
                              }}>
                                {member.role === "admin" ? (
                                  <UserCog className="mr-1 h-3 w-3" />
                                ) : (
                                  <Pencil className="mr-1 h-3 w-3" />
                                )}
                                {member.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {member.assignedLocales && member.assignedLocales.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {member.assignedLocales.map((code) => (
                                  <Badge key={code} variant="outline" className="text-xs">
                                    <Image
                                      src={getLocaleFlagUrl(code)} 
                                      alt={code} 
                                      width={20} 
                                      height={15} 
                                      className="inline-block mr-1 border"
                                    />
                                    {code}
                                  </Badge>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">All locales</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {canManageTeam && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openEditDialog(member)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                )}
                                {(canManageTeam || isCurrentUser) && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openRemoveDialog(member)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
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
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Update role and permissions for {editingMember?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={editRole} onValueChange={(value) => setEditRole(value as "editor" | "admin")}>
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Editor - Can only translate</SelectItem>
                  <SelectItem value="admin">Admin - Full access except deletion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editRole === "editor" && locales.length > 0 && (
              <div className="space-y-2">
                <Label>Assigned Locales (Optional)</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  If no locales are selected, editor can translate all locales
                </p>
                <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                  {locales.slice((editLocalesDialogPage - 1) * DIALOG_ITEMS_PER_PAGE, editLocalesDialogPage * DIALOG_ITEMS_PER_PAGE).map((locale) => (
                    <div key={locale.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-locale-${locale.id}`}
                        checked={editLocales.includes(locale.locale.code)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEditLocales([...editLocales, locale.locale.code]);
                          } else {
                            setEditLocales(editLocales.filter(c => c !== locale.locale.code));
                          }
                        }}
                      />
                      <label
                        htmlFor={`edit-locale-${locale.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {locale.locale.code} - {locale.locale.language}
                      </label>
                    </div>
                  ))}
                </div>
                
                {/* Pagination for edit locales */}
                {locales.length > DIALOG_ITEMS_PER_PAGE && (
                  <div className="mt-2">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={editLocalesDialogPage === 1 ? undefined : () => setEditLocalesDialogPage(p => Math.max(1, p - 1))}
                            aria-disabled={editLocalesDialogPage === 1}
                            className={editLocalesDialogPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {(() => {
                          const totalPages = Math.ceil(locales.length / DIALOG_ITEMS_PER_PAGE);
                          return Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                            // Show first page, last page, current page, and pages around current page
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= editLocalesDialogPage - 1 && page <= editLocalesDialogPage + 1)
                            ) {
                              return (
                                <PaginationItem key={page}>
                                  <PaginationLink
                                    onClick={() => setEditLocalesDialogPage(page)}
                                    isActive={editLocalesDialogPage === page}
                                    className="cursor-pointer"
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            } else if (page === editLocalesDialogPage - 2 || page === editLocalesDialogPage + 2) {
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
                            onClick={editLocalesDialogPage === Math.ceil(locales.length / DIALOG_ITEMS_PER_PAGE) ? undefined : () => setEditLocalesDialogPage(p => Math.min(Math.ceil(locales.length / DIALOG_ITEMS_PER_PAGE), p + 1))}
                            aria-disabled={editLocalesDialogPage === Math.ceil(locales.length / DIALOG_ITEMS_PER_PAGE)}
                            className={editLocalesDialogPage === Math.ceil(locales.length / DIALOG_ITEMS_PER_PAGE) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleUpdate} disabled={updateMember.isPending}>
              {updateMember.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Member"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {removingMember?.name} from this project?
              {removingMember?.userId === currentUser?.id 
                ? " You will lose access to this project."
                : " They will lose access to this project."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => {
              e.preventDefault();
              handleRemove();
            }} disabled={removeMember.isPending}>
              {removeMember.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Member"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
