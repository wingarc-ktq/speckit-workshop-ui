import { QueryClient } from '@tanstack/react-query';

import type { RepositoryComposition } from '@/adapters/repositories';

export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      },
    },
  });
};

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * リポジトリをモックに差し替えるためのオーバーライド型
 *
 * リポジトリのカテゴリと、そのカテゴリに属するリポジトリをすべてPartialにすることで、
 * リポジトリの一部をモックに差し替えることができます。
 */
export type OverrideRepositories = DeepPartial<RepositoryComposition>;

/**
 * リポジトリのオーバーライドとデフォルト値をマージする関数
 */
export function createMergedRepositories<T extends Record<string, unknown>>(
  overrideRepositories: DeepPartial<T> | undefined,
  defaultRepositories: T
): T {
  if (!overrideRepositories) {
    return defaultRepositories;
  }

  const result = { ...defaultRepositories };

  for (const key in overrideRepositories) {
    if (
      key in overrideRepositories &&
      overrideRepositories[key] !== undefined
    ) {
      const defaultValue = result[key];
      const overrideValue = overrideRepositories[key];

      if (
        typeof defaultValue === 'object' &&
        defaultValue !== null &&
        typeof overrideValue === 'object' &&
        overrideValue !== null
      ) {
        result[key] = {
          ...defaultValue,
          ...overrideValue,
        } as T[Extract<keyof T, string>];
      } else {
        result[key] = overrideValue as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}

/**
 * 指定したモック関数の戻り値を保留状態の Promise に差し替え、
 * 後から取得を完了させるための関数を返す。取得中→完了の遷移検証に使う。
 *
 * @example
 * const resolve = deferMock(getFoo, fooValue);
 * // ... 取得中（スケルトン等）を検証 ...
 * resolve(); // 取得を完了させる
 */
export const deferMock = <T>(
  mockFn: ReturnType<typeof vi.fn>,
  value: T
): (() => void) => {
  const { promise, resolve } = Promise.withResolvers<T>();
  mockFn.mockReturnValue(promise);
  return () => resolve(value);
};
