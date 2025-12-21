"use client";

import * as React from "react";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useProjects, useCreateProject } from "@/hooks/use-projects";
import { useLocales } from "@/hooks/use-translations";
import { useTerms } from "@/hooks/use-terms";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

function getLocaleFlagUrl(localeCode: string): string {
  // Extract country code from locale (e.g., "en_US" -> "us", "de_DE" -> "de")
  const parts = localeCode.toLowerCase().split('_');
  const countryCode = parts.length > 1 ? parts[1] : parts[0];
  return `https://flagcdn.com/w320/${countryCode}.png`;
}

// Helper hook to get project stats
function useProjectStats(projectId: string) {
  const { data: locales } = useLocales(projectId);
  const { data: terms } = useTerms(projectId);

  const termsCount = terms?.length || 0;
  const localesCount = locales?.length || 0;
  const localeCodes = locales?.map((l) => l.locale.code) || [];

  return {
    termsCount,
    localesCount,
    localeCodes,
    locales,
  };
}

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [newProjectName, setNewProjectName] = React.useState("");
  const [newProjectDescription, setNewProjectDescription] = React.useState("");
  const { toast } = useToast();

  const { data: projects, isLoading, error } = useProjects();
  const createProject = useCreateProject();

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      await createProject.mutateAsync({
        name: newProjectName,
        description: newProjectDescription || undefined,
      });
      toast({
        title: "Project created",
        description: `${newProjectName} has been created successfully.`,
      });
      setIsCreateDialogOpen(false);
      setNewProjectName("");
      setNewProjectDescription("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create project";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const filteredProjects = React.useMemo(() => {
    if (!projects) return [];
    return projects.filter(
      (project) =>
        project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="flex flex-col items-center justify-center py-12">
        <Icons.folder className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">Error loading projects</h3>
        <p className="text-muted-foreground">
          {error instanceof Error ? error.message : "Failed to load projects"}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage your translation projects
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Icons.plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create new project</DialogTitle>
              <DialogDescription>
                Add a new translation project to your workspace.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project name</Label>
                <Input
                  id="name"
                  placeholder="My Project"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  placeholder="A brief description of your project"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={createProject.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={handleCreateProject}
                disabled={!newProjectName || createProject.isPending}
              >
                {createProject.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create project"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Icons.search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Projects grid */}
      {!projects || filteredProjects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12">
          <Icons.folder className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No projects found</h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? "Try adjusting your search query"
              : "Get started by creating a new project"}
          </p>
          {!searchQuery && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Icons.plus className="mr-2 h-4 w-4" />
              Create your first project
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

// Separate component for project card to fetch its stats
function ProjectCard({ project }: { project: { id: string; name: string; description?: string } }) {
  const { termsCount, localeCodes } = useProjectStats(project.id);

  // Calculate translation progress (simplified - would need full translation data)
  const translatedPercentage = 0; // Placeholder

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{project.name}</CardTitle>
              <CardDescription className="line-clamp-2">
                {project.description || "No description"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Locales */}
          {localeCodes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {localeCodes.slice(0, 4).map((locale) => (
                <Badge key={locale} variant="secondary" className="text-xs flex items-center gap-1">
                  <Image
                    src={getLocaleFlagUrl(locale)}
                    alt={locale}
                    className="inline-block h-3 w-auto"
                    width={20}
                    height={15}
                  />
                  {locale.toUpperCase()}
                </Badge>
              ))}
              {localeCodes.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{localeCodes.length - 4}
                </Badge>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {termsCount} terms
              </span>
              {translatedPercentage > 0 && (
                <span className="font-medium">
                  {translatedPercentage}% translated
                </span>
              )}
            </div>
            {translatedPercentage > 0 && (
              <Progress value={translatedPercentage} className="h-2" />
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
