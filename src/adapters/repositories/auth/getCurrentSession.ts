import '@/adapters/axios';

import { getCurrentUser as getCurrentUserApi } from '@/adapters/generated/auth';
import type { AuthSession } from '@/domain/models/auth';

import { handleSessionError } from './utils/authErrorHandler';

export type GetCurrentSession = () => Promise<AuthSession>;

/**
 * 現在の認証ユーザー情報を取得（JWT検証: GET /auth/me）
 * @returns 認証セッション
 * @throws {AuthException} 認証エラー時
 */
export const getCurrentSession: GetCurrentSession =
  async (): Promise<AuthSession> => {
    try {
      const { user } = await getCurrentUserApi();

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      handleSessionError(error);
    }
  };
