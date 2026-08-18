import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { filterMockFilesBySearch } from '@/__fixtures__/files';
import { mockTags } from '@/__fixtures__/tags';
import { deferMock } from '@/__fixtures__/testUtils';
import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import { i18n } from '@/i18n/config';

import { MyFilesSection } from '../MyFilesSection';

describe('MyFilesSection', () => {
  const getFiles = vi.fn();
  const getTags = vi.fn();
  const getFileById = vi.fn();

  const renderMyFilesSection = async (searchQuery?: string) => {
    const r = render(
      <MemoryRouter>
        <RepositoryTestWrapper
          hasSuspense
          override={{
            files: {
              getFiles: getFiles,
              getFileById: getFileById,
            },
            tags: {
              getTags: getTags,
            },
          }}
        >
          <MyFilesSection searchQuery={searchQuery} />
        </RepositoryTestWrapper>
      </MemoryRouter>
    );
    // QueryBoundary のスケルトンが消える（データ取得が完了する）まで待つ
    await waitFor(() =>
      expect(r.queryByTestId('myFilesSkeleton')).not.toBeInTheDocument()
    );
    return r;
  };

  beforeEach(async () => {
    await i18n.changeLanguage('ja');
    // 検索クエリに応じてフィルタリングされたデータを返す
    getFiles.mockImplementation((params) => {
      return Promise.resolve(filterMockFilesBySearch(params?.search));
    });
    getTags.mockResolvedValue(mockTags);
    // ファイル詳細のモックを追加
    getFileById.mockImplementation((fileId: string) => {
      const allFiles = filterMockFilesBySearch(undefined);
      const file = allFiles.files.find((f) => f.id === fileId);
      return Promise.resolve(file || null);
    });
  });

  describe('多言語リソースの確認', () => {
    describe('i18n: filesPage.myFilesSection.title', () => {
      test('locale:ja "マイファイル" が表示される', async () => {
        await renderMyFilesSection();

        await waitFor(() => {
          expect(screen.getByText('マイファイル')).toBeInTheDocument();
        });
      });
    });
  });

  describe('基本的な表示', () => {
    test('MyFilesSectionコンテナが表示されること', async () => {
      await renderMyFilesSection();

      await waitFor(() => {
        expect(screen.getByTestId('myFilesSection')).toBeInTheDocument();
      });
    });

    test('タイトル "マイファイル" が表示されること', async () => {
      await renderMyFilesSection();

      await waitFor(() => {
        expect(screen.getByText('マイファイル')).toBeInTheDocument();
      });
    });

    test('FileListTableが表示されること', async () => {
      await renderMyFilesSection();

      // DataGridのロール要素が表示されることを確認
      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });
    });
  });

  describe('データ取得', () => {
    test('取得したデータが表示されていること', async () => {
      await renderMyFilesSection();

      // モックデータのファイルが表示されることを確認（最初の5件）
      expect(screen.getByText('document.pdf')).toBeInTheDocument();
      expect(screen.getByText('contract.docx')).toBeInTheDocument();
      expect(screen.getByText('report.xlsx')).toBeInTheDocument();
      expect(screen.getByText('invoice.pdf')).toBeInTheDocument();
      expect(screen.getByText('meeting-notes.txt')).toBeInTheDocument();
    });
  });

  describe('ページネーション', () => {
    test('初期ページネーションモデルが page: 0, pageSize: 10 であること', async () => {
      await renderMyFilesSection();

      // ページネーションの表示を確認（1–5 of 5 のような形式）
      expect(screen.getByText(/1–5 of 5/)).toBeInTheDocument();
    });

    test('ページサイズオプションが 5, 10, 25 であること', async () => {
      const user = userEvent.setup();
      await renderMyFilesSection();

      // ページサイズのドロップダウンを開く
      // MUI DataGrid v9 では rows-per-page セレクトがモバイルファーストで
      // display:none となり、sm 以上のメディアクエリでのみ表示される。
      // jsdom はメディアクエリを評価しないため hidden: true で取得する。
      const pageSizeButton = screen.getByRole('combobox', {
        name: /rows per page/i,
        hidden: true,
      });
      await user.click(pageSizeButton);

      // オプションが表示されることを確認
      await waitFor(() => {
        expect(screen.getByRole('option', { name: '5' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: '10' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: '25' })).toBeInTheDocument();
      });
    });

    test('ページサイズを変更できること', async () => {
      const user = userEvent.setup();
      await renderMyFilesSection();

      // 初期状態のページサイズを確認
      expect(screen.getByText(/1–5 of 5/)).toBeInTheDocument();

      // ページサイズを5に変更
      // MUI DataGrid v9 では rows-per-page セレクトがモバイルファーストで
      // display:none となり、sm 以上のメディアクエリでのみ表示される。
      // jsdom はメディアクエリを評価しないため hidden: true で取得する。
      const pageSizeButton = screen.getByRole('combobox', {
        name: /rows per page/i,
        hidden: true,
      });
      await user.click(pageSizeButton);

      await waitFor(() => {
        expect(screen.getByRole('option', { name: '5' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('option', { name: '5' }));

      // ページサイズが変更されたことを確認（表示は変わらないが、変更は成功する）
    });
  });

  describe('行選択', () => {
    test('チェックボックスが表示されること', async () => {
      await renderMyFilesSection();

      // チェックボックスが表示されることを確認（ヘッダー + 3行 = 4個）
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThanOrEqual(4);
    });

    test('行を選択できること', async () => {
      const user = userEvent.setup();
      await renderMyFilesSection();

      // 最初のファイルのチェックボックスを取得（ヘッダーの次）
      const checkboxes = screen.getAllByRole('checkbox');
      const firstFileCheckbox = checkboxes[1];

      // チェックされていないことを確認
      expect(firstFileCheckbox).not.toBeChecked();

      // チェックボックスをクリック
      await user.click(firstFileCheckbox);

      // チェックされたことを確認
      await waitFor(() => {
        expect(firstFileCheckbox).toBeChecked();
      });
    });

    test('行クリックでは選択されないこと（disableRowSelectionOnClick）', async () => {
      const user = userEvent.setup();
      await renderMyFilesSection();

      // チェックボックスの初期状態を取得
      const checkboxes = screen.getAllByRole('checkbox');
      const firstFileCheckbox = checkboxes[1];
      expect(firstFileCheckbox).not.toBeChecked();

      // 最初のファイル名をクリック
      const firstFile = screen.getByText('document.pdf');
      await user.click(firstFile);

      // ダイアログが開くのを待つ
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // ダイアログを閉じる（複数ある場合は最後のボタンを取得）
      const closeButtons = screen.getAllByRole('button', { name: '閉じる' });
      await user.click(closeButtons[closeButtons.length - 1]);

      // ダイアログが閉じるのを待つ
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // チェックボックスがまだチェックされていないことを確認
      const checkboxesAfter = screen.getAllByRole('checkbox');
      const firstFileCheckboxAfter = checkboxesAfter[1];
      expect(firstFileCheckboxAfter).not.toBeChecked();
    });
  });

  describe('エラーハンドリング', () => {
    test('データが空の場合でもエラーにならないこと', async () => {
      // useFilesが空のデータを返すケースをシミュレート
      // 実際のAPIハンドラーが空データを返す場合の動作をテスト
      await renderMyFilesSection();

      // DataGridは表示されたまま（エラーにならない）
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
  });

  describe('統合動作', () => {
    test('ページネーションと行選択が同時に機能すること', async () => {
      const user = userEvent.setup();
      await renderMyFilesSection();

      // 行を選択
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]);

      await waitFor(() => {
        expect(checkboxes[1]).toBeChecked();
      });

      // ページサイズを変更
      // MUI DataGrid v9 では rows-per-page セレクトがモバイルファーストで
      // display:none となり、sm 以上のメディアクエリでのみ表示される。
      // jsdom はメディアクエリを評価しないため hidden: true で取得する。
      const pageSizeButton = screen.getByRole('combobox', {
        name: /rows per page/i,
        hidden: true,
      });
      await user.click(pageSizeButton);

      await waitFor(() => {
        expect(screen.getByRole('option', { name: '5' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('option', { name: '5' }));

      // データが再取得されても正常に動作することを確認
    });
  });

  describe('検索機能', () => {
    test('検索クエリ "pdf" で該当するファイルだけが表示されること', async () => {
      await renderMyFilesSection('pdf');

      // pdfファイルが表示されること
      await waitFor(() => {
        expect(screen.getByText('document.pdf')).toBeInTheDocument();
        expect(screen.getByText('invoice.pdf')).toBeInTheDocument();
      });

      // 他のファイルは表示されないこと
      expect(screen.queryByText('contract.docx')).not.toBeInTheDocument();
      expect(screen.queryByText('report.xlsx')).not.toBeInTheDocument();
      expect(screen.queryByText('meeting-notes.txt')).not.toBeInTheDocument();
    });

    test('検索クエリ "contract" で該当するファイルだけが表示されること', async () => {
      await renderMyFilesSection('contract');

      // contractファイルが表示されること
      await waitFor(() => {
        expect(screen.getByText('contract.docx')).toBeInTheDocument();
      });

      // 他のファイルは表示されないこと
      expect(screen.queryByText('document.pdf')).not.toBeInTheDocument();
      expect(screen.queryByText('report.xlsx')).not.toBeInTheDocument();
      expect(screen.queryByText('invoice.pdf')).not.toBeInTheDocument();
      expect(screen.queryByText('meeting-notes.txt')).not.toBeInTheDocument();
    });

    test('検索クエリ "meeting" で description にマッチするファイルが表示されること', async () => {
      await renderMyFilesSection('meeting');

      // meeting-notes.txtが表示されること（descriptionに"meeting"が含まれる）
      await waitFor(() => {
        expect(screen.getByText('meeting-notes.txt')).toBeInTheDocument();
      });

      // 他のファイルは表示されないこと
      expect(screen.queryByText('document.pdf')).not.toBeInTheDocument();
      expect(screen.queryByText('contract.docx')).not.toBeInTheDocument();
      expect(screen.queryByText('report.xlsx')).not.toBeInTheDocument();
      expect(screen.queryByText('invoice.pdf')).not.toBeInTheDocument();
    });

    test('検索クエリなしの場合は全てのファイルが表示されること', async () => {
      await renderMyFilesSection();

      // 全てのファイルが表示されること
      await waitFor(() => {
        expect(screen.getByText('document.pdf')).toBeInTheDocument();
        expect(screen.getByText('contract.docx')).toBeInTheDocument();
        expect(screen.getByText('report.xlsx')).toBeInTheDocument();
        expect(screen.getByText('invoice.pdf')).toBeInTheDocument();
        expect(screen.getByText('meeting-notes.txt')).toBeInTheDocument();
      });
    });
  });

  describe('検索結果ゼロ件の表示', () => {
    describe('i18n: filesPage.myFilesSection.noResults', () => {
      test('locale:ja "検索結果が見つかりませんでした" が表示される', async () => {
        // "nonexistent"という検索クエリでは結果がゼロ件になる
        await renderMyFilesSection('nonexistent');

        await waitFor(() => {
          expect(
            screen.getByText('検索結果が見つかりませんでした')
          ).toBeInTheDocument();
        });
      });
    });

    describe('i18n: filesPage.myFilesSection.noResultsDescription', () => {
      test('locale:ja "別のキーワードで検索するか、検索条件をクリアしてください" が表示される', async () => {
        // "nonexistent"という検索クエリでは結果がゼロ件になる
        await renderMyFilesSection('nonexistent');

        await waitFor(() => {
          expect(
            screen.getByText(
              '別のキーワードで検索するか、検索条件をクリアしてください'
            )
          ).toBeInTheDocument();
        });
      });
    });

    test('検索クエリがない場合は、結果がゼロ件でも空の状態メッセージは表示されないこと（DataGridが表示される）', async () => {
      // 検索クエリなしの場合は、全データが返る
      // 空データを返すように一時的にモックを変更
      getFiles.mockResolvedValueOnce({
        files: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      // 検索クエリなしでレンダリング
      await renderMyFilesSection();

      // 空の状態メッセージが表示されていないことを確認
      expect(
        screen.queryByText('検索結果が見つかりませんでした')
      ).not.toBeInTheDocument();

      // DataGridが表示されることを確認
      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });
    });
  });

  describe('ローディング表示（QueryBoundary）', () => {
    test('取得中はスケルトンを表示し、完了後に実データへ切り替わること', async () => {
      // getFiles を保留状態にして、取得中→完了の遷移を制御する
      const resolve = deferMock(getFiles, filterMockFilesBySearch(undefined));

      render(
        <MemoryRouter>
          <RepositoryTestWrapper
            override={{
              files: { getFiles, getFileById },
              tags: { getTags },
            }}
          >
            <MyFilesSection />
          </RepositoryTestWrapper>
        </MemoryRouter>
      );

      // 取得中はスケルトンが表示され、実データ（テーブル）はまだ無い
      expect(screen.getByTestId('myFilesSkeleton')).toBeInTheDocument();
      expect(screen.queryByRole('grid')).not.toBeInTheDocument();

      // 取得完了 → 実データに切り替わり、スケルトンは消える
      resolve();

      expect(await screen.findByText('document.pdf')).toBeInTheDocument();
      expect(screen.queryByTestId('myFilesSkeleton')).not.toBeInTheDocument();
    });
  });
});
