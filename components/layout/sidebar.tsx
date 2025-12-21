"use client";

import * as React from "react";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { Globe, FolderOpen, Settings, LogOut, FileText, Tag, Users, Key, Zap, Lock, type LucideIcon, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useProjectPermissions } from "@/hooks/use-project-permissions";

interface SidebarProps {
  isCollapsed: boolean;
}

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  isNested?: boolean;
  disabled?: boolean;
}

const navItems: NavItem[] = [
  {
    title: "Projects",
    href: "/projects",
    icon: FolderOpen,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar({ isCollapsed }: SidebarProps) {
  const pathname = usePathname();

  // Extract projectId from pathname if on a project page
  const projectIdMatch = pathname.match(/^\/projects\/([^/]+)/);
  const projectId = projectIdMatch ? projectIdMatch[1] : null;
  
  // Fetch permissions only if we're on a project page
  const permissions = useProjectPermissions(projectId || '');
  const isOnProjectPage = projectId && projectId !== '' && pathname !== '/projects';

  // Define project navigation items
  const getProjectNavItems = React.useMemo((): NavItem[] => {
    if (!projectId) return [];
    
    return [
      {
        title: "Translations",
        href: `/projects/${projectId}/translations`,
        icon: Globe,
        isNested: true,
        disabled: false,
      },
      {
        title: "Terms",
        href: `/projects/${projectId}/terms`,
        icon: FileText,
        isNested: true,
        disabled: false,
      },
      {
        title: "Labels",
        href: `/projects/${projectId}/labels`,
        icon: Tag,
        isNested: true,
        disabled: false,
      },
      {
        title: "Team",
        href: `/projects/${projectId}/team`,
        icon: Users,
        isNested: true,
        disabled: !permissions.canManageTeam,
      },
      {
        title: "API Keys",
        href: `/projects/${projectId}/api-keys`,
        icon: Key,
        isNested: true,
        disabled: !permissions.canManageApiKeys,
      },
      {
        title: "Integration",
        href: `/projects/${projectId}/integrations`,
        icon: Zap,
        isNested: true,
        disabled: permissions.isEditor,
      },
      {
        title: "Project Settings",
        href: `/projects/${projectId}/settings`,
        icon: Settings,
        isNested: true,
        disabled: !permissions.canManageProject,
      },
    ];
  }, [projectId, permissions.canManageTeam, permissions.canManageApiKeys, permissions.isEditor, permissions.canManageProject]);

  function logout() {
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).then(() => {
      redirect('/login');
    });
  }

  const renderNavItem = (item: NavItem) => {
    const isActive = pathname === item.href || (item.href !== '/projects' && pathname.startsWith(item.href));
    const NavIcon = item.icon;
    const isDisabled = item.disabled;

    if (isCollapsed) {
      return (
        <Tooltip key={item.href} delayDuration={0}>
          <TooltipTrigger asChild>
            {isDisabled ? (
              <Button
                variant="ghost"
                size="icon"
                disabled
                className={cn(
                  "w-10 h-10 opacity-50 cursor-not-allowed",
                  item.isNested && "ml-2"
                )}
              >
                <Lock className="h-4 w-4" />
              </Button>
            ) : (
              <Link href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="icon"
                  className={cn(
                    "w-10 h-10",
                    isActive && "bg-primary/10 text-primary hover:bg-primary/20",
                    !isActive && "hover:bg-accent hover:text-accent-foreground",
                    item.isNested && "ml-2"
                  )}
                >
                  <NavIcon className="h-5 w-5" />
                </Button>
              </Link>
            )}
          </TooltipTrigger>
          <TooltipContent side="right">
            {item.title} {isDisabled && "(Locked)"}
          </TooltipContent>
        </Tooltip>
      );
    }

    if (isDisabled) {
      return (
        <Button
          key={item.href}
          variant="ghost"
          disabled
          className={cn(
            "w-full justify-start gap-3 opacity-50 cursor-not-allowed",
            item.isNested && "pl-8"
          )}
        >
          <Lock className="h-4 w-4" />
          {item.title}
        </Button>
      );
    }

    return (
      <Link key={item.href} href={item.href}>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start gap-3",
            isActive && "bg-primary/10 text-primary hover:bg-primary/20",
            !isActive && "hover:bg-accent hover:text-accent-foreground",
            item.isNested && "pl-8"
          )}
        >
          <NavIcon className="h-5 w-5" />
          {item.title}
        </Button>
      </Link>
    );
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-card",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn("flex h-16 items-center border-b px-4", isCollapsed && "justify-center")}>
        <Link href="/projects" className="flex items-center gap-2">
          <Languages className="h-6 w-6 text-primary" />
          {!isCollapsed && (
            <span className="text-lg font-semibold">Localine</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {/* Projects item */}
          {renderNavItem(navItems[0])}
          
          {/* Project Navigation - show when on a project page */}
          {isOnProjectPage && !permissions.isLoading && (
            <>
              {getProjectNavItems.map((item) => renderNavItem(item))}
            </>
          )}
          
          {/* Settings item - always last */}
          {renderNavItem(navItems[1])}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        {isCollapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="w-10 h-10 hover:bg-accent hover:text-accent-foreground">
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Sign out</TooltipContent>
          </Tooltip>
        ) : (
          <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-accent hover:text-accent-foreground">
            <LogOut className="h-5 w-5" onClick={logout} />
            Sign out
          </Button>
        )}
      </div>
    </div>
  );
}
