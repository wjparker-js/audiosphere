import { Track } from '@/types/track';

// Mock data for liked songs
const mockTracks: Track[] = [
  {
    id: '1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: '3:20',
    plays: '1.2B',
    thumbnail: 'https://via.placeholder.com/48x48/1f2937/ffffff?text=BL',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    isLiked: true,
    addedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    title: "Don't Start Now",
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    duration: '3:03',
    plays: '980.0M',
    thumbnail: 'https://via.placeholder.com/48x48/1f2937/ffffff?text=DS',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-04.wav',
    isLiked: true,
    addedAt: new Date('2024-01-10')
  },
  {
    id: '3',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    duration: '3:23',
    plays: '850.0M',
    thumbnail: 'https://via.placeholder.com/48x48/1f2937/ffffff?text=LV',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-03.wav',
    isLiked: true,
    addedAt: new Date('2024-01-08')
  },
  {
    id: '4',
    title: 'Save Your Tears',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: '3:35',
    plays: '720.0M',
    thumbnail: 'https://via.placeholder.com/48x48/1f2937/ffffff?text=ST',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-02.wav',
    isLiked: true,
    addedAt: new Date('2024-01-05')
  },
  {
    id: '5',
    title: 'SICKO MODE',
    artist: 'Travis Scott',
    album: 'ASTROWORLD',
    duration: '5:12',
    plays: '650.0M',
    thumbnail: 'https://via.placeholder.com/48x48/1f2937/ffffff?text=SM',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-01.wav',
    isLiked: true,
    addedAt: new Date('2024-01-01')
  },
  {
    id: '6',
    title: 'Watermelon Sugar',
    artist: 'Harry Styles',
    album: 'Fine Line',
    duration: '2:54',
    plays: '590.0M',
    thumbnail: 'https://via.placeholder.com/48x48/1f2937/ffffff?text=WS',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    isLiked: true,
    addedAt: new Date('2023-12-28')
  },
  {
    id: '7',
    title: 'Good 4 U',
    artist: 'Olivia Rodrigo',
    album: 'SOUR',
    duration: '2:58',
    plays: '540.0M',
    thumbnail: 'https://via.placeholder.com/48x48/1f2937/ffffff?text=G4',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-04.wav',
    isLiked: true,
    addedAt: new Date('2023-12-25')
  },
  {
    id: '8',
    title: 'Stay',
    artist: 'The Kid LAROI & Justin Bieber',
    album: 'F*CK LOVE 3: OVER YOU',
    duration: '2:21',
    plays: '480.0M',
    thumbnail: 'https://via.placeholder.com/48x48/1f2937/ffffff?text=ST',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-03.wav',
    isLiked: true,
    addedAt: new Date('2023-12-20')
  }
];

export class MockTracksService {
  static async getLikedTracks(): Promise<Track[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTracks;
  }

  static async toggleLike(trackId: string): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    const track = mockTracks.find(t => t.id === trackId);
    if (track) {
      track.isLiked = !track.isLiked;
      return track.isLiked;
    }
    return false;
  }

  static async searchTracks(query: string): Promise<Track[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (!query.trim()) return mockTracks;
    
    return mockTracks.filter(track =>
      track.title.toLowerCase().includes(query.toLowerCase()) ||
      track.artist.toLowerCase().includes(query.toLowerCase()) ||
      track.album.toLowerCase().includes(query.toLowerCase())
    );
  }
}