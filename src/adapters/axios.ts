import axios from 'axios';

import { NetworkException, WebApiException } from '@/domain/errors';

import { getAccessToken } from './authToken';

import type { AxiosError, AxiosRequestConfig } from 'axios';

const axiosClient = axios.create({
  // Base URL設定 - 環境変数から取得。既定は同一オリジン経由（Vite proxy / ゲートウェイ）
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  paramsSerializer: { indexes: null },
});

// JWT 認証: 保存済みトークンがあれば Authorization ヘッダーに付与する
axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);

  return config;
});

axiosClient.interceptors.response.use(null, (error: AxiosError) => {
  if (error.response) {
    throw new WebApiException(
      error.response.status,
      error.response.statusText,
      error.response.data
    );
  } else {
    throw new NetworkException(error.message);
  }
});

export async function customInstance<T>(
  config: AxiosRequestConfig
): Promise<T> {
  const { data } = await axiosClient(config);
  return data;
}
