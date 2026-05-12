import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StudentsPage } from '../pages/StudentsPage';
import { studentService, classService } from '../services';
import { toast } from 'sonner';

// Mock Services
vi.mock('../services', () => ({
  studentService: {
    getAllStudents: vi.fn(),
    createStudent: vi.fn(),
    updateStudent: vi.fn(),
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

const mockStudents = [
  {
    studentId: 1,
    studentCode: 'HS001',
    fullName: 'Nguyễn Văn A',
    dateOfBirth: '2020-01-01',
    className: 'Lớp Mầm 1',
    isActive: true,
    parents: [{ fullName: 'Nguyễn Văn B' }],
  },
];

const mockClasses = [
  { classId: 1, className: 'Lớp Mầm 1' },
];

describe('StudentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (studentService.getAllStudents as any).mockResolvedValue({ success: true, data: mockStudents });
    (classService.getAllClasses as any).mockResolvedValue({ success: true, data: mockClasses });
  });

  it('renders page title and fetches data', async () => {
    render(<StudentsPage />);
    
    expect(screen.getByText('Quản lý Học sinh')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(studentService.getAllStudents).toHaveBeenCalled();
      expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
    });
  });

  it('successfully creates a new student', async () => {
    (studentService.createStudent as any).mockResolvedValue({ success: true });
    
    render(<StudentsPage />);
    fireEvent.click(screen.getByText(/Thêm học sinh/i));
    
    await waitFor(() => expect(screen.getByText('Thêm học sinh mới')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/Tên học sinh/i), { target: { value: 'Học sinh mới' } });
    fireEvent.change(screen.getByLabelText(/Ngày sinh/i), { target: { value: '2021-02-02' } });
    
    const classSelect = screen.getByLabelText(/Lớp/i);
    fireEvent.change(classSelect, { target: { value: 'Lớp Mầm 1' } }); // value is className in this page
    
    fireEvent.click(screen.getByText('Thêm mới'));
    
    await waitFor(() => {
      expect(studentService.createStudent).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Thêm học sinh mới thành công!');
    });
  });

  it('opens edit student dialog', async () => {
    render(<StudentsPage />);
    await waitFor(() => expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument());
    
    const editButton = screen.getByLabelText('Edit student');
    fireEvent.click(editButton);
    
    expect(screen.getByText('Chỉnh sửa học sinh')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Nguyễn Văn A')).toBeInTheDocument();
  });
});
