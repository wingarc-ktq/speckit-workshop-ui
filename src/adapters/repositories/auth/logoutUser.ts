import { clearAccessToken } from '@/adapters/authToken';

export type LogoutUser = () => Promise<void>;

/**
 * ユーザーログアウト
 * @remarks
 * JWT はステートレスなためサーバー側のログアウトAPIは無い。
 * クライアント側で保存済みトークンを破棄する。
 */
export const logoutUser: LogoutUser = (): Promise<void> => {
  clearAccessToken();
  return Promise.resolve();
};
