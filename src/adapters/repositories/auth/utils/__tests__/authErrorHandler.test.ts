import { AuthException, AuthErrorCode } from '@/domain/errors';
import { WebApiException, NetworkException } from '@/domain/errors';

import { handleLoginError, handleSessionError } from '../authErrorHandler';

describe('authErrorHandler', () => {
  describe('handleLoginError', () => {
    test.concurrent(
      '401エラーでAuthException.invalidCredentials()をthrowする',
      () => {
        const webApiError = new WebApiException(401, 'Unauthorized', {
          message: 'Invalid credentials',
        });

        expect(() => handleLoginError(webApiError)).toThrow(AuthException);
        try {
          handleLoginError(webApiError);
        } catch (error) {
          expect(error).toBeInstanceOf(AuthException);
          expect((error as AuthException).code).toBe(
            AuthErrorCode.INVALID_CREDENTIALS
          );
          expect((error as AuthException).statusCode).toBe(401);
        }
      }
    );

    test.concurrent(
      'その他のWebApiExceptionでAuthException.networkError()をthrowする',
      () => {
        const webApiError = new WebApiException(500, 'Internal Server Error');

        try {
          handleLoginError(webApiError);
        } catch (error) {
          expect(error).toBeInstanceOf(AuthException);
          expect((error as AuthException).code).toBe(
            AuthErrorCode.NETWORK_ERROR
          );
        }
      }
    );

    test.concurrent(
      'NetworkExceptionでAuthException.networkError()をthrowする',
      () => {
        const networkError = new NetworkException('Network error');

        try {
          handleLoginError(networkError);
        } catch (error) {
          expect(error).toBeInstanceOf(AuthException);
          expect((error as AuthException).code).toBe(
            AuthErrorCode.NETWORK_ERROR
          );
        }
      }
    );

    test.concurrent(
      '予期しないエラーでAuthException.networkError()をthrowする',
      () => {
        const unknownError = new Error('Unknown error');

        try {
          handleLoginError(unknownError);
        } catch (error) {
          expect(error).toBeInstanceOf(AuthException);
          expect((error as AuthException).code).toBe(
            AuthErrorCode.NETWORK_ERROR
          );
        }
      }
    );
  });

  describe('handleSessionError', () => {
    test.concurrent('401エラーでAuthException.noSession()をthrowする', () => {
      const webApiError = new WebApiException(401, 'Unauthorized', {
        message: 'No session',
      });

      try {
        handleSessionError(webApiError);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthException);
        expect((error as AuthException).code).toBe(AuthErrorCode.NO_SESSION);
      }
    });

    test.concurrent(
      'その他のWebApiExceptionでAuthException.networkError()をthrowする',
      () => {
        const webApiError = new WebApiException(500, 'Internal Server Error');

        try {
          handleSessionError(webApiError);
        } catch (error) {
          expect(error).toBeInstanceOf(AuthException);
          expect((error as AuthException).code).toBe(
            AuthErrorCode.NETWORK_ERROR
          );
        }
      }
    );
  });
});
