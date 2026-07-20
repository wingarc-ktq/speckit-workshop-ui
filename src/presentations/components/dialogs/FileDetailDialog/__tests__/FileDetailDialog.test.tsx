import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { mockFile } from '@/__fixtures__/files';
import { mockTags } from '@/__fixtures__/tags';
import { deferMock } from '@/__fixtures__/testUtils';
import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import type { DocumentFile } from '@/domain/models/file';
import { i18n } from '@/i18n/config';

import { FileDetailDialog } from '../FileDetailDialog';

/**
 * URL.createObjectURLとURL.revokeObjectURLをモック化
 *
 * FileDetailDialogはuseEffect内でdownloadFileを呼び出し、
 * URL.createObjectURLを使用してプレビュー用のURLを生成します。
 * テスト環境ではBlobURLの生成が必要ないため、モック化します。
 */
const mockObjectUrl = 'blob:http://localhost/mock-preview-url';
const mockCreateObjectURL = vi.fn<(object: Blob | MediaSource) => string>(
  () => mockObjectUrl
);
const mockRevokeObjectURL = vi.fn<(url: string) => void>();

globalThis.URL.createObjectURL = mockCreateObjectURL;
globalThis.URL.revokeObjectURL = mockRevokeObjectURL;

/**
 * document.createElement('a')のクリックイベントをモック化
 *
 * ダウンロード機能のテストのため、アンカー要素の生成と
 * クリック動作をモック化します。
 */
const mockAnchorClick = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();

describe('FileDetailDialog', () => {
  // リポジトリのモック関数
  const getFileById = vi.fn<(fileId: string) => Promise<DocumentFile>>();
  const getTags = vi.fn();
  const downloadFile = vi.fn<(fileId: string) => Promise<Blob>>();

  beforeEach(async () => {
    await i18n.changeLanguage('ja');

    // デフォルトのモック実装を設定
    getFileById.mockResolvedValue(mockFile);
    getTags.mockResolvedValue(mockTags);
    downloadFile.mockResolvedValue(
      new Blob(['mock file content'], { type: 'application/pdf' })
    );

    // URLモックをクリア
    mockCreateObjectURL.mockClear();
    mockRevokeObjectURL.mockClear();

    // documentモックをクリア
    mockAnchorClick.mockClear();
    mockAppendChild.mockClear();
    mockRemoveChild.mockClear();
  });

  const renderDialog = (props?: { fileId?: string; onClose?: () => void }) => {
    const fileId = props?.fileId ?? 'file-001';
    const onClose = props?.onClose ?? vi.fn();

    return render(
      <RepositoryTestWrapper
        hasSuspense
        override={{
          files: {
            getFileById: getFileById,
            downloadFile: downloadFile,
          },
          tags: {
            getTags: getTags,
          },
        }}
      >
        <FileDetailDialog fileId={fileId} onClose={onClose} />
      </RepositoryTestWrapper>
    );
  };

  describe('多言語リソースの確認', () => {
    describe('i18n: filesPage.fileDetailDialog.title', () => {
      test('locale:ja "ファイル詳細" が表示される', async () => {
        renderDialog();

        await waitFor(() => {
          expect(screen.getByText('ファイル詳細')).toBeInTheDocument();
        });
      });
    });

    describe('i18n: filesPage.fileDetailDialog.close', () => {
      test('locale:ja "閉じる" が表示される', async () => {
        renderDialog();

        await waitFor(() => {
          expect(screen.getAllByText('閉じる').length).toBeGreaterThan(0);
        });
      });
    });

    describe('i18n: filesPage.fileDetailDialog.download', () => {
      test('locale:ja "ダウンロード" が表示される', async () => {
        renderDialog();

        await waitFor(() => {
          expect(screen.getByText('ダウンロード')).toBeInTheDocument();
        });
      });
    });

    describe('i18n: filesPage.fileDetailDialog.fileName', () => {
      test('locale:ja "ファイル名" が表示される', async () => {
        renderDialog();

        await waitFor(() => {
          expect(screen.getByText('ファイル名')).toBeInTheDocument();
        });
      });
    });

    describe('i18n: filesPage.fileDetailDialog.fileSize', () => {
      test('locale:ja "ファイルサイズ" が表示される', async () => {
        renderDialog();

        await waitFor(() => {
          expect(screen.getByText('ファイルサイズ')).toBeInTheDocument();
        });
      });
    });

    describe('i18n: filesPage.fileDetailDialog.uploadedAt', () => {
      test('locale:ja "アップロード日時" が表示される', async () => {
        renderDialog();

        await waitFor(() => {
          expect(screen.getByText('アップロード日時')).toBeInTheDocument();
        });
      });
    });

    describe('i18n: filesPage.fileDetailDialog.tags', () => {
      test('locale:ja "タグ" が表示される', async () => {
        renderDialog();

        await waitFor(() => {
          expect(screen.getByText('タグ')).toBeInTheDocument();
        });
      });
    });

    describe('i18n: filesPage.fileDetailDialog.description', () => {
      test('locale:ja "説明" が表示される', async () => {
        renderDialog();

        await waitFor(() => {
          expect(screen.getByText('説明')).toBeInTheDocument();
        });
      });
    });

    describe('i18n: filesPage.fileDetailDialog.noTags', () => {
      test('locale:ja "タグなし" が表示される', async () => {
        const fileWithoutTags: DocumentFile = {
          ...mockFile,
          tagIds: [],
        };
        getFileById.mockResolvedValue(fileWithoutTags);

        renderDialog();

        await waitFor(() => {
          expect(screen.getByText('タグなし')).toBeInTheDocument();
        });
      });
    });
  });

  describe('ダイアログの表示', () => {
    test('ダイアログが表示されること', async () => {
      renderDialog();

      await waitFor(() => {
        expect(screen.getByText('ファイル詳細')).toBeInTheDocument();
      });
    });

    test('閉じるボタンをクリックするとonCloseが呼び出されること', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      renderDialog({ onClose });

      // 本体（DialogActions）が読み込まれる（スケルトンが消える）まで待つ
      await waitFor(() =>
        expect(
          screen.queryByTestId('fileDetailDialogSkeleton')
        ).not.toBeInTheDocument()
      );

      // ダイアログアクションの閉じるボタンを取得（2つの「閉じる」ボタンの内、ダイアログアクション内のものをクリック）
      const closeButtons = screen.getAllByRole('button', { name: '閉じる' });
      // aria-labelが「閉じる」のアイコンボタンと、テキストが「閉じる」のボタンがあるため、
      // テキストベースの閉じるボタン（DialogActions内）を探す
      const dialogActionCloseButton = closeButtons.find(
        (button) =>
          button.textContent === '閉じる' && !button.querySelector('svg')
      );

      await user.click(dialogActionCloseButton!);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test('×アイコンをクリックするとonCloseが呼び出されること', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      renderDialog({ onClose });

      await waitFor(() => {
        expect(screen.getByText('ファイル詳細')).toBeInTheDocument();
      });

      // aria-labelが「閉じる」のIconButton（CloseIconを含むもの）をクリック
      const closeButtons = screen.getAllByRole('button', { name: '閉じる' });
      const closeIconButton = closeButtons.find((button) =>
        button.querySelector('svg[data-testid="CloseIcon"]')
      );

      await user.click(closeIconButton!);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('ファイル情報の表示', () => {
    test('ファイル名が表示されること', async () => {
      renderDialog();

      await waitFor(() => {
        expect(screen.getByText('document.pdf')).toBeInTheDocument();
      });
    });

    test('ファイルサイズがフォーマットされて表示されること', async () => {
      renderDialog();

      await waitFor(() => {
        // mockFileのサイズは102,400バイト = 100KB
        expect(screen.getByText('100 KB')).toBeInTheDocument();
      });
    });

    test('アップロード日時がyyyy/MM/dd HH:mm形式で表示されること', async () => {
      renderDialog();

      await waitFor(() => {
        // mockFileのuploadedAtは'2025-01-11T10:00:00Z'
        expect(screen.getByText('2025/01/11 19:00')).toBeInTheDocument();
      });
    });

    test('説明が表示されること', async () => {
      renderDialog();

      await waitFor(() => {
        expect(screen.getByText('Sample PDF document')).toBeInTheDocument();
      });
    });

    test('説明がない場合、説明フィールドが表示されないこと', async () => {
      const fileWithoutDescription: DocumentFile = {
        ...mockFile,
        description: null,
      };
      getFileById.mockResolvedValue(fileWithoutDescription);

      renderDialog();

      await waitFor(() => {
        expect(screen.getByText('ファイル名')).toBeInTheDocument();
      });

      // 説明ラベル自体が表示されないことを確認
      expect(screen.queryByText('説明')).not.toBeInTheDocument();
    });
  });

  describe('タグの表示', () => {
    test('タグが存在する場合、タグが表示されること', async () => {
      const fileWithTags: DocumentFile = {
        ...mockFile,
        tagIds: ['tag-001', 'tag-002'],
      };
      getFileById.mockResolvedValue(fileWithTags);

      renderDialog();

      await waitFor(() => {
        expect(screen.getByText('Important')).toBeInTheDocument();
      });
      expect(screen.getByText('Review')).toBeInTheDocument();
    });

    test('タグが存在しない場合、"タグなし"が表示されること', async () => {
      const fileWithoutTags: DocumentFile = {
        ...mockFile,
        tagIds: [],
      };
      getFileById.mockResolvedValue(fileWithoutTags);

      renderDialog();

      await waitFor(() => {
        expect(screen.getByText('タグなし')).toBeInTheDocument();
      });
    });

    test('ファイルのtagIdsに対応するタグのみが表示されること', async () => {
      const fileWithOneTag: DocumentFile = {
        ...mockFile,
        tagIds: ['tag-002'], // Reviewタグのみ
      };
      getFileById.mockResolvedValue(fileWithOneTag);

      renderDialog();

      await waitFor(() => {
        expect(screen.getByText('Review')).toBeInTheDocument();
      });

      // 他のタグは表示されない
      expect(screen.queryByText('Important')).not.toBeInTheDocument();
      expect(screen.queryByText('Urgent')).not.toBeInTheDocument();
    });
  });

  describe('プレビュー機能', () => {
    test('ダイアログが開いたときにdownloadFileが呼び出されること', async () => {
      renderDialog({ fileId: 'file-001' });

      await waitFor(() => {
        expect(downloadFile).toHaveBeenCalledWith('file-001', expect.anything());
      });
    });

    test('プレビュー用のObject URLが生成されること', async () => {
      renderDialog();

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled();
      });

      const createdBlob = mockCreateObjectURL.mock.calls[0][0];
      expect(createdBlob).toBeInstanceOf(Blob);
    });

    test('PDFファイルの場合、プレビューが埋め込み表示されること', async () => {
      renderDialog();

      await waitFor(() => {
        const iframe = screen.getByTitle('document.pdf');
        expect(iframe).toBeInTheDocument();
        expect(iframe).toHaveAttribute('src', mockObjectUrl);
      });
    });

    test('画像ファイルの場合、画像プレビューが表示されること', async () => {
      const imageFile: DocumentFile = {
        ...mockFile,
        id: 'image-001',
        name: 'photo.jpg',
        mimeType: 'image/jpeg',
      };
      getFileById.mockResolvedValue(imageFile);

      renderDialog({ fileId: 'image-001' });

      await waitFor(() => {
        const image = screen.getByAltText('photo.jpg');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', imageFile.downloadUrl);
      });
    });

    test('Wordファイルの場合、プレビュー未対応メッセージが表示されること', async () => {
      const wordFile: DocumentFile = {
        ...mockFile,
        id: 'word-001',
        name: 'document.docx',
        mimeType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };
      getFileById.mockResolvedValue(wordFile);

      renderDialog({ fileId: 'word-001' });

      await waitFor(() => {
        expect(
          screen.getByText('プレビュー機能は対応していません')
        ).toBeInTheDocument();
        expect(
          screen.getByText(
            'ダウンロードボタンからファイルをダウンロードしてください'
          )
        ).toBeInTheDocument();
      });
    });

    test('Excelファイルの場合、プレビュー未対応メッセージが表示されること', async () => {
      const excelFile: DocumentFile = {
        ...mockFile,
        id: 'excel-001',
        name: 'spreadsheet.xlsx',
        mimeType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
      getFileById.mockResolvedValue(excelFile);

      renderDialog({ fileId: 'excel-001' });

      await waitFor(() => {
        expect(
          screen.getByText('プレビュー機能は対応していません')
        ).toBeInTheDocument();
      });
    });

    test('その他のファイルタイプの場合、プレビュー未対応メッセージが表示されること', async () => {
      const textFile: DocumentFile = {
        ...mockFile,
        id: 'text-001',
        name: 'readme.txt',
        mimeType: 'text/plain',
      };
      getFileById.mockResolvedValue(textFile);

      renderDialog({ fileId: 'text-001' });

      await waitFor(() => {
        expect(
          screen.getByText('プレビュー機能は対応していません')
        ).toBeInTheDocument();
      });
    });
  });

  describe('ダウンロード機能', () => {
    test('ダウンロードボタンが表示されること', async () => {
      renderDialog();

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'ダウンロード' })
        ).toBeInTheDocument();
      });
    });

    test('ダウンロードボタンにDownloadIconが表示されること', async () => {
      renderDialog();

      await waitFor(() => {
        const downloadButton = screen.getByRole('button', {
          name: 'ダウンロード',
        });
        const icon = downloadButton.querySelector(
          'svg[data-testid="DownloadIcon"]'
        );
        expect(icon).toBeInTheDocument();
      });
    });

    test('ダウンロードボタンをクリックするとdownloadFileが呼び出されること', async () => {
      const user = userEvent.setup();

      // document.createElementのモックを設定してナビゲーションを防ぐ
      const originalCreateElement = document.createElement.bind(document);
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockImplementation((tagName: string) => {
          const element = originalCreateElement(tagName);
          if (tagName === 'a') {
            element.click = vi.fn(); // clickを何もしないモック関数に置き換え
          }
          return element;
        });

      renderDialog({ fileId: 'file-001' });

      await waitFor(() => {
        expect(screen.getByText('ファイル詳細')).toBeInTheDocument();
      });

      // 初回のプレビュー用呼び出しをクリア
      downloadFile.mockClear();

      const downloadButton = await screen.findByRole('button', {
        name: 'ダウンロード',
      });
      await user.click(downloadButton);

      await waitFor(() => {
        expect(downloadFile).toHaveBeenCalledWith('file-001', expect.anything());
      });

      // クリーンアップ
      createElementSpy.mockRestore();
    });

    test('ダウンロードボタンをクリックするとファイルがダウンロードされること', async () => {
      const user = userEvent.setup();

      renderDialog();

      await waitFor(() => {
        expect(screen.getByText('ファイル詳細')).toBeInTheDocument();
      });

      // レンダリング後にモックを設定
      const originalCreateElement = document.createElement.bind(document);
      const originalAppendChild = document.body.appendChild.bind(document.body);
      const originalRemoveChild = document.body.removeChild.bind(document.body);

      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockImplementation((tagName: string) => {
          const element = originalCreateElement(tagName);
          if (tagName === 'a') {
            element.click = mockAnchorClick;
          }
          return element;
        });

      const appendChildSpy = vi
        .spyOn(document.body, 'appendChild')
        .mockImplementation((node) => {
          mockAppendChild(node);
          return originalAppendChild(node);
        });

      const removeChildSpy = vi
        .spyOn(document.body, 'removeChild')
        .mockImplementation((node) => {
          mockRemoveChild(node);
          return originalRemoveChild(node);
        });

      const downloadButton = await screen.findByRole('button', {
        name: 'ダウンロード',
      });
      await user.click(downloadButton);

      await waitFor(() => {
        expect(mockAnchorClick).toHaveBeenCalled();
      });

      // a要素が作成され、appendChildとremoveChildが呼ばれたことを確認
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();

      // クリーンアップ
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    test('ダウンロード時に正しいファイル名が設定されること', async () => {
      const user = userEvent.setup();

      renderDialog();

      await waitFor(() => {
        expect(screen.getByText('ファイル詳細')).toBeInTheDocument();
      });

      // レンダリング後にモックを設定
      const originalCreateElement = document.createElement.bind(document);
      const originalAppendChild = document.body.appendChild.bind(document.body);
      const originalRemoveChild = document.body.removeChild.bind(document.body);

      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockImplementation((tagName: string) => {
          const element = originalCreateElement(tagName);
          if (tagName === 'a') {
            element.click = mockAnchorClick;
          }
          return element;
        });

      const appendChildSpy = vi
        .spyOn(document.body, 'appendChild')
        .mockImplementation((node) => {
          mockAppendChild(node);
          return originalAppendChild(node);
        });

      const removeChildSpy = vi
        .spyOn(document.body, 'removeChild')
        .mockImplementation((node) => {
          mockRemoveChild(node);
          return originalRemoveChild(node);
        });

      const downloadButton = await screen.findByRole('button', {
        name: 'ダウンロード',
      });
      await user.click(downloadButton);

      await waitFor(() => {
        expect(mockAnchorClick).toHaveBeenCalled();
      });

      // a要素のdownload属性が正しいファイル名に設定されていることを確認
      const anchorElement = mockAppendChild.mock
        .calls[0][0] as HTMLAnchorElement;
      expect(anchorElement.download).toBe('document.pdf');

      // クリーンアップ
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    test('ダウンロード後にObject URLが解放されること', async () => {
      const user = userEvent.setup();

      // document.createElementのモックを設定してナビゲーションを防ぐ
      const originalCreateElement = document.createElement.bind(document);
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockImplementation((tagName: string) => {
          const element = originalCreateElement(tagName);
          if (tagName === 'a') {
            element.click = vi.fn();
          }
          return element;
        });

      renderDialog();

      await waitFor(() => {
        expect(screen.getByText('ファイル詳細')).toBeInTheDocument();
      });

      mockRevokeObjectURL.mockClear();

      const downloadButton = await screen.findByRole('button', {
        name: 'ダウンロード',
      });
      await user.click(downloadButton);

      await waitFor(() => {
        expect(mockRevokeObjectURL).toHaveBeenCalled();
      });

      // クリーンアップ
      createElementSpy.mockRestore();
    });
  });

  describe('エラーハンドリング', () => {
    test('ファイル取得に失敗した場合でもエラーが発生しないこと', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      getFileById.mockRejectedValue(new Error('Failed to fetch file'));

      expect(() => renderDialog()).not.toThrow();

      consoleError.mockRestore();
    });

    test('ダウンロードに失敗した場合でもエラーが発生しないこと', async () => {
      const user = userEvent.setup();
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // document.createElementのモックを設定してナビゲーションを防ぐ
      const originalCreateElement = document.createElement.bind(document);
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockImplementation((tagName: string) => {
          const element = originalCreateElement(tagName);
          if (tagName === 'a') {
            element.click = vi.fn();
          }
          return element;
        });

      // プレビュー用は成功させるが、ダウンロードボタンクリック時は失敗させる
      downloadFile
        .mockResolvedValueOnce(
          new Blob(['mock file content'], { type: 'application/pdf' })
        )
        .mockRejectedValueOnce(new Error('Download failed'));

      renderDialog();

      await waitFor(() => {
        expect(screen.getByText('ファイル詳細')).toBeInTheDocument();
      });

      const downloadButton = await screen.findByRole('button', {
        name: 'ダウンロード',
      });

      await expect(user.click(downloadButton)).resolves.not.toThrow();

      createElementSpy.mockRestore();
      consoleError.mockRestore();
    });

    test('プレビューの読み込みに失敗した場合、コンソールエラーが出力されること', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      downloadFile.mockRejectedValue(new Error('Failed to load preview'));

      renderDialog();

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          'Failed to load preview:',
          expect.any(Error)
        );
      });

      consoleError.mockRestore();
    });
  });

  describe('クリーンアップ', () => {
    test('ダイアログを閉じたときにObject URLが解放されること', async () => {
      const onClose = vi.fn();

      const { unmount } = renderDialog({ onClose });

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled();
      });

      mockRevokeObjectURL.mockClear();

      // コンポーネントをアンマウント（ダイアログを閉じる動作をシミュレート）
      unmount();

      // useEffectのクリーンアップでrevokeObjectURLが呼ばれることを確認
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('エッジケース', () => {
    test('ファイルIDが変更された場合、新しいファイルが読み込まれること', async () => {
      const { rerender } = renderDialog({ fileId: 'file-001' });

      await waitFor(() => {
        expect(getFileById).toHaveBeenCalledWith('file-001');
      });

      const newFile: DocumentFile = {
        ...mockFile,
        id: 'file-002',
        name: 'new-document.pdf',
      };
      getFileById.mockResolvedValue(newFile);

      rerender(
        <RepositoryTestWrapper
          hasSuspense
          override={{
            files: {
              getFileById: getFileById,
              downloadFile: downloadFile,
            },
            tags: {
              getTags: getTags,
            },
          }}
        >
          <FileDetailDialog fileId="file-002" onClose={vi.fn()} />
        </RepositoryTestWrapper>
      );

      await waitFor(() => {
        expect(getFileById).toHaveBeenCalledWith('file-002');
      });
    });

    test('ファイルサイズが大きい場合、正しくフォーマットされること', async () => {
      const largeFile: DocumentFile = {
        ...mockFile,
        size: 1024 * 1024 * 100, // 100MB
      };
      getFileById.mockResolvedValue(largeFile);

      renderDialog();

      await waitFor(() => {
        expect(screen.getByText('100 MB')).toBeInTheDocument();
      });
    });

    test('ファイルサイズが非常に小さい場合、正しくフォーマットされること', async () => {
      const tinyFile: DocumentFile = {
        ...mockFile,
        size: 512, // 512バイト = 512 Bytes
      };
      getFileById.mockResolvedValue(tinyFile);

      renderDialog();

      // まずダイアログが表示されるのを待つ
      await waitFor(() => {
        expect(screen.getByText('ファイル詳細')).toBeInTheDocument();
      });

      // その後ファイルサイズが表示されるのを待つ
      await waitFor(() => {
        expect(screen.getByText('512 Bytes')).toBeInTheDocument();
      });
    });

    test('複数のタグがある場合、全てのタグが表示されること', async () => {
      const fileWithMultipleTags: DocumentFile = {
        ...mockFile,
        tagIds: ['tag-001', 'tag-002', 'tag-003'],
      };
      getFileById.mockResolvedValue(fileWithMultipleTags);

      renderDialog();

      await waitFor(() => {
        expect(screen.getByText('Important')).toBeInTheDocument();
      });
      expect(screen.getByText('Review')).toBeInTheDocument();
      expect(screen.getByText('Urgent')).toBeInTheDocument();
    });
  });

  describe('ローディング表示（QueryBoundary）', () => {
    test('取得中はスケルトンを表示し、完了後に実データへ切り替わること', async () => {
      // getFileById を保留状態にして、取得中→完了の遷移を制御する
      const resolve = deferMock(getFileById, mockFile);

      render(
        <RepositoryTestWrapper
          override={{
            files: { getFileById, downloadFile },
            tags: { getTags },
          }}
        >
          <FileDetailDialog fileId={mockFile.id} onClose={vi.fn()} />
        </RepositoryTestWrapper>
      );

      // 取得中はスケルトンが表示され、本体（ダウンロードボタン）はまだ無い
      expect(
        screen.getByTestId('fileDetailDialogSkeleton')
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'ダウンロード' })
      ).not.toBeInTheDocument();

      // 取得完了 → 実データに切り替わり、スケルトンは消える
      resolve();

      expect(
        await screen.findByRole('button', { name: 'ダウンロード' })
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId('fileDetailDialogSkeleton')
      ).not.toBeInTheDocument();
    });
  });
});
