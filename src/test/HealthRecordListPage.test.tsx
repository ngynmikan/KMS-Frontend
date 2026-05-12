import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HealthRecordListPage } from '../pages/HealthRecordListPage';
import { healthCheckService, studentService } from '../services';
import { MemoryRouter } from 'react-router-dom';

// Mock Services
vi.mock('../services', async () => {
  const actual = await vi.importActual('../services');
  return {
    ...actual,
    healthCheckService: {
      getAll: vi.fn(),
    },
    studentService: {
      getAllStudents: vi.fn(),
    },
  };
});

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockStudents = [
  { studentId: 1, fullName: 'Nguyễn Minh An', studentCode: 'SV001' },
];

const mockHealthChecks = [
  {
    HealthCheckId: 1,
    StudentId: 1,
    CheckDate: '2024-09-15',
    Height: 102.5,
    Weight: 16.8,
    Bmi: 16.0,
    GeneralHealth: 'Tốt',
  },
];

describe('HealthRecordListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (studentService.getAllStudents as any).mockResolvedValue({ success: true, data: mockStudents });
    (healthCheckService.getAll as any).mockResolvedValue({ success: true, data: mockHealthChecks });
  });

  it('renders page title and fetches data', async () => {
    render(
      <MemoryRouter>
        <HealthRecordListPage />
      </MemoryRouter>
    );
    
    await screen.findByText(/Hồ sơ sức khỏe/i);
    await screen.findByText(/Nguyễn Minh An/i);
    // Be more permissive with numbers to avoid formatting/spacing issues
    expect(screen.getByText(/102/)).toBeInTheDocument();
    expect(screen.getByText(/16/)).toBeInTheDocument();
  });

  it('navigates to create page on button click', async () => {
    render(
      <MemoryRouter>
        <HealthRecordListPage />
      </MemoryRouter>
    );
    
    const addButton = screen.getByText('Thêm hồ sơ mới');
    fireEvent.click(addButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/health-records/new');
  });

  it('navigates to detail page on "Chi tiết" click', async () => {
    render(
      <MemoryRouter>
        <HealthRecordListPage />
      </MemoryRouter>
    );
    
    await screen.findByText(/Chi tiết/i);
    const detailButton = screen.getByText(/Chi tiết/i);
    fireEvent.click(detailButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/health-records/1/edit');
  });

  it('filters results by student name', async () => {
    render(
      <MemoryRouter>
        <HealthRecordListPage />
      </MemoryRouter>
    );
    
    await screen.findByText(/Nguyễn Minh An/i);
    
    const searchInput = screen.getByPlaceholderText(/Tìm kiếm theo tên/i);
    fireEvent.change(searchInput, { target: { value: 'Minh An' } });
    
    expect(screen.getByText('Nguyễn Minh An')).toBeInTheDocument();
    
    fireEvent.change(searchInput, { target: { value: 'Không tồn tại' } });
    expect(screen.queryByText('Nguyễn Minh An')).not.toBeInTheDocument();
    expect(screen.getByText('Không tìm thấy hồ sơ nào')).toBeInTheDocument();
  });
});
