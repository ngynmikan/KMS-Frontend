export interface ApiPayment {
  paymentId: number;
  paymentNumber: string;
  invoiceId: number;
  invoiceNumber: string;
  createdAt: string;
  notes: string;
  paidAmount: number;
  paymentDate: string;
  paymentMethod: string;
  receivedBy: number;
  receivedByName: string;
  studentName: string;
  transactionReference: string;
  updatedAt?: string;
}

export interface CreatePaymentRequest {
  invoiceId: number;
  paidAmount: number;
  paymentDate: string;
  paymentMethod: string;
  transactionReference?: string;
  notes?: string;
}

export interface RevenueSummaryByMethod {
  paymentMethod: string;
  totalAmount: number;
  count: number;
}

export interface RevenueSummary {
  fromDate: string;
  toDate: string;
  totalRevenue: number;
  totalTransactions: number;
  byMethod: RevenueSummaryByMethod[];
}

export interface PaymentFilterRequest {
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
  invoiceId?: number;
}
