"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Loader2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProject } from "@/hooks/use-projects";
import { useProjectPermissions } from "@/hooks/use-project-permissions";

export default function IntegrationsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;

  const { data: project, isLoading: isLoadingProject } = useProject(projectId);
  
  // Check permissions
  const permissions = useProjectPermissions(projectId);
  
  // Redirect editors away from this page
  React.useEffect(() => {
    if (!permissions.isLoading && permissions.isEditor) {
      router.push(`/projects/${projectId}`);
    }
  }, [permissions.isLoading, permissions.isEditor, router, projectId]);

  // Mock integrations data as requested
  const integrations = [
    {
      id: "figma",
      name: "Figma",
      description: "Sync translations with your Figma designs",
      icon: "🎨",
      available: false,
    },
    {
      id: "github",
      name: "GitHub",
      description: "Automatically create PRs with translation updates",
      icon: "🐙",
      available: false,
    },
    {
      id: "slack",
      name: "Slack",
      description: "Get notified about translation updates",
      icon: "💬",
      available: false,
    },
    {
      id: "ai",
      name: "AI Translation",
      description: "Use AI to translate your content automatically",
      icon: "🤖",
      available: false,
    },
  ];

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
            <p className="text-muted-foreground">Connect external tools and services</p>
          </div>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{integration.icon}</div>
                  <div>
                    <CardTitle>{integration.name}</CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                disabled={!integration.available} 
                variant="outline" 
                className={`w-full ${!integration.available ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20' : ''}`}
              >
                {integration.available ? (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Connect
                  </>
                ) : (
                  "Coming Soon"
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Zap className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">More Integrations Coming</h3>
          <p className="text-muted-foreground text-center max-w-md text-sm">
            We&apos;re working on adding integrations with popular tools and services.
            Stay tuned for updates!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
