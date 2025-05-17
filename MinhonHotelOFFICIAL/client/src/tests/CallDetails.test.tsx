import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CallDetails from '../components/CallDetails';
import { mockCallData } from '../mocks/calls';

describe('CallDetails', () => {
  const defaultProps = {
    callData: mockCallData
  };

  it('renders without crashing', () => {
    render(<CallDetails {...defaultProps} />);
    expect(screen.getByText(/Call Details/i)).toBeInTheDocument();
  });

  it('displays loading state', () => {
    render(<CallDetails callData={null} isLoading={true} />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays error state', () => {
    const errorMessage = 'Failed to load call details';
    render(<CallDetails callData={null} error={errorMessage} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('displays call information', () => {
    render(<CallDetails {...defaultProps} />);
    const call = mockCallData;
    
    expect(screen.getByText(call.callerName)).toBeInTheDocument();
    expect(screen.getByText(call.phoneNumber)).toBeInTheDocument();
    expect(screen.getByText(call.callType)).toBeInTheDocument();
    expect(screen.getByText(call.duration)).toBeInTheDocument();
  });

  it('handles call status update', async () => {
    const onStatusUpdate = jest.fn();
    render(<CallDetails {...defaultProps} onStatusUpdate={onStatusUpdate} />);
    const user = userEvent.setup();
    
    const statusSelect = screen.getByRole('combobox', { name: /call status/i });
    await user.selectOptions(statusSelect, 'completed');
    
    expect(onStatusUpdate).toHaveBeenCalledWith('completed');
  });

  it('handles notes update', async () => {
    const onNotesUpdate = jest.fn();
    render(<CallDetails {...defaultProps} onNotesUpdate={onNotesUpdate} />);
    const user = userEvent.setup();
    
    const notesInput = screen.getByRole('textbox', { name: /call notes/i });
    await user.type(notesInput, 'Test note');
    
    await waitFor(() => {
      expect(onNotesUpdate).toHaveBeenCalledWith('Test note');
    });
  });

  it('handles call recording playback', async () => {
    render(<CallDetails {...defaultProps} />);
    const user = userEvent.setup();
    
    const playButton = screen.getByRole('button', { name: /play recording/i });
    await user.click(playButton);
    
    expect(screen.getByTestId('audio-player')).toHaveAttribute('src', mockCallData.recordingUrl);
  });
}); 