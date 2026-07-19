import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { createTestQueryClient } from '@/__fixtures__/testUtils';

import { useQueryExtError } from '../useQueryExtError';

import type { UseQueryResult } from '@tanstack/react-query';

describe('useQueryExtError', () => {
  const client = createTestQueryClient();

  const useQueryOk = () =>
    useQuery({
      queryKey: ['key'],
      queryFn: async () => 'data',
    });

  const error = new Error('ng');

  const useQueryNg = () =>
    useQuery({
      queryKey: ['key'],
      queryFn: async () => {
        throw error;
      },
    });

  const hook = <TData, TError>(
    queryHook: () => UseQueryResult<TData, TError>
  ) =>
    renderHook(() => useQueryExtError(queryHook()), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={client}>
          <MemoryRouter>{children}</MemoryRouter>
        </QueryClientProvider>
      ),
    });

  beforeEach(() => client.clear());

  describe('エラーが発生しない場合', () => {
    test.concurrent('取得結果をそのまま返す', async () => {
      const r = hook(useQueryOk);
      await waitFor(() => expect(r.result.current.data).toBe('data'));
      expect(r.result.current.error).toBeNull();
      expect(r.result.current.isError).toBe(false);
    });
  });

  describe('エラーが発生した場合', () => {
    test.concurrent(
      '発生したエラーを返し、resetErrorでクリアできる',
      async () => {
        const r = hook(useQueryNg);
        await waitFor(() => r.result.current.isPending);
        /**
         * useQueryExtError内のuseEffectが処理されるまで待つ
         * (useEffect分ライフサイクルを進ませる必要がある)
         */
        await waitFor(() => expect(r.result.current.error).toBe(error));
        expect(r.result.current.isError).toBe(true);

        act(() => r.result.current.resetError());
        expect(r.result.current.error).toBeNull();
        expect(r.result.current.isError).toBe(false);
      }
    );
  });
});
