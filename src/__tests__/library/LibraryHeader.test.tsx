import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LibraryHeader } from '@/components/library/LibraryHeader';

// Mock the useDebounce hook
jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value
}));

describe('LibraryHeader', () => {
  const mockProps = {
    onSearch: jest.fn(),
    onAddContent: jest.fn(),
    searchQuery: '',
    totalItems: 10,
    loading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders header with correct title and item count', () => {
    render(<LibraryHeader {...mockProps} />);
    
    expect(screen.getByText('Your Library')).toBeInTheDocument();
    expect(screen.getByText('10 items')).toBeInTheDocument();
  });

  it('displays singular item text when count is 1', () => {
    render(<LibraryHeader {...mockProps} totalItems={1} />);
    
    expect(screen.getByText('1 item')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<LibraryHeader {...mockProps} loading={true} />);
    
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('calls onSearch when user types in search input', async () => {
    const user = userEvent.setup();
    render(<LibraryHeader {...mockProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search your library...');
    await user.type(searchInput, 'test query');
    
    expect(searchInput).toHaveValue('test query');
  });

  it('shows clear button when search has value', async () => {
    const user = userEvent.setup();
    render(<LibraryHeader {...mockProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search your library...');
    await user.type(searchInput, 'test');
    
    expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
  });

  it('clears search when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<LibraryHeader {...mockProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search your library...');
    await user.type(searchInput, 'test');
    
    const clearButton = screen.getByRole('button', { name: 'Clear search' });
    await user.click(clearButton);
    
    expect(searchInput).toHaveValue('');
    expect(mockProps.onSearch).toHaveBeenCalledWith('');
  });

  it('calls onAddContent when add button is clicked', async () => {
    const user = userEvent.setup();
    render(<LibraryHeader {...mockProps} />);
    
    const addButton = screen.getByRole('button', { name: 'Add content' });
    await user.click(addButton);
    
    expect(mockProps.onAddContent).toHaveBeenCalled();
  });

  it('displays search query from props', () => {
    render(<LibraryHeader {...mockProps} searchQuery="existing query" />);
    
    const searchInput = screen.getByPlaceholderText('Search your library...');
    expect(searchInput).toHaveValue('existing query');
  });

  it('has proper accessibility attributes', () => {
    render(<LibraryHeader {...mockProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search your library...');
    expect(searchInput).toHaveAttribute('type', 'text');
    
    const addButton = screen.getByRole('button', { name: 'Add content' });
    expect(addButton).toHaveAttribute('title', 'Add content');
  });
});