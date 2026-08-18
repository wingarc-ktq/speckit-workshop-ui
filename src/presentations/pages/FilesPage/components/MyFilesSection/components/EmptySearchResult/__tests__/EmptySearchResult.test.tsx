import { render, screen } from '@testing-library/react';

import { i18n } from '@/i18n/config';

import { EmptySearchResult } from '../EmptySearchResult';

describe('EmptySearchResult', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ja');
  });

  describe('多言語リソースの確認', () => {
    describe('i18n: filesPage.myFilesSection.noResults', () => {
      test('locale:ja "検索結果が見つかりませんでした" が表示される', () => {
        render(<EmptySearchResult />);

        expect(
          screen.getByText('検索結果が見つかりませんでした')
        ).toBeInTheDocument();
      });
    });

    describe('i18n: filesPage.myFilesSection.noResultsDescription', () => {
      test('locale:ja "別のキーワードで検索するか、検索条件をクリアしてください" が表示される', () => {
        render(<EmptySearchResult />);

        expect(
          screen.getByText(
            '別のキーワードで検索するか、検索条件をクリアしてください'
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe('基本的な表示', () => {
    test('EmptySearchResultコンテナが表示されること', () => {
      render(<EmptySearchResult />);

      expect(screen.getByTestId('emptySearchResult')).toBeInTheDocument();
    });

    test('タイトルが表示されること', () => {
      render(<EmptySearchResult />);

      expect(
        screen.getByText('検索結果が見つかりませんでした')
      ).toBeInTheDocument();
    });

    test('説明文が表示されること', () => {
      render(<EmptySearchResult />);

      expect(
        screen.getByText(
          '別のキーワードで検索するか、検索条件をクリアしてください'
        )
      ).toBeInTheDocument();
    });
  });

  describe('スタイル構造', () => {
    test('タイトルと説明文が正しい順序で表示されること', () => {
      render(<EmptySearchResult />);

      const container = screen.getByTestId('emptySearchResult');
      const children = Array.from(container.children);

      // 最初の子がタイトル
      expect(children[0]).toHaveTextContent('検索結果が見つかりませんでした');
      // 2番目の子が説明文
      expect(children[1]).toHaveTextContent(
        '別のキーワードで検索するか、検索条件をクリアしてください'
      );
    });
  });
});
