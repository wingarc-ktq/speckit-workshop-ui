import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';

import { mockTags } from '@/__fixtures__/tags';
import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import { i18n } from '@/i18n/config';
import { QUERY_PARAMS } from '@/presentations/constants/queryParams';

import { AppHeader } from '../AppHeader';

/**
 * テスト用に現在のlocationを取得するためのコンポーネント
 */
const LocationObserver: React.FC<{
  onLocationChange: (search: string) => void;
}> = ({ onLocationChange }) => {
  const location = useLocation();
  onLocationChange(location.search);
  return null;
};

describe('AppHeader', () => {
  const onMenuToggle = vi.fn();
  const logoutUser = vi.fn();
  const getTags = vi.fn(async () => mockTags);

  beforeEach(async () => {
    await i18n.changeLanguage('ja');
  });

  const renderAppHeader = async (initialUrl = '/') => {
    let currentSearch = '';
    const result = render(
      <MemoryRouter initialEntries={[initialUrl]}>
        <RepositoryTestWrapper
          hasSuspense
          override={{
            auth: {
              logoutUser: logoutUser,
            },
            tags: {
              getTags,
            },
          }}
        >
          <LocationObserver
            onLocationChange={(search) => {
              currentSearch = search;
            }}
          />
          <AppHeader onMenuToggle={onMenuToggle} />
        </RepositoryTestWrapper>
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(result.queryByTestId('suspense')).not.toBeInTheDocument()
    );

    return {
      ...result,
      getLocation: () => currentSearch,
    };
  };

  describe('基本的な表示', () => {
    test('メニュートグルボタンが表示されること', async () => {
      await renderAppHeader();

      const toggleButton = screen.getByTestId('toggleButton');
      expect(toggleButton).toBeInTheDocument();
    });

    test('メニュートグルボタンにMenuIconが表示されること', async () => {
      await renderAppHeader();

      const menuIcon = screen.getByTestId('MenuIcon');
      expect(menuIcon).toBeInTheDocument();
    });

    test('ロゴとアプリ名が表示されること', async () => {
      await renderAppHeader();

      const appName = screen.getByText('UI Proto');
      expect(appName).toBeInTheDocument();
    });

    test('通知アイコンが表示されること', async () => {
      await renderAppHeader();

      const notificationIcon = screen.getByTestId('NotificationsOutlinedIcon');
      expect(notificationIcon).toBeInTheDocument();
    });

    test('通知バッジが表示されること', async () => {
      await renderAppHeader();

      const badge = screen.getByText('3');
      expect(badge).toBeInTheDocument();
    });

    test('ユーザーメニューが表示されること', async () => {
      await renderAppHeader();

      const userMenuButton = screen.getByTestId('user-menu-button');
      expect(userMenuButton).toBeInTheDocument();
    });
  });

  describe('メニュートグル機能', () => {
    test('メニュートグルボタンをクリックするとonMenuToggleが呼ばれること', async () => {
      const user = userEvent.setup();
      await renderAppHeader();

      const toggleButton = screen.getByTestId('toggleButton');
      await user.click(toggleButton);

      expect(onMenuToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('多言語リソースの確認', () => {
    describe('i18n: layouts.appHeader.searchPlaceholder', () => {
      test('locale:ja "ファイルを検索..." が表示される', async () => {
        await renderAppHeader();

        const searchInput = screen.getByPlaceholderText('ファイルを検索...');
        expect(searchInput).toBeInTheDocument();
      });
    });
  });

  describe('検索機能', () => {
    test('検索バーに入力できること', async () => {
      const user = userEvent.setup();
      await renderAppHeader();

      const searchInput = screen.getByPlaceholderText('ファイルを検索...');
      await user.type(searchInput, 'テストファイル');

      expect(searchInput).toHaveValue('テストファイル');
    });

    test('検索値がない場合、クリアボタンが表示されないこと', async () => {
      await renderAppHeader();

      const closeIcon = screen.queryByTestId('CloseIcon');
      expect(closeIcon).not.toBeInTheDocument();
    });

    test('検索値がある場合、クリアボタンが表示されること', async () => {
      const user = userEvent.setup();
      await renderAppHeader();

      const searchInput = screen.getByPlaceholderText('ファイルを検索...');
      await user.type(searchInput, 'テスト');

      const closeIcon = screen.getByTestId('CloseIcon');
      expect(closeIcon).toBeInTheDocument();
    });

    test('クリアボタンをクリックすると検索値がクリアされること', async () => {
      const user = userEvent.setup();
      await renderAppHeader();

      const searchInput = screen.getByPlaceholderText('ファイルを検索...');
      await user.type(searchInput, 'テスト');

      expect(searchInput).toHaveValue('テスト');

      const closeButton = screen
        .getByTestId('CloseIcon')
        .closest('button') as HTMLButtonElement;
      await user.click(closeButton);

      expect(searchInput).toHaveValue('');
    });
  });

  describe('検索のデバウンス処理', () => {
    test('入力後300ms待機するとURL検索パラメータが更新されること', async () => {
      const user = userEvent.setup();
      const { getLocation } = await renderAppHeader();

      const searchInput = screen.getByPlaceholderText('ファイルを検索...');
      await user.type(searchInput, 'テストファイル');

      // デバウンス前はURLパラメータが更新されていない
      expect(getLocation()).toBe('');

      // デバウンス後にURLパラメータが更新される（300ms + α待機）
      await waitFor(
        () => {
          const search = getLocation();
          const searchParams = new URLSearchParams(search);
          expect(searchParams.get(QUERY_PARAMS.SEARCH)).toBe('テストファイル');
        },
        { timeout: 1000 }
      );
    });

    test('検索値をクリアするとURL検索パラメータが削除されること', async () => {
      const user = userEvent.setup();
      const { getLocation } = await renderAppHeader();

      const searchInput = screen.getByPlaceholderText('ファイルを検索...');

      // 検索値を入力
      await user.type(searchInput, 'テスト');

      await waitFor(
        () => {
          const search = getLocation();
          const searchParams = new URLSearchParams(search);
          expect(searchParams.get(QUERY_PARAMS.SEARCH)).toBe('テスト');
        },
        { timeout: 1000 }
      );

      // クリアボタンをクリック
      const closeButton = screen
        .getByTestId('CloseIcon')
        .closest('button') as HTMLButtonElement;
      await user.click(closeButton);

      // URLパラメータが削除される
      await waitFor(
        () => {
          const search = getLocation();
          const searchParams = new URLSearchParams(search);
          expect(searchParams.get(QUERY_PARAMS.SEARCH)).toBeNull();
        },
        { timeout: 1000 }
      );
    });
  });

  describe('URL検索パラメータの初期値反映', () => {
    test('URLパラメータのsearchが初期値として検索バーに表示されること', async () => {
      await renderAppHeader('/?search=初期検索値');

      const searchInput = screen.getByPlaceholderText('ファイルを検索...');
      expect(searchInput).toHaveValue('初期検索値');
    });

    test('URLパラメータのsearchがある場合、クリアボタンが表示されること', async () => {
      await renderAppHeader('/?search=初期検索値');

      const closeIcon = screen.getByTestId('CloseIcon');
      expect(closeIcon).toBeInTheDocument();
    });

    test('URLパラメータのsearchがない場合、検索バーが空であること', async () => {
      await renderAppHeader('/');

      const searchInput = screen.getByPlaceholderText('ファイルを検索...');
      expect(searchInput).toHaveValue('');
    });
  });

  describe('検索によるページリセット', () => {
    test('検索を実行するとpageパラメータが削除されること', async () => {
      const user = userEvent.setup();
      const { getLocation } = await renderAppHeader('/?page=2');

      const searchInput = screen.getByPlaceholderText('ファイルを検索...');
      await user.type(searchInput, 'テスト');

      await waitFor(
        () => {
          const search = getLocation();
          const searchParams = new URLSearchParams(search);
          // searchパラメータが追加され、pageパラメータが削除される
          expect(searchParams.get(QUERY_PARAMS.SEARCH)).toBe('テスト');
          expect(searchParams.get(QUERY_PARAMS.PAGE)).toBeNull();
        },
        { timeout: 1000 }
      );
    });

    test('既存のsearchとpageパラメータがある状態で検索を変更するとpageがリセットされること', async () => {
      const user = userEvent.setup();
      const { getLocation } = await renderAppHeader('/?search=古い検索&page=3');

      const searchInput = screen.getByPlaceholderText('ファイルを検索...');

      // 検索値をクリアして新しい値を入力
      await user.clear(searchInput);
      await user.type(searchInput, '新しい検索');

      await waitFor(
        () => {
          const search = getLocation();
          const searchParams = new URLSearchParams(search);
          // 新しいsearchパラメータが設定され、pageパラメータが削除される
          expect(searchParams.get(QUERY_PARAMS.SEARCH)).toBe('新しい検索');
          expect(searchParams.get(QUERY_PARAMS.PAGE)).toBeNull();
        },
        { timeout: 1000 }
      );
    });
  });
});
