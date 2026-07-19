import { HTTP_STATUS } from '@/domain/constants';
import { AuthException } from '@/domain/errors';
import { WebApiException, NetworkException } from '@/domain/errors';

/**
 * 共通のエラー変換処理
 * @param error キャッチされたエラー
 * @param handleUnauthorized 401エラー時のハンドラー
 * @throws {AuthException} 変換されたAuthException
 */
function convertToAuthException(
  error: unknown,
  handleUnauthorized: (data: unknown) => never
): never {
  // WebApiExceptionからAuthExceptionへの変換
  if (error instanceof WebApiException) {
    // 401 Unauthorized - 認証エラー
    if (error.statusCode === HTTP_STATUS.UNAUTHORIZED) {
      handleUnauthorized(error.data);
    }

    // その他のWebAPIエラー - ネットワークエラーとして扱う
    throw AuthException.networkError(error.data);
  }

  // NetworkExceptionからAuthExceptionへの変換
  if (error instanceof NetworkException) {
    throw AuthException.networkError(error.message);
  }

  // 予期しないエラー - ネットワークエラーとして扱う
  throw AuthException.networkError(error);
}

/**
 * ログインエラーを適切なAuthExceptionに変換する
 * @param error キャッチされたエラー
 * @throws {AuthException} 変換されたAuthException
 */
export function handleLoginError(error: unknown): never {
  convertToAuthException(error, (data) => {
    throw AuthException.invalidCredentials(data);
  });
}

/**
 * セッション取得エラーを適切なAuthExceptionに変換する
 * @param error キャッチされたエラー
 * @throws {AuthException} 変換されたAuthException
 */
export function handleSessionError(error: unknown): never {
  convertToAuthException(error, (data) => {
    throw AuthException.noSession(data);
  });
}
