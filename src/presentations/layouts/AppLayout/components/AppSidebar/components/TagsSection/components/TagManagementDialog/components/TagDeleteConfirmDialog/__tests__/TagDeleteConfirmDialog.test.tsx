import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { mockTag, mockTag2 } from '@/__fixtures__/tags';
import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import { i18n } from '@/i18n/config';

import { TagDeleteConfirmDialog } from '../TagDeleteConfirmDialog';

import type { TagDeleteConfirmDialogProps } from '../TagDeleteConfirmDialog';

describe('TagDeleteConfirmDialog', () => {
  const onClose = vi.fn();
  const deleteTag = vi.fn<(tagId: string) => Promise<void>>();

  beforeEach(async () => {
    await i18n.changeLanguage('ja');
    deleteTag.mockResolvedValue(undefined);
  });

  const renderTagDeleteConfirmDialog = (
    props: Partial<TagDeleteConfirmDialogProps> = {}
  ) => {
    const defaultProps: TagDeleteConfirmDialogProps = {
      open: true,
      tagId: mockTag.id,
      tagName: mockTag.name,
      onClose: onClose,
    };

    return render(
      <RepositoryTestWrapper
        override={{
          tags: {
            deleteTag: deleteTag,
          },
        }}
      >
        <TagDeleteConfirmDialog {...defaultProps} {...props} />
      </RepositoryTestWrapper>
    );
  };

  describe('多言語リソースの確認', () => {
    describe('i18n: layouts.appSidebar.tags.deleteDialog.title', () => {
      test('locale:ja "タグを削除" が表示される', () => {
        renderTagDeleteConfirmDialog();
        expect(screen.getByText('タグを削除')).toBeInTheDocument();
      });
    });

    describe('i18n: layouts.appSidebar.tags.deleteDialog.message', () => {
      test('locale:ja タグ名を含むメッセージが表示される', () => {
        renderTagDeleteConfirmDialog({ tagName: mockTag.name });
        expect(
          screen.getByText(`「${mockTag.name}」を削除してもよろしいですか?`)
        ).toBeInTheDocument();
      });

      test('タグ名が指定されない場合は空文字列で表示される', () => {
        renderTagDeleteConfirmDialog({ tagName: undefined });
        expect(
          screen.getByText('「」を削除してもよろしいですか?')
        ).toBeInTheDocument();
      });
    });

    describe('i18n: layouts.appSidebar.tags.deleteDialog.warning', () => {
      test('locale:ja 警告メッセージが表示される', () => {
        renderTagDeleteConfirmDialog();
        expect(
          screen.getByText(
            'このタグが使用されているファイルから、このタグが削除されます。この操作は取り消せません。'
          )
        ).toBeInTheDocument();
      });
    });

    describe('i18n: common.cancel', () => {
      test('locale:ja "キャンセル" が表示される', () => {
        renderTagDeleteConfirmDialog();
        expect(screen.getByTestId('cancelButton')).toHaveTextContent(
          'キャンセル'
        );
      });
    });

    describe('i18n: layouts.appSidebar.tags.deleteDialog.confirmButton', () => {
      test('locale:ja "削除" が表示される', () => {
        renderTagDeleteConfirmDialog();
        expect(screen.getByTestId('confirmDeleteButton')).toHaveTextContent(
          '削除'
        );
      });
    });
  });

  describe('初期表示', () => {
    test('ダイアログが正しく表示されること', () => {
      renderTagDeleteConfirmDialog();

      expect(screen.getByTestId('tagDeleteConfirmDialog')).toBeInTheDocument();
      expect(screen.getByText('タグを削除')).toBeInTheDocument();
      expect(screen.getByTestId('cancelButton')).toBeInTheDocument();
      expect(screen.getByTestId('confirmDeleteButton')).toBeInTheDocument();
    });

    test('警告アイコンが表示されること', () => {
      renderTagDeleteConfirmDialog();

      // MUIのWarningAmberIconはSVG要素としてレンダリングされる
      const icon = screen
        .getByTestId('tagDeleteConfirmDialog')
        .querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    test('削除対象のタグ名が表示されること', () => {
      renderTagDeleteConfirmDialog({ tagName: mockTag2.name });

      expect(
        screen.getByText(`「${mockTag2.name}」を削除してもよろしいですか?`)
      ).toBeInTheDocument();
    });

    test('警告ボックスが表示されること', () => {
      renderTagDeleteConfirmDialog();

      const warningText = screen.getByText(
        'このタグが使用されているファイルから、このタグが削除されます。この操作は取り消せません。'
      );
      expect(warningText).toBeInTheDocument();
    });

    test('削除ボタンが有効な状態で表示されること', () => {
      renderTagDeleteConfirmDialog();

      const confirmButton = screen.getByTestId('confirmDeleteButton');
      expect(confirmButton).toBeEnabled();
    });
  });

  describe('ユーザー操作', () => {
    test('キャンセルボタンをクリックするとonCloseが呼ばれること', async () => {
      const user = userEvent.setup();
      renderTagDeleteConfirmDialog();

      const cancelButton = screen.getByTestId('cancelButton');
      await user.click(cancelButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test('削除ボタンをクリックすると削除処理が実行されonCloseが呼ばれること', async () => {
      const user = userEvent.setup();
      renderTagDeleteConfirmDialog({ tagId: mockTag.id });

      const confirmButton = screen.getByTestId('confirmDeleteButton');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(deleteTag).toHaveBeenCalledWith(mockTag.id, expect.anything());
      });

      await waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });

    test('tagIdがnullの場合は削除ボタンをクリックしても何も実行されないこと', async () => {
      const user = userEvent.setup();
      renderTagDeleteConfirmDialog({ tagId: null });

      const confirmButton = screen.getByTestId('confirmDeleteButton');
      await user.click(confirmButton);

      // 削除処理が呼ばれないことを確認
      expect(deleteTag).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('ダイアログの開閉', () => {
    test('openがfalseの場合はダイアログが非表示になること', () => {
      renderTagDeleteConfirmDialog({ open: false });

      const dialog = screen.queryByTestId('tagDeleteConfirmDialog');

      // MUIのDialogはDOM上には存在するが、aria-hiddenで非表示になる
      if (dialog) {
        expect(dialog).toHaveAttribute('aria-hidden', 'true');
      } else {
        expect(dialog).not.toBeInTheDocument();
      }
    });

    test('openがtrueの場合はダイアログが表示されること', () => {
      renderTagDeleteConfirmDialog({ open: true });

      const dialog = screen.getByTestId('tagDeleteConfirmDialog');
      expect(dialog).toBeInTheDocument();
    });
  });

  describe('削除処理の状態管理', () => {
    test('削除処理中は削除ボタンが無効になること', async () => {
      const user = userEvent.setup();

      // 削除処理が完了しないようにPromiseを保留状態にする
      let resolveDelete: () => void;
      const pendingPromise = new Promise<void>((resolve) => {
        resolveDelete = resolve;
      });
      deleteTag.mockReturnValue(pendingPromise);

      renderTagDeleteConfirmDialog();

      // 削除ボタンをクリックして削除処理を開始
      const confirmButton = screen.getByTestId('confirmDeleteButton');
      await user.click(confirmButton);

      // 削除処理中はボタンが無効になることを確認
      await waitFor(() => {
        expect(confirmButton).toBeDisabled();
      });

      // クリーンアップ: Promiseを解決してテストを終了
      resolveDelete!();
    });

    test('削除処理が完了していない状態では削除ボタンが有効なこと', () => {
      renderTagDeleteConfirmDialog();

      const confirmButton = screen.getByTestId('confirmDeleteButton');
      expect(confirmButton).toBeEnabled();
    });
  });

  describe('エラーハンドリング', () => {
    test('削除処理でエラーが発生した場合はコンソールエラーが出力されダイアログが閉じないこと', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const mockError = new Error('API Error');
      deleteTag.mockRejectedValue(mockError);

      renderTagDeleteConfirmDialog({ tagId: mockTag.id });

      const confirmButton = screen.getByTestId('confirmDeleteButton');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(deleteTag).toHaveBeenCalledWith(mockTag.id, expect.anything());
      });

      // エラーが発生してもダイアログは開いたまま
      expect(screen.getByTestId('tagDeleteConfirmDialog')).toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();

      // コンソールエラーが出力されていることを確認
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Tag deletion failed:',
          mockError
        );
      });

      consoleErrorSpy.mockRestore();
    });

    test('削除処理で予期しないエラーが発生した場合も適切にハンドリングされること', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      deleteTag.mockRejectedValue('Unexpected error string');

      renderTagDeleteConfirmDialog({ tagId: mockTag.id });

      const confirmButton = screen.getByTestId('confirmDeleteButton');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(deleteTag).toHaveBeenCalledWith(mockTag.id, expect.anything());
      });

      // エラーが発生してもダイアログは開いたまま
      expect(screen.getByTestId('tagDeleteConfirmDialog')).toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();

      // コンソールエラーが出力されていることを確認
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Tag deletion failed:',
          'Unexpected error string'
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('複数のタグに対する削除確認', () => {
    test('異なるタグIDで削除確認ダイアログを表示できること', () => {
      const { rerender } = renderTagDeleteConfirmDialog({
        tagId: mockTag.id,
        tagName: mockTag.name,
      });

      expect(
        screen.getByText(`「${mockTag.name}」を削除してもよろしいですか?`)
      ).toBeInTheDocument();

      // 別のタグに切り替え
      rerender(
        <RepositoryTestWrapper
          override={{
            tags: {
              deleteTag: deleteTag,
            },
          }}
        >
          <TagDeleteConfirmDialog
            open={true}
            tagId={mockTag2.id}
            tagName={mockTag2.name}
            onClose={onClose}
          />
        </RepositoryTestWrapper>
      );

      expect(
        screen.getByText(`「${mockTag2.name}」を削除してもよろしいですか?`)
      ).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    test('ダイアログにmaxWidthとfullWidthが設定されていること', () => {
      renderTagDeleteConfirmDialog();

      const dialog = screen.getByTestId('tagDeleteConfirmDialog');
      expect(dialog).toBeInTheDocument();

      // MUIのDialogがmaxWidth="xs"とfullWidthを適用していることを確認
      // 実際のDOMではpaper要素にクラスが適用される
      const paper = dialog.querySelector('.MuiDialog-paper');
      expect(paper).toHaveClass('MuiDialog-paperWidthXs');
      expect(paper).toHaveClass('MuiDialog-paperFullWidth');
    });

    test('削除ボタンがerrorカラーで表示されること', () => {
      renderTagDeleteConfirmDialog();

      const confirmButton = screen.getByTestId('confirmDeleteButton');
      expect(confirmButton).toHaveClass('MuiButton-colorError');
      expect(confirmButton).toHaveClass('MuiButton-contained');
    });
  });
});
