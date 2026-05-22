import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { BaseQueryFn } from '@reduxjs/toolkit/query';
import { config } from '@config/env.config';

export interface AxiosBaseQueryArgs {
  url: string;
  method?: AxiosRequestConfig['method'];
  data?: AxiosRequestConfig['data'];
  params?: AxiosRequestConfig['params'];
}

const axiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(
  cfg => cfg,
  err => Promise.reject(err),
);

axiosInstance.interceptors.response.use(
  res => res,
  (error: AxiosError) => {
    const status = error.response?.status;
    const message =
      (error.response?.data as { message?: string })?.message ??
      error.message ??
      'An unexpected error occurred.';
    console.warn(`[API Error] ${status ?? 'network'}: ${message}`);
    return Promise.reject(error);
  },
);

export const axiosBaseQuery =
  (): BaseQueryFn<
    AxiosBaseQueryArgs,
    unknown,
    { status?: number; message: string }
  > =>
  async ({ url, method = 'GET', data, params }) => {
    try {
      const result = await axiosInstance({ url, method, data, params });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          message:
            (err.response?.data as { message?: string })?.message ??
            err.message ??
            'Network error',
        },
      };
    }
  };

export default axiosInstance;
