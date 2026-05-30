import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScheduleDetailPage } from '../pages/ScheduleDetailPage';
import { timetableService, teacherService, classService } from '../services';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock Services
vi.mock('../services', async () => {
  const actual = await vi.importActual('../services');
  return {
    ...actual,
    timetableService: {
      getById: vi.fn(),
    },
    teacherService: {
      getTeacherById: vi.fn(),
    },
    classService: {
      getClassById: vi.fn(),
    },
  };
});

const mockTimetable = {
  id: 1,
  subject: 'Vẽ - Học vẽ phong cảnh',
  startTime: '08:00',
  endTime: '09:00',
  dayOfWeek: 1,
  room: 'Phòng 101',
  teacherId: 10,
  classId: 5
};

const mockTeacher = { teacherId: 10, fullName: 'Cô Nguyễn Thị Mỹ' };
const mockClass = { classId: 5, className: 'Lớp Chồi 2' };

describe('ScheduleDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (timetableService.getById as any).mockResolvedValue({ success: true, data: mockTimetable });
    (teacherService.getTeacherById as any).mockResolvedValue({ success: true, data: mockTeacher });
    (classService.getClassById as any).mockResolvedValue({ success: true, data: mockClass });
  });

  it('renders detail page and splits subject correctly', async () => {
    render(
      <MemoryRouter initialEntries={['/schedule/1']}>
        <Routes>
          <Route path="/schedule/:id" element={<ScheduleDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Vẽ')).toBeInTheDocument();
      expect(screen.getByText('Học vẽ phong cảnh')).toBeInTheDocument();
      expect(screen.getByText('Cô Nguyễn Thị Mỹ')).toBeInTheDocument();
      expect(screen.getByText('Lớp Chồi 2')).toBeInTheDocument();
      expect(screen.getByText('08:00 - 09:00')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    render(
      <MemoryRouter initialEntries={['/schedule/1']}>
        <Routes>
          <Route path="/schedule/:id" element={<ScheduleDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Đang tải chi tiết bài học/i)).toBeInTheDocument();
  });
});
