import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { mockAuthSession } from '@/__fixtures__/auth';
import { networkError, unauthorizedError } from '@/__fixtures__/errors';
import { mockTags } from '@/__fixtures__/tags';
import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import { i18n } from '@/i18n/config';

import { routes } from '../routes';

// Pageコンポーネントはモックしてテストする
vi.mock('@/presentations/pages', () => ({
  FilesPage: () => <div data-testid="filesPage">ファイルページ</div>,
  LoginPage: () => <div data-testid="loginPage">ログイン</div>,
  NotFoundPage: () => (
    <div data-testid="notFoundPage">404 ページが見つかりません</div>
  ),
  CrashPage: ({ error }: { error: Error; resetErrorBoundary?: () => void }) => (
    <div data-testid="crashPage">クラッシュページ: {error.message}</div>
  ),
}));

describe('AppRoutes', () => {
  const getCurrentSession = vi.fn();
  const getTags = vi.fn(async () => mockTags);
  const getFiles = vi.fn();

  beforeEach(async () => {
    await i18n.changeLanguage('ja');
  });

  // テスト用のエラーページ
  const ErrorTestPage = () => {
    throw new Error('ページエラーが発生しました');
  };

  // RouteErrorBoundaryをテストするために、既存のroutesの子ルートに追加
  const testRoutes = [
    {
      ...routes[0],
      children: [
        ...routes[0].children,
        {
          path: '/test-error',
          element: <ErrorTestPage />,
        },
      ],
    },
  ];

  const renderAppRoutes = async (initialRoute = '/') => {
    const r = render(
      <RouterProvider
        router={createMemoryRouter(testRoutes, {
          initialEntries: [initialRoute],
        })}
      />,
      {
        wrapper: ({ children }: { children: React.ReactNode }) => (
          <RepositoryTestWrapper
            hasSuspense
            override={{
              auth: {
                getCurrentSession,
              },
              tags: {
                getTags,
              },
              files: {
                getFiles,
              },
            }}
          >
            {children}
          </RepositoryTestWrapper>
        ),
      }
    );

    await waitFor(() =>
      expect(r.queryByTestId('suspense')).not.toBeInTheDocument()
    );
    return r;
  };

  test('セッション取得に成功した場合、FilesPageがレンダリングされる', async () => {
    getCurrentSession.mockResolvedValue(mockAuthSession);

    await renderAppRoutes();

    await waitFor(() => {
      expect(getCurrentSession).toHaveBeenCalledOnce();
    });

    await waitFor(() => {
      expect(screen.getByTestId('filesPage')).toBeInTheDocument();
    });
  });
  describe('セッション取得に失敗した場合', () => {
    test('セッション切れの場合、LoginPageがレンダリングされる', async () => {
      getCurrentSession.mockRejectedValue(unauthorizedError);

      await renderAppRoutes();

      await waitFor(() => {
        expect(getCurrentSession).toHaveBeenCalledOnce();
      });

      await waitFor(() => {
        expect(screen.getByTestId('loginPage')).toBeInTheDocument();
      });
    });
    test('それ以外の場合、CrashPageが表示される', async () => {
      getCurrentSession.mockRejectedValue(networkError);

      await renderAppRoutes();

      await waitFor(() => {
        expect(getCurrentSession).toHaveBeenCalledOnce();
      });

      await waitFor(() => {
        expect(screen.getByTestId('crashPage')).toBeInTheDocument();
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
      });
    });
  });

  describe('ルーティングのテスト', () => {
    describe('ルートパス', () => {
      test('/ にアクセスした場合、FilesPageが表示される', async () => {
        getCurrentSession.mockResolvedValue(mockAuthSession);

        await renderAppRoutes('/');

        await waitFor(() => {
          expect(screen.getByTestId('filesPage')).toBeInTheDocument();
        });
      });
    });
    describe('存在しないページへのアクセス', () => {
      test('存在しないページにアクセスした場合、NotFoundPageが表示される', async () => {
        getCurrentSession.mockResolvedValue(mockAuthSession);
        await renderAppRoutes('/non-existent-page');

        await waitFor(() => {
          expect(screen.getByTestId('notFoundPage')).toBeInTheDocument();
        });
      });
    });

    describe('RouteErrorBoundary', () => {
      test('ページコンポーネントでエラーが発生した場合、CrashPageが表示される', async () => {
        getCurrentSession.mockResolvedValue(mockAuthSession);
        await renderAppRoutes('/test-error');

        await waitFor(() => {
          expect(screen.getByTestId('crashPage')).toBeInTheDocument();
        });
      });
    });
  });
});
