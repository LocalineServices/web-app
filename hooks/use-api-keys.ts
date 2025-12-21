/**
 * React Query hooks for API Keys
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface ApiKey {
  id: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface CreateApiKeyRequest {
  name: string;
  role: 'read-only' | 'editor' | 'admin';
}

export interface CreateApiKeyResponse {
  key: string;
  id: string;
  name: string;
  role: string;
  createdAt: string;
}

export function useApiKeys(projectId: string, options?: { enableLiveUpdates?: boolean }) {
  return useQuery({
    queryKey: ['projects', projectId, 'api-keys'],
    queryFn: async () => {
      const response = await fetch(`/api/v1/projects/${projectId}/api-keys`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }

      const data = await response.json();
      return (data.data || data.apiKeys || []) as ApiKey[];
    },
    enabled: !!projectId,
    refetchInterval: options?.enableLiveUpdates !== false ? 5000 : false,
  });
}

export function useCreateApiKey(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateApiKeyRequest) => {
      const response = await fetch(`/api/v1/projects/${projectId}/api-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create API key');
      }

      const result = await response.json();
      return {
        key: result.data.key || result.key,
        id: result.data.id,
        name: result.data.name,
        role: result.data.role,
        createdAt: result.data.createdAt,
      } as CreateApiKeyResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'api-keys'] });
    },
  });
}

export function useRevokeApiKey(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keyId: string) => {
      const response = await fetch(`/api/v1/projects/${projectId}/api-keys/${keyId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to revoke API key');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'api-keys'] });
    },
  });
}
