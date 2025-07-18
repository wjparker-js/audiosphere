import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LibraryFilters } from '@/components/library/LibraryFilters';
import { FilterType } from '@/types/library';

describe('LibraryFilters', () => {
  const mockProps = {
    activeFilter: 'all' as FilterType,
    onFilterChange: jest.fn(),
    counts: {
      all: 25,
      playlists: 10,
      albums: 8,
      blogs: 7
    },
    loading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all filter tabs with correct labels and counts', () => {
    render(<LibraryFilters {...mockProps} />);
    
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    
    expect(screen.getByText('Playlists')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    
    expect(screen.getByText('Albums')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    
    expect(screen.getByText('Blog Posts')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('highlights active filter', () => {
    render(<LibraryFilters {...mockProps} activeFilter="playlists" />);
    
    const playlistsButton = screen.getByRole('button', { name: /playlists/i });
    expect(playlistsButton).toHaveClass('bg-orange-500');
  });

  it('calls onFilterChange when filter is clicked', async () => {
    const user = userEvent.setup();
    render(<LibraryFilters {...mockProps} />);
    
    const albumsButton = screen.getByRole('button', { name: /albums/i });
    await user.click(albumsButton);
    
    expect(mockProps.onFilterChange).toHaveBeenCalledWith('albums');
  });

  it('shows loading skeleton when loading', () => {
    render(<LibraryFilters {...mockProps} loading={true} />);
    
    const skeletons = screen.getAllByRole('generic');
    expect(skeletons.some(el => el.classList.contains('animate-pulse'))).toBe(true);
  });

  it('has proper button accessibility', () => {
    render(<LibraryFilters {...mockProps} />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
    
    buttons.forEach(button => {
      expect(button).toBeEnabled();
    });
  });

  it('handles zero counts correctly', () => {
    const propsWithZeroCounts = {
      ...mockProps,
      counts: {
        all: 0,
        playlists: 0,
        albums: 0,
        blogs: 0
      }
    };
    
    render(<LibraryFilters {...propsWithZeroCounts} />);
    
    const zeroCountElements = screen.getAllByText('0');
    expect(zeroCountElements).toHaveLength(4);
  });

  it('maintains filter state correctly', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<LibraryFilters {...mockProps} />);
    
    // Click on playlists filter
    const playlistsButton = screen.getByRole('button', { name: /playlists/i });
    await user.click(playlistsButton);
    
    // Rerender with updated active filter
    rerender(<LibraryFilters {...mockProps} activeFilter="playlists" />);
    
    expect(playlistsButton).toHaveClass('bg-orange-500');
  });
});