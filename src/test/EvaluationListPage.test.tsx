import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EvaluationListPage } from '../pages/EvaluationListPage';
import { classService, evaluationService } from '../services';
import { MemoryRouter } from 'react-router-dom';

// Mock Services
vi.mock('../services', async () => {
  const actual = await vi.importActual('../services');
  return {
    ...actual,
    classService: {
      getAllClasses: vi.fn(),
    },
    evaluationService: {
      getClassSummary: vi.fn(),
    },
  };
});

const mockClasses = [
  { classId: 1, className: 'Lớp Mầm 1' },
];

const mockSummary = {
  classId: 1,
  className: 'Lớp Mầm 1',
  periodType: 'monthly',
  periodStart: '2024-09-01',
  totalStudents: 1,
  evaluatedCount: 1,
  notEvaluatedCount: 0,
  goodStudentCount: 1,
  students: [
    {
      studentId: 1,
      fullName: 'Nguyễn Minh An',
      isEvaluated: true,
      evaluationId: 10,
      averageScore: 9.5,
      isGoodStudent: true,
      photo: null
    }
  ]
};

describe('EvaluationListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (classService.getAllClasses as any).mockResolvedValue({ success: true, data: mockClasses });
    (evaluationService.getClassSummary as any).mockResolvedValue(mockSummary);
  });

  it('renders page and fetches class summary', async () => {
    render(
      <MemoryRouter>
        <EvaluationListPage />
      </MemoryRouter>
    );
    
    await screen.findByText(/Đánh giá học sinh/i);
    
    await waitFor(() => {
      expect(classService.getAllClasses).toHaveBeenCalled();
      expect(screen.getByText(/Tất cả các lớp/i)).toBeInTheDocument();
    });

    await screen.findByText(/Nguyễn Minh An/i);
    // Use getAllByText because these values appear in both summary cards and the table
    expect(screen.getAllByText(/Đã đánh giá/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/9/).length).toBeGreaterThanOrEqual(1);
  });

  it('shows summary statistics', async () => {
    render(
      <MemoryRouter>
        <EvaluationListPage />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Tổng số trẻ')).toBeInTheDocument();
      const elementsWith1 = screen.getAllByText('1');
      expect(elementsWith1.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('filters students by name', async () => {
    render(
      <MemoryRouter>
        <EvaluationListPage />
      </MemoryRouter>
    );
    
    await screen.findByText(/Nguyễn Minh An/i);
    
    const searchInput = screen.getByPlaceholderText(/Tên học sinh/i);
    fireEvent.change(searchInput, { target: { value: 'Minh An' } });
    expect(screen.getByText('Nguyễn Minh An')).toBeInTheDocument();
    
    fireEvent.change(searchInput, { target: { value: 'Khác' } });
    expect(screen.queryByText('Nguyễn Minh An')).not.toBeInTheDocument();
  });
});
