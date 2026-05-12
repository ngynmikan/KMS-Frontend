import api from '../api';
import { API_ENDPOINTS } from '../api.constants';
import { 
  FlexibleResponse, 
  ApiPayment, 
  CreatePaymentRequest, 
  RevenueSummary, 
  PaymentFilterRequest 
} from '@/types';

export const paymentService = {
  // Get all payments
  getAllPayments: async (): Promise<FlexibleResponse<ApiPayment[]>> => {
    const response = await api.get<FlexibleResponse<ApiPayment[]>>(API_ENDPOINTS.PAYMENT.BASE);
    return response.data;
  },

  // Record a payment for an invoice
  createPayment: async (paymentData: CreatePaymentRequest): Promise<FlexibleResponse<ApiPayment>> => {
    const response = await api.post<FlexibleResponse<ApiPayment>>(API_ENDPOINTS.PAYMENT.BASE, paymentData);
    return response.data;
  },

  // Get payment by ID
  getPaymentById: async (id: number | string): Promise<FlexibleResponse<ApiPayment>> => {
    const response = await api.get<FlexibleResponse<ApiPayment>>(API_ENDPOINTS.PAYMENT.BY_ID(id));
    return response.data;
  },

  // Delete payment and recalculate invoice status
  deletePayment: async (id: number | string): Promise<FlexibleResponse<any>> => {
    const response = await api.delete<FlexibleResponse<any>>(API_ENDPOINTS.PAYMENT.BY_ID(id));
    return response.data;
  },

  // Get all payments for an invoice
  getPaymentsByInvoice: async (invoiceId: number | string): Promise<FlexibleResponse<ApiPayment[]>> => {
    const response = await api.get<FlexibleResponse<ApiPayment[]>>(API_ENDPOINTS.PAYMENT.BY_INVOICE(invoiceId));
    return response.data;
  },

  // Filter payments
  filterPayments: async (filterData: PaymentFilterRequest): Promise<FlexibleResponse<ApiPayment[]>> => {
    const response = await api.get<FlexibleResponse<ApiPayment[]>>(API_ENDPOINTS.PAYMENT.FILTER, {
      params: filterData
    });
    return response.data;
  },

  // Revenue summary by date range
  getRevenueSummary: async (startDate?: string, endDate?: string): Promise<FlexibleResponse<RevenueSummary>> => {
    const response = await api.get<FlexibleResponse<RevenueSummary>>(API_ENDPOINTS.PAYMENT.REVENUE_SUMMARY, {
      params: { startDate, endDate }
    });
    return response.data;
  },
};

export default paymentService;
