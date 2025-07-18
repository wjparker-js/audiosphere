export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  plays: string | number;
  thumbnail: string;
  audioUrl?: string;
  isLiked: boolean;
  addedAt?: Date;
}

export type TrackAction = 'play' | 'pause' | 'like' | 'add-to-playlist' | 'download' | 'share' | 'remove';

export type TrackFilterType = 'all' | 'recently-added' | 'most-played' | 'artist' | 'album';

export type TrackSortType = 'recently-added' | 'title' | 'artist' | 'album' | 'plays';

export type TrackViewMode = 'list';