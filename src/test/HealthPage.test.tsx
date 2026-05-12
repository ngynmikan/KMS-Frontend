import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HealthPage } from '../pages/HealthPage';
import { healthCheckService, medicalIncidentService, studentService } from '../services';
import { toast } from 'sonner';

// Mock Services
vi.mock('../services', () => ({
  healthCheckService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  medicalIncidentService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  studentService: {
    getAllStudents: vi.fn(),
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

const mockStudents = [
  { studentId: 1, fullName: 'Học sinh A' },
];

const mockHealthChecks = [
  {
    HealthCheckId: 1,
    StudentId: 1,
    CheckDate: new Date().toISOString(),
    Height: 110,
    Weight: 18,
    EyeSight: 'Tốt',
    DentalStatus: 'Bình thường',
    GeneralHealth: 'Tốt',
    Note: 'Khỏe mạnh',
    CheckedBy: 'Bác sĩ A',
    Bmi: 14.8,
  },
];

const mockIncidents = [
  {
    id: 1,
    studentId: 1,
    incidentDate: new Date().toISOString(),
    description: 'Trầy xước nhẹ',
    actionTaken: 'Sát trùng',
    reportedBy: 'Cô giáo B',
  },
];

describe('HealthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (studentService.getAllStudents as any).mockResolvedValue({ success: true, data: mockStudents });
    (healthCheckService.getAll as any).mockResolvedValue({ success: true, data: mockHealthChecks });
    (medicalIncidentService.getAll as any).mockResolvedValue({ success: true, data: mockIncidents });
  });

  it('renders page title and fetches health data', async () => {
    render(<HealthPage />);
    
    expect(screen.getByText('Quản lý Sức khỏe')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(healthCheckService.getAll).toHaveBeenCalled();
      expect(screen.getByText('110cm / 18kg')).toBeInTheDocument();
    });
  });

  it('switches between tabs and shows correct data', async () => {
    render(<HealthPage />);
    
    await waitFor(() => expect(screen.getByText('Kiểm tra định kỳ')).toBeInTheDocument());
    
    const incidentsTab = screen.getByText('Sự cố y tế');
    fireEvent.click(incidentsTab);
    
    await waitFor(() => {
      expect(screen.getByText('Trầy xước nhẹ')).toBeInTheDocument();
      expect(screen.getByText('Sát trùng')).toBeInTheDocument();
    });
  });

  it('opens add health check dialog', async () => {
    render(<HealthPage />);
    const addButton = screen.getByText(/Lên lịch kiểm tra/i);
    fireEvent.click(addButton);
    
    expect(screen.getByText('Thêm mới Phiếu kiểm tra sức khỏe')).toBeInTheDocument();
  });

  it('successfully creates a new medical incident', async () => {
    (medicalIncidentService.create as any).mockResolvedValue({ success: true });

    render(<HealthPage />);
    fireEvent.click(screen.getByText('Sự cố y tế'));

    await waitFor(() => expect(screen.getByText(/Ghi nhận sự cố/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Ghi nhận sự cố/i));

    // Wait for dialog
    await waitFor(() => expect(screen.getByText('Thêm mới Bản ghi sự cố y tế')).toBeInTheDocument());

    // Select student using the id we added to HealthPage
    const studentSelect = document.getElementById('health-studentId') as HTMLSelectElement;
    fireEvent.change(studentSelect, { target: { value: '1' } });

    const reportedByInput = document.getElementById('incident-reportedBy') as HTMLInputElement;
    fireEvent.change(reportedByInput, { target: { value: 'Cô giáo C' } });

    const descriptionInput = document.getElementById('incident-description') as HTMLInputElement;
    fireEvent.change(descriptionInput, { target: { value: 'Sốt nhẹ' } });

    const actionInput = document.getElementById('incident-actionTaken') as HTMLInputElement;
    fireEvent.change(actionInput, { target: { value: 'Cho uống nước gừng' } });

    fireEvent.click(screen.getByText('Lưu thông tin'));

    await waitFor(() => {
      expect(medicalIncidentService.create).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Thêm bản ghi sự cố thành công');
    });
  });
});
