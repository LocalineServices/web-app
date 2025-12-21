/**
 * React Query hooks for Translations and Locales
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { localesApi, translationsApi, AddLocaleRequest, UpdateTranslationRequest } from '@/lib/api';

export function useLocales(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'locales'],
    queryFn: () => localesApi.list(projectId),
    enabled: !!projectId,
  });
}

export function useTranslations(projectId: string, localeCode: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'translations', localeCode],
    queryFn: () => translationsApi.get(projectId, localeCode),
    enabled: !!projectId && !!localeCode,
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

