import '@/adapters/axios';

import { setAccessToken } from '@/adapters/authToken';
import { loginUser as loginUserApi } from '@/adapters/generated/auth';
import type { LoginCredentials, LoginResult } from '@/domain/models/auth';

import { handleLoginError } from './utils/authErrorHandler';

export type LoginUser = (credentials: LoginCredentials) => Promise<LoginResult>;

/**
 * ユーザーログイン
 * @param credentials ログイン認証情報
 * @returns ログイン結果
 * @throws {AuthException} 認証エラー時
 */
export const loginUser: LoginUser = async (
  credentials: LoginCredentials
): Promise<LoginResult> => {
  try {
    const { accessToken, expiresIn, user } = await loginUserApi({
      email: credentials.email,
      password: credentials.password,
    });

    // rememberMe に応じて保存先（localStorage/sessionStorage）を切り替えて保存
    setAccessToken(accessToken, credentials.rememberMe ?? false);

    return {
      session: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        sessionInfo: {
          expiresAt: new Date(Date.now() + expiresIn * 1000),
        },
      },
    };
  } catch (error) {
    handleLoginError(error);
  }
};
