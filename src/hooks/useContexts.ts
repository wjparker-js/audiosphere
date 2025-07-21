// Convenience hooks for accessing multiple contexts
import { useAuth } from '@/contexts/AuthContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotification } from '@/contexts/NotificationContext';

// Combined hook for accessing all contexts
export function useAppContexts() {
  const auth = useAuth();
  const player = usePlayer();
  const theme = useTheme();
  const notification = useNotification();

  return {
    auth,
    player,
    theme,
    notification
  };
}

// Hook for accessing user-related contexts
export function useUserContexts() {
  const auth = useAuth();
  const theme = useTheme();
  const notification = useNotification();

  return {
    auth,
    theme,
    notification
  };
}

// Hook for accessing media-related contexts
export function useMediaContexts() {
  const player = usePlayer();
  const notification = useNotification();

  return {
    player,
    notification
  };
}

// Hook for accessing UI-related contexts
export function useUIContexts() {
  const theme = useTheme();
  const notification = useNotification();

  return {
    theme,
    notification
  };
}

export default {
  useAppContexts,
  useUserContexts,
  useMediaContexts,
  useUIContexts
};