import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ApiKey {
  id: string;
  name: string;
  role: string;
  createdAt: string;
}

interface CreateApiKeyRequest {
  name: string;
  role: "read-only" | "editor" | "admin";
}

interface CreateApiKeyResponse {
  data: {
    id: string;
    name: string;
    role: string;
    createdAt: string;
    key: string;
  };
}

export function useApiKeys(projectId: string | undefined, canManageApiKeys: boolean) {
  return useQuery({
    queryKey: ['projects', projectId, 'api-keys'],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');

      const response = await fetch(`/api/v1/projects/${projectId}/api-keys`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }

      const data = await response.json();
      return (data.data || data.apiKeys || []) as ApiKey[];
    },
    enabled: !!projectId && canManageApiKeys,
    refetchInterval: 5000, // Refetch every 5 seconds for live updates
  });
}

export function useCreateApiKey(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateApiKeyRequest) => {
      const response = await fetch(`/api/v1/projects/${projectId}/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create API key');
      }

      return await response.json() as CreateApiKeyResponse;
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
