/**
 * React Query hooks for Translations and Locales
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { localesApi, translationsApi, AddLocaleRequest, UpdateTranslationRequest } from '@/lib/api';

export function useLocales(projectId: string, options?: { enableLiveUpdates?: boolean }) {
  return useQuery({
    queryKey: ['projects', projectId, 'locales'],
    queryFn: () => localesApi.list(projectId),
    enabled: !!projectId,
    refetchInterval: options?.enableLiveUpdates !== false ? 5000 : false,
  });
}

export function useTranslations(projectId: string, localeCode: string, options?: { enableLiveUpdates?: boolean }) {
  return useQuery({
    queryKey: ['projects', projectId, 'translations', localeCode],
    queryFn: () => translationsApi.get(projectId, localeCode),
    enabled: !!projectId && !!localeCode,
    refetchInterval: options?.enableLiveUpdates !== false ? 5000 : false,
  });
}

export function useAddLocale(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddLocaleRequest) => localesApi.add(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'locales'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
}

export function useUpdateTranslation(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      localeCode,
      termId,
      data,
    }: {
      localeCode: string;
      termId: string;
      data: UpdateTranslationRequest;
    }) => translationsApi.update(projectId, localeCode, termId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['projects', projectId, 'translations', variables.localeCode],
      });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'terms'] });
    },
  });
}

export function useDeleteLocale(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (localeCode: string) => localesApi.delete(projectId, localeCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'locales'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
}

