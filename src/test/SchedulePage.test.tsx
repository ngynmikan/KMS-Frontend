import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { SchedulePage } from '../pages/SchedulePage';
import { classService, teacherService, semesterService, timetableService } from '../services';
import { toast } from 'sonner';

// Mock Services
vi.mock('../services', () => ({
  classService: {
    getAllClasses: vi.fn(),
  },
  teacherService: {
    getAllTeachers: vi.fn(),
  },
  semesterService: {
    getAllSemesters: vi.fn(),
  },
  timetableService: {
    getByClass: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock Sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockClasses = [
  { classId: 1, className: 'Lớp Mầm 1' },
  { classId: 2, className: 'Lớp Chồi 2' },
];

const mockTeachers = [
  { teacherId: 1, fullName: 'Nguyễn Văn A' },
  { teacherId: 2, fullName: 'Trần Thị B' },
];

const mockSemesters = [
  { id: 1, name: 'Học kỳ 1', academicYear: '2023-2024', isActive: true },
];

const mockTimetable = [
  {
    id: 1,
    classId: 1,
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '09:00',
    subject: 'Toán',
    room: '101',
    teacherId: 1,
  },
];

describe('SchedulePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    (classService.getAllClasses as any).mockResolvedValue({ success: true, data: mockClasses });
    (teacherService.getAllTeachers as any).mockResolvedValue({ success: true, data: mockTeachers });
    (semesterService.getAllSemesters as any).mockResolvedValue({ success: true, data: mockSemesters });
    (timetableService.getByClass as any).mockResolvedValue({ success: true, data: mockTimetable });
  });

  const waitForLoadingToFinish = async () => {
    await waitFor(() => {
      expect(classService.getAllClasses).toHaveBeenCalled();
      expect(screen.getByText('Lớp Mầm 1')).toBeInTheDocument();
    });
  };

  it('renders the page header and fetches initial data', async () => {
    render(
      <MemoryRouter>
        <SchedulePage />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Lịch học tuần')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(classService.getAllClasses).toHaveBeenCalled();
      expect(teacherService.getAllTeachers).toHaveBeenCalled();
      expect(semesterService.getAllSemesters).toHaveBeenCalled();
    });
  });

  it('displays the classes in the select dropdown', async () => {
    render(
      <MemoryRouter>
        <SchedulePage />
      </MemoryRouter>
    );
    await waitForLoadingToFinish();
    
    expect(screen.getByText('Lớp Mầm 1')).toBeInTheDocument();
    expect(screen.getByText('Lớp Chồi 2')).toBeInTheDocument();
  });

  it('loads the timetable when a class is selected', async () => {
    render(
      <MemoryRouter>
        <SchedulePage />
      </MemoryRouter>
    );
    await waitForLoadingToFinish();
    
    await waitFor(() => {
      expect(timetableService.getByClass).toHaveBeenCalledWith(1);
      expect(screen.getByText('Toán')).toBeInTheDocument();
    });
  });

  it('opens the add entry modal when "Thêm tiết học" is clicked', async () => {
    render(
      <MemoryRouter>
        <SchedulePage />
      </MemoryRouter>
    );
    await waitForLoadingToFinish();
    
    const addButton = screen.getByText(/Thêm tiết học/i);
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText('Thêm tiết học mới')).toBeInTheDocument();
    });
  });

  it('successfully creates a new timetable entry', async () => {
    (timetableService.create as any).mockResolvedValue({ success: true });
    
    render(
      <MemoryRouter>
        <SchedulePage />
      </MemoryRouter>
    );
    await waitForLoadingToFinish();
    
    // Open modal
    fireEvent.click(screen.getByText(/Thêm tiết học/i));
    
    // Wait for modal to appear
    await waitFor(() => expect(screen.getByText('Thêm tiết học mới')).toBeInTheDocument());
    
    // Fill form
    const subjectInput = screen.getByPlaceholderText(/VD: Học vẽ/i);
    fireEvent.change(subjectInput, { target: { value: 'Âm nhạc' } });
    
    const roomInput = screen.getByPlaceholderText(/VD: 101/i);
    fireEvent.change(roomInput, { target: { value: '202' } });
    
    // Select teacher
    const teacherSelect = screen.getByLabelText(/Giáo viên giảng dạy/i);
    fireEvent.change(teacherSelect, { target: { value: '1' } });
    
    // Submit
    const saveButton = screen.getByText('Lưu lại');
    expect(saveButton).not.toBeDisabled();
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(timetableService.create).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Thêm mới thành công');
    });
  });

  it('successfully deletes a timetable entry', async () => {
    (timetableService.delete as any).mockResolvedValue({ success: true });
    window.confirm = vi.fn().mockReturnValue(true);
    
    render(
      <MemoryRouter>
        <SchedulePage />
      </MemoryRouter>
    );
    await waitForLoadingToFinish();
    
    await waitFor(() => {
      expect(screen.getByText('Toán')).toBeInTheDocument();
    });

    const deleteButton = screen.getByLabelText('Xóa tiết học');
    fireEvent.click(deleteButton);
    
    // Now handle the modal
    await waitFor(() => expect(screen.getByText(/Bạn có chắc chắn muốn xóa/i)).toBeInTheDocument());
    const confirmButton = screen.getByRole('button', { name: 'Xóa' });
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(timetableService.delete).toHaveBeenCalledWith(1);
      expect(toast.success).toHaveBeenCalledWith('Xóa thành công');
    });
  });
});
