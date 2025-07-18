import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContentCard } from '@/components/library/ContentCard';
import { Album, Playlist, BlogPost } from '@/types/library';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}));

// Mock OptimizedImage
jest.mock('@/components/ui/optimized-image', () => ({
  OptimizedImage: ({ alt, className }: any) => (
    <div className={className} data-testid="optimized-image" aria-label={alt} />
  )
}));

describe('ContentCard', () => {
  const mockAlbum: Album = {
    id: '1',
    type: 'album',
    title: 'Test Album',
    artist: 'Test Artist',
    coverArt: '/test-cover.jpg',
    trackCount: 12,
    genre: 'Rock',
    status: 'published',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
    userId: 'user1'
  };

  const mockPlaylist: Playlist = {
    id: '2',
    type: 'playlist',
    title: 'Test Playlist',
    trackCount: 25,
    isPublic: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
    userId: 'user1'
  };

  const mockBlogPost: BlogPost = {
    id: '3',
    type: 'blog',
    title: 'Test Blog Post',
    excerpt: 'This is a test blog post excerpt...',
    status: 'published',
    publishedAt: new Date('2023-01-01'),
    viewCount: 100,
    commentCount: 5,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
    userId: 'user1'
  };

  const mockProps = {
    onAction: jest.fn(),
    selected: false,
    onSelect: jest.fn(),
    showCheckbox: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Album Card', () => {
    it('renders album information correctly', () => {
      render(<ContentCard content={mockAlbum} {...mockProps} />);
      
      expect(screen.getByText('Test Album')).toBeInTheDocument();
      expect(screen.getByText('Test Artist • 12 tracks')).toBeInTheDocument();
      expect(screen.getByText('Published')).toBeInTheDocument();
      expect(screen.getByText('Album')).toBeInTheDocument();
    });

    it('shows singular track text for one track', () => {
      const singleTrackAlbum = { ...mockAlbum, trackCount: 1 };
      render(<ContentCard content={singleTrackAlbum} {...mockProps} />);
      
      expect(screen.getByText('Test Artist • 1 track')).toBeInTheDocument();
    });
  });

  describe('Playlist Card', () => {
    it('renders playlist information correctly', () => {
      render(<ContentCard content={mockPlaylist} {...mockProps} />);
      
      expect(screen.getByText('Test Playlist')).toBeInTheDocument();
      expect(screen.getByText('25 tracks')).toBeInTheDocument();
      expect(screen.getByText('Public')).toBeInTheDocument();
      expect(screen.getByText('Playlist')).toBeInTheDocument();
    });

    it('shows private status for private playlists', () => {
      const privatePlaylist = { ...mockPlaylist, isPublic: false };
      render(<ContentCard content={privatePlaylist} {...mockProps} />);
      
      expect(screen.getByText('Private')).toBeInTheDocument();
    });
  });

  describe('Blog Post Card', () => {
    it('renders blog post information correctly', () => {
      render(<ContentCard content={mockBlogPost} {...mockProps} />);
      
      expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
      expect(screen.getByText('This is a test blog post excerpt...')).toBeInTheDocument();
      expect(screen.getByText('Published')).toBeInTheDocument();
      expect(screen.getByText('Blog')).toBeInTheDocument();
    });

    it('shows draft status for draft posts', () => {
      const draftPost = { ...mockBlogPost, status: 'draft' as const };
      render(<ContentCard content={draftPost} {...mockProps} />);
      
      expect(screen.getByText('Draft')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onAction with view when card is clicked', async () => {
      const user = userEvent.setup();
      render(<ContentCard content={mockAlbum} {...mockProps} />);
      
      const card = screen.getByRole('generic');
      await user.click(card);
      
      expect(mockProps.onAction).toHaveBeenCalledWith('view', mockAlbum);
    });

    it('shows selection checkbox when showCheckbox is true', () => {
      render(<ContentCard content={mockAlbum} {...mockProps} showCheckbox={true} />);
      
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('calls onSelect when checkbox is clicked', async () => {
      const user = userEvent.setup();
      render(<ContentCard content={mockAlbum} {...mockProps} showCheckbox={true} />);
      
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      
      expect(mockProps.onSelect).toHaveBeenCalledWith(true);
    });

    it('shows selected state when selected prop is true', () => {
      render(<ContentCard content={mockAlbum} {...mockProps} selected={true} showCheckbox={true} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });

    it('prevents event propagation when checkbox is clicked', async () => {
      const user = userEvent.setup();
      render(<ContentCard content={mockAlbum} {...mockProps} showCheckbox={true} />);
      
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      
      // onAction should not be called when checkbox is clicked
      expect(mockProps.onAction).not.toHaveBeenCalled();
      expect(mockProps.onSelect).toHaveBeenCalled();
    });
  });

  describe('Content Type Badges', () => {
    it('shows correct badge for each content type', () => {
      const { rerender } = render(<ContentCard content={mockAlbum} {...mockProps} />);
      expect(screen.getByText('Album')).toBeInTheDocument();
      
      rerender(<ContentCard content={mockPlaylist} {...mockProps} />);
      expect(screen.getByText('Playlist')).toBeInTheDocument();
      
      rerender(<ContentCard content={mockBlogPost} {...mockProps} />);
      expect(screen.getByText('Blog')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper image alt text', () => {
      render(<ContentCard content={mockAlbum} {...mockProps} />);
      
      const image = screen.getByTestId('optimized-image');
      expect(image).toHaveAttribute('aria-label', 'Test Album');
    });

    it('has proper checkbox accessibility', () => {
      render(<ContentCard content={mockAlbum} {...mockProps} showCheckbox={true} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });
  });
});