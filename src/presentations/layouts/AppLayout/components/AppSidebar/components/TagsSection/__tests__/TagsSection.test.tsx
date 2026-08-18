import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { mockTags } from '@/__fixtures__/tags';
import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import type { Tag } from '@/domain/models/tag';
import { i18n } from '@/i18n/config';

import { TagsSection } from '../TagsSection';

describe('TagsSection', () => {
  // リポジトリのモック関数
  const getTags = vi.fn<() => Promise<Tag[]>>();

  beforeEach(async () => {
    await i18n.changeLanguage('ja');

    // デフォルトのモック実装を設定
    getTags.mockResolvedValue(mockTags);
  });

  const renderTagsSection = async (initialUrl = '/') => {
    const r = render(
      <RepositoryTestWrapper
        override={{
          tags: {
            getTags: getTags,
          },
        }}
        hasSuspense
      >
        <MemoryRouter initialEntries={[initialUrl]}>
          <TagsSection />
        </MemoryRouter>
      </RepositoryTestWrapper>
    );

    await waitFor(() =>
      expect(r.queryByTestId('suspense')).not.toBeInTheDocument()
    );
    return r;
  };

  describe('多言語リソースの確認', () => {
    describe('i18n: layouts.appSidebar.tags.title', () => {
      test('locale:ja "タグ" が表示される', async () => {
        await renderTagsSection();

        expect(screen.getByText('タグ')).toBeInTheDocument();
      });
    });
  });

  describe('初期表示', () => {
    test('セクションタイトルが表示されること', async () => {
      await renderTagsSection();

      expect(screen.getByText('タグ')).toBeInTheDocument();
    });

    test('追加ボタンが表示されること', async () => {
      await renderTagsSection();

      const addButton = screen.getByTestId('addTagButton');
      expect(addButton).toBeInTheDocument();
    });

    test('タグリストが正しく表示されること', async () => {
      await renderTagsSection();

      expect(screen.getByText('Important')).toBeInTheDocument();
      expect(screen.getByText('Review')).toBeInTheDocument();
      expect(screen.getByText('Urgent')).toBeInTheDocument();
    });

    test('各タグが非選択状態で表示されること', async () => {
      await renderTagsSection();

      // 非選択状態のアイコンが表示されていることを確認
      const outlinedIcons = screen.getAllByTestId('SellOutlinedIcon');
      expect(outlinedIcons).toHaveLength(3);
    });
  });

  describe('ユーザー操作', () => {
    test('タグをクリックすると選択状態になること', async () => {
      const user = userEvent.setup();
      await renderTagsSection();

      // 初期状態: 全て非選択
      const outlinedIcons = screen.getAllByTestId('SellOutlinedIcon');
      expect(outlinedIcons).toHaveLength(3);

      // Importantタグをクリック
      const importantTag = screen.getByText('Important');
      await user.click(importantTag);

      // URLパラメータが更新されて選択状態になる
      await waitFor(() => {
        const selectedIcons = screen.getAllByTestId('SellIcon');
        expect(selectedIcons).toHaveLength(1);
      });
    });

    test('選択済みタグをクリックすると選択解除されること', async () => {
      const user = userEvent.setup();
      await renderTagsSection('/?tags=tag-001');

      // 初期状態: 1つ選択済み
      const selectedIcons = screen.getAllByTestId('SellIcon');
      expect(selectedIcons).toHaveLength(1);

      // 選択済みのImportantタグをクリック
      const importantTag = screen.getByText('Important');
      await user.click(importantTag);

      // 選択解除される
      await waitFor(() => {
        const outlinedIcons = screen.getAllByTestId('SellOutlinedIcon');
        expect(outlinedIcons).toHaveLength(3);
      });
    });

    test('複数のタグを選択できること', async () => {
      const user = userEvent.setup();
      await renderTagsSection();

      // Importantタグをクリック
      const importantTag = screen.getByText('Important');
      await user.click(importantTag);

      await waitFor(() => {
        expect(screen.getAllByTestId('SellIcon')).toHaveLength(1);
      });

      // Reviewタグをクリック
      const reviewTag = screen.getByText('Review');
      await user.click(reviewTag);

      // 2つ選択状態になる
      await waitFor(() => {
        expect(screen.getAllByTestId('SellIcon')).toHaveLength(2);
      });
    });

    test('タグ管理ボタンをクリックするとダイアログが開くこと', async () => {
      const user = userEvent.setup();
      await renderTagsSection();

      // 初期状態: ダイアログは非表示
      expect(
        screen.queryByTestId('tagManagementDialog')
      ).not.toBeInTheDocument();

      // タグ管理ボタンをクリック
      const addButton = screen.getByTestId('addTagButton');
      await user.click(addButton);

      // ダイアログが表示される
      await waitFor(() => {
        expect(screen.getByTestId('tagManagementDialog')).toBeInTheDocument();
      });
    });

    test('タグ管理ダイアログを閉じることができること', async () => {
      const user = userEvent.setup();
      await renderTagsSection();

      // ダイアログを開く
      const addButton = screen.getByTestId('addTagButton');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('tagManagementDialog')).toBeInTheDocument();
      });

      // 閉じるボタンをクリック
      const closeButton = screen.getByTestId('closeButton');
      await user.click(closeButton);

      // ダイアログが閉じる
      await waitFor(() => {
        expect(
          screen.queryByTestId('tagManagementDialog')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('選択状態の表示', () => {
    test('URLパラメータで選択されているタグが選択状態で表示されること', async () => {
      await renderTagsSection('/?tags=tag-001');

      // 選択状態のアイコンが表示されることを確認
      const selectedIcons = screen.getAllByTestId('SellIcon');
      expect(selectedIcons).toHaveLength(1);

      // 非選択状態のアイコンも表示されることを確認
      const outlinedIcons = screen.getAllByTestId('SellOutlinedIcon');
      expect(outlinedIcons).toHaveLength(2);
    });

    test('複数のタグが選択状態で表示されること', async () => {
      await renderTagsSection('/?tags=tag-001,tag-002');

      const selectedIcons = screen.getAllByTestId('SellIcon');
      expect(selectedIcons).toHaveLength(2);

      const outlinedIcons = screen.getAllByTestId('SellOutlinedIcon');
      expect(outlinedIcons).toHaveLength(1);
    });
  });

  describe('ローディング状態', () => {
    test('データ取得中はSuspenseフォールバックが表示されること', () => {
      // 解決されないPromiseを返してローディング状態を維持
      getTags.mockReturnValue(new Promise(() => {}));

      render(
        <RepositoryTestWrapper
          override={{
            tags: {
              getTags: getTags,
            },
          }}
          hasSuspense
        >
          <MemoryRouter initialEntries={['/']}>
            <TagsSection />
          </MemoryRouter>
        </RepositoryTestWrapper>
      );

      // ローディング中はSuspenseフォールバックが表示される
      expect(screen.getByTestId('suspense')).toBeInTheDocument();
      expect(screen.queryByTestId('tagsSection')).not.toBeInTheDocument();
    });
  });
});
