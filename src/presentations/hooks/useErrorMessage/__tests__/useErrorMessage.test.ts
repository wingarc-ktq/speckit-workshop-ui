import { renderHook } from '@testing-library/react';

import { HTTP_STATUS } from '@/domain/constants';
import type { ApplicationException } from '@/domain/errors';
import {
  AuthException,
  AuthErrorCode,
  FatalException,
  NetworkException,
  WebApiException,
} from '@/domain/errors';
import { i18n } from '@/i18n/config';

import { useErrorMessage } from '../useErrorMessage';

describe('useErrorMessage', () => {
  const getMessage = (error: ApplicationException) => {
    const { result } = renderHook(() => useErrorMessage());
    return result.current.toMessageFromError(error);
  };

  beforeEach(async () => {
    await i18n.changeLanguage('ja');
  });

  test.concurrent.each([
    {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message:
        '現在システムが混雑しています。しばらく時間をおいてから再度お試しください。',
    },
    {
      status: HTTP_STATUS.BAD_REQUEST,
      message: '不正なパラメータが送信されました。',
    },
    {
      status: HTTP_STATUS.UNAUTHORIZED,
      message: 'ログインしていません。',
    },
    {
      status: HTTP_STATUS.FORBIDDEN,
      message:
        'この操作を行う権限がありません。問題が解消しない場合はブラウザをリロードしてください。',
    },
    {
      status: HTTP_STATUS.NOT_FOUND,
      message: '対象が見つかりません。',
    },
    {
      status: HTTP_STATUS.PAYLOAD_TOO_LARGE,
      message: 'データ量の上限を超過しました。',
    },
    {
      status: HTTP_STATUS.SERVICE_UNAVAILABLE,
      message:
        'サーバーが一時的に混雑しているか、メンテナンス中です。時間を空けて再度試してください。',
    },
    {
      status: HTTP_STATUS.GATEWAY_TIMEOUT,
      message: 'サーバーが時間内に応答しませんでした。',
    },
  ])(
    'WebApiException($status)の場合に適切なメッセージを返すこと',
    ({ status, message }) => {
      const error = new WebApiException(status, 'Error');

      expect(getMessage(error)).toBe(message);
    }
  );

  test.concurrent(
    'NetworkExceptionの場合にネットワークエラーメッセージを返すこと',
    () => {
      const error = new NetworkException('Network error');

      expect(getMessage(error)).toBe(
        'ネットワークエラーが発生しました。ネットワーク接続をご確認ください。'
      );
    }
  );

  test.concurrent.each([
    {
      code: AuthErrorCode.INVALID_CREDENTIALS,
      message:
        'メールアドレス（またはユーザー名）またはパスワードが正しくありません。',
    },
    {
      code: AuthErrorCode.NO_SESSION,
      message: 'セッションが存在しません。再度ログインしてください。',
    },
    {
      code: AuthErrorCode.SESSION_EXPIRED,
      message: 'セッションの有効期限が切れました。再度ログインしてください。',
    },
    {
      code: AuthErrorCode.NETWORK_ERROR,
      message:
        '認証サーバーとの通信に失敗しました。しばらく時間をおいてから再度お試しください。',
    },
  ])(
    'AuthException($code)の場合に適切なメッセージを返すこと',
    ({ code, message }) => {
      const error = new AuthException(code, 401, 'Auth Error');

      expect(getMessage(error)).toBe(message);
    }
  );

  test.concurrent(
    'エラーハンドリングに引っ掛からなかった時はerrorをそのままスローすること',
    () => {
      const error = new FatalException('unknown', 'Error');

      expect(() => getMessage(error)).toThrow(error);
    }
  );
});
