import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface UseLiveUpdatesOptions {
  projectId: string;
  /** Refetch interval in milliseconds. Default: 5000 (5 seconds) */
  interval?: number;
  /** Enable live updates. Default: true */
  enabled?: boolean;
}

/**
 * Enable live updates for all project-related queries
 * This will automatically refetch data at regular intervals when viewing a project
 */
export function useLiveUpdates({ 
  projectId, 
  interval = 5000, 
  enabled = true 
}: UseLiveUpdatesOptions) {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || !projectId) {
      return;
    }

    // Set up interval for automatic refetching
    intervalRef.current = setInterval(() => {
      // Refetch all queries related to this project
      queryClient.invalidateQueries({ 
        queryKey: ['projects', projectId],
        refetchType: 'active', // Only refetch queries that are currently being used
      });
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [projectId, interval, enabled, queryClient]);
}

/**
 * Enable live updates for specific query areas within a project
 */
export function useLiveUpdatesForArea({ 
  projectId, 
  area,
  interval = 5000, 
  enabled = true 
}: UseLiveUpdatesOptions & { area: 'translations' | 'terms' | 'labels' | 'team' | 'api-keys' }) {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || !projectId) {
      return;
    }

    // Map areas to their query keys
    const queryKeyMap = {
      'translations': ['projects', projectId, 'translations'],
      'terms': ['projects', projectId, 'terms'],
      'labels': ['labels', projectId],
      'team': ['projects', projectId, 'members'],
      'api-keys': ['projects', projectId, 'api-keys'],
    };

    intervalRef.current = setInterval(() => {
      const queryKey = queryKeyMap[area];
      queryClient.invalidateQueries({ 
        queryKey,
        refetchType: 'active',
      });
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [projectId, area, interval, enabled, queryClient]);
}
