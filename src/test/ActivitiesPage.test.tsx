import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActivitiesPage } from '../pages/ActivitiesPage';
import { classActivityService, classService } from '../services';
import { toast } from 'sonner';

// Mock Services
vi.mock('../services', () => ({
  classActivityService: {
    getAllActivities: vi.fn(),
    createActivity: vi.fn(),
    updateActivity: vi.fn(),
    deleteActivity: vi.fn(),
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

const mockActivities = [
  {
    activityId: 1,
    classId: 1,
    title: 'Hoạt động vẽ tranh',
    content: 'Các bé tập vẽ tranh phong cảnh',
    activityDate: new Date().toISOString(),
    photos: [{ photoUrl: 'https://example.com/photo.jpg' }],
  },
];

const mockClasses = [
  { classId: 1, className: 'Lớp Mầm 1' },
];

describe('ActivitiesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (classActivityService.getAllActivities as any).mockResolvedValue({ success: true, data: mockActivities });
    (classService.getAllClasses as any).mockResolvedValue({ success: true, data: mockClasses });
  });

  it('renders page title and fetches activities', async () => {
    render(<ActivitiesPage />);

    expect(screen.getByText('Hoạt động lớp học')).toBeInTheDocument();

    await waitFor(() => {
      expect(classActivityService.getAllActivities).toHaveBeenCalled();
      expect(screen.getByText('Hoạt động vẽ tranh')).toBeInTheDocument();
      // "Lớp Mầm 1" appears in filter dropdown AND activity card badge
      const elements = screen.getAllByText('Lớp Mầm 1');
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('filters activities by search term', async () => {
    render(<ActivitiesPage />);
    await waitFor(() => expect(screen.getByText('Hoạt động vẽ tranh')).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText(/Tìm kiếm sự kiện/i);
    fireEvent.change(searchInput, { target: { value: 'Không tồn tại' } });

    expect(screen.queryByText('Hoạt động vẽ tranh')).not.toBeInTheDocument();
    expect(screen.getByText('Chưa có hoạt động nào')).toBeInTheDocument();
  });

  it('opens create activity dialog', async () => {
    render(<ActivitiesPage />);
    const addButton = screen.getByText(/Thêm hoạt động/i);
    fireEvent.click(addButton);

    expect(screen.getByText('Thêm hoạt động mới')).toBeInTheDocument();
  });

  it('successfully creates a new activity', async () => {
    (classActivityService.createActivity as any).mockResolvedValue({ success: true });

    render(<ActivitiesPage />);

    // Wait for data to load first
    await waitFor(() => expect(classService.getAllClasses).toHaveBeenCalled());

    // Open dialog
    fireEvent.click(screen.getByText(/Thêm hoạt động/i));

    await waitFor(() => expect(screen.getByText('Thêm hoạt động mới')).toBeInTheDocument());

    // Fill form using id selectors to avoid label association issues
    const classSelect = document.getElementById('classId') as HTMLSelectElement;
    fireEvent.change(classSelect, { target: { value: '1' } });

    const titleInput = document.getElementById('title') as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'Tham quan' } });

    const contentTextarea = document.getElementById('content') as HTMLTextAreaElement;
    fireEvent.change(contentTextarea, { target: { value: 'Đi tham quan sở thú' } });

    fireEvent.click(screen.getByText('Tạo hoạt động'));

    await waitFor(() => {
      expect(classActivityService.createActivity).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Thêm hoạt động mới thành công!');
    });
  });
});
