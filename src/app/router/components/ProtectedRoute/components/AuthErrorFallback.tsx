import React from 'react';

import { Navigate, useLocation } from 'react-router-dom';

import { HTTP_STATUS_CODES } from '@/domain/constants';
import { WebApiException } from '@/domain/errors';

interface AuthErrorFallbackProps {
  error: unknown;
}

/**
 * 認証エラー用のフォールバックコンポーネント
 */
export const AuthErrorFallback: React.FC<AuthErrorFallbackProps> = ({
  error,
}) => {
  const location = useLocation();
  // 401エラー（認証エラー）の場合はログインページにリダイレクト
  if (
    error instanceof WebApiException &&
    error.statusCode === HTTP_STATUS_CODES.UNAUTHORIZED
  ) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // その他のエラーの場合は再スロー（上位のError Boundaryで処理）
  throw error;
};
