import type { FileQueryParams } from '@/domain/models/file';

/**
 * ローディングをグローバルで表示するクエリのキー
 * @remark
 * - 個別にローディングを表示しないQueryの先頭にこのkeyを入れる
 * - これにより、Queryが実行されている間、グローバルローディングが表示される
 */
export const GLOBAL_LOADING = 'globalLoading';

/**
 * React Query のクエリキー定数
 */
export const QUERY_KEYS = {
  // 認証関連
  AUTH: {
    CURRENT_SESSION: [GLOBAL_LOADING, 'auth', 'currentSession'],
  },

  // ファイル関連
  FILES: {
    LIST: (params?: FileQueryParams) => {
      const keys = [];
      keys.push('files', 'list');

      if (params) keys.push(params);

      return keys;
    },
    DETAIL: (id?: string) => {
      const keys = [];
      keys.push('files', 'detail');

      if (id) keys.push(id);

      return keys;
    },
  },

  // タグ関連
  TAGS: {
    LIST: [GLOBAL_LOADING, 'tags', 'list'],
  },
} as const;
