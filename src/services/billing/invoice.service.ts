import api from '../api';
import { API_ENDPOINTS } from '../api.constants';
import { 
  APIResponse, 
  ApiInvoice, 
  CreateInvoiceRequest, 
  UpdateInvoiceRequest, 
  InvoiceFilterRequest,
  CreateInvoiceFromTemplateRequest,
  StudentInvoiceSummary
} from '@/types';

export const invoiceService = {
  // Get all invoices
  getAllInvoices: async (): Promise<ApiInvoice[]> => {
    const response = await api.get<APIResponse<ApiInvoice[]>>(API_ENDPOINTS.INVOICE.BASE);
    return response.data.data ?? [];
  },

  // Create invoice manually
  createInvoice: async (invoiceData: CreateInvoiceRequest): Promise<ApiInvoice> => {
    const response = await api.post<APIResponse<ApiInvoice>>(API_ENDPOINTS.INVOICE.BASE, invoiceData);
    return response.data.data!;
  },

  // Get invoice by ID
  getInvoiceById: async (id: number | string): Promise<ApiInvoice> => {
    const response = await api.get<APIResponse<ApiInvoice>>(API_ENDPOINTS.INVOICE.BY_ID(id));
    return response.data.data!;
  },

  // Update invoice
  updateInvoice: async (id: number | string, invoiceData: UpdateInvoiceRequest): Promise<ApiInvoice> => {
    const response = await api.put<APIResponse<ApiInvoice>>(API_ENDPOINTS.INVOICE.BY_ID(id), invoiceData);
    return response.data.data!;
  },

  // Delete invoice
  deleteInvoice: async (id: number | string): Promise<boolean> => {
    const response = await api.delete<APIResponse<any>>(API_ENDPOINTS.INVOICE.BY_ID(id));
    return response.data.success;
  },

  // Get invoices by student
  getInvoicesByStudent: async (studentId: number | string): Promise<ApiInvoice[]> => {
    const response = await api.get<APIResponse<ApiInvoice[]>>(API_ENDPOINTS.INVOICE.BY_STUDENT(studentId));
    return response.data.data ?? [];
  },

  // Get overdue invoices
  getOverdueInvoices: async (): Promise<ApiInvoice[]> => {
    const response = await api.get<APIResponse<ApiInvoice[]>>(API_ENDPOINTS.INVOICE.OVERDUE);
    return response.data.data ?? [];
  },

  // Filter invoices
  filterInvoices: async (filter: InvoiceFilterRequest): Promise<ApiInvoice[]> => {
    const response = await api.get<APIResponse<ApiInvoice[]>>(API_ENDPOINTS.INVOICE.FILTER, {
      params: filter
    });
    return response.data.data ?? [];
  },

  // Create invoice from tuition template
  createFromTemplate: async (data: CreateInvoiceFromTemplateRequest): Promise<APIResponse<any>> => {
    const response = await api.post<APIResponse<any>>(API_ENDPOINTS.INVOICE.FROM_TEMPLATE, data);
    return response.data;
  },

  // Batch mark all expired unpaid invoices as Overdue
  markOverdue: async (): Promise<APIResponse<any>> => {
    const response = await api.post<APIResponse<any>>(API_ENDPOINTS.INVOICE.MARK_OVERDUE);
    return response.data;
  },

  // Get invoice summary for a student
  getStudentInvoiceSummary: async (studentId: number | string): Promise<StudentInvoiceSummary> => {
    const response = await api.get<APIResponse<StudentInvoiceSummary>>(API_ENDPOINTS.INVOICE.SUMMARY_BY_STUDENT(studentId));
    return response.data.data!;
  },
};

export default invoiceService;
