import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardPage } from '../pages/DashboardPage';
import { studentService, userService, invoiceService, paymentService, medicalIncidentService } from '../services';
import { BrowserRouter } from 'react-router-dom';

// Mock Services
vi.mock('../services', () => ({
  studentService: { getAllStudents: vi.fn() },
  userService: { getActiveUsers: vi.fn() },
  invoiceService: { getAllInvoices: vi.fn() },
  paymentService: { getAllPayments: vi.fn() },
  medicalIncidentService: { getAll: vi.fn() },
}));

// Mock Recharts to avoid issues in JSDOM
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  AreaChart: ({ children }: any) => <div>{children}</div>,
  Area: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  PieChart: ({ children }: any) => <div>{children}</div>,
  Pie: () => <div />,
  Cell: () => <div />,
}));

const mockStudents = [
  { studentId: 1, fullName: 'Student A', isActive: true },
  { studentId: 2, fullName: 'Student B', isActive: false },
];

const mockUsers = [
  { userId: 1, fullName: 'Staff 1' },
];

const mockInvoices = [
  { id: 1, invoiceNumber: 'INV-001', status: 'Paid', totalAmount: 1000000, issueDate: new Date().toISOString() },
  { id: 2, invoiceNumber: 'INV-002', status: 'Unpaid', totalAmount: 500000, issueDate: new Date().toISOString() },
];

const mockPayments = [
  { id: 1, paidAmount: 1000000, paymentDate: new Date().toISOString() },
];

const mockIncidents = [
  { id: 1, reportedBy: 'Teacher A', incidentDate: new Date().toISOString(), description: 'Small scratch' },
];

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (studentService.getAllStudents as any).mockResolvedValue({ success: true, data: mockStudents });
    (userService.getActiveUsers as any).mockResolvedValue({ success: true, data: mockUsers });
    (invoiceService.getAllInvoices as any).mockResolvedValue({ success: true, data: mockInvoices });
    (paymentService.getAllPayments as any).mockResolvedValue({ success: true, data: mockPayments });
    (medicalIncidentService.getAll as any).mockResolvedValue({ success: true, data: mockIncidents });
  });

  const renderDashboard = () => {
    return render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
  };

  it('renders the dashboard header and KPI cards', async () => {
    renderDashboard();

    // Header is hidden while loading (component returns early), wait for it
    await waitFor(() => {
      expect(screen.getByText('Tổng quan Hệ thống')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Tổng học sinh')).toBeInTheDocument();
      expect(screen.getByText('Đội ngũ nhân sự')).toBeInTheDocument();
      expect(screen.getByText('Sự cố y tế (Hôm nay)')).toBeInTheDocument();
    });
  });

  it('calculates payment rate correctly', async () => {
    renderDashboard();

    await waitFor(() => {
      // 1 paid / 2 total = 50%
      expect(screen.getByText('50.0%')).toBeInTheDocument();
    });
  });

  it('renders quick action buttons', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('QL Học sinh')).toBeInTheDocument();
      expect(screen.getByText('QL Sức khỏe')).toBeInTheDocument();
      expect(screen.getByText('Lên thực đơn')).toBeInTheDocument();
      expect(screen.getByText('QL Thu phí')).toBeInTheDocument();
    });
  });
});
