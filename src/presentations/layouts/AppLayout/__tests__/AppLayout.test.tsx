import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { mockTags } from '@/__fixtures__/tags';
import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import { i18n } from '@/i18n/config';

import { AppLayout } from '../AppLayout';

// ウィンドウサイズをvi.stubGlobalでモック
const mockWindowSize = (width: number, height: number) => {
  vi.stubGlobal('innerWidth', width);
  vi.stubGlobal('innerHeight', height);
};

// テスト用の子コンポーネント
const TestChild = () => <div data-testid="testChild">テストコンテンツ</div>;

const renderAppLayout = async () => {
  const getTags = vi.fn(async () => mockTags);

  // AppLayoutと同じルート構造でテスト
  const routes = [
    {
      path: '/',
      element: <AppLayout />,
      children: [
        {
          index: true,
          element: <TestChild />,
        },
      ],
    },
  ];

  const router = createMemoryRouter(routes, {
    initialEntries: ['/'],
  });

  const r = render(
    <RepositoryTestWrapper
      hasSuspense
      override={{
        tags: {
          getTags,
        },
      }}
    >
      <RouterProvider router={router} />
    </RepositoryTestWrapper>
  );

  await waitFor(() =>
    expect(r.queryByTestId('suspense')).not.toBeInTheDocument()
  );
  return r;
};

describe('AppLayout', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ja');
    // デフォルトのウィンドウサイズを設定
    mockWindowSize(1024, 768);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('基本コンポーネントが正しくレンダリングされること', async () => {
    const r = await renderAppLayout();

    // AppLayoutのヘッダーが表示されることを確認
    expect(r.getByRole('banner')).toBeInTheDocument();

    // AppSidebarが表示されることを確認
    expect(r.getByTestId('appSidebar')).toBeInTheDocument();

    // AppMainが表示されることを確認
    expect(r.getByRole('main')).toBeInTheDocument();
  });

  test('ResizeHandleが表示されること', async () => {
    const r = await renderAppLayout();

    expect(r.getByTestId('resizeHandle')).toBeInTheDocument();
  });

  test('ヘッダーのトグルボタンが正しく機能すること', async () => {
    const r = await renderAppLayout();
    const user = userEvent.setup();

    expect(r.getByTestId('toggleButton')).toBeInTheDocument();

    const toggleButton = r.getByTestId('toggleButton');

    // トグルボタンをクリックしてResizeHandleが非表示になることを確認
    await user.click(toggleButton);
    expect(r.queryByTestId('resizeHandle')).not.toBeInTheDocument();

    // 再度トグルボタンをクリックしてResizeHandleが表示されることを確認
    await user.click(toggleButton);
    expect(r.getByTestId('resizeHandle')).toBeInTheDocument();
  });
});
