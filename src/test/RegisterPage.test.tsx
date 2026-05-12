import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterPage } from '../pages/RegisterPage';
import { authService } from '../services';
import { BrowserRouter } from 'react-router-dom';

// Mock Services
vi.mock('../services', () => ({
  authService: {
    register: vi.fn(),
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

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderRegisterPage = () => {
    return render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );
  };

  it('renders register form correctly', () => {
    renderRegisterPage();
    
    expect(screen.getByText('Đăng ký tài khoản mới')).toBeInTheDocument();
    expect(screen.getByLabelText(/Họ và tên/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tên đăng nhập/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Số điện thoại/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mật khẩu/i)).toBeInTheDocument();
  });

  it('shows error message on failed registration', async () => {
    (authService.register as any).mockRejectedValue({
      response: { data: { message: 'Username already exists' } }
    });

    renderRegisterPage();

    fireEvent.change(screen.getByLabelText(/Họ và tên/i), { target: { value: 'New User' } });
    fireEvent.change(screen.getByLabelText(/Tên đăng nhập/i), { target: { value: 'existinguser' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@ex.com' } });
    fireEvent.change(screen.getByLabelText(/Số điện thoại/i), { target: { value: '0123456789' } });
    fireEvent.change(screen.getByLabelText(/Mật khẩu/i), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Đăng ký/i }));

    await waitFor(() => {
      expect(screen.getByText('Username already exists')).toBeInTheDocument();
    });
  });

  it('shows success message on successful registration', async () => {
    (authService.register as any).mockResolvedValue({ success: true });

    renderRegisterPage();

    fireEvent.change(screen.getByLabelText(/Họ và tên/i), { target: { value: 'New User' } });
    fireEvent.change(screen.getByLabelText(/Tên đăng nhập/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@ex.com' } });
    fireEvent.change(screen.getByLabelText(/Số điện thoại/i), { target: { value: '0123456789' } });
    fireEvent.change(screen.getByLabelText(/Mật khẩu/i), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Đăng ký/i }));

    await waitFor(() => {
      expect(screen.getByText('Đăng ký thành công!')).toBeInTheDocument();
      expect(screen.getByText(/Bạn sẽ được chuyển hướng/i)).toBeInTheDocument();
    });
  });
});
