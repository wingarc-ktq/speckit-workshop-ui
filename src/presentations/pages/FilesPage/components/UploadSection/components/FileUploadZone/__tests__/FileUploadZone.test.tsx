import { render, screen, waitFor } from '@testing-library/react';

import { i18n } from '@/i18n/config';

import { FileUploadZone } from '../FileUploadZone';

import { createFile, createFiles, drag, dragLeave, drop } from './testHelpers';

describe('FileUploadZone', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ja');
  });

  const mockOnFilesAccepted = vi.fn();
  const mockOnFilesRejected = vi.fn();

  const renderComponent = (props?: {
    disabled?: boolean;
    maxFiles?: number;
  }) => {
    return render(
      <FileUploadZone
        onFilesAccepted={mockOnFilesAccepted}
        onFilesRejected={mockOnFilesRejected}
        {...props}
      />
    );
  };

  describe('多言語リソースの確認', () => {
    describe('i18n: filesPage.fileUploadZone.dragInactive', () => {
      test('locale:ja "クリックしてアップロード、またはドラッグ&ドロップ" が表示される', () => {
        renderComponent();

        expect(
          screen.getByText('クリックしてアップロード、またはドラッグ&ドロップ')
        ).toBeInTheDocument();
      });
    });

    describe('i18n: filesPage.fileUploadZone.dragActive', () => {
      test('locale:ja ドラッグ中に"ここにファイルをドロップ..." が表示される', async () => {
        renderComponent();

        const file = createFile('test.pdf');
        await drag([file]);

        await waitFor(() => {
          expect(
            screen.getByText('ここにファイルをドロップ...')
          ).toBeInTheDocument();
        });
      });
    });

    describe('i18n: filesPage.fileUploadZone.supportedFormats', () => {
      test('locale:ja "PDF、Word、Excel、画像 - 最大200MB" が表示される', () => {
        renderComponent();

        expect(
          screen.getByText('PDF、Word、Excel、画像 - 最大200MB')
        ).toBeInTheDocument();
      });
    });
  });

  describe('基本的な表示', () => {
    test('ドロップゾーンが表示されること', () => {
      renderComponent();

      const dropZone = screen.getByTestId('dragAndDropArea');
      expect(dropZone).toBeInTheDocument();
    });

    test('ファイル入力要素が存在すること', () => {
      renderComponent();

      const fileInput = screen.getByTestId('dropInput');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('type', 'file');
    });

    test('アップロードアイコンが表示されること', () => {
      renderComponent();

      // SVGアイコンの存在を確認
      const dropZone = screen.getByTestId('dragAndDropArea');
      const uploadIcon = dropZone.querySelector('svg');
      expect(uploadIcon).toBeInTheDocument();
    });

    test('メインテキストが表示されること', () => {
      renderComponent();

      expect(
        screen.getByText('クリックしてアップロード、またはドラッグ&ドロップ')
      ).toBeInTheDocument();
    });

    test('サブテキスト（サポートフォーマット）が表示されること', () => {
      renderComponent();

      expect(
        screen.getByText('PDF、Word、Excel、画像 - 最大200MB')
      ).toBeInTheDocument();
    });
  });

  describe('ファイルドロップ', () => {
    test('許可されたファイルがドロップされた際にコールバックが呼ばれること', async () => {
      renderComponent();

      const file = createFile('document.pdf');
      expect(mockOnFilesAccepted).not.toHaveBeenCalled();

      await drop([file]);

      await waitFor(() => {
        expect(mockOnFilesAccepted).toHaveBeenCalledWith([file]);
      });
    });

    test('複数の許可されたファイルがドロップされた際にコールバックが呼ばれること', async () => {
      renderComponent();

      const files = createFiles(['doc1.pdf', 'doc2.pdf', 'doc3.pdf']);
      expect(mockOnFilesAccepted).not.toHaveBeenCalled();

      await drop(files);

      await waitFor(() => {
        expect(mockOnFilesAccepted).toHaveBeenCalledWith(files);
      });
    });
  });

  describe('isDragActive', () => {
    test('ドラッグ中にメッセージが変化すること', async () => {
      renderComponent();

      const dropHere = 'ここにファイルをドロップ...';
      const defaultMessage =
        'クリックしてアップロード、またはドラッグ&ドロップ';

      // ファイルをドラッグ
      const file = createFile('test.pdf');
      await drag([file]);

      await waitFor(() => {
        expect(screen.getByText(dropHere)).toBeInTheDocument();
      });

      // ドラッグが終わった後のメッセージ確認
      await dragLeave([file]);

      await waitFor(() => {
        expect(screen.getByText(defaultMessage)).toBeInTheDocument();
      });
    });
  });

  describe('disabled状態', () => {
    test('disabled=trueの場合、ファイルドロップが無効化されること', async () => {
      renderComponent({ disabled: true });

      const file = createFile('document.pdf');
      await drop([file]);

      // disabledの場合、コールバックが呼ばれないことを確認
      expect(mockOnFilesAccepted).not.toHaveBeenCalled();
    });

    test('disabled=falseの場合、ファイルドロップが有効であること', async () => {
      renderComponent({ disabled: false });

      const file = createFile('document.pdf');
      await drop([file]);

      await waitFor(() => {
        expect(mockOnFilesAccepted).toHaveBeenCalledWith([file]);
      });
    });
  });

  describe('ファイルバリデーション', () => {
    test('サポートされていないファイルタイプはコールバックに渡される', async () => {
      renderComponent();

      const unsupportedFile = createFile('test.txt', 'text/plain');
      await drop([unsupportedFile]);

      await waitFor(() => {
        expect(mockOnFilesRejected).toHaveBeenCalledWith([unsupportedFile]);
      });
    });

    test('許可されたファイルと拒否されたファイルが混在する場合、それぞれ適切なコールバックに含まれる', async () => {
      renderComponent();

      const validFile = createFile('document.pdf', 'application/pdf');
      const invalidFile = createFile('test.txt', 'text/plain');
      await drop([validFile, invalidFile]);

      await waitFor(() => {
        expect(mockOnFilesAccepted).toHaveBeenCalledWith([validFile]);
        expect(mockOnFilesRejected).toHaveBeenCalledWith([invalidFile]);
      });
    });
  });
});
