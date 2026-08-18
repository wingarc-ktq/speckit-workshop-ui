import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { mockFile } from '@/__fixtures__/files';
import { mockTags } from '@/__fixtures__/tags';
import { deferMock } from '@/__fixtures__/testUtils';
import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import type { UpdateFileRequest } from '@/domain/models/file';
import { i18n } from '@/i18n/config';

import { FileEditDialog } from '../FileEditDialog';

describe('FileEditDialog', () => {
  const onClose = vi.fn();
  const getFileById = vi.fn();
  const getTags = vi.fn();
  const updateFile = vi.fn();

  beforeEach(async () => {
    await i18n.changeLanguage('ja');

    // デフォルトのモック実装
    getFileById.mockResolvedValue(mockFile);
    getTags.mockResolvedValue(mockTags);
    updateFile.mockResolvedValue(undefined);
  });

  const renderComponent = async (
    props: Partial<React.ComponentProps<typeof FileEditDialog>> = {}
  ) => {
    const defaultProps = {
      fileId: mockFile.id,
      onClose,
    };

    const result = render(
      <RepositoryTestWrapper
        hasSuspense
        override={{
          files: {
            getFileById,
            updateFile,
          },
          tags: {
            getTags,
          },
        }}
      >
        <FileEditDialog {...defaultProps} {...props} />
      </RepositoryTestWrapper>
    );

    // QueryBoundary のスケルトンが消える（ファイル取得が完了する）まで待つ
    await waitFor(() =>
      expect(
        result.queryByTestId('fileEditDialogSkeleton')
      ).not.toBeInTheDocument()
    );

    return result;
  };

  describe('多言語リソースの確認', () => {
    describe('i18n: filesPage.fileEditDialog.title', () => {
      test('locale:ja "ファイルを編集" が表示される', async () => {
        await renderComponent();

        expect(screen.getByText('ファイルを編集')).toBeInTheDocument();
      });
    });

    describe('i18n: filesPage.fileEditDialog.fileName', () => {
      test('locale:ja "ファイル名" が表示される', async () => {
        await renderComponent();

        expect(screen.getByLabelText(/ファイル名/)).toBeInTheDocument();
      });
    });

    describe('i18n: filesPage.fileEditDialog.description', () => {
      test('locale:ja "説明" が表示される', async () => {
        await renderComponent();

        expect(screen.getByLabelText('説明')).toBeInTheDocument();
      });
    });

    describe('i18n: filesPage.fileEditDialog.tags', () => {
      test('locale:ja "タグ" が表示される', async () => {
        await renderComponent();

        expect(screen.getByLabelText('タグ')).toBeInTheDocument();
      });
    });

    describe('i18n: common.cancel', () => {
      test('locale:ja "キャンセル" が表示される', async () => {
        await renderComponent();

        expect(
          screen.getByRole('button', { name: 'キャンセル' })
        ).toBeInTheDocument();
      });
    });

    describe('i18n: common.save', () => {
      test('locale:ja "保存" が表示される', async () => {
        await renderComponent();

        expect(
          screen.getByRole('button', { name: '保存' })
        ).toBeInTheDocument();
      });
    });
  });

  describe('初期表示', () => {
    test('ダイアログが開いている時、ファイル情報が表示されること', async () => {
      await renderComponent();

      const fileNameInput = screen.getByLabelText(
        /ファイル名/
      ) as HTMLInputElement;
      expect(fileNameInput.value).toBe(mockFile.name);

      const descriptionInput = screen.getByLabelText(
        '説明'
      ) as HTMLInputElement;
      expect(descriptionInput.value).toBe(mockFile.description);
    });

    test('保存ボタンにEditIconが表示されること', async () => {
      await renderComponent();

      const saveButton = screen.getByRole('button', { name: '保存' });
      const icon = saveButton.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('ユーザー操作', () => {
    describe('ファイル名の編集', () => {
      test('ファイル名を変更できること', async () => {
        const user = userEvent.setup();
        await renderComponent();

        const fileNameInput = screen.getByLabelText(
          /ファイル名/
        ) as HTMLInputElement;

        await user.clear(fileNameInput);
        await user.type(fileNameInput, 'new-filename.pdf');

        expect(fileNameInput.value).toBe('new-filename.pdf');
      });

      test('ファイル名が空の時、バリデーションエラーが表示されること', async () => {
        const user = userEvent.setup();
        await renderComponent();

        const fileNameInput = screen.getByLabelText(/ファイル名/);

        await user.clear(fileNameInput);

        await waitFor(() => {
          expect(
            screen.getByText('ファイル名は1〜255文字で入力してください')
          ).toBeInTheDocument();
        });
      });

      test('ファイル名が255文字を超える時、バリデーションエラーが表示されること', async () => {
        const user = userEvent.setup();
        await renderComponent();

        const fileNameInput = screen.getByLabelText(/ファイル名/);
        const longName = 'a'.repeat(256);

        await user.clear(fileNameInput);
        await user.type(fileNameInput, longName);

        await waitFor(() => {
          expect(
            screen.getByText('ファイル名は1〜255文字で入力してください')
          ).toBeInTheDocument();
        });
      });

      test('ファイル名が空白のみの場合、バリデーションエラーが表示されること', async () => {
        const user = userEvent.setup();
        await renderComponent();

        const fileNameInput = screen.getByLabelText(/ファイル名/);

        await user.clear(fileNameInput);
        await user.type(fileNameInput, '   ');

        await waitFor(() => {
          expect(
            screen.getByText('ファイル名は1〜255文字で入力してください')
          ).toBeInTheDocument();
        });
      });
    });

    describe('説明の編集', () => {
      test('説明を変更できること', async () => {
        const user = userEvent.setup();
        await renderComponent();

        const descriptionInput = screen.getByLabelText(
          '説明'
        ) as HTMLInputElement;

        await user.clear(descriptionInput);
        await user.type(descriptionInput, 'New description');

        expect(descriptionInput.value).toBe('New description');
      });

      test('説明が500文字を超える時、バリデーションエラーが表示されること', async () => {
        const user = userEvent.setup();
        await renderComponent();

        const descriptionInput = screen.getByLabelText('説明');
        const longDescription = 'a'.repeat(501);

        await user.clear(descriptionInput);
        await user.type(descriptionInput, longDescription);

        await waitFor(() => {
          expect(
            screen.getByText('説明は500文字以内で入力してください')
          ).toBeInTheDocument();
        });
      });

      test('説明が500文字以内の時、文字数カウンターが表示されること', async () => {
        const user = userEvent.setup();
        await renderComponent();

        const descriptionInput = screen.getByLabelText('説明');

        await user.clear(descriptionInput);
        await user.type(descriptionInput, 'Test description');

        await waitFor(() => {
          expect(screen.getByText('16/500')).toBeInTheDocument();
        });
      });
    });

    describe('タグの編集', () => {
      test('タグセレクターが表示されること', async () => {
        await renderComponent();

        expect(screen.getByLabelText('タグ')).toBeInTheDocument();
      });

      test('利用可能なタグが表示されること', async () => {
        await renderComponent();

        expect(getTags).toHaveBeenCalled();
      });
    });

    describe('キャンセルボタン', () => {
      test('キャンセルボタンをクリックすると、onCloseが呼ばれること', async () => {
        const user = userEvent.setup();
        await renderComponent();

        const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
        await user.click(cancelButton);

        expect(onClose).toHaveBeenCalledTimes(1);
      });

      test('保存中はキャンセルボタンが無効になること', async () => {
        const user = userEvent.setup();
        // 保存処理を遅延させる
        updateFile.mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 1000))
        );

        await renderComponent();

        const saveButton = screen.getByRole('button', { name: '保存' });
        await user.click(saveButton);

        const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
        expect(cancelButton).toBeDisabled();
      });
    });

    describe('保存ボタン', () => {
      test('有効な入力値で保存ボタンをクリックすると、updateFileが呼ばれること', async () => {
        const user = userEvent.setup();
        await renderComponent();

        const fileNameInput = screen.getByLabelText(/ファイル名/);
        const descriptionInput = screen.getByLabelText('説明');

        await user.clear(fileNameInput);
        await user.type(fileNameInput, 'updated-file.pdf');
        await user.clear(descriptionInput);
        await user.type(descriptionInput, 'Updated description');

        const saveButton = screen.getByRole('button', { name: '保存' });
        await user.click(saveButton);

        await waitFor(() => {
          expect(updateFile).toHaveBeenCalledWith(mockFile.id, {
            name: 'updated-file.pdf',
            description: 'Updated description',
            tagIds: [],
          } as UpdateFileRequest);
        });
      });

      test('説明が空の場合、undefinedとして送信されること', async () => {
        const user = userEvent.setup();
        await renderComponent();

        const fileNameInput = screen.getByLabelText(/ファイル名/);
        const descriptionInput = screen.getByLabelText('説明');

        await user.clear(fileNameInput);
        await user.type(fileNameInput, 'test.pdf');
        await user.clear(descriptionInput);

        const saveButton = screen.getByRole('button', { name: '保存' });
        await user.click(saveButton);

        await waitFor(() => {
          expect(updateFile).toHaveBeenCalledWith(mockFile.id, {
            name: 'test.pdf',
            description: undefined,
            tagIds: [],
          } as UpdateFileRequest);
        });
      });

      test('保存が成功すると、onCloseが呼ばれること', async () => {
        const user = userEvent.setup();
        await renderComponent();

        const saveButton = screen.getByRole('button', { name: '保存' });
        await user.click(saveButton);

        await waitFor(() => {
          expect(onClose).toHaveBeenCalledTimes(1);
        });
      });

      test('バリデーションエラーがある時、保存ボタンが無効になること', async () => {
        const user = userEvent.setup();
        await renderComponent();

        const fileNameInput = screen.getByLabelText(/ファイル名/);
        await user.clear(fileNameInput);

        await waitFor(() => {
          const saveButton = screen.getByRole('button', { name: '保存' });
          expect(saveButton).toBeDisabled();
        });
      });

      test('保存中は保存ボタンが無効になること', async () => {
        const user = userEvent.setup();
        // 保存処理を遅延させる
        updateFile.mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 1000))
        );

        await renderComponent();

        const saveButton = screen.getByRole('button', { name: '保存' });
        await user.click(saveButton);

        expect(saveButton).toBeDisabled();
      });

      test('ファイル名の前後の空白がトリミングされること', async () => {
        const user = userEvent.setup();
        await renderComponent();

        const fileNameInput = screen.getByLabelText(/ファイル名/);

        await user.clear(fileNameInput);
        await user.type(fileNameInput, '  test.pdf  ');

        const saveButton = screen.getByRole('button', { name: '保存' });
        await user.click(saveButton);

        await waitFor(() => {
          expect(updateFile).toHaveBeenCalledWith(
            mockFile.id,
            expect.objectContaining({
              name: 'test.pdf',
            })
          );
        });
      });

      test('説明の前後の空白がトリミングされること', async () => {
        const user = userEvent.setup();
        await renderComponent();

        const descriptionInput = screen.getByLabelText('説明');

        await user.clear(descriptionInput);
        await user.type(descriptionInput, '  test description  ');

        const saveButton = screen.getByRole('button', { name: '保存' });
        await user.click(saveButton);

        await waitFor(() => {
          expect(updateFile).toHaveBeenCalledWith(
            mockFile.id,
            expect.objectContaining({
              description: 'test description',
            })
          );
        });
      });
    });
  });

  describe('エラーハンドリング', () => {
    test('保存に失敗してもダイアログが閉じないこと', async () => {
      const user = userEvent.setup();
      updateFile.mockRejectedValue(new Error('Update failed'));

      await renderComponent();

      const saveButton = screen.getByRole('button', { name: '保存' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(updateFile).toHaveBeenCalled();
      });

      // ダイアログは閉じない
      expect(onClose).not.toHaveBeenCalled();
      expect(screen.getByText('ファイルを編集')).toBeInTheDocument();
    });
  });

  describe('エッジケース', () => {
    test('ファイルに説明がない場合でも正しく表示されること', async () => {
      const fileWithoutDescription = {
        ...mockFile,
        description: null,
      };
      getFileById.mockResolvedValue(fileWithoutDescription);

      await renderComponent();

      const descriptionInput = screen.getByLabelText(
        '説明'
      ) as HTMLInputElement;
      expect(descriptionInput.value).toBe('');
    });

    test('255文字ちょうどのファイル名は有効であること', async () => {
      const user = userEvent.setup();
      await renderComponent();

      const fileNameInput = screen.getByLabelText(/ファイル名/);
      const exactLengthName = 'a'.repeat(255);

      await user.clear(fileNameInput);
      await user.type(fileNameInput, exactLengthName);

      await waitFor(() => {
        const saveButton = screen.getByRole('button', { name: '保存' });
        expect(saveButton).not.toBeDisabled();
      });
    });

    test('500文字ちょうどの説明は有効であること', async () => {
      const user = userEvent.setup();
      await renderComponent();

      const descriptionInput = screen.getByLabelText('説明');
      const exactLengthDescription = 'a'.repeat(500);

      await user.clear(descriptionInput);
      await user.type(descriptionInput, exactLengthDescription);

      await waitFor(() => {
        const saveButton = screen.getByRole('button', { name: '保存' });
        expect(saveButton).not.toBeDisabled();
        expect(screen.getByText('500/500')).toBeInTheDocument();
      });
    });
  });

  describe('ローディング表示（QueryBoundary）', () => {
    test('取得中はスケルトンを表示し、完了後に実データへ切り替わること', async () => {
      // getFileById を保留状態にして、取得中→完了の遷移を制御する
      const resolve = deferMock(getFileById, mockFile);

      render(
        <RepositoryTestWrapper
          override={{
            files: { getFileById, updateFile },
            tags: { getTags },
          }}
        >
          <FileEditDialog fileId={mockFile.id} onClose={onClose} />
        </RepositoryTestWrapper>
      );

      // 取得中はスケルトンが表示され、フォーム（ファイル名入力）はまだ無い
      expect(screen.getByTestId('fileEditDialogSkeleton')).toBeInTheDocument();
      expect(screen.queryByLabelText(/ファイル名/)).not.toBeInTheDocument();

      // 取得完了 → フォームに切り替わり、スケルトンは消える
      resolve();

      expect(await screen.findByLabelText(/ファイル名/)).toBeInTheDocument();
      expect(
        screen.queryByTestId('fileEditDialogSkeleton')
      ).not.toBeInTheDocument();
    });
  });
});
