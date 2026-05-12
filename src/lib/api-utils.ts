import { FlexibleResponse } from '@/types';

/**
 * Extracts data from a FlexibleResponse, handling both wrapped APIResponse and direct data.
 */
export function extractData<T>(response: FlexibleResponse<T>): T {
  if (response && typeof response === 'object' && 'data' in response && 'success' in response) {
    return response.data as T;
  }
  return response as T;
}

/**
 * Extracts an array from a FlexibleResponse, ensuring it's an array.
 */
export function extractArray<T>(response: FlexibleResponse<T[]>): T[] {
  const data = extractData(response);
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === 'object' && 'items' in (data as any)) {
    return (data as any).items as T[];
  }
  return [];
}
