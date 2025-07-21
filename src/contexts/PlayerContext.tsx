'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useAudioPlayer, PlaybackState } from '@/hooks/useAudioPlayer';
import { AudioTrack } from '@/services/audio-streaming.service';

// Player state interface
interface PlayerState {
  // Current playback
  currentTrack: AudioTrack | null;
  playlist: AudioTrack[];
  currentIndex: number;
  
  // Playback state
  playbackState: PlaybackState;
  
  // Player settings
  volume: number;
  isMuted: boolean;
  repeatMode: 'none' | 'one' | 'all';
  isShuffled: boolean;
  
  // UI state
  isPlayerVisible: boolean;
  isQueueVisible: boolean;
  isFullscreen: boolean;
  
  // Queue management
  queue: AudioTrack[];
  history: AudioTrack[];
}

// Player actions
type PlayerAction =
  | { type: 'SET_TRACK'; payload: AudioTrack }
  | { type: 'SET_PLAYLIST'; payload: AudioTrack[] }
  | { type: 'SET_CURRENT_INDEX'; payload: number }
  | { type: 'UPDATE_PLAYBACK_STATE'; payload: Partial<PlaybackState> }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'SET_REPEAT_MODE'; payload: 'none' | 'one' | 'all' }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'TOGGLE_PLAYER_VISIBILITY' }
  | { type: 'TOGGLE_QUEUE_VISIBILITY' }
  | { type: 'TOGGLE_FULLSCREEN' }
  | { type: 'ADD_TO_QUEUE'; payload: AudioTrack }
  | { type: 'REMOVE_FROM_QUEUE'; payload: number }
  | { type: 'CLEAR_QUEUE' }
  | { type: 'ADD_TO_HISTORY'; payload: AudioTrack };

// Initial state
const initialState: PlayerState = {
  currentTrack: null,
  playlist: [],
  currentIndex: 0,
  playbackState: {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    quality: 'medium',
    bufferedPercent: 0,
    isLoading: false,
    error: null
  },
  volume: 1,
  isMuted: false,
  repeatMode: 'none',
  isShuffled: false,
  isPlayerVisible: false,
  isQueueVisible: false,
  isFullscreen: false,
  queue: [],
  history: []
};

// Player reducer
function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'SET_TRACK':
      return {
        ...state,
        currentTrack: action.payload,
        isPlayerVisible: true
      };
      
    case 'SET_PLAYLIST':
      return {
        ...state,
        playlist: action.payload,
        currentIndex: 0
      };
      
    case 'SET_CURRENT_INDEX':
      return {
        ...state,
        currentIndex: action.payload
      };
      
    case 'UPDATE_PLAYBACK_STATE':
      return {
        ...state,
        playbackState: {
          ...state.playbackState,
          ...action.payload
        }
      };
      
    case 'SET_VOLUME':
      return {
        ...state,
        volume: action.payload,
        isMuted: action.payload === 0
      };
      
    case 'TOGGLE_MUTE':
      return {
        ...state,
        isMuted: !state.isMuted
      };
      
    case 'SET_REPEAT_MODE':
      return {
        ...state,
        repeatMode: action.payload
      };
      
    case 'TOGGLE_SHUFFLE':
      return {
        ...state,
        isShuffled: !state.isShuffled
      };
      
    case 'TOGGLE_PLAYER_VISIBILITY':
      return {
        ...state,
        isPlayerVisible: !state.isPlayerVisible
      };
      
    case 'TOGGLE_QUEUE_VISIBILITY':
      return {
        ...state,
        isQueueVisible: !state.isQueueVisible
      };
      
    case 'TOGGLE_FULLSCREEN':
      return {
        ...state,
        isFullscreen: !state.isFullscreen
      };
      
    case 'ADD_TO_QUEUE':
      return {
        ...state,
        queue: [...state.queue, action.payload]
      };
      
    case 'REMOVE_FROM_QUEUE':
      return {
        ...state,
        queue: state.queue.filter((_, index) => index !== action.payload)
      };
      
    case 'CLEAR_QUEUE':
      return {
        ...state,
        queue: []
      };
      
    case 'ADD_TO_HISTORY':
      return {
        ...state,
        history: [action.payload, ...state.history.slice(0, 49)] // Keep last 50 tracks
      };
      
    default:
      return state;
  }
}

// Context interface
interface PlayerContextType {
  // State
  state: PlayerState;
  
  // Playback controls
  play: () => Promise<void>;
  pause: () => void;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  seek: (time: number) => void;
  
  // Volume controls
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  
  // Playlist controls
  playTrack: (track: AudioTrack, playlist?: AudioTrack[]) => Promise<void>;
  setPlaylist: (tracks: AudioTrack[]) => void;
  
  // Queue management
  addToQueue: (track: AudioTrack) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  
  // Player settings
  setRepeatMode: (mode: 'none' | 'one' | 'all') => void;
  toggleShuffle: () => void;
  
  // UI controls
  togglePlayerVisibility: () => void;
  toggleQueueVisibility: () => void;
  toggleFullscreen: () => void;
  
  // Utility functions
  formatTime: (seconds: number) => string;
  getProgress: () => number;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  
  // Use the audio player hook
  const audioPlayer = useAudioPlayer({
    autoPlay: true,
    crossfade: true,
    preloadNext: true,
    quality: 'auto'
  });

  // Sync audio player state with context state
  useEffect(() => {
    dispatch({
      type: 'UPDATE_PLAYBACK_STATE',
      payload: audioPlayer.playbackState
    });
  }, [audioPlayer.playbackState]);

  // Sync current track
  useEffect(() => {
    if (audioPlayer.currentTrack && audioPlayer.currentTrack !== state.currentTrack) {
      dispatch({
        type: 'SET_TRACK',
        payload: audioPlayer.currentTrack
      });
    }
  }, [audioPlayer.currentTrack, state.currentTrack]);

  // Sync playlist
  useEffect(() => {
    if (audioPlayer.playlist.length !== state.playlist.length) {
      dispatch({
        type: 'SET_PLAYLIST',
        payload: audioPlayer.playlist
      });
    }
  }, [audioPlayer.playlist, state.playlist.length]);

  // Sync current index
  useEffect(() => {
    if (audioPlayer.currentIndex !== state.currentIndex) {
      dispatch({
        type: 'SET_CURRENT_INDEX',
        payload: audioPlayer.currentIndex
      });
    }
  }, [audioPlayer.currentIndex, state.currentIndex]);

  // Playback controls
  const play = useCallback(async () => {
    await audioPlayer.play();
  }, [audioPlayer]);

  const pause = useCallback(() => {
    audioPlayer.pause();
  }, [audioPlayer]);

  const next = useCallback(async () => {
    const nextTrack = audioPlayer.getNextTrack();
    if (nextTrack) {
      dispatch({ type: 'ADD_TO_HISTORY', payload: state.currentTrack! });
    }
    await audioPlayer.next();
  }, [audioPlayer, state.currentTrack]);

  const previous = useCallback(async () => {
    await audioPlayer.previous();
  }, [audioPlayer]);

  const seek = useCallback((time: number) => {
    audioPlayer.seek(time);
  }, [audioPlayer]);

  // Volume controls
  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    audioPlayer.setVolume(clampedVolume);
    dispatch({ type: 'SET_VOLUME', payload: clampedVolume });
  }, [audioPlayer]);

  const toggleMute = useCallback(() => {
    if (state.isMuted) {
      audioPlayer.setVolume(state.volume);
    } else {
      audioPlayer.setVolume(0);
    }
    dispatch({ type: 'TOGGLE_MUTE' });
  }, [audioPlayer, state.isMuted, state.volume]);

  // Playlist controls
  const playTrack = useCallback(async (track: AudioTrack, playlist?: AudioTrack[]) => {
    if (playlist) {
      audioPlayer.setPlaylist(playlist);
    }
    
    // Add current track to history if there is one
    if (state.currentTrack) {
      dispatch({ type: 'ADD_TO_HISTORY', payload: state.currentTrack });
    }
    
    await audioPlayer.loadTrack(track, true);
    dispatch({ type: 'SET_TRACK', payload: track });
  }, [audioPlayer, state.currentTrack]);

  const setPlaylist = useCallback((tracks: AudioTrack[]) => {
    audioPlayer.setPlaylist(tracks);
    dispatch({ type: 'SET_PLAYLIST', payload: tracks });
  }, [audioPlayer]);

  // Queue management
  const addToQueue = useCallback((track: AudioTrack) => {
    dispatch({ type: 'ADD_TO_QUEUE', payload: track });
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_FROM_QUEUE', payload: index });
  }, []);

  const clearQueue = useCallback(() => {
    dispatch({ type: 'CLEAR_QUEUE' });
  }, []);

  // Player settings
  const setRepeatMode = useCallback((mode: 'none' | 'one' | 'all') => {
    audioPlayer.toggleRepeat(); // This cycles through modes
    dispatch({ type: 'SET_REPEAT_MODE', payload: mode });
  }, [audioPlayer]);

  const toggleShuffle = useCallback(() => {
    audioPlayer.toggleShuffle();
    dispatch({ type: 'TOGGLE_SHUFFLE' });
  }, [audioPlayer]);

  // UI controls
  const togglePlayerVisibility = useCallback(() => {
    dispatch({ type: 'TOGGLE_PLAYER_VISIBILITY' });
  }, []);

  const toggleQueueVisibility = useCallback(() => {
    dispatch({ type: 'TOGGLE_QUEUE_VISIBILITY' });
  }, []);

  const toggleFullscreen = useCallback(() => {
    dispatch({ type: 'TOGGLE_FULLSCREEN' });
  }, []);

  // Utility functions
  const formatTime = useCallback((seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const getProgress = useCallback((): number => {
    const { currentTime, duration } = state.playbackState;
    if (!duration || duration === 0) return 0;
    return (currentTime / duration) * 100;
  }, [state.playbackState]);

  // Persist player state to localStorage
  useEffect(() => {
    const playerState = {
      volume: state.volume,
      isMuted: state.isMuted,
      repeatMode: state.repeatMode,
      isShuffled: state.isShuffled
    };
    
    try {
      localStorage.setItem('audiosphere_player_state', JSON.stringify(playerState));
    } catch (error) {
      console.warn('Failed to save player state:', error);
    }
  }, [state.volume, state.isMuted, state.repeatMode, state.isShuffled]);

  // Restore player state from localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('audiosphere_player_state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        dispatch({ type: 'SET_VOLUME', payload: parsed.volume || 1 });
        if (parsed.isMuted) dispatch({ type: 'TOGGLE_MUTE' });
        dispatch({ type: 'SET_REPEAT_MODE', payload: parsed.repeatMode || 'none' });
        if (parsed.isShuffled) dispatch({ type: 'TOGGLE_SHUFFLE' });
      }
    } catch (error) {
      console.warn('Failed to restore player state:', error);
    }
  }, []);

  const value: PlayerContextType = {
    state,
    play,
    pause,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    playTrack,
    setPlaylist,
    addToQueue,
    removeFromQueue,
    clearQueue,
    setRepeatMode,
    toggleShuffle,
    togglePlayerVisibility,
    toggleQueueVisibility,
    toggleFullscreen,
    formatTime,
    getProgress
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}

export default PlayerContext;