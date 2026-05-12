import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginPage } from '../pages/LoginPage';
import { authService } from '../services';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// Mock Services
vi.mock('../services', () => ({
  authService: {
    login: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLoginPage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('renders login form correctly', () => {
    renderLoginPage();
    
    expect(screen.getByText('Mầm Non Hoa Mai')).toBeInTheDocument();
    expect(screen.getByLabelText(/Tên đăng nhập/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mật khẩu/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Đăng nhập/i })).toBeInTheDocument();
  });

  it('shows error message on failed login', async () => {
    (authService.login as any).mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } }
    });

    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/Tên đăng nhập/i), { target: { value: 'wronguser' } });
    fireEvent.change(screen.getByLabelText(/Mật khẩu/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Đăng nhập/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('navigates to dashboard on successful login', async () => {
    (authService.login as any).mockResolvedValue({
      data: {
        token: 'fake-token',
        user: { id: 1, name: 'Admin', role: 'admin' }
      }
    });

    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/Tên đăng nhập/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/Mật khẩu/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /Đăng nhập/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        username: 'admin',
        password: 'password'
      });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('toggles password visibility', () => {
    renderLoginPage();
    
    const passwordInput = screen.getByLabelText(/Mật khẩu/i) as HTMLInputElement;
    expect(passwordInput.type).toBe('password');
    
    const toggleButton = screen.getByRole('button', { name: '' }); // The Eye icon button
    fireEvent.click(toggleButton);
    
    expect(passwordInput.type).toBe('text');
    
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });
});
