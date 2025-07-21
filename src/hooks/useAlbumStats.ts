import { useState, useEffect } from 'react';

interface AlbumStats {
  totalPlays: number;
  totalLikes: number;
  formattedPlays: string;
  formattedLikes: string;
}

interface UseAlbumStatsReturn {
  stats: AlbumStats | null;
  loading: boolean;
  error: string | null;
}

export function useAlbumStats(albumId: string): UseAlbumStatsReturn {
  const [stats, setStats] = useState<AlbumStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!albumId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/albums/${albumId}/stats`);
        const data = await response.json();

        if (data.success) {
          setStats(data.data);
        } else {
          setError(data.error?.message || 'Failed to fetch album statistics');
        }
      } catch (err) {
        setError('Network error while fetching album statistics');
        console.error('Error fetching album stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [albumId]);

  return { stats, loading, error };
}