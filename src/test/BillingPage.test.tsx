import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BillingPage } from '../pages/BillingPage';
import { paymentService, invoiceService } from '../services';

// Mock Services
vi.mock('../services', () => ({
  paymentService: {
    getAllPayments: vi.fn(),
    getRevenueSummary: vi.fn(),
  },
  invoiceService: {
    getAllInvoices: vi.fn(),
    markOverdue: vi.fn(),
  },
}));

const mockPayments = [
  {
    paymentId: 1,
    paymentNumber: 'PAY-001',
    studentName: 'Học sinh A',
    invoiceNumber: 'INV-001',
    paymentMethod: 'Tiền mặt',
    paidAmount: 1000000,
    paymentDate: new Date().toISOString(),
    receivedByName: 'Kế toán A',
  },
];

const mockInvoices = [
  {
    invoiceId: 1,
    invoiceNumber: 'INV-001',
    studentName: 'Học sinh A',
    dueDate: new Date().toISOString(),
    totalAmount: 2000000,
    paidAmount: 1000000,
    status: 'Partial',
  },
];

const mockSummary = {
  totalRevenue: 5000000,
  totalTransactions: 5,
  fromDate: '2026-01-01',
  toDate: '2026-03-31',
  byMethod: [
    { paymentMethod: 'Tiền mặt', totalAmount: 3000000, count: 3 },
    { paymentMethod: 'Chuyển khoản', totalAmount: 2000000, count: 2 },
  ],
};

describe('BillingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (paymentService.getAllPayments as any).mockResolvedValue({ success: true, data: mockPayments });
    (invoiceService.getAllInvoices as any).mockResolvedValue({ success: true, data: mockInvoices });
    (paymentService.getRevenueSummary as any).mockResolvedValue({ success: true, data: mockSummary });
  });

  it('renders page title and fetches billing data', async () => {
    render(<BillingPage />);

    expect(screen.getByText('Quản lý Tài chính')).toBeInTheDocument();

    await waitFor(() => {
      expect(paymentService.getAllPayments).toHaveBeenCalled();
      expect(invoiceService.getAllInvoices).toHaveBeenCalled();
      expect(paymentService.getRevenueSummary).toHaveBeenCalled();

      // Check revenue is displayed (format depends on locale, use regex)
      expect(screen.getByText(/5[.,\s]?0+[.,\s]?0+[.,\s]?0+\s*đ/)).toBeInTheDocument();
      expect(screen.getByText('Học sinh A')).toBeInTheDocument();
    });
  });

  it('switches between payments and invoices tabs', async () => {
    render(<BillingPage />);

    await waitFor(() => expect(screen.getByText('Lịch sử Thanh toán')).toBeInTheDocument());

    const invoicesTab = screen.getByText('Quản lý Hóa đơn');
    fireEvent.click(invoicesTab);

    await waitFor(() => {
      expect(screen.getByText('Hạn Đóng')).toBeInTheDocument();
      // "Đóng một phần" may appear in filter dropdown and badge - use getAllByText
      const partialElements = screen.getAllByText('Đóng một phần');
      expect(partialElements.length).toBeGreaterThanOrEqual(1);
    });

    const paymentsTab = screen.getByText('Lịch sử Thanh toán');
    fireEvent.click(paymentsTab);

    await waitFor(() => {
      expect(screen.getByText('Số Phiếu')).toBeInTheDocument();
    });
  });

  it('opens invoice details dialog', async () => {
    render(<BillingPage />);
    fireEvent.click(screen.getByText('Quản lý Hóa đơn'));

    await waitFor(() => expect(screen.getByText('Chi tiết')).toBeInTheDocument());

    const detailButton = screen.getByText('Chi tiết');
    fireEvent.click(detailButton);

    await waitFor(() => {
      expect(screen.getByText(/Chi tiết Hóa đơn: INV-001/i)).toBeInTheDocument();
    });
  });
});
