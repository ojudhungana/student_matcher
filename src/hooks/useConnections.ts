<<<<<<< HEAD
=======
// Fetch and paginate user connections; exposes list and actions.
>>>>>>> aaa84261f8429e5f3b3bea0ebd897acd2a3f4f08
import { useState, useEffect } from 'react';
import { Connection, PaginatedResponse } from '@/types';
import { apiService } from '@/services/api';
import { getMockConnections } from '@/services/mockData';
import { env } from '@/config/env';
import toast from 'react-hot-toast';

interface UseConnectionsResult {
  connections: Connection[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useConnections(): UseConnectionsResult {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadConnections = async (page: number, append = false) => {
    setLoading(true);
    setError(null);
    
    try {
      let response: PaginatedResponse<Connection>;
      
      if (env.IS_DEV) {
        // Use mock data in development
        response = getMockConnections(page, 20);
      } else {
        response = await apiService.getConnections(page, 20);
      }
      
      if (append) {
        setConnections(prev => [...prev, ...response.data]);
      } else {
        setConnections(response.data);
      }
      
      setHasMore(page < response.pagination.totalPages);
      setCurrentPage(page);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load connections';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loading) return;
    await loadConnections(currentPage + 1, true);
  };

  const refresh = async () => {
    setCurrentPage(1);
    await loadConnections(1, false);
  };

  useEffect(() => {
    loadConnections(1);
  }, []);

  return {
    connections,
    loading,
    error,
    hasMore,
    currentPage,
    loadMore,
    refresh,
  };
}