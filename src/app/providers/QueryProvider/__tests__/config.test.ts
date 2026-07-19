import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, test } from 'vitest';

import {
  networkError,
  serviceUnavailableError,
  unauthorizedError,
} from '@/__fixtures__/errors';

import { queryClient } from '../config';

describe('queryClient configuration', () => {
  beforeEach(() => {
    // 各テスト前にキャッシュをクリア
    queryClient.clear();
  });

  describe('defaultOptions.queries', () => {
    test('staleTimeが5分（300000ms）に設定されていること', () => {
      const defaultOptions = queryClient.getDefaultOptions();
      expect(defaultOptions.queries?.staleTime).toBe(1000 * 60 * 5);
      expect(defaultOptions.queries?.staleTime).toBe(300000);
    });

    describe('retry設定', () => {
      test.concurrent(
        '401エラーの場合、retryがfalseを返すこと（リトライしない）',
        () => {
          const retryFn = queryClient.getDefaultOptions().queries?.retry;
          if (typeof retryFn === 'function') {
            const shouldRetry = retryFn(0, unauthorizedError);
            expect(shouldRetry).toBe(false);
          } else {
            throw new Error('retry function is not defined');
          }
        }
      );

      test.concurrent(
        '401以外のWebApiExceptionの場合、failureCountが1未満ならリトライすること',
        () => {
          const retryFn = queryClient.getDefaultOptions().queries?.retry;
          if (typeof retryFn === 'function') {
            // failureCount = 0（初回失敗）の場合はリトライする
            expect(retryFn(0, serviceUnavailableError)).toBe(true);
            // failureCount = 1（2回目失敗）の場合はリトライしない
            expect(retryFn(1, serviceUnavailableError)).toBe(false);
          } else {
            throw new Error('retry function is not defined');
          }
        }
      );

      test.concurrent(
        'NetworkExceptionの場合、failureCountが1未満ならリトライすること',
        () => {
          const retryFn = queryClient.getDefaultOptions().queries?.retry;
          if (typeof retryFn === 'function') {
            // failureCount = 0（初回失敗）の場合はリトライする
            expect(retryFn(0, networkError)).toBe(true);
            // failureCount = 1（2回目失敗）の場合はリトライしない
            expect(retryFn(1, networkError)).toBe(false);
          } else {
            throw new Error('retry function is not defined');
          }
        }
      );

      test.concurrent(
        'WebApiExceptionでもNetworkExceptionでもないエラーの場合、failureCountが1未満ならリトライすること',
        () => {
          const error = new Error('Unknown error');

          const retryFn = queryClient.getDefaultOptions().queries?.retry;
          if (typeof retryFn === 'function') {
            // failureCount = 0（初回失敗）の場合はリトライする
            expect(retryFn(0, error)).toBe(true);
            // failureCount = 1（2回目失敗）の場合はリトライしない
            expect(retryFn(1, error)).toBe(false);
          } else {
            throw new Error('retry function is not defined');
          }
        }
      );
    });
  });

  describe('QueryCache error handling', () => {
    test('401エラーの場合、queryClientのキャッシュがクリアされること', () => {
      // テスト用のダミーデータをキャッシュに追加
      queryClient.setQueryData(['test-query'], { data: 'test' });

      // キャッシュにデータがあることを確認
      expect(queryClient.getQueryData(['test-query'])).toEqual({
        data: 'test',
      });

      const onError = queryClient.getQueryCache().config.onError;
      if (onError) {
        onError(
          unauthorizedError,
          {} as never // Query型の代わりにダミーオブジェクト
        );
      }

      // キャッシュがクリアされたことを確認
      expect(queryClient.getQueryData(['test-query'])).toBeUndefined();
    });

    test('401以外のエラーの場合、キャッシュがクリアされないこと', () => {
      // テスト用のダミーデータをキャッシュに追加
      queryClient.setQueryData(['test-query'], { data: 'test' });

      const onError = queryClient.getQueryCache().config.onError;
      if (onError) {
        onError(
          serviceUnavailableError,
          {} as never // Query型の代わりにダミーオブジェクト
        );
      }

      // キャッシュが残っていることを確認
      expect(queryClient.getQueryData(['test-query'])).toEqual({
        data: 'test',
      });
    });
  });

  describe('MutationCache error handling', () => {
    test('401エラーの場合、queryClientのキャッシュがクリアされること', () => {
      // テスト用のダミーデータをキャッシュに追加
      queryClient.setQueryData(['test-mutation'], { data: 'test' });

      // キャッシュにデータがあることを確認
      expect(queryClient.getQueryData(['test-mutation'])).toEqual({
        data: 'test',
      });

      const onError = queryClient.getMutationCache().config.onError;
      if (onError) {
        onError(
          unauthorizedError,
          null,
          undefined,
          {} as never, // Mutation型の代わりにダミーオブジェクト
          {} as never // MutationFunctionContext型の代わりにダミーオブジェクト
        );
      }

      // キャッシュがクリアされたことを確認
      expect(queryClient.getQueryData(['test-mutation'])).toBeUndefined();
    });

    test('401以外のエラーの場合、キャッシュがクリアされないこと', () => {
      // テスト用のダミーデータをキャッシュに追加
      queryClient.setQueryData(['test-mutation'], { data: 'test' });

      const onError = queryClient.getMutationCache().config.onError;
      if (onError) {
        onError(
          serviceUnavailableError,
          null,
          undefined,
          {} as never, // Mutation型の代わりにダミーオブジェクト
          {} as never // MutationFunctionContext型の代わりにダミーオブジェクト
        );
      }

      // キャッシュが残っていることを確認
      expect(queryClient.getQueryData(['test-mutation'])).toEqual({
        data: 'test',
      });
    });
  });

  describe('queryClient instance', () => {
    test('queryClientがQueryClientのインスタンスであること', () => {
      expect(queryClient).toBeInstanceOf(QueryClient);
    });

    test('QueryCacheが設定されていること', () => {
      expect(queryClient.getQueryCache()).toBeDefined();
      expect(queryClient.getQueryCache().config.onError).toBeDefined();
    });

    test('MutationCacheが設定されていること', () => {
      expect(queryClient.getMutationCache()).toBeDefined();
      expect(queryClient.getMutationCache().config.onError).toBeDefined();
    });
  });
});
