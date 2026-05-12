export interface APIResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  [key: string]: any;
}

export type FlexibleResponse<T> = T | APIResponse<T> | any;
