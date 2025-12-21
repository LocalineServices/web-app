/**
 * React Query hooks for Terms
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { termsApi, AddTermRequest, UpdateTermRequest } from '@/lib/api';

export function useTerms(projectId: string, options?: { enableLiveUpdates?: boolean }) {
  return useQuery({
    queryKey: ['projects', projectId, 'terms'],
    queryFn: () => termsApi.list(projectId),
    enabled: !!projectId,
    refetchInterval: options?.enableLiveUpdates !== false ? 5000 : false,
  });
}

export function useCreateTerm(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddTermRequest) => termsApi.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'terms'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'translations'] });
    },
  });
}

export function useUpdateTerm(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ termId, data }: { termId: string; data: UpdateTermRequest }) =>
      termsApi.update(projectId, termId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'terms'] });
    },
  });
}

export function useDeleteTerm(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (termId: string) => termsApi.delete(projectId, termId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'terms'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'translations'] });
    },
  });
}

export function useLockAllTerms(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/v1/projects/${projectId}/terms/lock-all`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to lock all terms');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'terms'] });
    },
  });
}

export function useUnlockAllTerms(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/v1/projects/${projectId}/terms/unlock-all`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to unlock all terms');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'terms'] });
    },
  });
}

