import api from '../api';
import { API_ENDPOINTS } from '../api.constants';
import { 
  FlexibleResponse, 
  ApiInvoice, 
  CreateInvoiceRequest, 
  UpdateInvoiceRequest, 
  InvoiceFilterRequest,
  CreateInvoiceFromTemplateRequest,
  StudentInvoiceSummary
} from '@/types';

export const invoiceService = {
  // Get all invoices
  getAllInvoices: async (): Promise<FlexibleResponse<ApiInvoice[]>> => {
    const response = await api.get<FlexibleResponse<ApiInvoice[]>>(API_ENDPOINTS.INVOICE.BASE);
    return response.data;
  },

  // Create invoice manually
  createInvoice: async (invoiceData: CreateInvoiceRequest): Promise<FlexibleResponse<ApiInvoice>> => {
    const response = await api.post<FlexibleResponse<ApiInvoice>>(API_ENDPOINTS.INVOICE.BASE, invoiceData);
    return response.data;
  },

  // Get invoice by ID
  getInvoiceById: async (id: number | string): Promise<FlexibleResponse<ApiInvoice>> => {
    const response = await api.get<FlexibleResponse<ApiInvoice>>(API_ENDPOINTS.INVOICE.BY_ID(id));
    return response.data;
  },

  // Update invoice
  updateInvoice: async (id: number | string, invoiceData: UpdateInvoiceRequest): Promise<FlexibleResponse<ApiInvoice>> => {
    const response = await api.put<FlexibleResponse<ApiInvoice>>(API_ENDPOINTS.INVOICE.BY_ID(id), invoiceData);
    return response.data;
  },

  // Delete invoice
  deleteInvoice: async (id: number | string): Promise<FlexibleResponse<any>> => {
    const response = await api.delete<FlexibleResponse<any>>(API_ENDPOINTS.INVOICE.BY_ID(id));
    return response.data;
  },

  // Get invoices by student
  getInvoicesByStudent: async (studentId: number | string): Promise<FlexibleResponse<ApiInvoice[]>> => {
    const response = await api.get<FlexibleResponse<ApiInvoice[]>>(API_ENDPOINTS.INVOICE.BY_STUDENT(studentId));
    return response.data;
  },

  // Get overdue invoices
  getOverdueInvoices: async (): Promise<FlexibleResponse<ApiInvoice[]>> => {
    const response = await api.get<FlexibleResponse<ApiInvoice[]>>(API_ENDPOINTS.INVOICE.OVERDUE);
    return response.data;
  },

  // Filter invoices
  filterInvoices: async (filter: InvoiceFilterRequest): Promise<FlexibleResponse<ApiInvoice[]>> => {
    const response = await api.get<FlexibleResponse<ApiInvoice[]>>(API_ENDPOINTS.INVOICE.FILTER, {
      params: filter
    });
    return response.data;
  },

  // Create invoice from tuition template
  createFromTemplate: async (data: CreateInvoiceFromTemplateRequest): Promise<FlexibleResponse<any>> => {
    const response = await api.post<FlexibleResponse<any>>(API_ENDPOINTS.INVOICE.FROM_TEMPLATE, data);
    return response.data;
  },

  // Batch mark all expired unpaid invoices as Overdue
  markOverdue: async (): Promise<FlexibleResponse<any>> => {
    const response = await api.post<FlexibleResponse<any>>(API_ENDPOINTS.INVOICE.MARK_OVERDUE);
    return response.data;
  },

  // Get invoice summary for a student
  getStudentInvoiceSummary: async (studentId: number | string): Promise<FlexibleResponse<StudentInvoiceSummary>> => {
    const response = await api.get<FlexibleResponse<StudentInvoiceSummary>>(API_ENDPOINTS.INVOICE.SUMMARY_BY_STUDENT(studentId));
    return response.data;
  },
};

export default invoiceService;
