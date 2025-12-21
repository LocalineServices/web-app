/**
 * Traduora API functions
 * Type-safe API calls for projects, terms, and translations
 */

import { apiClient } from './api-client';

// Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  role?: string;
}

export interface Locale {
  id: string;
  locale: {
    code: string;
    language?: string;
    region?: string;
  };
  date: string;
}

export interface Term {
  id: string;
  value: string;
  context?: string | null;
  isLocked?: boolean;
  labels: Array<{ id: string; name: string }>;
  date: {
    created: string;
    modified: string;
  };
}

export interface Translation {
  termId: string;
  value: string;
  labels: Array<{ id: string; name: string }>;
  date: {
    created: string;
    modified: string;
  };
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface AddTermRequest {
  value: string;
  context?: string;
}

export interface UpdateTermRequest {
  value?: string;
  context?: string;
}

export interface UpdateTranslationRequest {
  value: string;
}

export interface AddLocaleRequest {
  code: string;
}

// Projects API
export const projectsApi = {
  list: (): Promise<Project[]> => {
    return apiClient.get<Project[]>('/api/v1/projects');
  },

  get: (projectId: string): Promise<Project> => {
    return apiClient.get<Project>(`/api/v1/projects/${projectId}`);
  },

  create: (data: CreateProjectRequest): Promise<Project> => {
    return apiClient.post<Project>('/api/v1/projects', data);
  },

  update: (projectId: string, data: Partial<CreateProjectRequest>): Promise<Project> => {
    return apiClient.patch<Project>(`/api/v1/projects/${projectId}`, data);
  },

  delete: (projectId: string): Promise<void> => {
    return apiClient.delete<void>(`/api/v1/projects/${projectId}`);
  },
};

// Locales API
export const localesApi = {
  list: (projectId: string): Promise<Locale[]> => {
    return apiClient.get<Locale[]>(`/api/v1/projects/${projectId}/translations`);
  },

  add: (projectId: string, data: AddLocaleRequest): Promise<Locale> => {
    return apiClient.post<Locale>(`/api/v1/projects/${projectId}/translations`, data);
  },

  delete: (projectId: string, localeCode: string): Promise<void> => {
    return apiClient.delete<void>(`/api/v1/projects/${projectId}/translations/${localeCode}`);
  },
};

// Terms API
export const termsApi = {
  list: (projectId: string): Promise<Term[]> => {
    return apiClient.get<Term[]>(`/api/v1/projects/${projectId}/terms`);
  },

  create: (projectId: string, data: AddTermRequest): Promise<Term> => {
    return apiClient.post<Term>(`/api/v1/projects/${projectId}/terms`, data);
  },

  update: (projectId: string, termId: string, data: UpdateTermRequest): Promise<Term> => {
    return apiClient.patch<Term>(`/api/v1/projects/${projectId}/terms/${termId}`, data);
  },

  delete: (projectId: string, termId: string): Promise<void> => {
    return apiClient.delete<void>(`/api/v1/projects/${projectId}/terms/${termId}`);
  },
};

// Translations API
export const translationsApi = {
  get: (projectId: string, localeCode: string): Promise<Translation[]> => {
    return apiClient.get<Translation[]>(`/api/v1/projects/${projectId}/translations/${localeCode}`);
  },

  update: (projectId: string, localeCode: string, termId: string, data: UpdateTranslationRequest): Promise<Translation> => {
    return apiClient.patch<Translation>(
      `/api/v1/projects/${projectId}/translations/${localeCode}/${termId}`,
      data
    );
  },
};

