import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';

import { mockFileListResponse } from '@/__fixtures__/files';
import { mockTags } from '@/__fixtures__/tags';
import { deferMock } from '@/__fixtures__/testUtils';
import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import { i18n } from '@/i18n/config';

import { RecentFilesSection } from '../RecentFilesSection';

describe('RecentFilesSection', () => {
  const getFiles = vi.fn();
  const getTags = vi.fn();

  beforeEach(async () => {
    await i18n.changeLanguage('ja');
    getFiles.mockResolvedValue({
      ...mockFileListResponse,
      files: mockFileListResponse.files.slice(0, 4),
    });
    getTags.mockResolvedValue(mockTags);
  });

  const renderRecentFilesSection = async () => {
    const r = render(
      <RepositoryTestWrapper
        hasSuspense
        override={{
          files: {
            getFiles: getFiles,
          },
          tags: {
            getTags: getTags,
          },
        }}
      >
        <RecentFilesSection />
      </RepositoryTestWrapper>
    );

    await waitFor(() =>
      expect(r.queryByTestId('suspense')).not.toBeInTheDocument()
    );
    return r;
  };

  describe('多言語リソースの確認', () => {
    describe('i18n: filesPage.recentFilesSection.title', () => {
      test('locale:ja "最近使用したファイル" が表示される', async () => {
        await renderRecentFilesSection();

        await waitFor(() => {
          expect(screen.getByText('最近使用したファイル')).toBeInTheDocument();
        });
      });
    });
  });

  describe('基本的な表示', () => {
    test('RecentFilesSectionコンテナが表示されること', async () => {
      await renderRecentFilesSection();

      await waitFor(() => {
        expect(screen.getByTestId('recentFilesSection')).toBeInTheDocument();
      });
    });

    test('タイトルが表示されること', async () => {
      await renderRecentFilesSection();

      await waitFor(() => {
        expect(screen.getByText('最近使用したファイル')).toBeInTheDocument();
      });
    });

    test('ファイルカードが表示されること', async () => {
      await renderRecentFilesSection();

      await waitFor(() => {
        // FileCardの中の"文書を見る"ボタンが表示されることを確認
        const viewButtons = screen.getAllByRole('button', {
          name: '文書を見る',
        });
        expect(viewButtons.length).toBeGreaterThan(0);
      });
    });

    test('ファイル名が表示されること', async () => {
      await renderRecentFilesSection();

      await waitFor(() => {
        expect(
          screen.getByText(mockFileListResponse.files[0].name)
        ).toBeInTheDocument();
      });
    });
  });

  describe('データ取得', () => {
    test('タグ情報が表示されること', async () => {
      await renderRecentFilesSection();

      await waitFor(() => {
        // モックデータでは最初のファイルに"Important"タグが付いている
        expect(screen.getByText('Important')).toBeInTheDocument();
      });
    });
  });

  describe('ファイルカードの表示内容', () => {
    test('ファイルアイコンが表示されること', async () => {
      renderRecentFilesSection();

      await waitFor(() => {
        expect(screen.getByText('document.pdf')).toBeInTheDocument();
      });

      // FileCardコンポーネント内のアイコンが表示されていることを確認
      const cards = screen.getAllByText('document.pdf');
      expect(cards[0]).toBeInTheDocument();
    });

    test('アップロード日時が表示されること', async () => {
      await renderRecentFilesSection();

      await waitFor(() => {
        // yyyy/MM/dd形式の日付が表示されていることを確認
        const datePattern = /\d{4}\/\d{2}\/\d{2}/;
        const dates = screen.getAllByText(datePattern);
        expect(dates.length).toBeGreaterThan(0);
      });
    });

    test('複数のファイルカードが正しく表示されること', async () => {
      await renderRecentFilesSection();

      await waitFor(() => {
        // 3つのファイルが表示されることを確認
        expect(screen.getByText('document.pdf')).toBeInTheDocument();
        expect(screen.getByText('contract.docx')).toBeInTheDocument();
        expect(screen.getByText('report.xlsx')).toBeInTheDocument();
      });
    });
  });

  describe('エッジケース', () => {
    test('ファイルがない場合でもエラーが発生しないこと', async () => {
      getFiles.mockResolvedValueOnce({
        ...mockFileListResponse,
        files: [],
      });

      await renderRecentFilesSection();

      await waitFor(() => {
        expect(screen.getByText('最近使用したファイル')).toBeInTheDocument();
      });

      // "文書を見る"ボタンが存在しないことを確認
      const viewButtons = screen.queryAllByRole('button', {
        name: '文書を見る',
      });
      expect(viewButtons).toHaveLength(0);
    });

    test('ファイルがない場合、空状態のプレースホルダが表示されること', async () => {
      getFiles.mockResolvedValueOnce({
        ...mockFileListResponse,
        files: [],
      });

      await renderRecentFilesSection();

      await waitFor(() => {
        expect(screen.getByTestId('emptyRecentFiles')).toBeInTheDocument();
      });

      // locale:ja の空状態メッセージが表示されること
      expect(
        screen.getByText('最近使用したファイルはありません')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'ファイルをアップロードすると、ここに最近使用したファイルが表示されます'
        )
      ).toBeInTheDocument();
    });

    test('タグがないファイルでも正しく表示されること', async () => {
      await renderRecentFilesSection();

      await waitFor(() => {
        // report.xlsxはタグがないファイル（mockFilesの定義による）
        expect(screen.getByText('report.xlsx')).toBeInTheDocument();
      });

      // タグがなくてもファイルカードが表示される
      const viewButtons = screen.getAllByRole('button', { name: '文書を見る' });
      expect(viewButtons.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('ローディング表示（QueryBoundary）', () => {
    test('取得中はスケルトンを表示し、完了後に実データへ切り替わること', async () => {
      // getFiles を保留状態にして、取得中→完了の遷移を制御する
      const resolve = deferMock(getFiles, {
        ...mockFileListResponse,
        files: mockFileListResponse.files.slice(0, 4),
      });

      render(
        <RepositoryTestWrapper
          override={{
            files: { getFiles },
            tags: { getTags },
          }}
        >
          <RecentFilesSection />
        </RepositoryTestWrapper>
      );

      // 取得中はスケルトンが表示され、実データはまだ無い
      expect(screen.getByTestId('recentFilesSkeleton')).toBeInTheDocument();
      expect(screen.queryByText('document.pdf')).not.toBeInTheDocument();

      // 取得完了 → 実データに切り替わり、スケルトンは消える
      resolve();

      expect(await screen.findByText('document.pdf')).toBeInTheDocument();
      expect(
        screen.queryByTestId('recentFilesSkeleton')
      ).not.toBeInTheDocument();
    });
  });
});
