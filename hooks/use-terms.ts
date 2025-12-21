/**
 * React Query hooks for Terms
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { termsApi, AddTermRequest, UpdateTermRequest } from '@/lib/api';

export function useTerms(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'terms'],
    queryFn: () => termsApi.list(projectId),
    enabled: !!projectId,
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

