import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/testUtils';
import { LoginScreen } from '../LoginScreen';

// Mock the auth context
const mockLogin = vi.fn();
const mockLoginWithUniversity = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    loginWithUniversity: mockLoginWithUniversity,
    loading: false,
  }),
}));

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('LoginScreen Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form elements', () => {
    render(<LoginScreen />);
    
    expect(screen.getByText('Campus Connect')).toBeInTheDocument();
    expect(screen.getByText('Find your college friends and study buddies')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in with university/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('handles university login', async () => {
    render(<LoginScreen />);
    
    const universityButton = screen.getByRole('button', { name: /sign in with university/i });
    fireEvent.click(universityButton);
    
    expect(mockLoginWithUniversity).toHaveBeenCalledTimes(1);
  });

  it('handles email login form submission', async () => {
    render(<LoginScreen />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@university.edu' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@university.edu', 'password123');
    });
  });

  it('toggles between login and signup', () => {
    render(<LoginScreen />);
    
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText("Don't have an account? Sign up")).toBeInTheDocument();
    
    fireEvent.click(screen.getByText("Don't have an account? Sign up"));
    
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByText('Already have an account? Sign in')).toBeInTheDocument();
  });

  it('validates form inputs', async () => {
    const toast = await import('react-hot-toast');
    render(<LoginScreen />);
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(toast.default.error).toHaveBeenCalledWith('Please fill in all fields');
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });
});
