import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FileUploadStatus, type UploadingFile } from '@/domain/models/file';
import { i18n } from '@/i18n/config';

import { FileUploadList } from '../FileUploadList';

describe('FileUploadList', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ja');
  });

  const onRemoveFile = vi.fn();

  const createMockFile = (name: string): File => {
    return new File(['test content'], name, { type: 'application/pdf' });
  };

  const mockFiles: UploadingFile[] = [
    {
      id: 'file-1',
      file: createMockFile('document1.pdf'),
      progress: 30,
      status: FileUploadStatus.UPLOADING,
    },
    {
      id: 'file-2',
      file: createMockFile('document2.pdf'),
      progress: 100,
      status: FileUploadStatus.SUCCESS,
    },
    {
      id: 'file-3',
      file: createMockFile('document3.pdf'),
      progress: 0,
      status: FileUploadStatus.ERROR,
      error: 'アップロードに失敗しました',
    },
  ];

  const renderFileUploadList = (files: UploadingFile[] = mockFiles) => {
    return render(<FileUploadList files={files} onRemoveFile={onRemoveFile} />);
  };

  describe('基本的な表示', () => {
    test('ファイルリストが表示されること', () => {
      renderFileUploadList();

      expect(screen.getByTestId('fileUploadList')).toBeInTheDocument();
    });

    test('各ファイルの名前が表示されること', () => {
      renderFileUploadList();

      expect(screen.getByText('document1.pdf')).toBeInTheDocument();
      expect(screen.getByText('document2.pdf')).toBeInTheDocument();
      expect(screen.getByText('document3.pdf')).toBeInTheDocument();
    });

    test('各ファイルのサイズが表示されること', () => {
      renderFileUploadList();

      // formatFileSize関数により "12 Bytes" として表示される
      const fileSizes = screen.getAllByText('12 Bytes');
      expect(fileSizes).toHaveLength(3);
    });
  });

  describe('空の状態', () => {
    test('ファイルが0件の場合、何も表示されないこと', () => {
      renderFileUploadList([]);

      const uploadList = screen.queryByTestId('fileUploadList');
      expect(uploadList).not.toBeInTheDocument();
    });

    test('ファイルが空配列の場合、FileUploadListが表示されないこと', () => {
      renderFileUploadList([]);

      const uploadList = screen.queryByTestId('fileUploadList');
      expect(uploadList).not.toBeInTheDocument();
    });
  });

  describe('ユーザー操作', () => {
    test('削除ボタンをクリックすると、onRemoveFileFileが正しいIDで呼ばれること', async () => {
      const user = userEvent.setup();
      renderFileUploadList();

      // 成功状態のファイル（file-2）の削除ボタンを取得
      const fileItem = screen
        .getByText('document2.pdf')
        .closest('[data-testid^="fileUploadItem"]');
      expect(fileItem).toBeInTheDocument();

      const removeButton = fileItem?.querySelector(
        '[data-testid="deleteButton"]'
      );
      expect(removeButton).toBeInTheDocument();

      await user.click(removeButton!);
      expect(onRemoveFile).toHaveBeenCalledWith('file-2');
    });

    test('エラー状態のファイルも削除できること', async () => {
      const user = userEvent.setup();
      renderFileUploadList();

      // エラー状態のファイル（file-3）の削除ボタンを取得
      const fileItem = screen
        .getByText('document3.pdf')
        .closest('[data-testid^="fileUploadItem"]');
      expect(fileItem).toBeInTheDocument();

      const removeButton = fileItem?.querySelector(
        '[data-testid="deleteButton"]'
      );
      expect(removeButton).toBeInTheDocument();

      await user.click(removeButton!);
      expect(onRemoveFile).toHaveBeenCalledWith('file-3');
    });
  });

  describe('子コンポーネントの表示', () => {
    test('FileUploadItemコンポーネントが各ファイルに対して表示されること', () => {
      renderFileUploadList();

      // 各FileUploadItemが表示されることを確認
      const items = screen.getAllByTestId(/^fileUploadItem-/);
      expect(items).toHaveLength(3);
    });

    test('単一ファイルの場合も正しく表示されること', () => {
      const singleFile: UploadingFile[] = [
        {
          id: 'single-file',
          file: createMockFile('single.pdf'),
          progress: 50,
          status: FileUploadStatus.UPLOADING,
        },
      ];

      renderFileUploadList(singleFile);

      expect(screen.getByText('single.pdf')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });
});
