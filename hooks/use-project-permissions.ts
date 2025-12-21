import { useState, useEffect, useCallback } from 'react';

interface TeamMember {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: 'editor' | 'admin';
  assignedLocales: string[] | null;
  createdAt: string;
}

interface ProjectPermissions {
  isOwner: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  canManageTeam: boolean;
  canManageProject: boolean;
  canManageApiKeys: boolean;
  canManageTerms: boolean;
  canManageLocales: boolean;
  canManageLabels: boolean;
  canTranslate: boolean;
  assignedLocales: string[] | null;
  canAccessLocale: (localeCode: string) => boolean;
  isLoading: boolean;
}

interface Project {
  ownerId: string;
  [key: string]: unknown; // Allow additional properties
}

interface User {
  id: string;
  [key: string]: unknown; // Allow additional properties
}

export function useProjectPermissions(projectId: string): ProjectPermissions {
  const [project, setProject] = useState<Project | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch current user
        const userResponse = await fetch('/api/users/me', { credentials: 'include' });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setCurrentUser(userData.user);

          // Fetch project
          const projectResponse = await fetch(`/api/v1/projects/${projectId}`, {
            credentials: 'include',
          });
          if (projectResponse.ok) {
            const projectData = await projectResponse.json();
            setProject(projectData.data);

            // Fetch team members to check if current user is a member
            const membersResponse = await fetch(`/api/v1/projects/${projectId}/members`, {
              credentials: 'include',
            });
            if (membersResponse.ok) {
              const membersData = await membersResponse.json();
              const member = (membersData.data || []).find(
                (m: TeamMember) => m.userId === userData.user.id
              );
              setTeamMember(member || null);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const canAccessLocale = useCallback(
    (localeCode: string): boolean => {
      // Owner and admin can access all locales
      if (!teamMember || teamMember.role === 'admin') {
        return true;
      }

      // Editor with no assigned locales can access all
      if (!teamMember.assignedLocales || teamMember.assignedLocales.length === 0) {
        return true;
      }

      // Check if locale is in assigned locales
      return teamMember.assignedLocales.includes(localeCode);
    },
    [teamMember]
  );

  const isOwner = project && currentUser && project.ownerId === currentUser.id;
  const isAdmin = teamMember?.role === 'admin';
  const isEditor = teamMember?.role === 'editor';

  return {
    isOwner: isOwner || false,
    isAdmin: isAdmin,
    isEditor: isEditor,
    canManageTeam: isOwner || isAdmin,
    canManageProject: isOwner || isAdmin,
    canManageApiKeys: isOwner || isAdmin,
    canManageTerms: isOwner || isAdmin,
    canManageLocales: isOwner || isAdmin,
    canManageLabels: isOwner || isAdmin,
    canTranslate: true, // Everyone can translate
    assignedLocales: teamMember?.assignedLocales || null,
    canAccessLocale,
    isLoading,
  };
}
