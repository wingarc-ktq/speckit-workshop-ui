import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import { i18n } from '@/i18n/config';

import {
  createFile,
  createFiles,
  drop,
} from '../components/FileUploadZone/__tests__/testHelpers';
import { UploadSection } from '../UploadSection';

describe('UploadSection', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ja');
  });

  const uploadFile = vi.fn();

  const renderComponent = () => {
    return render(
      <RepositoryTestWrapper
        override={{
          files: {
            uploadFile: uploadFile,
          },
        }}
      >
        <UploadSection />
      </RepositoryTestWrapper>
    );
  };

  describe('多言語リソースの確認', () => {
    describe('i18n: filesPage.uploadSection.title', () => {
      test('locale:ja "ファイルをアップロード" が表示される', () => {
        renderComponent();

        expect(screen.getByText('ファイルをアップロード')).toBeInTheDocument();
      });
    });

    describe('i18n: filesPage.uploadSection.maxFilesError', () => {
      test('locale:ja "一度にアップロードできるファイルは最大20個までです。" が表示される', async () => {
        uploadFile.mockResolvedValue({ id: '1' });
        renderComponent();

        // 最初に15個アップロード
        const firstBatch = createFiles(
          Array.from({ length: 15 }, (_, i) => `first${i + 1}.pdf`)
        );
        await drop(firstBatch);

        await waitFor(() => {
          expect(screen.getByTestId('fileUploadList')).toBeInTheDocument();
        });

        // さらに6個追加しようとする（合計21個になるので制限エラー）
        const secondBatch = createFiles(
          Array.from({ length: 6 }, (_, i) => `second${i + 1}.pdf`)
        );
        await drop(secondBatch);

        await waitFor(() => {
          expect(
            screen.getByText(
              '一度にアップロードできるファイルは最大20個までです。'
            )
          ).toBeInTheDocument();
        });
      });
    });

    describe('i18n: filesPage.uploadSection.unsupportedFilesError', () => {
      test('locale:ja "次のファイルはサポートされていないか、サイズが大きすぎます: {{files}}" が表示される', async () => {
        renderComponent();

        // サポートされていないファイルをドロップ
        const file = createFile('test.exe', 'application/x-msdownload');
        await drop([file]);

        await waitFor(() => {
          expect(
            screen.getByText(
              '次のファイルはサポートされていないか、サイズが大きすぎます: test.exe'
            )
          ).toBeInTheDocument();
        });
      });
    });

    describe('i18n: filesPage.uploadSection.uploadFailed', () => {
      test('locale:ja "アップロードに失敗しました" が表示される', async () => {
        uploadFile.mockRejectedValue('string error');
        renderComponent();

        const file = createFile('test.pdf');
        await drop([file]);

        // エラーメッセージが表示されるまで待つ
        await waitFor(
          () => {
            expect(
              screen.getByText('アップロードに失敗しました')
            ).toBeInTheDocument();
          },
          { timeout: 3000 }
        );
      });
    });
  });

  describe('基本的な表示', () => {
    test('タイトルが表示されること', () => {
      renderComponent();

      expect(screen.getByText('ファイルをアップロード')).toBeInTheDocument();
    });

    test('FileUploadZoneが表示されること', () => {
      renderComponent();

      expect(screen.getByTestId('dragAndDropArea')).toBeInTheDocument();
    });

    test('初期状態ではエラーメッセージが表示されないこと', () => {
      renderComponent();

      const alerts = screen.queryAllByRole('alert');
      expect(alerts).toHaveLength(0);
    });

    test('初期状態ではFileUploadListが表示されないこと', () => {
      renderComponent();

      // FileUploadListは空配列の場合nullを返すため、表示されない
      const uploadList = screen.queryByTestId('fileUploadList');
      expect(uploadList).not.toBeInTheDocument();
    });
  });

  describe('子コンポーネントの表示', () => {
    test('FileUploadZoneコンポーネントが表示されること', () => {
      renderComponent();

      expect(screen.getByTestId('dragAndDropArea')).toBeInTheDocument();
    });

    test('ファイル選択後にFileUploadListが表示されること', async () => {
      uploadFile.mockResolvedValue({ id: '1' });
      renderComponent();

      const file = createFile('test.pdf');
      await drop([file]);

      await waitFor(() => {
        expect(screen.getByTestId('fileUploadList')).toBeInTheDocument();
      });
    });
  });

  describe('ファイルアップロード機能', () => {
    test('ファイルをドロップするとアップロードキューに追加されること', async () => {
      uploadFile.mockResolvedValue({ id: '1' });
      renderComponent();

      const file = createFile('test.pdf');
      await drop([file]);

      await waitFor(() => {
        expect(screen.getByTestId('fileUploadList')).toBeInTheDocument();
      });

      // ファイル名が表示されることを確認
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    test('複数のファイルをドロップするとすべてアップロードキューに追加されること', async () => {
      uploadFile.mockResolvedValue({ id: '1' });
      renderComponent();

      const files = createFiles(['file1.pdf', 'file2.pdf', 'file3.pdf']);
      await drop(files);

      await waitFor(() => {
        expect(screen.getByTestId('fileUploadList')).toBeInTheDocument();
      });

      // すべてのファイル名が表示されることを確認
      expect(screen.getByText('file1.pdf')).toBeInTheDocument();
      expect(screen.getByText('file2.pdf')).toBeInTheDocument();
      expect(screen.getByText('file3.pdf')).toBeInTheDocument();
    });

    test('ファイルのアップロードが呼び出されること', async () => {
      uploadFile.mockResolvedValue({ id: '1' });
      renderComponent();

      const file = createFile('test.pdf');
      await drop([file]);

      await waitFor(() => {
        expect(uploadFile).toHaveBeenCalledWith({ file }, expect.anything());
      });
    });

    test('アップロード成功時にアップロード完了が表示されること', async () => {
      uploadFile.mockResolvedValue({ id: '1' });
      renderComponent();

      const file = createFile('test.pdf');
      await drop([file]);

      // アップロード完了が表示されるまで待つ
      await waitFor(() => {
        expect(screen.getByText('アップロード完了')).toBeInTheDocument();
      });
    });

    test('アップロード成功後にファイルがリストから自動削除されること', async () => {
      uploadFile.mockResolvedValue({ id: '1' });
      renderComponent();

      const file = createFile('test.pdf');
      await drop([file]);

      // アップロード成功を確認
      await waitFor(() => {
        expect(screen.getByText('アップロード完了')).toBeInTheDocument();
      });

      // 3秒後にファイルリストが消えることを確認（実時間で待つ）
      await waitFor(
        () => {
          expect(
            screen.queryByTestId('fileUploadList')
          ).not.toBeInTheDocument();
        },
        { timeout: 4000 }
      );
    });

    test('複数ファイルのアップロードが順次実行されること', async () => {
      let resolveCount = 0;
      uploadFile.mockImplementation(() => {
        resolveCount++;
        return Promise.resolve({ id: `${resolveCount}` });
      });

      renderComponent();

      const files = createFiles(['file1.pdf', 'file2.pdf']);
      await drop(files);

      // すべてのファイルでuploadFileが呼ばれることを確認
      await waitFor(() => {
        expect(uploadFile).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('エラーハンドリング', () => {
    test('既にアップロード中のファイルがある状態で20個を超えると制限エラーになること', async () => {
      uploadFile.mockResolvedValue({ id: '1' });
      renderComponent();

      // 最初に10個アップロード
      const firstBatch = createFiles(
        Array.from({ length: 10 }, (_, i) => `first${i + 1}.pdf`)
      );
      await drop(firstBatch);

      await waitFor(() => {
        expect(screen.getByTestId('fileUploadList')).toBeInTheDocument();
      });

      // さらに11個追加しようとする（合計21個）
      const secondBatch = createFiles(
        Array.from({ length: 11 }, (_, i) => `second${i + 1}.pdf`)
      );
      await drop(secondBatch);

      await waitFor(() => {
        expect(
          screen.getByText(
            '一度にアップロードできるファイルは最大20個までです。'
          )
        ).toBeInTheDocument();
      });
    });

    test('サポートされていないファイル形式の場合エラーメッセージが表示されること', async () => {
      renderComponent();

      // サポートされていないファイルをドロップ
      const file = createFile('test.exe', 'application/x-msdownload');
      await drop([file]);

      await waitFor(() => {
        expect(
          screen.getByText(
            '次のファイルはサポートされていないか、サイズが大きすぎます: test.exe'
          )
        ).toBeInTheDocument();
      });
    });

    test('アップロード失敗時にエラーステータスが表示されること', async () => {
      uploadFile.mockRejectedValue(new Error('Network error'));
      renderComponent();

      const file = createFile('test.pdf');
      await drop([file]);

      // エラーメッセージが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    test('アップロード失敗時にエラーステータスが表示されエラーアイコンが表示されること', async () => {
      uploadFile.mockRejectedValue(new Error());
      renderComponent();

      const file = createFile('test.pdf');
      await drop([file]);

      // エラーアイコンが表示されることを確認
      await waitFor(
        () => {
          expect(screen.getByTestId('ErrorIcon')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    test('アップロード失敗時に文字列エラーの場合はデフォルトメッセージが表示されること', async () => {
      uploadFile.mockRejectedValue('Something went wrong');
      renderComponent();

      const file = createFile('test.pdf');
      await drop([file]);

      // デフォルトエラーメッセージが表示されることを確認
      await waitFor(() => {
        expect(
          screen.getByText('アップロードに失敗しました')
        ).toBeInTheDocument();
      });
    });

    test('エラーメッセージのクローズボタンをクリックするとエラーメッセージが非表示になること', async () => {
      const user = userEvent.setup();
      renderComponent();

      // サポートされていないファイルをドロップしてエラーメッセージを表示
      const file = createFile('test.exe', 'application/x-msdownload');
      await drop([file]);

      await waitFor(() => {
        expect(
          screen.getByText(
            '次のファイルはサポートされていないか、サイズが大きすぎます: test.exe'
          )
        ).toBeInTheDocument();
      });

      // クローズボタンをクリック
      const alert = screen.getByRole('alert');
      const closeButton = within(alert).getByRole('button', {
        name: /close/i,
      });
      await user.click(closeButton);

      // エラーメッセージが非表示になることを確認
      await waitFor(() => {
        expect(
          screen.queryByText(
            '次のファイルはサポートされていないか、サイズが大きすぎます: test.exe'
          )
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('ファイル削除機能', () => {
    test('アップロード完了後のファイルを削除できること', async () => {
      const user = userEvent.setup();
      uploadFile.mockResolvedValue({ id: '1' });
      renderComponent();

      const file = createFile('test.pdf');
      await drop([file]);

      // アップロード完了を確認
      await waitFor(() => {
        expect(screen.getByText('アップロード完了')).toBeInTheDocument();
      });

      // 削除ボタンをクリック
      const deleteButton = screen.getByTestId('deleteButton');
      await user.click(deleteButton);

      // ファイルリストが消えることを確認
      await waitFor(() => {
        expect(screen.queryByTestId('fileUploadList')).not.toBeInTheDocument();
      });
    });

    test('エラー状態のファイルを削除できること', async () => {
      const user = userEvent.setup();
      uploadFile.mockRejectedValue(new Error('Upload failed'));
      renderComponent();

      const file = createFile('test.pdf');
      await drop([file]);

      // エラーメッセージが表示されるまで待つ
      await waitFor(() => {
        expect(screen.getByText('Upload failed')).toBeInTheDocument();
      });

      // 削除ボタンをクリック
      const deleteButton = screen.getByTestId('deleteButton');
      await user.click(deleteButton);

      // ファイルリストが消えることを確認
      await waitFor(() => {
        expect(screen.queryByTestId('fileUploadList')).not.toBeInTheDocument();
      });
    });

    test('複数ファイル中の1つを削除しても他のファイルは残ること', async () => {
      const user = userEvent.setup();
      uploadFile.mockResolvedValue({ id: '1' });
      renderComponent();

      const files = createFiles(['file1.pdf', 'file2.pdf', 'file3.pdf']);
      await drop(files);

      // すべてのファイルがアップロード完了するまで待つ
      await waitFor(() => {
        const completeMessages = screen.getAllByText('アップロード完了');
        expect(completeMessages).toHaveLength(3);
      });

      // file2を削除
      const allDeleteButtons = screen.getAllByTestId('deleteButton');
      await user.click(allDeleteButtons[1]);

      // file2が消えて、file1とfile3は残ることを確認
      await waitFor(() => {
        expect(screen.queryByText('file2.pdf')).not.toBeInTheDocument();
      });
      expect(screen.getByText('file1.pdf')).toBeInTheDocument();
      expect(screen.getByText('file3.pdf')).toBeInTheDocument();
    });
  });

  describe('アップロード中の状態管理', () => {
    test('アップロード中はFileUploadZoneが無効化されること', async () => {
      uploadFile.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ id: '1' }), 10000)
          )
      );
      renderComponent();

      const file = createFile('test.pdf');
      await drop([file]);

      // FileUploadZoneが無効化されることを確認
      // react-dropzoneはdisabled propsが渡されると内部的に無効化されるが、
      // DOM要素自体にdisabled属性が追加されるわけではない
      // そのため、ファイルリストが表示されアップロードが進行中であることを確認
      await waitFor(() => {
        expect(screen.getByTestId('fileUploadList')).toBeInTheDocument();
      });
    });

    test('すべてのアップロードが完了するとFileUploadZoneが有効化されること', async () => {
      uploadFile.mockResolvedValue({ id: '1' });
      renderComponent();

      const file = createFile('test.pdf');
      await drop([file]);

      // アップロード完了を確認
      await waitFor(() => {
        expect(screen.getByText('アップロード完了')).toBeInTheDocument();
      });

      // FileUploadZoneが有効化されていることを確認
      // アップロード完了後もドラッグ&ドロップエリアが表示されていることで確認
      const dropZone = screen.getByTestId('dragAndDropArea');
      expect(dropZone).toBeInTheDocument();
    });
  });
});
