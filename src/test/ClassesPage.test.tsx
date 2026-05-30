import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ClassesPage } from '../pages/ClassesPage';
import { classService, teacherService, studentService, userService, classTeacherService } from '../services';
import { toast } from 'sonner';

// Mock Services
vi.mock('../services', () => ({
  classService: {
    getAllClasses: vi.fn(),
    createClass: vi.fn(),
    updateClass: vi.fn(),
  },
  teacherService: {
    getAllTeachers: vi.fn(),
  },
  studentService: {
    getAllStudents: vi.fn(),
  },
  userService: {
    getActiveUsers: vi.fn(),
  },
  classStudentService: {
    enrollMultipleStudents: vi.fn(),
  },
  classTeacherService: {
    getTeachersByClass: vi.fn(),
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

const mockClasses = [
  {
    classId: 1,
    className: 'Lớp Mầm 1',
    schoolYearId: 2,
    room: 'Phòng A1',
    ageGroup: '3-4 tuổi',
    maxCapacity: 20,
    currentEnrollment: 15,
    isActive: true,
    teacherId: 1,
  },
];

const mockTeachers = [
  { teacherId: 1, fullName: 'Cô giáo Thảo' },
];

const mockStudents = [
  { studentId: 101, fullName: 'Bé Na', dateOfBirth: '2020-05-05', address: 'Hà Nội' },
];

describe('ClassesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (classService.getAllClasses as any).mockResolvedValue({ success: true, data: mockClasses });
    (teacherService.getAllTeachers as any).mockResolvedValue({ success: true, data: mockTeachers });
    (studentService.getAllStudents as any).mockResolvedValue({ success: true, data: mockStudents });
    (userService.getActiveUsers as any).mockResolvedValue({ success: true, data: [] });
    (classTeacherService.getTeachersByClass as any).mockResolvedValue([
      { role: 'Main', teacher: { fullName: 'Cô giáo Thảo' } },
      { role: 'Support', teacher: { fullName: 'Cô giáo Phụ' } }
    ]);
  });

  it('renders page title and fetches data', async () => {
    render(
      <MemoryRouter>
        <ClassesPage />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Quản lý Lớp học')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(classService.getAllClasses).toHaveBeenCalled();
      expect(screen.getByText('Lớp Mầm 1')).toBeInTheDocument();
      expect(screen.getByText('Cô giáo Thảo')).toBeInTheDocument();
    });
  });

  it('successfully creates a new class', async () => {
    (classService.createClass as any).mockResolvedValue({ success: true, data: { classId: 2 } });
    
    render(
      <MemoryRouter>
        <ClassesPage />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText(/Tạo lớp mới/i));
    
    await waitFor(() => expect(screen.getByText('Tạo lớp học mới')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/Tên lớp/i), { target: { value: 'Lớp Chồi 2' } });
    fireEvent.change(screen.getByLabelText(/Phòng học/i), { target: { value: 'Phòng B2' } });
    fireEvent.change(screen.getByLabelText(/Nhóm tuổi/i), { target: { value: '4-5 tuổi' } });
    
    const teacherSelect = screen.getByLabelText(/Giáo viên chủ nhiệm/i);
    fireEvent.change(teacherSelect, { target: { value: '1' } });
    
    fireEvent.click(screen.getByText('Tạo lớp'));
    
    await waitFor(() => {
      expect(classService.createClass).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Tạo lớp học thành công!');
    });
  });

  it('opens edit class dialog', async () => {
    render(
      <MemoryRouter>
        <ClassesPage />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText('Lớp Mầm 1')).toBeInTheDocument());
    
    const editButton = screen.getByLabelText('Edit class');
    fireEvent.click(editButton);
    
    expect(screen.getByText('Chỉnh sửa lớp học')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Lớp Mầm 1')).toBeInTheDocument();
  });
});
