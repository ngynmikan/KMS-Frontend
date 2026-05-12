import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AccountManagementPage } from '../pages/AccountManagementPage';
import { userService } from '../services';

// Mock Services
vi.mock('../services', () => ({
  userService: {
    getPendingUsers: vi.fn(),
    getActiveUsers: vi.fn(),
    getInactiveUsers: vi.fn(),
    approveUser: vi.fn(),
    activateUser: vi.fn(),
    deactivateUser: vi.fn(),
  },
}));

const mockPending = [
  { userId: 1, fullName: 'User Pending', username: 'pending1', email: 'p@ex.com', isActive: false, roles: [] },
];
const mockActive = [
  { userId: 2, fullName: 'User Active', username: 'active1', email: 'a@ex.com', isActive: true, roles: [{ roleName: 'Admin' }] },
];
const mockInactive = [
  { userId: 3, fullName: 'User Inactive', username: 'inactive1', email: 'i@ex.com', isActive: false, roles: [] },
];

describe('AccountManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (userService.getPendingUsers as any).mockResolvedValue({ success: true, data: mockPending });
    (userService.getActiveUsers as any).mockResolvedValue({ success: true, data: mockActive });
    (userService.getInactiveUsers as any).mockResolvedValue({ success: true, data: mockInactive });
  });

  it('renders page title and fetches all user types', async () => {
    render(<AccountManagementPage />);
    
    expect(screen.getByText('Quản lý tài khoản')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(userService.getPendingUsers).toHaveBeenCalled();
      expect(userService.getActiveUsers).toHaveBeenCalled();
      expect(userService.getInactiveUsers).toHaveBeenCalled();
      
      expect(screen.getByText('User Pending')).toBeInTheDocument();
      expect(screen.getByText('User Active')).toBeInTheDocument();
      expect(screen.getByText('User Inactive')).toBeInTheDocument();
    });
  });

  it('filters users by status', async () => {
    render(<AccountManagementPage />);
    await waitFor(() => expect(screen.getByText('User Active')).toBeInTheDocument());
    
    const statusSelect = screen.getByRole('combobox');
    fireEvent.change(statusSelect, { target: { value: 'active' } });
    
    expect(screen.getByText('User Active')).toBeInTheDocument();
    expect(screen.queryByText('User Pending')).not.toBeInTheDocument();
  });

  it('approves a pending user', async () => {
    (userService.approveUser as any).mockResolvedValue({ success: true });
    
    render(<AccountManagementPage />);
    await waitFor(() => expect(screen.getByText('User Pending')).toBeInTheDocument());
    
    const approveButton = screen.getByText('Phê duyệt');
    fireEvent.click(approveButton);
    
    await waitFor(() => {
      expect(userService.approveUser).toHaveBeenCalledWith(1);
    });
  });

  it('deactivates an active user', async () => {
    (userService.deactivateUser as any).mockResolvedValue({ success: true });
    
    render(<AccountManagementPage />);
    await waitFor(() => expect(screen.getByText('User Active')).toBeInTheDocument());
    
    const deactivateButton = screen.getByText('Vô hiệu hóa');
    fireEvent.click(deactivateButton);
    
    await waitFor(() => {
      expect(userService.deactivateUser).toHaveBeenCalledWith(2);
    });
  });
});
