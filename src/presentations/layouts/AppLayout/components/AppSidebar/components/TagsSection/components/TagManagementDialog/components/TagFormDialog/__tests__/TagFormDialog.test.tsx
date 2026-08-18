import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { mockTag } from '@/__fixtures__/tags';
import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import { TagColor } from '@/domain/models/tag';
import { i18n } from '@/i18n/config';

import { TagFormDialog } from '../TagFormDialog';

import type { TagFormDialogProps } from '../TagFormDialog';

describe('TagFormDialog', () => {
  const onClose = vi.fn();
  const createTag = vi.fn();
  const updateTag = vi.fn();
  const getTags = vi.fn();

  beforeEach(async () => {
    await i18n.changeLanguage('ja');
    getTags.mockResolvedValue([mockTag]);
    createTag.mockResolvedValue(undefined);
    updateTag.mockResolvedValue(undefined);
  });

  const renderTagFormDialog = async (
    props: Partial<TagFormDialogProps> = {}
  ) => {
    const defaultProps: TagFormDialogProps = {
      open: true,
      mode: 'create',
      tagId: null,
      onClose: onClose,
    };

    const r = render(
      <RepositoryTestWrapper
        hasSuspense
        override={{
          tags: {
            getTags: getTags,
            createTag: createTag,
            updateTag: updateTag,
          },
        }}
      >
        <TagFormDialog {...defaultProps} {...props} />
      </RepositoryTestWrapper>
    );
    await waitFor(() =>
      expect(r.queryByTestId('suspense')).not.toBeInTheDocument()
    );
    return r;
  };

  describe('作成モード', () => {
    describe('多言語リソースの確認', () => {
      describe('i18n: layouts.appSidebar.tags.formDialog.createTitle', () => {
        test('locale:ja "タグを作成" が表示される', async () => {
          await renderTagFormDialog({ mode: 'create' });
          expect(screen.getByText('タグを作成')).toBeInTheDocument();
        });
      });

      describe('i18n: layouts.appSidebar.tags.formDialog.nameLabel', () => {
        test('locale:ja "タグ名" が表示される', async () => {
          await renderTagFormDialog({ mode: 'create' });
          expect(screen.getByLabelText('タグ名')).toBeInTheDocument();
        });
      });

      describe('i18n: layouts.appSidebar.tags.formDialog.colorLabel', () => {
        test('locale:ja "色" が表示される', async () => {
          await renderTagFormDialog({ mode: 'create' });
          expect(screen.getByText('色')).toBeInTheDocument();
        });
      });

      describe('i18n: common.cancel', () => {
        test('locale:ja "キャンセル" が表示される', async () => {
          await renderTagFormDialog({ mode: 'create' });
          expect(screen.getByTestId('cancelButton')).toHaveTextContent(
            'キャンセル'
          );
        });
      });

      describe('i18n: layouts.appSidebar.tags.formDialog.createButton', () => {
        test('locale:ja "作成" が表示される', async () => {
          await renderTagFormDialog({ mode: 'create' });
          expect(screen.getByTestId('submitButton')).toHaveTextContent('作成');
        });
      });
    });

    describe('初期表示', () => {
      test('ダイアログが正しく表示されること', async () => {
        await renderTagFormDialog({ mode: 'create' });

        expect(screen.getByTestId('tagFormDialog')).toBeInTheDocument();
        expect(screen.getByText('タグを作成')).toBeInTheDocument();
        expect(screen.getByTestId('tagNameInput')).toBeInTheDocument();
        expect(screen.getByTestId('tagColorPicker')).toBeInTheDocument();
        expect(screen.getByTestId('cancelButton')).toBeInTheDocument();
        expect(screen.getByTestId('submitButton')).toBeInTheDocument();
      });

      test('タグ名の入力フィールドが空であること', async () => {
        await renderTagFormDialog({ mode: 'create' });

        const nameInput = screen
          .getByTestId('tagNameInput')
          .querySelector('input');
        expect(nameInput).toHaveValue('');
      });

      test('デフォルトの色が選択されていること', async () => {
        await renderTagFormDialog({ mode: 'create' });

        // デフォルトはblue
        const blueButton = screen.getByTestId('color-blue');
        expect(blueButton).toHaveClass('Mui-selected');
      });
    });

    describe('ユーザー操作', () => {
      test('タグ名を入力できること', async () => {
        const user = userEvent.setup();
        await renderTagFormDialog({ mode: 'create' });

        const nameInput = screen
          .getByTestId('tagNameInput')
          .querySelector('input');
        await user.type(nameInput!, 'New Tag');

        expect(nameInput).toHaveValue('New Tag');
      });

      test('色を選択できること', async () => {
        const user = userEvent.setup();
        await renderTagFormDialog({ mode: 'create' });

        const redButton = screen.getByTestId('color-red');
        await user.click(redButton);

        expect(redButton).toHaveClass('Mui-selected');
      });

      test('キャンセルボタンをクリックするとonCloseが呼ばれること', async () => {
        const user = userEvent.setup();
        await renderTagFormDialog({ mode: 'create' });

        const cancelButton = screen.getByTestId('cancelButton');
        await user.click(cancelButton);

        expect(onClose).toHaveBeenCalledTimes(1);
      });

      test('タグ名と色を入力して送信できること', async () => {
        const user = userEvent.setup();
        await renderTagFormDialog({ mode: 'create' });

        // タグ名を入力
        const nameInput = screen
          .getByTestId('tagNameInput')
          .querySelector('input');
        await user.type(nameInput!, 'New Tag');

        // 色を選択
        const redButton = screen.getByTestId('color-red');
        await user.click(redButton);

        // 送信
        const submitButton = screen.getByTestId('submitButton');
        await user.click(submitButton);

        await waitFor(() => {
          expect(createTag).toHaveBeenCalledWith(
            {
              name: 'New Tag',
              color: TagColor.RED,
            },
            expect.anything()
          );
        });

        await waitFor(() => {
          expect(onClose).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('バリデーション', () => {
      test('タグ名が空の場合エラーメッセージが表示されること', async () => {
        const user = userEvent.setup();
        await renderTagFormDialog({ mode: 'create' });

        const submitButton = screen.getByTestId('submitButton');
        await user.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText('タグ名は必須です')).toBeInTheDocument();
        });

        expect(createTag).not.toHaveBeenCalled();
      });

      test('タグ名が50文字を超える場合エラーメッセージが表示されること', async () => {
        const user = userEvent.setup();
        await renderTagFormDialog({ mode: 'create' });

        const nameInput = screen
          .getByTestId('tagNameInput')
          .querySelector('input');
        const longName = 'a'.repeat(51);
        await user.type(nameInput!, longName);

        const submitButton = screen.getByTestId('submitButton');
        await user.click(submitButton);

        await waitFor(() => {
          expect(
            screen.getByText('タグ名は50文字以内で入力してください')
          ).toBeInTheDocument();
        });

        expect(createTag).not.toHaveBeenCalled();
      });

      test('タグ名が50文字ちょうどの場合は送信できること', async () => {
        const user = userEvent.setup();
        await renderTagFormDialog({ mode: 'create' });

        const nameInput = screen
          .getByTestId('tagNameInput')
          .querySelector('input');
        const exactLengthName = 'a'.repeat(50);
        await user.type(nameInput!, exactLengthName);

        const submitButton = screen.getByTestId('submitButton');
        await user.click(submitButton);

        await waitFor(() => {
          expect(createTag).toHaveBeenCalledWith(
            {
              name: exactLengthName,
              color: TagColor.BLUE, // デフォルト色
            },
            expect.anything()
          );
        });
      });
    });
  });

  describe('編集モード', () => {
    describe('多言語リソースの確認', () => {
      describe('i18n: layouts.appSidebar.tags.formDialog.editTitle', () => {
        test('locale:ja "タグを編集" が表示される', async () => {
          await renderTagFormDialog({ mode: 'edit', tagId: mockTag.id });
          expect(screen.getByText('タグを編集')).toBeInTheDocument();
        });
      });

      describe('i18n: layouts.appSidebar.tags.formDialog.saveButton', () => {
        test('locale:ja "保存" が表示される', async () => {
          await renderTagFormDialog({ mode: 'edit', tagId: mockTag.id });
          expect(screen.getByTestId('submitButton')).toHaveTextContent('保存');
        });
      });
    });

    describe('初期表示', () => {
      test('既存のタグ情報がフォームに表示されること', async () => {
        await renderTagFormDialog({ mode: 'edit', tagId: mockTag.id });

        await waitFor(() => {
          const nameInput = screen
            .getByTestId('tagNameInput')
            .querySelector('input');
          expect(nameInput).toHaveValue(mockTag.name);
        });

        // 既存の色が選択されている
        const colorButton = screen.getByTestId(`color-${mockTag.color}`);
        expect(colorButton).toHaveClass('Mui-selected');
      });
    });

    describe('ユーザー操作', () => {
      test('タグ名を変更して保存できること', async () => {
        const user = userEvent.setup();
        await renderTagFormDialog({ mode: 'edit', tagId: mockTag.id });

        // 既存のタグ名が表示されるまで待機
        await waitFor(() => {
          const nameInput = screen
            .getByTestId('tagNameInput')
            .querySelector('input');
          expect(nameInput).toHaveValue(mockTag.name);
        });

        // タグ名を変更
        const nameInput = screen
          .getByTestId('tagNameInput')
          .querySelector('input');
        await user.clear(nameInput!);
        await user.type(nameInput!, 'Updated Tag');

        // 保存
        const submitButton = screen.getByTestId('submitButton');
        await user.click(submitButton);

        await waitFor(() => {
          expect(updateTag).toHaveBeenCalledWith(mockTag.id, {
            name: 'Updated Tag',
            color: mockTag.color,
          });
        });

        await waitFor(() => {
          expect(onClose).toHaveBeenCalledTimes(1);
        });
      });

      test('色を変更して保存できること', async () => {
        const user = userEvent.setup();
        await renderTagFormDialog({ mode: 'edit', tagId: mockTag.id });

        // 既存のタグ情報が表示されるまで待機
        await waitFor(() => {
          const nameInput = screen
            .getByTestId('tagNameInput')
            .querySelector('input');
          expect(nameInput).toHaveValue(mockTag.name);
        });

        // 色を変更
        const blueButton = screen.getByTestId('color-blue');
        await user.click(blueButton);

        // 保存
        const submitButton = screen.getByTestId('submitButton');
        await user.click(submitButton);

        await waitFor(() => {
          expect(updateTag).toHaveBeenCalledWith(mockTag.id, {
            name: mockTag.name,
            color: TagColor.BLUE,
          });
        });

        await waitFor(() => {
          expect(onClose).toHaveBeenCalledTimes(1);
        });
      });

      test('タグ名と色の両方を変更して保存できること', async () => {
        const user = userEvent.setup();
        await renderTagFormDialog({ mode: 'edit', tagId: mockTag.id });

        // 既存のタグ情報が表示されるまで待機
        await waitFor(() => {
          const nameInput = screen
            .getByTestId('tagNameInput')
            .querySelector('input');
          expect(nameInput).toHaveValue(mockTag.name);
        });

        // タグ名を変更
        const nameInput = screen
          .getByTestId('tagNameInput')
          .querySelector('input');
        await user.clear(nameInput!);
        await user.type(nameInput!, 'Updated Tag');

        // 色を変更
        const greenButton = screen.getByTestId('color-green');
        await user.click(greenButton);

        // 保存
        const submitButton = screen.getByTestId('submitButton');
        await user.click(submitButton);

        await waitFor(() => {
          expect(updateTag).toHaveBeenCalledWith(mockTag.id, {
            name: 'Updated Tag',
            color: TagColor.GREEN,
          });
        });

        await waitFor(() => {
          expect(onClose).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('バリデーション', () => {
      test('タグ名を空にした場合エラーメッセージが表示されること', async () => {
        const user = userEvent.setup();
        await renderTagFormDialog({ mode: 'edit', tagId: mockTag.id });

        // 既存のタグ名が表示されるまで待機
        await waitFor(() => {
          const nameInput = screen
            .getByTestId('tagNameInput')
            .querySelector('input');
          expect(nameInput).toHaveValue(mockTag.name);
        });

        // タグ名をクリア
        const nameInput = screen
          .getByTestId('tagNameInput')
          .querySelector('input');
        await user.clear(nameInput!);

        // 保存
        const submitButton = screen.getByTestId('submitButton');
        await user.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText('タグ名は必須です')).toBeInTheDocument();
        });

        expect(createTag).not.toHaveBeenCalled();
      });

      test('タグ名を50文字を超える値に変更した場合エラーメッセージが表示されること', async () => {
        const user = userEvent.setup();
        await renderTagFormDialog({ mode: 'edit', tagId: mockTag.id });

        // 既存のタグ名が表示されるまで待機
        await waitFor(() => {
          const nameInput = screen
            .getByTestId('tagNameInput')
            .querySelector('input');
          expect(nameInput).toHaveValue(mockTag.name);
        });

        // タグ名を長すぎる値に変更
        const nameInput = screen
          .getByTestId('tagNameInput')
          .querySelector('input');
        await user.clear(nameInput!);
        const longName = 'a'.repeat(51);
        await user.type(nameInput!, longName);

        // 保存
        const submitButton = screen.getByTestId('submitButton');
        await user.click(submitButton);

        await waitFor(() => {
          expect(
            screen.getByText('タグ名は50文字以内で入力してください')
          ).toBeInTheDocument();
        });

        expect(createTag).not.toHaveBeenCalled();
      });
    });
  });

  describe('ダイアログの開閉', () => {
    test('openがfalseの場合はダイアログが表示されないこと', async () => {
      await renderTagFormDialog({ open: false });

      // MUIのDialogはDOM上には存在するが、表示されていない状態になる
      // data-testidで要素を取得できるかチェック
      const dialog = screen.queryByTestId('tagFormDialog');

      // ダイアログ自体は存在する可能性があるが、aria-hiddenなどで非表示になっている
      if (dialog) {
        // ダイアログが存在する場合、非表示の属性を確認
        expect(dialog).toHaveAttribute('aria-hidden', 'true');
      } else {
        // または完全にDOMに存在しない場合
        expect(dialog).not.toBeInTheDocument();
      }
    });

    test('openがtrueの場合はダイアログが表示されること', async () => {
      await renderTagFormDialog({ open: true });

      const dialog = screen.getByTestId('tagFormDialog');
      expect(dialog).toBeInTheDocument();
    });
  });

  describe('エラーハンドリング', () => {
    test('送信時にエラーが発生してもダイアログが閉じないこと', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      createTag.mockRejectedValue(new Error('API Error'));

      await renderTagFormDialog({ mode: 'create' });

      // タグ名を入力
      const nameInput = screen
        .getByTestId('tagNameInput')
        .querySelector('input');
      await user.type(nameInput!, 'New Tag');

      // 送信
      const submitButton = screen.getByTestId('submitButton');
      await user.click(submitButton);

      await waitFor(() => {
        expect(createTag).toHaveBeenCalled();
      });

      // エラーが発生してもダイアログは開いたまま
      expect(screen.getByTestId('tagFormDialog')).toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();

      // コンソールエラーが出力されていることを確認
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Tag operation failed:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
