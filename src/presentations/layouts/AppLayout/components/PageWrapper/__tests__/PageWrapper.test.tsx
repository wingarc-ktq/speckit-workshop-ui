import React from 'react';

import {
  QueryClient,
  QueryClientProvider,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ErrorBoundary } from 'react-error-boundary';

import { HTTP_STATUS_CLIENT_ERROR } from '@/domain/constants';
import { WebApiException } from '@/domain/errors';

import { PageWrapper } from '../PageWrapper';

// テスト用のWebApiExceptionを作成
const appError = new WebApiException(
  HTTP_STATUS_CLIENT_ERROR.BAD_REQUEST,
  'Bad Request',
  null
);

// テスト用のコンポーネント
const TestComponent: React.FC = () => {
  return <div data-testid="test-content">Test Content</div>;
};

const TestComponentWithSuspenseQuery: React.FC<{ error?: Error }> = ({
  error,
}) => {
  useSuspenseQuery({
    queryKey: ['test-suspense-query'],
    queryFn: async () => {
      if (error) {
        throw error;
      }
      return 'success';
    },
  });

  return <div data-testid="suspense-content">Suspense Content</div>;
};

describe('PageWrapper', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  const renderWithPageWrapper = (children: React.ReactNode) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <PageWrapper>{children}</PageWrapper>
      </QueryClientProvider>
    );
  };

  describe('正常系の表示', () => {
    test('子コンポーネントが正常に表示されること', () => {
      renderWithPageWrapper(<TestComponent />);

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    test('useSuspenseQueryが成功した場合、コンテンツが表示されること', async () => {
      renderWithPageWrapper(
        <TestComponentWithSuspenseQuery error={undefined} />
      );

      await waitFor(() => {
        expect(screen.getByTestId('suspense-content')).toBeInTheDocument();
      });
    });
  });

  describe('エラー時の表示', () => {
    test('コンポーネントでエラーが発生した場合、AppErrorDialogが表示されること', async () => {
      renderWithPageWrapper(
        <TestComponentWithSuspenseQuery error={appError} />
      );

      await waitFor(() => {
        expect(screen.getByTestId('appErrorDialog')).toBeInTheDocument();
      });

      // エラーメッセージは多言語化されてBadRequestメッセージになる
      expect(screen.getByTestId('errorMessage')).toBeInTheDocument();
    });

    test('エラーダイアログのOKボタンをクリックするとエラーバウンダリがリセットされること', async () => {
      const user = userEvent.setup();

      renderWithPageWrapper(
        <TestComponentWithSuspenseQuery error={appError} />
      );

      // エラーダイアログが表示されるまで待機
      await waitFor(() => {
        expect(screen.getByTestId('appErrorDialog')).toBeInTheDocument();
      });

      // OKボタンをクリック
      const okButton = screen.getByTestId('okButton');
      await user.click(okButton);

      // エラーバウンダリがリセットされるが、
      // 同じエラーコンポーネントがあるため再度エラーが表示される
      await waitFor(() => {
        expect(screen.getByTestId('appErrorDialog')).toBeInTheDocument();
      });
    });

    test('ApplicationException以外のエラーの場合、再スローされ上位のErrorBoundaryで捕捉されること', async () => {
      const unexpectedError = new Error('unexpected');

      render(
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary
            fallbackRender={() => <div data-testid="outerErrorBoundary" />}
          >
            <PageWrapper>
              <TestComponentWithSuspenseQuery error={unexpectedError} />
            </PageWrapper>
          </ErrorBoundary>
        </QueryClientProvider>
      );

      // AppErrorDialogは表示されず、上位のErrorBoundaryが捕捉する
      await waitFor(() => {
        expect(screen.getByTestId('outerErrorBoundary')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('appErrorDialog')).not.toBeInTheDocument();
    });
  });
});
