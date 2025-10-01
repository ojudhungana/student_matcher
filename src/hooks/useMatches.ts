// Manage suggested matches, pagination, and connect/skip actions.
import { useState, useEffect, useRef } from 'react';
import { MatchSuggestion, PaginatedResponse } from '@/types';
import { apiService } from '@/services/api';
import toast from 'react-hot-toast';

interface UseMatchesResult {
  suggestions: MatchSuggestion[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  loadMore: () => Promise<void>;
  sendMatch: (userId: string) => Promise<void>;
  skipMatch: (userId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useMatches(): UseMatchesResult {
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const inFlightRef = useRef<Set<string>>(new Set());

  const loadSuggestions = async (page: number, append = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getMatchSuggestions(page, 10);
      
      if (append) {
        setSuggestions(prev => [...prev, ...response.data]);
      } else {
        setSuggestions(response.data);
      }
      
      setHasMore(page < response.pagination.totalPages);
      setCurrentPage(page);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load matches';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loading) return;
    await loadSuggestions(currentPage + 1, true);
  };

  const autoLoadIfNeeded = (newSuggestions: MatchSuggestion[]) => {
    if (newSuggestions.length <= 2 && hasMore && !loading) {
      setTimeout(() => loadMore(), 100);
    }
  };

  const refresh = async () => {
    setCurrentPage(1);
    await loadSuggestions(1, false);
  };

  const sendMatch = async (userId: string) => {
    // Prevent duplicate requests for the same user
    if (inFlightRef.current.has(userId)) return;
    inFlightRef.current.add(userId);
    try {
      await apiService.sendMatchRequest(userId);
      toast.success('Connection request sent!');
      
      // Remove the user from suggestions
      setSuggestions(prev => {
        const newSuggestions = prev.filter(s => s.user.id !== userId);
        // Auto-load more if running low on matches
        autoLoadIfNeeded(newSuggestions);
        return newSuggestions;
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send connection request';
      setError(message);
      toast.error(message);
    } finally {
      inFlightRef.current.delete(userId);
    }
  };

  const skipMatch = async (userId: string) => {
    // Prevent duplicate skip requests for the same user
    if (inFlightRef.current.has(userId)) return;
    inFlightRef.current.add(userId);
    try {
      await apiService.skipMatch(userId);
      
      // Remove the user from suggestions
      setSuggestions(prev => {
        const newSuggestions = prev.filter(s => s.user.id !== userId);
        // Auto-load more if running low on matches
        autoLoadIfNeeded(newSuggestions);
        return newSuggestions;
      });
    } catch (err) {
      console.error('Error skipping match:', err);
      // Don't show error toast for skip action, just log it
    } finally {
      inFlightRef.current.delete(userId);
    }
  };

  useEffect(() => {
    loadSuggestions(1);
  }, []);

  return {
    suggestions,
    loading,
    error,
    hasMore,
    currentPage,
    loadMore,
    sendMatch,
    skipMatch,
    refresh,
  };
}