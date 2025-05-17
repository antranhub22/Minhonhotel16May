import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Reference from '../components/Reference';
import { mockReferences } from '../mocks/references';

describe('Reference', () => {
  const defaultProps = {
    references: mockReferences
  };

  it('renders without crashing', () => {
    render(<Reference {...defaultProps} />);
    expect(screen.getByText(/Reference/i)).toBeInTheDocument();
  });

  it('displays loading state', () => {
    render(<Reference references={[]} isLoading={true} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays error state', () => {
    const errorMessage = 'Failed to load references';
    render(<Reference references={[]} error={errorMessage} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('displays reference items', () => {
    render(<Reference {...defaultProps} />);
    mockReferences.forEach(reference => {
      expect(screen.getByText(reference.title)).toBeInTheDocument();
    });
  });

  it('handles reference item click', async () => {
    const onReferenceClick = jest.fn();
    render(<Reference {...defaultProps} onReferenceClick={onReferenceClick} />);
    
    const user = userEvent.setup();
    const firstReference = screen.getByText(mockReferences[0].title);
    await user.click(firstReference);
    
    expect(onReferenceClick).toHaveBeenCalledWith(mockReferences[0]);
  });

  it('handles search input', async () => {
    render(<Reference {...defaultProps} />);
    const user = userEvent.setup();
    
    const searchInput = screen.getByPlaceholderText(/search references/i);
    await user.type(searchInput, 'test');
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('test')).toBeInTheDocument();
    });
  });
}); 