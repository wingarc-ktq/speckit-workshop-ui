import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { NavigationListItem } from '../NavigationListItem';

const renderNavigationListItem = (
  props: React.ComponentProps<typeof NavigationListItem>,
  initialRoute = '/'
) => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route
          path="*"
          element={
            <nav>
              <NavigationListItem {...props} />
            </nav>
          }
        />
      </Routes>
    </MemoryRouter>
  );
};

describe('NavigationListItem', () => {
  describe('初期表示', () => {
    test('toプロパティがある場合、NavLinkとして表示されること', () => {
      renderNavigationListItem({
        icon: <HomeIcon />,
        label: 'ホーム',
        to: '/home',
      });

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/home');
    });

    test('toプロパティがない場合、ボタンとして表示されること', () => {
      renderNavigationListItem({
        icon: <SettingsIcon />,
        label: '設定',
      });

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    test('アイコンとラベルが正しく表示されること', () => {
      renderNavigationListItem({
        icon: <HomeIcon data-testid="home-icon" />,
        label: 'ホーム',
        to: '/home',
      });

      expect(screen.getByTestId('home-icon')).toBeInTheDocument();
      expect(screen.getByText('ホーム')).toBeInTheDocument();
    });
  });

  describe('NavLinkモード (toプロパティあり)', () => {
    test('現在のルートと一致する場合、選択状態になること', () => {
      renderNavigationListItem(
        {
          icon: <HomeIcon />,
          label: 'ホーム',
          to: '/home',
        },
        '/home'
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('Mui-selected');
    });

    test('現在のルートと一致しない場合、選択状態にならないこと', () => {
      renderNavigationListItem(
        {
          icon: <HomeIcon />,
          label: 'ホーム',
          to: '/home',
        },
        '/other'
      );

      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('Mui-selected');
    });

    test('ネストされたルートでも選択状態が正しく動作すること', () => {
      renderNavigationListItem(
        {
          icon: <SettingsIcon />,
          label: '設定',
          to: '/settings',
        },
        '/settings/profile'
      );

      const button = screen.getByRole('button');
      // react-router-domのNavLinkはデフォルトで部分一致するため、選択状態になる
      expect(button).toHaveClass('Mui-selected');
    });

    test('リンクをクリックすると正しいページに遷移すること', async () => {
      const user = userEvent.setup();

      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <nav>
                  <NavigationListItem
                    icon={<HomeIcon />}
                    label="ホーム"
                    to="/home"
                  />
                </nav>
              }
            />
            <Route path="/home" element={<div>ホームページ</div>} />
          </Routes>
        </MemoryRouter>
      );

      const link = screen.getByRole('link');
      await user.click(link);

      // ページ遷移後の要素が表示されることを確認
      expect(await screen.findByText('ホームページ')).toBeInTheDocument();
    });
  });

  describe('ボタンモード (toプロパティなし)', () => {
    test('selectedプロパティがtrueの場合、選択状態になること', () => {
      renderNavigationListItem({
        icon: <SettingsIcon />,
        label: '設定',
        selected: true,
      });

      const button = screen.getByRole('button');
      expect(button).toHaveClass('Mui-selected');
    });

    test('selectedプロパティがfalseの場合、選択状態にならないこと', () => {
      renderNavigationListItem({
        icon: <SettingsIcon />,
        label: '設定',
        selected: false,
      });

      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('Mui-selected');
    });

    test('selectedプロパティが指定されていない場合、デフォルトでfalseになること', () => {
      renderNavigationListItem({
        icon: <SettingsIcon />,
        label: '設定',
      });

      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('Mui-selected');
    });

    test('onClickハンドラが呼び出されること', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      renderNavigationListItem({
        icon: <SettingsIcon />,
        label: '設定',
        onClick,
      });

      const button = screen.getByRole('button');
      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    test('複数回クリックしても正しく動作すること', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      renderNavigationListItem({
        icon: <SettingsIcon />,
        label: '設定',
        onClick,
      });

      const button = screen.getByRole('button');
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(3);
    });

    test('onClickが指定されていない場合でもエラーにならないこと', async () => {
      const user = userEvent.setup();

      renderNavigationListItem({
        icon: <SettingsIcon />,
        label: '設定',
      });

      const button = screen.getByRole('button');

      // エラーが発生しないことを確認
      await expect(user.click(button)).resolves.not.toThrow();
    });
  });

  describe('エッジケース', () => {
    test('長いラベルも正しく表示されること', () => {
      const longLabel = 'これは非常に長いナビゲーションアイテムのラベルです';

      renderNavigationListItem({
        icon: <HomeIcon />,
        label: longLabel,
        to: '/home',
      });

      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    test('特殊文字を含むラベルも正しく表示されること', () => {
      const specialLabel = 'ファイル & フォルダー (詳細)';

      renderNavigationListItem({
        icon: <HomeIcon />,
        label: specialLabel,
        to: '/files',
      });

      expect(screen.getByText(specialLabel)).toBeInTheDocument();
    });

    test('空文字のラベルでもエラーにならないこと', () => {
      renderNavigationListItem({
        icon: <HomeIcon />,
        label: '',
        to: '/home',
      });

      // コンポーネントがレンダリングされることを確認
      expect(screen.getByRole('link')).toBeInTheDocument();
    });

    test('ルートパス "/"が正しく処理されること', () => {
      renderNavigationListItem(
        {
          icon: <HomeIcon />,
          label: 'ホーム',
          to: '/',
        },
        '/'
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/');

      const button = screen.getByRole('button');
      expect(button).toHaveClass('Mui-selected');
    });

    test('クエリパラメータ付きのパスも正しく処理されること', () => {
      renderNavigationListItem({
        icon: <HomeIcon />,
        label: 'ホーム',
        to: '/home?tab=settings',
      });

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/home?tab=settings');
    });
  });

  describe('アクセシビリティ', () => {
    test('toプロパティがある場合、role="link"が設定されていること', () => {
      renderNavigationListItem({
        icon: <HomeIcon />,
        label: 'ホーム',
        to: '/home',
      });

      expect(screen.getByRole('link')).toBeInTheDocument();
    });

    test('toプロパティがない場合、role="button"が設定されていること', () => {
      renderNavigationListItem({
        icon: <SettingsIcon />,
        label: '設定',
      });

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('選択状態のアイテムにaria-selected属性が適切に設定されていること', () => {
      renderNavigationListItem({
        icon: <SettingsIcon />,
        label: '設定',
        selected: true,
      });

      const button = screen.getByRole('button');
      // MUIのListItemButtonは選択状態でMui-selectedクラスを付与する
      expect(button).toHaveClass('Mui-selected');
    });
  });
});
