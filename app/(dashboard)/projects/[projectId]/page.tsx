"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  FileText,
  Globe,
  Key,
  Loader2,
  Lock,
  Percent,
  Settings,
  Tag,
  Upload,
  Users,
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
import { Progress } from "@/components/ui/progress";
import { useProject } from "@/hooks/use-projects";
import { useLocales } from "@/hooks/use-translations";
import { useTerms } from "@/hooks/use-terms";
import { useLabels } from "@/hooks/use-labels";
import { useProjectPermissions } from "@/hooks/use-project-permissions";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;

  const { data: project, isLoading: isLoadingProject } = useProject(projectId);
  const { data: locales = [], isLoading: isLoadingLocales } = useLocales(projectId);
  const { data: terms = [], isLoading: isLoadingTerms } = useTerms(projectId);
  const { data: labels = [], isLoading: isLoadingLabels } = useLabels(projectId);
  
  // Check permissions
  const permissions = useProjectPermissions(projectId);

  const isLoading = isLoadingProject || isLoadingLocales || isLoadingTerms || isLoadingLabels;

  // Calculate translation progress
  const [translationStats, setTranslationStats] = React.useState<{
    totalTranslations: number;
    completedTranslations: number;
    progress: number;
  }>({ totalTranslations: 0, completedTranslations: 0, progress: 0 });

  React.useEffect(() => {
    async function fetchTranslationStats() {
      if (!projectId || locales.length === 0 || terms.length === 0) {
        // Only update if the state actually changed to avoid infinite loop
        setTranslationStats(prev => {
          if (prev.totalTranslations === 0 && prev.completedTranslations === 0 && prev.progress === 0) {
            return prev;
          }
          return { totalTranslations: 0, completedTranslations: 0, progress: 0 };
        });
        return;
      }

      try {
        // Fetch translations for all locales
        const translationPromises = locales.map(async (locale: { id: string; locale: { code: string } }) => {
          const response = await fetch(`/api/v1/projects/${projectId}/translations/${locale.locale.code}`);
          if (response.ok) {
            const data = await response.json();
            return data.data || [];
          }
          return [];
        });

        const allTranslations = await Promise.all(translationPromises);
        const flatTranslations = allTranslations.flat();

        // Count completed translations (non-empty values)
        const completedCount = flatTranslations.filter((t: { value?: string }) => t.value && t.value.trim()).length;
        const totalCount = terms.length * locales.length;
        const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        setTranslationStats({
          totalTranslations: totalCount,
          completedTranslations: completedCount,
          progress: progressPercent,
        });
      } catch {
        setTranslationStats({ totalTranslations: 0, completedTranslations: 0, progress: 0 });
      }
    }

    fetchTranslationStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, locales.length, terms.length]);

  if (isLoading) {
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

  const sections = [
    {
      title: "Translations",
      description: "Translate your content into multiple languages",
      icon: Globe,
      href: `/projects/${projectId}/translations`,
      count: locales.length,
      countLabel: "locales",
      restricted: false,
    },
    {
      title: "Terms",
      description: "Manage translation keys and strings",
      icon: FileText,
      href: `/projects/${projectId}/terms`,
      count: terms.length,
      countLabel: "terms",
      restricted: false, // Editors can view in read-only mode
    },
    {
      title: "Labels",
      description: "Organize translations with labels",
      icon: Tag,
      href: `/projects/${projectId}/labels`,
      count: labels.length,
      countLabel: "labels",
      restricted: false, // Editors can view in read-only mode
    },
    {
      title: "API Keys",
      description: "Manage API access and permissions",
      icon: Key,
      href: `/projects/${projectId}/api-keys`,
      count: null,
      countLabel: null,
      restricted: !permissions.canManageApiKeys,
    },
    {
      title: "Team",
      description: "Invite and manage team members",
      icon: Users,
      href: `/projects/${projectId}/team`,
      count: null,
      countLabel: null,
      comingSoon: false,
      restricted: !permissions.canManageTeam,
    },
    {
      title: "Integrations",
      description: "Connect external tools and services",
      icon: Zap,
      href: `/projects/${projectId}/integrations`,
      count: null,
      countLabel: null,
      comingSoon: true,
      restricted: permissions.isEditor, // Editors cannot access integrations
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/projects')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground">{project.description}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {!permissions.isLoading && !permissions.isEditor && (
            <>
              <Button
                variant="outline"
                onClick={() => router.push(`/projects/${projectId}/import`)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/projects/${projectId}/export`)}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </>
          )}
          {permissions.canManageProject && (
            <Button
              variant="outline"
              onClick={() => router.push(`/projects/${projectId}/settings`)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          )}
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Translation Progress</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{translationStats.progress}%</div>
            <Progress value={translationStats.progress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {translationStats.completedTranslations} of {translationStats.totalTranslations} translations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locales</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locales.length}</div>
            <p className="text-xs text-muted-foreground">
              Languages in your project
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terms</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{terms.length}</div>
            <p className="text-xs text-muted-foreground">
              Translation keys defined
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Labels</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{labels.length}</div>
            <p className="text-xs text-muted-foreground">
              Labels for organization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      {locales.length === 0 && terms.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Follow these steps to set up your translation project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Add locales</p>
                <p className="text-sm text-muted-foreground">
                  Start by adding the languages you want to support
                </p>
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => router.push(`/projects/${projectId}/translations`)}
                >
                  Go to Translations →
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Create terms</p>
                <p className="text-sm text-muted-foreground">
                  Define your translation keys (e.g., &quot;common.welcome&quot;, &quot;auth.login&quot;)
                </p>
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => router.push(`/projects/${projectId}/terms`)}
                >
                  Go to Terms →
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Start translating</p>
                <p className="text-sm text-muted-foreground">
                  Fill in translations for each language
                </p>
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => router.push(`/projects/${projectId}/translations`)}
                >
                  Go to Translations →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon;
            const isRestricted = section.restricted && !permissions.isLoading;
            return (
              <Link 
                key={section.href} 
                href={isRestricted ? "#" : section.href}
                onClick={(e) => {
                  if (isRestricted) {
                    e.preventDefault();
                  }
                }}
              >
                <Card className={`transition-colors h-full ${isRestricted ? 'opacity-60 cursor-not-allowed' : 'hover:bg-muted/50 cursor-pointer'}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isRestricted ? 'bg-muted' : 'bg-primary/10'}`}>
                          <Icon className={`h-6 w-6 ${isRestricted ? 'text-muted-foreground' : 'text-primary'}`} />
                        </div>
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            {section.title}
                            {section.comingSoon && (
                              <span className="text-xs font-normal text-muted-foreground">
                                (Coming Soon)
                              </span>
                            )}
                            {isRestricted && (
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            )}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {isRestricted ? "Access restricted" : section.description}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  {section.count !== null && !isRestricted && (
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {section.count}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {section.countLabel}
                      </p>
                    </CardContent>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
