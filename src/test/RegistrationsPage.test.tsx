import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegistrationsPage } from '../pages/RegistrationsPage';
import { parentRegistrationService, classService } from '../services';
import { toast } from 'sonner';

// Mock Services
vi.mock('../services', () => ({
  parentRegistrationService: {
    getAllRegistrations: vi.fn(),
    approveRegistration: vi.fn(),
    rejectRegistration: vi.fn(),
  },
  classService: {
    getAllClasses: vi.fn(),
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

const mockRegistrations = [
  {
    registrationId: 1,
    parentName: 'Phụ huynh A',
    phoneNumber: '0987654321',
    email: 'parentA@example.com',
    childName: 'Bé A',
    childDateOfBirth: '2021-01-01',
    childGender: 'Male',
    intendedStartDate: '2026-09-01',
    status: 'Pending',
    createdAt: new Date().toISOString(),
  },
];

const mockClasses = [
  { classId: 1, className: 'Lớp Mầm 1' },
];

describe('RegistrationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (parentRegistrationService.getAllRegistrations as any).mockResolvedValue({ success: true, data: mockRegistrations });
    (classService.getAllClasses as any).mockResolvedValue({ success: true, data: mockClasses });
  });

  it('renders page title and fetches registrations', async () => {
    render(<RegistrationsPage />);
    
    expect(screen.getByText('Quản lý Tuyển sinh')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(parentRegistrationService.getAllRegistrations).toHaveBeenCalled();
      expect(screen.getByText('Phụ huynh A')).toBeInTheDocument();
      expect(screen.getByText('Bé A')).toBeInTheDocument();
    });
  });

  it('filters registrations by search term', async () => {
    render(<RegistrationsPage />);
    await waitFor(() => expect(screen.getByText('Phụ huynh A')).toBeInTheDocument());
    
    const searchInput = screen.getByPlaceholderText(/Tìm phụ huynh/i);
    fireEvent.change(searchInput, { target: { value: 'Bé B' } });
    
    expect(screen.queryByText('Phụ huynh A')).not.toBeInTheDocument();
    expect(screen.getByText('Không tìm thấy dữ liệu đăng ký nào.')).toBeInTheDocument();
  });

  it('opens registration details dialog', async () => {
    render(<RegistrationsPage />);
    await waitFor(() => expect(screen.getByText('Chi tiết')).toBeInTheDocument());
    
    const detailButton = screen.getByText('Chi tiết');
    fireEvent.click(detailButton);
    
    expect(screen.getByText(/Đơn đăng ký #1/i)).toBeInTheDocument();
    expect(screen.getByText('Thông tin phụ huynh')).toBeInTheDocument();
  });

  it('successfully approves a registration', async () => {
    (parentRegistrationService.approveRegistration as any).mockResolvedValue({ success: true });
    
    render(<RegistrationsPage />);
    await waitFor(() => expect(screen.getByText('Chi tiết')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Chi tiết'));
    
    await waitFor(() => expect(screen.getByText('Tiếp nhận hồ sơ')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Tiếp nhận hồ sơ'));
    
    // Wait for approve modal
    await waitFor(() => expect(screen.getByText('XÁC NHẬN TIẾP NHẬN')).toBeInTheDocument());
    fireEvent.click(screen.getByText('XÁC NHẬN TIẾP NHẬN'));
    
    await waitFor(() => {
      expect(parentRegistrationService.approveRegistration).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Đã duyệt đơn đăng ký');
    });
  });

  it('successfully rejects a registration', async () => {
    (parentRegistrationService.rejectRegistration as any).mockResolvedValue({ success: true });
    
    render(<RegistrationsPage />);
    await waitFor(() => expect(screen.getByText('Chi tiết')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Chi tiết'));
    
    await waitFor(() => expect(screen.getByText('Từ chối hồ sơ')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Từ chối hồ sơ'));
    
    // Wait for reject modal
    await waitFor(() => expect(screen.getByText('XÁC NHẬN TỪ CHỐI')).toBeInTheDocument());
    
    // Fill reason
    const reasonInput = screen.getByPlaceholderText(/Lý do từ chối/i);
    fireEvent.change(reasonInput, { target: { value: 'Lớp đã đầy' } });
    
    fireEvent.click(screen.getByText('XÁC NHẬN TỪ CHỐI'));
    
    await waitFor(() => {
      expect(parentRegistrationService.rejectRegistration).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Đã từ chối đơn đăng ký');
    });
  });
});
