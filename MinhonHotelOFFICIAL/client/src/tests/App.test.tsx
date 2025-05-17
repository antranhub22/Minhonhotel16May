import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/Mi Nhon Hotel Voice Assistant/i)).toBeInTheDocument();
  });

  it('renders navigation menu', () => {
    render(<App />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders main content area', () => {
    render(<App />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('handles navigation clicks', async () => {
    render(<App />);
    const user = userEvent.setup();
    
    // Test navigation to different sections
    const navLinks = screen.getAllByRole('link');
    for (const link of navLinks) {
      await user.click(link);
      expect(window.location.pathname).toBe(link.getAttribute('href'));
    }
  });

  it('handles theme toggle', async () => {
    render(<App />);
    const user = userEvent.setup();
    
    const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(themeToggle);
    
    // Check if theme class is updated
    expect(document.documentElement).toHaveClass('dark');
  });
}); 