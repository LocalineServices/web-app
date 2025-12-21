"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
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
import { useProjectPermissions } from "@/hooks/use-project-permissions";

interface Project {
  id: string;
  name: string;
  description: string | null;
}

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { toast } = useToast();

  const [project, setProject] = React.useState<Project | null>(null);
  const [isLoadingProject, setIsLoadingProject] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const [projectName, setProjectName] = React.useState("");
  const [projectDescription, setProjectDescription] = React.useState("");
  
  // Check permissions
  const permissions = useProjectPermissions(projectId);
  
  // Redirect non-admins away from this page
  React.useEffect(() => {
    if (!permissions.isLoading && !permissions.canManageProject) {
      router.push(`/projects/${projectId}`);
    }
  }, [permissions.isLoading, permissions.canManageProject, router, projectId]);

  // Fetch project data
  React.useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/v1/projects/${projectId}`);
        if (response.ok) {
          const data = await response.json();
          setProject(data.data);
          setProjectName(data.data.name);
          setProjectDescription(data.data.description || "");
        }
      } catch {
      } finally {
        setIsLoadingProject(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleSaveProject = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/v1/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName,
          description: projectDescription || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update project');
      }

      const data = await response.json();
      setProject(data.data);
      toast({
        title: "Project updated",
        description: "Your project settings have been updated successfully.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update project";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/v1/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete project');
      }

      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully.",
      });
      
      // Close dialog and navigate
      setDeleteDialogOpen(false);
      router.push('/projects');
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete project";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoadingProject || permissions.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  // Don't render content for non-admins
  if (!permissions.canManageProject) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/projects/${projectId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Project Settings</h1>
          <p className="text-muted-foreground">{project?.name}</p>
        </div>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>
            Update your project&apos;s basic information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My Project"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Input
              id="project-description"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="A brief description of your project"
            />
          </div>
          <Button variant="outline" onClick={handleSaveProject} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Delete Project</Label>
              <p className="text-sm text-muted-foreground">
                Permanently delete this project and all its translations
              </p>
            </div>
            <AlertDialog 
              open={deleteDialogOpen} 
              onOpenChange={(open) => {
                if (open) {
                  setDeleteDialogOpen(true);
                } else if (!isDeleting) {
                  setDeleteDialogOpen(false);
                }
              }}
            >
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Project</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the project
                    &quot;{project?.name}&quot; and remove all translations, terms, and API keys.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteProject}
                    loading={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Project
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
