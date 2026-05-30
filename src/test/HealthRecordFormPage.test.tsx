import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HealthRecordFormPage } from '../pages/HealthRecordFormPage';
import { healthCheckService, studentService } from '../services';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { toast } from 'sonner';

// Mock Services
vi.mock('../services', async () => {
  const actual = await vi.importActual('../services');
  return {
    ...actual,
    healthCheckService: {
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    studentService: {
      getAllStudents: vi.fn(),
    },
  };
});

// Mock Sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

const mockStudents = [
  { studentId: 1, fullName: 'Nguyễn Minh An', studentCode: 'SV001' },
];

const mockHealthCheck = {
  healthCheckId: 1,
  studentId: 1,
  checkDate: '2024-09-15',
  height: 102.5,
  weight: 16.8,
  eyesight: '10/10',
  dentalStatus: 'Bình thường',
  generalHealth: 'Tốt',
  note: 'Phát triển tốt',
  checkedBy: 'BS Nguyễn Văn A',
};

describe('HealthRecordFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (studentService.getAllStudents as any).mockResolvedValue({ success: true, data: mockStudents });
    (healthCheckService.getById as any).mockResolvedValue({ success: true, data: mockHealthCheck });
  });

  it('renders create form correctly', async () => {
    render(
      <MemoryRouter initialEntries={['/health-records/new']}>
        <Routes>
          <Route path="/health-records/new" element={<HealthRecordFormPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Thêm hồ sơ sức khỏe mới')).toBeInTheDocument();
      expect(screen.getByLabelText(/Học sinh/i)).toBeInTheDocument();
    });
  });

  it('renders edit form with existing data', async () => {
    render(
      <MemoryRouter initialEntries={['/health-records/1/edit']}>
        <Routes>
          <Route path="/health-records/:id/edit" element={<HealthRecordFormPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Chỉnh sửa hồ sơ sức khỏe')).toBeInTheDocument();
      const studentSelect = screen.getByLabelText(/Học sinh/i) as HTMLSelectElement;
      expect(studentSelect.value).toBe('1');
      expect((screen.getByLabelText(/Người thực hiện/i) as HTMLInputElement).value).toBe('BS Nguyễn Văn A');
    });
  });

  it('calculates BMI correctly based on input', async () => {
    render(
      <MemoryRouter initialEntries={['/health-records/new']}>
        <Routes>
          <Route path="/health-records/new" element={<HealthRecordFormPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => screen.getByLabelText(/Chiều cao/i));
    
    const heightInput = screen.getByLabelText(/Chiều cao/i);
    const weightInput = screen.getByLabelText(/Cân nặng/i);
    
    fireEvent.change(heightInput, { target: { value: '100' } });
    fireEvent.change(weightInput, { target: { value: '20' } });
    
    // BMI = 20 / (1.0 * 1.0) = 20.0
    expect(screen.getByText('20.0')).toBeInTheDocument();
  });

  it('validates required fields on save', async () => {
    render(
      <MemoryRouter initialEntries={['/health-records/new']}>
        <Routes>
          <Route path="/health-records/new" element={<HealthRecordFormPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText('Lưu hồ sơ'));
    fireEvent.click(screen.getByText('Lưu hồ sơ'));
    
    expect(toast.warning).toHaveBeenCalledWith('Vui lòng chọn học sinh và nhập người thực hiện');
  });

  it('successfully submits the form', async () => {
    (healthCheckService.create as any).mockResolvedValue({ success: true });

    render(
      <MemoryRouter initialEntries={['/health-records/new']}>
        <Routes>
          <Route path="/health-records/new" element={<HealthRecordFormPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => screen.getByLabelText(/Học sinh/i));
    
    fireEvent.change(screen.getByLabelText(/Học sinh/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/Người thực hiện/i), { target: { value: 'BS Test' } });
    
    fireEvent.click(screen.getByText('Lưu hồ sơ'));
    
    await waitFor(() => {
      expect(healthCheckService.create).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Thêm hồ sơ thành công');
    });
  });
});
