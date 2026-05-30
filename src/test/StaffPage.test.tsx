import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StaffPage } from '../pages/StaffPage';
import { userService, roleService } from '../services';
import { toast } from 'sonner';

// Mock Services
vi.mock('../services', () => ({
  userService: {
    getActiveUsers: vi.fn(),
    updateUser: vi.fn(),
    deactivateUser: vi.fn(),
  },
  roleService: {
    getRoles: vi.fn(),
  },
}));

// Mock Sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

const mockStaff = [
  {
    userId: 1,
    fullName: 'Giáo viên A',
    username: 'gv_a',
    email: 'gv_a@example.com',
    phone: '0123456789',
    isActive: true,
    roles: [{ roleName: 'Teacher' }],
    createdAt: '2023-01-01T00:00:00Z',
  },
];

describe('StaffPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (userService.getActiveUsers as any).mockResolvedValue({ success: true, data: mockStaff });
    (roleService.getRoles as any).mockResolvedValue({ success: true, data: [{ roleId: 1, roleName: 'Teacher' }] });
  });

  it('renders page title and fetches data', async () => {
    render(<StaffPage />);
    
    expect(screen.getByText('Quản lý Nhân sự')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(userService.getActiveUsers).toHaveBeenCalled();
      expect(screen.getByText('Giáo viên A')).toBeInTheDocument();
    });
  });

  it('filters staff by search term', async () => {
    render(<StaffPage />);
    await waitFor(() => expect(screen.getByText('Giáo viên A')).toBeInTheDocument());
    
    const searchInput = screen.getByPlaceholderText(/Tìm kiếm theo tên/i);
    fireEvent.change(searchInput, { target: { value: 'Không tìm thấy' } });
    
    expect(screen.queryByText('Giáo viên A')).not.toBeInTheDocument();
    expect(screen.getByText('Không tìm thấy nhân viên nào.')).toBeInTheDocument();
  });

  it('opens edit staff dialog', async () => {
    render(<StaffPage />);
    await waitFor(() => expect(screen.getByText('Giáo viên A')).toBeInTheDocument());
    
    const editButton = screen.getByLabelText('Edit staff');
    fireEvent.click(editButton);
    
    expect(screen.getByText('Chỉnh sửa nhân viên')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Giáo viên A')).toBeInTheDocument();
  });

  it('successfully updates a staff member', async () => {
    (userService.updateUser as any).mockResolvedValue({ success: true });
    
    render(<StaffPage />);
    await waitFor(() => expect(screen.getByText('Giáo viên A')).toBeInTheDocument());
    
    fireEvent.click(screen.getByLabelText('Edit staff'));
    
    fireEvent.change(screen.getByLabelText(/Tên nhân viên/i), { target: { value: 'Giáo viên A Updated' } });
    fireEvent.click(screen.getByText('Cập nhật'));
    
    await waitFor(() => {
      expect(userService.updateUser).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Cập nhật thông tin nhân viên thành công!');
    });
  });

  it('toggles staff status', async () => {
    (userService.deactivateUser as any).mockResolvedValue({ success: true });
    
    render(<StaffPage />);
    await waitFor(() => expect(screen.getByText('Giáo viên A')).toBeInTheDocument());
    
    const toggleButton = screen.getByLabelText('Toggle status');
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(userService.deactivateUser).toHaveBeenCalledWith('1');
    });
  });
});
