import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StaffDashboard from '../components/StaffDashboard';
import { mockStaffData } from '../mocks/staff';

describe('StaffDashboard', () => {
  const defaultProps = {
    staffData: mockStaffData
  };

  it('renders without crashing', () => {
    render(<StaffDashboard {...defaultProps} />);
    expect(screen.getByText(/Staff Dashboard/i)).toBeInTheDocument();
  });

  it('displays loading state', () => {
    render(<StaffDashboard staffData={[]} isLoading={true} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays error state', () => {
    const errorMessage = 'Failed to load staff data';
    render(<StaffDashboard staffData={[]} error={errorMessage} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('displays staff statistics', () => {
    render(<StaffDashboard {...defaultProps} />);
    expect(screen.getByText(/Total Staff/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Staff/i)).toBeInTheDocument();
    expect(screen.getByText(/On Leave/i)).toBeInTheDocument();
  });

  it('handles staff search', async () => {
    render(<StaffDashboard {...defaultProps} />);
    const user = userEvent.setup();
    
    const searchInput = screen.getByPlaceholderText(/search staff/i);
    await user.type(searchInput, 'John');
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('handles staff filter', async () => {
    render(<StaffDashboard {...defaultProps} />);
    const user = userEvent.setup();
    
    const filterButton = screen.getByRole('button', { name: /filter/i });
    await user.click(filterButton);
    
    const activeFilter = screen.getByRole('checkbox', { name: /active/i });
    await user.click(activeFilter);
    
    await waitFor(() => {
      expect(screen.getAllByText(/active/i)).toHaveLength(2); // Header + Filter
    });
  });

  it('handles staff sort', async () => {
    render(<StaffDashboard {...defaultProps} />);
    const user = userEvent.setup();
    
    const sortButton = screen.getByRole('button', { name: /sort/i });
    await user.click(sortButton);
    
    const nameSort = screen.getByRole('button', { name: /sort by name/i });
    await user.click(nameSort);
    
    const staffNames = screen.getAllByTestId('staff-name');
    const names = staffNames.map(el => el.textContent);
    expect(names).toEqual([...names].sort());
  });
}); 