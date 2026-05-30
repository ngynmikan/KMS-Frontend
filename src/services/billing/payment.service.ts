import api from '../api';
import { API_ENDPOINTS } from '../api.constants';
import { 
  APIResponse, 
  ApiPayment, 
  CreatePaymentRequest, 
  RevenueSummary, 
  PaymentFilterRequest 
} from '@/types';

export const paymentService = {
  // Get all payments
  getAllPayments: async (): Promise<ApiPayment[]> => {
    const response = await api.get<APIResponse<ApiPayment[]>>(API_ENDPOINTS.PAYMENT.BASE);
    return response.data.data ?? [];
  },

  // Record a payment for an invoice
  createPayment: async (paymentData: CreatePaymentRequest): Promise<ApiPayment> => {
    const response = await api.post<APIResponse<ApiPayment>>(API_ENDPOINTS.PAYMENT.BASE, paymentData);
    return response.data.data!;
  },

  // Get payment by ID
  getPaymentById: async (id: number | string): Promise<ApiPayment> => {
    const response = await api.get<APIResponse<ApiPayment>>(API_ENDPOINTS.PAYMENT.BY_ID(id));
    return response.data.data!;
  },

  // Delete payment and recalculate invoice status
  deletePayment: async (id: number | string): Promise<boolean> => {
    const response = await api.delete<APIResponse<any>>(API_ENDPOINTS.PAYMENT.BY_ID(id));
    return response.data.success;
  },

  // Get all payments for an invoice
  getPaymentsByInvoice: async (invoiceId: number | string): Promise<ApiPayment[]> => {
    const response = await api.get<APIResponse<ApiPayment[]>>(API_ENDPOINTS.PAYMENT.BY_INVOICE(invoiceId));
    return response.data.data ?? [];
  },

  // Filter payments
  filterPayments: async (filterData: PaymentFilterRequest): Promise<ApiPayment[]> => {
    const response = await api.get<APIResponse<ApiPayment[]>>(API_ENDPOINTS.PAYMENT.FILTER, {
      params: filterData
    });
    return response.data.data ?? [];
  },

  // Revenue summary by date range
  getRevenueSummary: async (startDate?: string, endDate?: string): Promise<RevenueSummary> => {
    const response = await api.get<APIResponse<RevenueSummary>>(API_ENDPOINTS.PAYMENT.REVENUE_SUMMARY, {
      params: { startDate, endDate }
    });
    return response.data.data!;
  },
};

export default paymentService;
