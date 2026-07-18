import React, { Suspense } from 'react';

import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

import { LoadError } from '../../feedback';

interface QueryBoundaryProps {
  children: React.ReactNode;
  /** データ取得中に表示するフォールバック（最終レイアウトと同形のスケルトンを推奨） */
  skeleton: React.ReactNode;
  /** 値が変わったときにエラー状態を自動でリセットするキー（例: folderId） */
  resetKeys?: unknown[];
  /** true を返したエラーはこの境界で捕捉せず、外側の ErrorBoundary に委譲する */
  shouldRethrow?: (error: Error) => boolean;
  /** エラー表示を差し替える場合に指定。省略時は {@link LoadError} を表示する */
  renderError?: (props: QueryBoundaryRenderErrorProps) => React.ReactNode;
}

interface QueryBoundaryRenderErrorProps {
  /** 捕捉したエラー */
  error: Error;
  /** エラー状態を解除し、失敗したクエリを再試行する */
  reset: () => void;
}

/**
 * データ取得を行うコンポーネントのローディング・エラーを、その範囲内で
 * 個別に扱うための境界。Suspense + ErrorBoundary + QueryErrorResetBoundary を
 * 1部品に束ねる。
 *
 * @remarks
 * - useSuspenseQuery のローディングは skeleton、エラーは再試行ボタン付きの
 *   {@link LoadError} として、コンテンツが表示される場所にインライン表示する
 * - 404 などページレベルで処理すべきエラーは shouldRethrow で外側の境界に委譲する
 *
 * @example
 * ```tsx
 * <QueryBoundary
 *   skeleton={<DataGridSkeleton />}
 *   resetKeys={[folderId]}
 *   shouldRethrow={isNotFoundError}
 * >
 *   <DocumentDataGridContainer folderId={folderId} />
 * </QueryBoundary>
 * ```
 */
export const QueryBoundary: React.FC<QueryBoundaryProps> = ({
  skeleton,
  renderError,
  resetKeys,
  shouldRethrow,
  children,
}) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          resetKeys={resetKeys}
          fallbackRender={({ error, resetErrorBoundary }) => {
            // react-error-boundary は error を unknown 型で渡すため Error に正規化する
            const normalizedError =
              error instanceof Error ? error : new Error(String(error));
            if (shouldRethrow?.(normalizedError) === true) throw error;

            return renderError !== undefined ? (
              renderError({ error: normalizedError, reset: resetErrorBoundary })
            ) : (
              <LoadError error={normalizedError} onReload={resetErrorBoundary} />
            );
          }}
        >
          <Suspense fallback={skeleton}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};
