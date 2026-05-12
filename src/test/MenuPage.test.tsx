import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MenuPage } from '../pages/MenuPage';
import { menuService, classService } from '../services';
import { toast } from 'sonner';

// Mock Services
vi.mock('../services', () => ({
  menuService: {
    getMenusByClass: vi.fn(),
    createMenu: vi.fn(),
    updateMenu: vi.fn(),
  },
  classService: {
    getAllClasses: vi.fn(),
  },
}));

// Mock Sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

const mockClasses = [
  { classId: 1, className: 'Lớp Mầm 1' },
];

const mockMenus = [
  {
    menuId: 1,
    menuDate: new Date().toISOString(),
    mealType: 'Breakfast',
    menuContent: 'Phở bò, Sữa tươi',
  },
];

describe('MenuPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (classService.getAllClasses as any).mockResolvedValue({ success: true, data: mockClasses });
    (menuService.getMenusByClass as any).mockResolvedValue({ success: true, data: mockMenus });
  });

  it('renders page title and fetches classes', async () => {
    render(<MenuPage />);

    expect(screen.getByText('Quản lý Thực đơn')).toBeInTheDocument();

    await waitFor(() => {
      expect(classService.getAllClasses).toHaveBeenCalled();
      // "Lớp Mầm 1" appears in the select dropdown
      const elements = screen.getAllByText('Lớp Mầm 1');
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('fetches menus when a class is selected', async () => {
    render(<MenuPage />);

    await waitFor(() => {
      expect(menuService.getMenusByClass).toHaveBeenCalledWith('1');
    });

    // "Phở bò" and "Sữa tươi" appear both in the palette AND in menu cells
    // Use getAllByText to handle multiple occurrences
    await waitFor(() => {
      const phoElements = screen.getAllByText(/Phở bò/i);
      expect(phoElements.length).toBeGreaterThanOrEqual(1);
      const suaElements = screen.getAllByText(/Sữa tươi/i);
      expect(suaElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows info toast when "Sao chép mẫu" is clicked', async () => {
    render(<MenuPage />);
    const copyButton = screen.getByText(/Sao chép mẫu/i);
    fireEvent.click(copyButton);

    expect(toast.info).toHaveBeenCalledWith('Chức năng sao chép thực đơn mẫu đang được phát triển');
  });

  it('saves menu correctly', async () => {
    (menuService.updateMenu as any).mockResolvedValue({ success: true });

    render(<MenuPage />);
    await waitFor(() => {
      const phoElements = screen.getAllByText(/Phở bò/i);
      expect(phoElements.length).toBeGreaterThanOrEqual(1);
    });

    const saveButton = screen.getByText(/Lưu thực đơn/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(menuService.updateMenu).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Thực đơn đã được lưu thành công trên hệ thống!');
    });
  });
});
