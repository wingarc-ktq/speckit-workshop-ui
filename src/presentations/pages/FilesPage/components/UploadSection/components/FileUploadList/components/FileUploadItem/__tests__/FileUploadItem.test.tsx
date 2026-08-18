import type { ComponentProps } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FileUploadStatus } from '@/domain/models/file';
import { i18n } from '@/i18n/config';

import { FileUploadItem } from '../FileUploadItem';

describe('FileUploadItem', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ja');
  });

  const mockFile = new File(['test content'], 'test-file.pdf', {
    type: 'application/pdf',
  });
  const onRemove = vi.fn();

  const defaultProps = {
    id: 'test-id-1',
    file: mockFile,
    progress: 50,
    status: FileUploadStatus.UPLOADING,
    onRemove,
  };

  const renderFileUploadItem = (
    props: Partial<ComponentProps<typeof FileUploadItem>> = {}
  ) => {
    return render(<FileUploadItem {...defaultProps} {...props} />);
  };

  describe('基本的な表示', () => {
    test('ファイル名が表示されること', () => {
      renderFileUploadItem();

      expect(screen.getByText('test-file.pdf')).toBeInTheDocument();
    });

    test('ファイルサイズが表示されること', () => {
      renderFileUploadItem();

      // mockFileは 'test content' (12文字=12バイト) で作成されているため、formatFileSize関数により "12 Bytes" として表示される
      expect(screen.getByText('12 Bytes')).toBeInTheDocument();
    });
  });

  describe('多言語リソースの確認', () => {
    describe('i18n: filesPage.uploadSection.progressPercent', () => {
      test('locale:ja "50%" が表示される（アップロード中）', () => {
        renderFileUploadItem({
          status: FileUploadStatus.UPLOADING,
          progress: 50,
        });

        expect(screen.getByText('50%')).toBeInTheDocument();
      });
    });

    describe('i18n: filesPage.uploadSection.uploadComplete', () => {
      test('locale:ja "アップロード完了" が表示される（成功時）', () => {
        renderFileUploadItem({
          status: FileUploadStatus.SUCCESS,
          progress: 100,
        });

        expect(screen.getByText('アップロード完了')).toBeInTheDocument();
      });
    });

    describe('i18n: filesPage.uploadSection.uploadFailed', () => {
      test('locale:ja カスタムエラーメッセージが表示される（エラー時）', () => {
        const errorMessage = 'ネットワークエラーが発生しました';
        renderFileUploadItem({
          status: FileUploadStatus.ERROR,
          error: errorMessage,
        });

        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe('アップロード状態による表示', () => {
    test('アップロード中の場合、プログレスバーとパーセンテージが表示されること', () => {
      renderFileUploadItem({
        status: FileUploadStatus.UPLOADING,
        progress: 30,
      });

      expect(screen.getByText('30%')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('アップロード中の場合、削除ボタンが表示されないこと', () => {
      renderFileUploadItem({
        status: FileUploadStatus.UPLOADING,
      });

      const closeButtons = screen.queryAllByRole('button');
      expect(closeButtons).toHaveLength(0);
    });

    test('成功時の場合、成功アイコンと完了メッセージが表示されること', () => {
      renderFileUploadItem({
        status: FileUploadStatus.SUCCESS,
        progress: 100,
      });

      expect(screen.getByText('アップロード完了')).toBeInTheDocument();
      // 成功アイコンの存在を確認（SVGアイコン）
      const fileItem = screen.getByTestId('fileUploadItem-test-id-1');
      const successIcon = fileItem.querySelector('svg');
      expect(successIcon).toBeInTheDocument();
    });

    test('成功時の場合、削除ボタンが表示されること', () => {
      renderFileUploadItem({
        status: FileUploadStatus.SUCCESS,
      });

      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();
    });

    test('エラー時の場合、エラーアイコンとエラーメッセージが表示されること', () => {
      const errorMessage = 'ファイルのアップロードに失敗しました';
      renderFileUploadItem({
        status: FileUploadStatus.ERROR,
        error: errorMessage,
      });

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      // エラーアイコンの存在を確認（SVGアイコン）
      const fileItem = screen.getByTestId('fileUploadItem-test-id-1');
      const errorIcon = fileItem.querySelector('svg');
      expect(errorIcon).toBeInTheDocument();
    });

    test('エラー時の場合、削除ボタンが表示されること', () => {
      renderFileUploadItem({
        status: FileUploadStatus.ERROR,
        error: 'エラー',
      });

      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('ユーザー操作', () => {
    test('削除ボタンをクリックすると、onRemoveが呼ばれること', async () => {
      const user = userEvent.setup();
      renderFileUploadItem({
        status: FileUploadStatus.SUCCESS,
      });

      expect(onRemove).not.toHaveBeenCalled();

      const closeButton = screen.getByRole('button');
      await user.click(closeButton);

      expect(onRemove).toHaveBeenCalledTimes(1);
      expect(onRemove).toHaveBeenCalledWith('test-id-1');
    });

    test('アップロード中は削除ボタンが表示されず、クリックできないこと', () => {
      renderFileUploadItem({
        status: FileUploadStatus.UPLOADING,
      });

      const closeButtons = screen.queryAllByRole('button');
      expect(closeButtons).toHaveLength(0);
    });
  });
});
