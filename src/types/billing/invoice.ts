import { ApiPayment } from './payment';

export interface InvoiceItem {
  itemId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

export interface ApiInvoice {
  invoiceId: number;
  invoiceNumber: string;
  studentId: number;
  studentName?: string;
  issueDate: string;
  dueDate: string;
  subTotal: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Partial' | 'Overdue' | 'Cancelled';
  notes?: string;
  items?: InvoiceItem[];
  payments?: ApiPayment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInvoiceRequest {
  studentId: number;
  dueDate: string;
  items: Omit<InvoiceItem, 'itemId' | 'totalAmount'>[];
  notes?: string;
}

export interface UpdateInvoiceRequest {
  discount?: number;
  status?: string;
  dueDate?: string;
  notes?: string;
}

export interface InvoiceFilterRequest {
  startDate?: string;
  endDate?: string;
  status?: string;
  studentId?: number;
}

export interface CreateInvoiceFromTemplateRequest {
  studentIds: number[];
  month: number;
  year: number;
  templateId?: number;
}

export interface StudentInvoiceSummary {
  studentId: number;
  studentName: string;
  totalInvoiced: number;
  totalPaid: number;
  totalBalance: number;
  invoiceCount: number;
}
