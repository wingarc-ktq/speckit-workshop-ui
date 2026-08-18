import type { ComponentProps } from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { mockTags, mockTag } from '@/__fixtures__/tags';
import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import { i18n } from '@/i18n/config';
import { QUERY_PARAMS } from '@/presentations/constants/queryParams';

import { SearchFilterPopover } from '../SearchFilterPopover';

describe('SearchFilterPopover', () => {
  const getTags = vi.fn(async () => mockTags);
  const onClose = vi.fn();

  beforeEach(async () => {
    await i18n.changeLanguage('ja');
  });

  const renderSearchFilterPopover = async (
    initialUrl = '/',
    props: Partial<ComponentProps<typeof SearchFilterPopover>> = {}
  ) => {
    // ポップオーバーのアンカー要素を作成
    const anchorElement = document.createElement('div');
    document.body.appendChild(anchorElement);

    const result = render(
      <RepositoryTestWrapper
        override={{
          tags: {
            getTags: getTags,
          },
        }}
        hasSuspense
      >
        <MemoryRouter initialEntries={[initialUrl]}>
          <SearchFilterPopover
            anchorEl={anchorElement}
            open={true}
            onClose={onClose}
            {...props}
          />
        </MemoryRouter>
      </RepositoryTestWrapper>
    );

    await waitFor(() =>
      expect(result.queryByTestId('suspense')).not.toBeInTheDocument()
    );

    return {
      ...result,
      anchorElement,
    };
  };

  describe('多言語リソースの確認', () => {
    describe('i18n: layouts.appHeader.filterPopover.title', () => {
      test('locale:ja "詳細検索" が表示される', async () => {
        await renderSearchFilterPopover();

        expect(screen.getByText('詳細検索')).toBeInTheDocument();
      });
    });

    describe('i18n: layouts.appHeader.filterPopover.searchLabel', () => {
      test('locale:ja "キーワード" が表示される', async () => {
        await renderSearchFilterPopover();

        expect(screen.getByLabelText('キーワード')).toBeInTheDocument();
      });
    });

    describe('i18n: layouts.appHeader.filterPopover.searchPlaceholder', () => {
      test('locale:ja "ファイル名を入力..." が表示される', async () => {
        await renderSearchFilterPopover();

        expect(
          screen.getByPlaceholderText('ファイル名を入力...')
        ).toBeInTheDocument();
      });
    });

    describe('i18n: layouts.appHeader.filterPopover.tagsLabel', () => {
      test('locale:ja "タグで絞り込み" が表示される', async () => {
        await renderSearchFilterPopover();

        expect(screen.getByLabelText('タグで絞り込み')).toBeInTheDocument();
      });
    });

    describe('i18n: layouts.appHeader.filterPopover.clear', () => {
      test('locale:ja "クリア" が表示される', async () => {
        await renderSearchFilterPopover();

        expect(
          screen.getByRole('button', { name: 'クリア' })
        ).toBeInTheDocument();
      });
    });

    describe('i18n: layouts.appHeader.filterPopover.apply', () => {
      test('locale:ja "適用" が表示される', async () => {
        await renderSearchFilterPopover();

        expect(
          screen.getByRole('button', { name: '適用' })
        ).toBeInTheDocument();
      });
    });
  });

  describe('初期表示', () => {
    test('タイトルが表示されること', async () => {
      await renderSearchFilterPopover();

      expect(screen.getByText('詳細検索')).toBeInTheDocument();
    });

    test('検索入力フィールドが表示されること', async () => {
      await renderSearchFilterPopover();

      expect(screen.getByLabelText('キーワード')).toBeInTheDocument();
    });

    test('タグセレクターが表示されること', async () => {
      await renderSearchFilterPopover();

      // combobox role を持つ要素を探す
      const tagSelector = screen.getByRole('combobox');
      expect(tagSelector).toBeInTheDocument();
    });

    test('クリアボタンと適用ボタンが表示されること', async () => {
      await renderSearchFilterPopover();

      expect(
        screen.getByRole('button', { name: 'クリア' })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '適用' })).toBeInTheDocument();
    });
  });

  describe('URLパラメータの初期値反映', () => {
    test('URLの検索クエリが入力フィールドに反映されること', async () => {
      await renderSearchFilterPopover(`/?${QUERY_PARAMS.SEARCH}=テスト検索`);

      const searchInput = screen.getByLabelText(
        'キーワード'
      ) as HTMLInputElement;

      // Popoverが完全に開かれるまで待機
      await waitFor(() => {
        expect(searchInput.value).toBe('テスト検索');
      });
    });

    test('URLのタグIDが選択された状態で表示されること', async () => {
      await renderSearchFilterPopover(`/?${QUERY_PARAMS.TAGS}=${mockTag.id}`);

      // タグが選択されるまで待機
      await waitFor(() => {
        const tagChip = screen.getByText('Important');
        expect(tagChip).toBeInTheDocument();
      });
    });
  });

  describe('検索入力', () => {
    test('検索フィールドに入力できること', async () => {
      const user = userEvent.setup();
      await renderSearchFilterPopover();

      const searchInput = screen.getByLabelText(
        'キーワード'
      ) as HTMLInputElement;
      await user.type(searchInput, 'ドキュメント');

      expect(searchInput.value).toBe('ドキュメント');
    });

    test('検索値を変更できること', async () => {
      const user = userEvent.setup();
      await renderSearchFilterPopover(`/?${QUERY_PARAMS.SEARCH}=古い検索`);

      const searchInput = screen.getByLabelText(
        'キーワード'
      ) as HTMLInputElement;

      // 初期値が反映されるまで待機
      await waitFor(() => {
        expect(searchInput.value).toBe('古い検索');
      });

      await user.clear(searchInput);
      await user.type(searchInput, '新しい検索');

      expect(searchInput.value).toBe('新しい検索');
    });
  });

  describe('タグ選択', () => {
    test('タグを選択できること', async () => {
      const user = userEvent.setup();
      await renderSearchFilterPopover();

      const tagSelector = screen.getByRole('combobox');
      await user.click(tagSelector);

      // ドロップダウンからタグを選択
      const tagOption = await screen.findByRole('option', {
        name: 'Important',
      });
      await user.click(tagOption);

      // 選択されたタグが表示される
      expect(await screen.findByText('Important')).toBeInTheDocument();
    });

    test('複数のタグを選択できること', async () => {
      const user = userEvent.setup();
      await renderSearchFilterPopover();

      const tagSelector = screen.getByRole('combobox');

      // 1つ目のタグを選択
      await user.click(tagSelector);
      const tag1Option = await screen.findByRole('option', {
        name: 'Important',
      });
      await user.click(tag1Option);

      // 2つ目のタグを選択
      await user.click(tagSelector);
      const tag2Option = await screen.findByRole('option', { name: 'Review' });
      await user.click(tag2Option);

      // 両方のタグが表示される
      expect(screen.getByText('Important')).toBeInTheDocument();
      expect(screen.getByText('Review')).toBeInTheDocument();
    });
  });

  describe('適用ボタン', () => {
    test('適用ボタンをクリックするとonCloseが呼ばれること', async () => {
      const user = userEvent.setup();
      await renderSearchFilterPopover();

      const applyButton = screen.getByRole('button', { name: '適用' });
      await user.click(applyButton);

      // onCloseが呼ばれる
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('クリアボタン', () => {
    test('クリアボタンをクリックするとonCloseが呼ばれること', async () => {
      const user = userEvent.setup();
      await renderSearchFilterPopover(
        `/?${QUERY_PARAMS.SEARCH}=テスト&${QUERY_PARAMS.TAGS}=${mockTag.id}`
      );

      // クリアボタンをクリック
      const clearButton = screen.getByRole('button', { name: 'クリア' });
      await user.click(clearButton);

      expect(onClose).toHaveBeenCalled();
    });
  });
});
