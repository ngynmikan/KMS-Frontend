import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EvaluationFormPage } from '../pages/EvaluationFormPage';
import { evaluationService, studentService } from '../services';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { toast } from 'sonner';

// Mock Services
vi.mock('../services', async () => {
  const actual = await vi.importActual('../services');
  return {
    ...actual,
    evaluationService: {
      getAllCriteria: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    studentService: {
      getStudentById: vi.fn(),
    },
  };
});

// Mock Sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockCriteria = [
  {
    criteriaId: 1,
    category: 'PHYSICAL',
    categoryLabel: 'Phát triển thể chất',
    name: 'Chiều cao',
    description: '',
    ratingType: 'scale',
    sortOrder: 1,
    isDefault: true,
    isActive: true
  },
  {
    criteriaId: 2,
    category: 'PHYSICAL',
    categoryLabel: 'Phát triển thể chất',
    name: 'Cân nặng',
    description: '',
    ratingType: 'scale',
    sortOrder: 2,
    isDefault: true,
    isActive: true
  }
];

const mockStudent = { studentId: 1, fullName: 'Nguyễn Minh An', studentCode: 'SV001' };

describe('EvaluationFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (evaluationService.getAllCriteria as any).mockResolvedValue(mockCriteria);
    (studentService.getStudentById as any).mockResolvedValue({ success: true, data: mockStudent });
  });

  it('renders evaluation form and fetches criteria', async () => {
    render(
      <MemoryRouter initialEntries={['/evaluations/new?studentId=1&classId=1']}>
        <Routes>
          <Route path="/evaluations/new" element={<EvaluationFormPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Tạo phiếu đánh giá mới')).toBeInTheDocument();
      expect(screen.getByText('Nguyễn Minh An')).toBeInTheDocument();
      expect(screen.getByText('Phát triển thể chất')).toBeInTheDocument();
      expect(screen.getByText('Chiều cao')).toBeInTheDocument();
    });
  });

  it('handles score changes', async () => {
    render(
      <MemoryRouter initialEntries={['/evaluations/new?studentId=1&classId=1']}>
        <Routes>
          <Route path="/evaluations/new" element={<EvaluationFormPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText('Chiều cao'));
    
    // In our implementation, scores are buttons from 1 to 10
    const score9Button = screen.getAllByText('9')[0];
    fireEvent.click(score9Button);
    
    expect(score9Button).toHaveClass('bg-orange-500');
  });

  it('submits evaluation successfully', async () => {
    (evaluationService.create as any).mockResolvedValue({ success: true });

    render(
      <MemoryRouter initialEntries={['/evaluations/new?studentId=1&classId=1&periodType=monthly&periodStart=2024-09-01']}>
        <Routes>
          <Route path="/evaluations/new" element={<EvaluationFormPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText('Lưu phiếu'));
    
    fireEvent.click(screen.getByText('Lưu phiếu'));
    
    await waitFor(() => {
      expect(evaluationService.create).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Tạo phiếu đánh giá thành công');
    });
  });
});
