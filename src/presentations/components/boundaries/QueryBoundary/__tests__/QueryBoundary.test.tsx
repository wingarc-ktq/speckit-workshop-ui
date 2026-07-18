import React from 'react';

import { QueryClientProvider, useSuspenseQuery } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from 'react-error-boundary';

import { forbiddenError } from '@/__fixtures__/errors';
import { createTestQueryClient } from '@/__fixtures__/testUtils';
import { i18n } from '@/i18n/config';

import { QueryBoundary } from '../QueryBoundary';

/** useSuspenseQuery でデータを取得して表示するテスト用コンポーネント */
const TestContent: React.FC<{ queryFn: () => Promise<string> }> = ({
  queryFn,
}) => {
  const { data } = useSuspenseQuery({ queryKey: ['queryBoundaryTest'], queryFn });
  return <div data-testid="content">{data}</div>;
};

describe('QueryBoundary', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ja');
  });

  const renderQueryBoundary = ({
    queryFn,
    ...props
  }: { queryFn: () => Promise<string> } & Partial<
    React.ComponentProps<typeof QueryBoundary>
  >) => {
    return render(
      <QueryClientProvider client={createTestQueryClient()}>
        <QueryBoundary skeleton={<div data-testid="skeleton" />} {...props}>
          <TestContent queryFn={queryFn} />
        </QueryBoundary>
      </QueryClientProvider>
    );
  };

  test('データ取得中はスケルトンが表示されること', () => {
    renderQueryBoundary({ queryFn: () => new Promise<string>(() => {}) });

    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  test('データ取得が成功するとコンテンツが表示されること', async () => {
    renderQueryBoundary({ queryFn: () => Promise.resolve('loaded') });

    expect(await screen.findByText('loaded')).toBeInTheDocument();
    expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
  });

  test('データ取得が失敗すると既定のエラー表示（LoadError）が表示されること', async () => {
    renderQueryBoundary({
      queryFn: () => Promise.reject(new Error('fetch failed')),
    });

    expect(
      await screen.findByText('読み込みに失敗しました')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '再読み込み' })
    ).toBeInTheDocument();
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  test('再読み込みボタンをクリックすると再取得され、成功するとコンテンツが表示されること', async () => {
    const user = userEvent.setup();
    const queryFn = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('fetch failed'))
      .mockResolvedValueOnce('recovered');

    renderQueryBoundary({ queryFn });

    await screen.findByText('読み込みに失敗しました');
    await user.click(screen.getByRole('button', { name: '再読み込み' }));

    expect(await screen.findByText('recovered')).toBeInTheDocument();
    expect(
      screen.queryByText('読み込みに失敗しました')
    ).not.toBeInTheDocument();
  });

  test('捕捉したエラーが既定のエラー表示に渡され、ステータスに応じたメッセージが表示されること', async () => {
    renderQueryBoundary({ queryFn: () => Promise.reject(forbiddenError) });

    expect(
      await screen.findByText(
        'この操作を行う権限がありません。問題が解消しない場合はブラウザをリロードしてください。'
      )
    ).toBeInTheDocument();
  });

  test('renderError を指定するとカスタムエラー表示が使われること', async () => {
    renderQueryBoundary({
      queryFn: () => Promise.reject(new Error('custom error message')),
      renderError: ({ error }) => (
        <div data-testid="customError">{error.message}</div>
      ),
    });

    expect(await screen.findByTestId('customError')).toHaveTextContent(
      'custom error message'
    );
    expect(
      screen.queryByText('読み込みに失敗しました')
    ).not.toBeInTheDocument();
  });

  test('shouldRethrow が true を返すエラーは外側の ErrorBoundary に委譲されること', async () => {
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <ErrorBoundary fallback={<div data-testid="outerBoundary" />}>
          <QueryBoundary
            skeleton={<div data-testid="skeleton" />}
            shouldRethrow={() => true}
          >
            <TestContent
              queryFn={() => Promise.reject(new Error('fetch failed'))}
            />
          </QueryBoundary>
        </ErrorBoundary>
      </QueryClientProvider>
    );

    expect(await screen.findByTestId('outerBoundary')).toBeInTheDocument();
    expect(
      screen.queryByText('読み込みに失敗しました')
    ).not.toBeInTheDocument();
  });
});
