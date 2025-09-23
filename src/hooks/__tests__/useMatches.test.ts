import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMatches } from '../useMatches';

// Mock the API service
vi.mock('@/services/api', () => ({
  apiService: {
    getMatchSuggestions: vi.fn(),
    sendMatchRequest: vi.fn(),
    skipMatch: vi.fn(),
  },
}));

// Mock the environment
vi.mock('@/config/env', () => ({
  env: {
    IS_DEV: true,
  },
}));

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('useMatches Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with loading state', () => {
    const { result } = renderHook(() => useMatches());
    
    expect(result.current.loading).toBe(true);
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  it('loads mock suggestions in development', async () => {
    const { result } = renderHook(() => useMatches());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.suggestions.length).toBeGreaterThan(0);
    expect(result.current.suggestions[0]).toHaveProperty('user');
    expect(result.current.suggestions[0]).toHaveProperty('compatibilityScore');
  });

  it('handles sending match request', async () => {
    const toast = await import('react-hot-toast');
    const { result } = renderHook(() => useMatches());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    const initialLength = result.current.suggestions.length;
    const firstUserId = result.current.suggestions[0].user.id;
    
    await result.current.sendMatch(firstUserId);
    
    expect(toast.default.success).toHaveBeenCalledWith('Connection request sent!');
    expect(result.current.suggestions.length).toBe(initialLength - 1);
  });

  it('handles skipping match', async () => {
    const { result } = renderHook(() => useMatches());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    const initialLength = result.current.suggestions.length;
    const firstUserId = result.current.suggestions[0].user.id;
    
    await result.current.skipMatch(firstUserId);
    
    expect(result.current.suggestions.length).toBe(initialLength - 1);
  });

  it('handles refresh', async () => {
    const { result } = renderHook(() => useMatches());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.currentPage).toBe(1);
    
    await result.current.refresh();
    
    expect(result.current.currentPage).toBe(1);
    expect(result.current.suggestions.length).toBeGreaterThan(0);
  });
});
