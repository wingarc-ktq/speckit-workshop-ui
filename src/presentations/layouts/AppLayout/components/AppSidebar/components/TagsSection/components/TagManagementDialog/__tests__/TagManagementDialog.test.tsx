import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { mockTag, mockTag2, mockTag3, mockTags } from '@/__fixtures__/tags';
import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import type { Tag } from '@/domain/models/tag';
import { i18n } from '@/i18n/config';

import { TagManagementDialog } from '../TagManagementDialog';

import type { TagManagementDialogProps } from '../TagManagementDialog';

/**
 * TagFormDialogをモック化
 *
 * TagFormDialogは独立したテストで既にカバーされているため、
 * このテストではTagManagementDialogの責務に集中するためにモック化する。
 * モックにより、フォームダイアログの開閉とpropsの受け渡しが正しく行われることを検証する。
 */
vi.mock('../components/TagFormDialog/TagFormDialog', () => ({
  TagFormDialog: vi.fn(
    ({
      open,
      mode,
      tagId,
      onClose,
    }: {
      open: boolean;
      mode: 'create' | 'edit';
      tagId: string | null | undefined;
      onClose: () => void;
    }) => {
      if (!open) return null;
      return (
        <div data-testid="tagFormDialog">
          <div data-testid="formMode">{mode}</div>
          <div data-testid="formTagId">{tagId || 'null'}</div>
          <button data-testid="formCloseButton" onClick={onClose}>
            Close Form
          </button>
        </div>
      );
    }
  ),
}));

/**
 * TagDeleteConfirmDialogをモック化
 *
 * TagDeleteConfirmDialogは独立したテストで既にカバーされているため、
 * このテストではTagManagementDialogの責務に集中するためにモック化する。
 * モックにより、削除確認ダイアログの開閉とpropsの受け渡しが正しく行われることを検証する。
 */
vi.mock('../components/TagDeleteConfirmDialog/TagDeleteConfirmDialog', () => ({
  TagDeleteConfirmDialog: vi.fn(
    ({
      open,
      tagId,
      tagName,
      onClose,
    }: {
      open: boolean;
      tagId: string | null;
      tagName: string | undefined;
      onClose: () => void;
    }) => {
      if (!open) return null;
      return (
        <div data-testid="tagDeleteConfirmDialog">
          <div data-testid="deleteTagId">{tagId}</div>
          <div data-testid="deleteTagName">{tagName || 'undefined'}</div>
          <button data-testid="deleteCloseButton" onClick={onClose}>
            Close Delete
          </button>
        </div>
      );
    }
  ),
}));

describe('TagManagementDialog', () => {
  // リポジトリのモック関数
  const getTags = vi.fn<() => Promise<Tag[]>>();
  const onClose = vi.fn();

  beforeEach(async () => {
    await i18n.changeLanguage('ja');
    getTags.mockResolvedValue(mockTags);
  });

  const renderTagManagementDialog = async (
    props: Partial<TagManagementDialogProps> = {}
  ) => {
    const defaultProps: TagManagementDialogProps = {
      open: true,
      onClose: onClose,
    };

    const r = render(
      <RepositoryTestWrapper
        hasSuspense
        override={{
          tags: {
            getTags: getTags,
          },
        }}
      >
        <TagManagementDialog {...defaultProps} {...props} />
      </RepositoryTestWrapper>
    );

    await waitFor(() =>
      expect(r.queryByTestId('suspense')).not.toBeInTheDocument()
    );
    return r;
  };

  describe('多言語リソースの確認', () => {
    describe('i18n: layouts.appSidebar.tags.manageDialog.title', () => {
      test('locale:ja "タグの管理" が表示される', async () => {
        await renderTagManagementDialog();
        expect(screen.getByText('タグの管理')).toBeInTheDocument();
      });
    });

    describe('i18n: layouts.appSidebar.tags.manageDialog.createButton', () => {
      test('locale:ja "新しいタグを作成" が表示される', async () => {
        await renderTagManagementDialog();
        expect(screen.getByText('新しいタグを作成')).toBeInTheDocument();
      });
    });

    describe('i18n: common.close', () => {
      test('locale:ja "閉じる" が表示される', async () => {
        await renderTagManagementDialog();
        expect(screen.getByTestId('closeButton')).toHaveTextContent('閉じる');
      });
    });
  });

  describe('初期表示', () => {
    test('ダイアログが正しく表示されること', async () => {
      await renderTagManagementDialog();

      expect(screen.getByTestId('tagManagementDialog')).toBeInTheDocument();
      expect(screen.getByText('タグの管理')).toBeInTheDocument();
      expect(screen.getByTestId('createTagButton')).toBeInTheDocument();
      expect(screen.getByTestId('closeButton')).toBeInTheDocument();
    });

    test('全てのタグが表示されること', async () => {
      await renderTagManagementDialog();

      expect(screen.getByTestId(`tagChip-${mockTag.id}`)).toBeInTheDocument();
      expect(screen.getByTestId(`tagChip-${mockTag2.id}`)).toBeInTheDocument();
      expect(screen.getByTestId(`tagChip-${mockTag3.id}`)).toBeInTheDocument();
    });

    test('各タグに編集ボタンと削除ボタンが表示されること', async () => {
      await renderTagManagementDialog();

      // 編集ボタン
      expect(
        screen.getByTestId(`editTagButton-${mockTag.id}`)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`editTagButton-${mockTag2.id}`)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`editTagButton-${mockTag3.id}`)
      ).toBeInTheDocument();

      // 削除ボタン
      expect(
        screen.getByTestId(`deleteTagButton-${mockTag.id}`)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`deleteTagButton-${mockTag2.id}`)
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`deleteTagButton-${mockTag3.id}`)
      ).toBeInTheDocument();
    });

    test('タグが空の場合でもダイアログが表示されること', async () => {
      getTags.mockResolvedValue([]);
      await renderTagManagementDialog();

      expect(screen.getByTestId('tagManagementDialog')).toBeInTheDocument();
      expect(screen.getByTestId('createTagButton')).toBeInTheDocument();
    });
  });

  describe('ユーザー操作 - タグ作成', () => {
    test('作成ボタンをクリックするとフォームダイアログが作成モードで開くこと', async () => {
      const user = userEvent.setup();
      await renderTagManagementDialog();

      const createButton = screen.getByTestId('createTagButton');
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByTestId('tagFormDialog')).toBeInTheDocument();
      });

      expect(screen.getByTestId('formMode')).toHaveTextContent('create');
      expect(screen.getByTestId('formTagId')).toHaveTextContent('null');
    });

    test('フォームダイアログを閉じるとダイアログが非表示になること', async () => {
      const user = userEvent.setup();
      await renderTagManagementDialog();

      // フォームダイアログを開く
      const createButton = screen.getByTestId('createTagButton');
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByTestId('tagFormDialog')).toBeInTheDocument();
      });

      // フォームダイアログを閉じる
      const formCloseButton = screen.getByTestId('formCloseButton');
      await user.click(formCloseButton);

      await waitFor(() => {
        expect(screen.queryByTestId('tagFormDialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('ユーザー操作 - タグ編集', () => {
    test('編集ボタンをクリックするとフォームダイアログが編集モードで開くこと', async () => {
      const user = userEvent.setup();
      await renderTagManagementDialog();

      const editButton = screen.getByTestId(`editTagButton-${mockTag.id}`);
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByTestId('tagFormDialog')).toBeInTheDocument();
      });

      expect(screen.getByTestId('formMode')).toHaveTextContent('edit');
      expect(screen.getByTestId('formTagId')).toHaveTextContent(mockTag.id);
    });

    test('異なるタグの編集ボタンをクリックすると正しいタグIDが渡されること', async () => {
      const user = userEvent.setup();
      await renderTagManagementDialog();

      // 最初のタグの編集
      const editButton1 = screen.getByTestId(`editTagButton-${mockTag2.id}`);
      await user.click(editButton1);

      await waitFor(() => {
        expect(screen.getByTestId('tagFormDialog')).toBeInTheDocument();
      });

      expect(screen.getByTestId('formTagId')).toHaveTextContent(mockTag2.id);

      // フォームを閉じる
      const formCloseButton = screen.getByTestId('formCloseButton');
      await user.click(formCloseButton);

      await waitFor(() => {
        expect(screen.queryByTestId('tagFormDialog')).not.toBeInTheDocument();
      });

      // 別のタグの編集
      const editButton2 = screen.getByTestId(`editTagButton-${mockTag3.id}`);
      await user.click(editButton2);

      await waitFor(() => {
        expect(screen.getByTestId('tagFormDialog')).toBeInTheDocument();
      });

      expect(screen.getByTestId('formTagId')).toHaveTextContent(mockTag3.id);
    });
  });

  describe('ユーザー操作 - タグ削除', () => {
    test('削除ボタンをクリックすると削除確認ダイアログが開くこと', async () => {
      const user = userEvent.setup();
      await renderTagManagementDialog();

      const deleteButton = screen.getByTestId(`deleteTagButton-${mockTag.id}`);
      await user.click(deleteButton);

      await waitFor(() => {
        expect(
          screen.getByTestId('tagDeleteConfirmDialog')
        ).toBeInTheDocument();
      });

      expect(screen.getByTestId('deleteTagId')).toHaveTextContent(mockTag.id);
      expect(screen.getByTestId('deleteTagName')).toHaveTextContent(
        mockTag.name
      );
    });

    test('異なるタグの削除ボタンをクリックすると正しいタグ情報が渡されること', async () => {
      const user = userEvent.setup();
      await renderTagManagementDialog();

      // 最初のタグの削除
      const deleteButton1 = screen.getByTestId(
        `deleteTagButton-${mockTag2.id}`
      );
      await user.click(deleteButton1);

      await waitFor(() => {
        expect(
          screen.getByTestId('tagDeleteConfirmDialog')
        ).toBeInTheDocument();
      });

      expect(screen.getByTestId('deleteTagId')).toHaveTextContent(mockTag2.id);
      expect(screen.getByTestId('deleteTagName')).toHaveTextContent(
        mockTag2.name
      );

      // ダイアログを閉じる
      const deleteCloseButton = screen.getByTestId('deleteCloseButton');
      await user.click(deleteCloseButton);

      await waitFor(() => {
        expect(
          screen.queryByTestId('tagDeleteConfirmDialog')
        ).not.toBeInTheDocument();
      });

      // 別のタグの削除
      const deleteButton2 = screen.getByTestId(
        `deleteTagButton-${mockTag3.id}`
      );
      await user.click(deleteButton2);

      await waitFor(() => {
        expect(
          screen.getByTestId('tagDeleteConfirmDialog')
        ).toBeInTheDocument();
      });

      expect(screen.getByTestId('deleteTagId')).toHaveTextContent(mockTag3.id);
      expect(screen.getByTestId('deleteTagName')).toHaveTextContent(
        mockTag3.name
      );
    });

    test('削除確認ダイアログを閉じるとダイアログが非表示になること', async () => {
      const user = userEvent.setup();
      await renderTagManagementDialog();

      // 削除確認ダイアログを開く
      const deleteButton = screen.getByTestId(`deleteTagButton-${mockTag.id}`);
      await user.click(deleteButton);

      await waitFor(() => {
        expect(
          screen.getByTestId('tagDeleteConfirmDialog')
        ).toBeInTheDocument();
      });

      // ダイアログを閉じる
      const deleteCloseButton = screen.getByTestId('deleteCloseButton');
      await user.click(deleteCloseButton);

      await waitFor(() => {
        expect(
          screen.queryByTestId('tagDeleteConfirmDialog')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('ダイアログの開閉', () => {
    test('closeボタンをクリックするとonCloseが呼ばれること', async () => {
      const user = userEvent.setup();
      await renderTagManagementDialog();

      const closeButton = screen.getByTestId('closeButton');
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test('openがfalseの場合はダイアログが表示されないこと', async () => {
      await renderTagManagementDialog({ open: false });

      const dialog = screen.queryByTestId('tagManagementDialog');

      // MUIのDialogはDOM上には存在するが、非表示状態になる
      if (dialog) {
        expect(dialog).toHaveAttribute('aria-hidden', 'true');
      } else {
        expect(dialog).not.toBeInTheDocument();
      }
    });

    test('openがtrueの場合はダイアログが表示されること', async () => {
      await renderTagManagementDialog({ open: true });

      const dialog = screen.getByTestId('tagManagementDialog');
      expect(dialog).toBeInTheDocument();
    });
  });

  describe('複雑なシナリオ', () => {
    test('編集ダイアログを開いた状態で削除ボタンをクリックすると削除ダイアログが開くこと', async () => {
      const user = userEvent.setup();
      await renderTagManagementDialog();

      // 編集ダイアログを開く
      const editButton = screen.getByTestId(`editTagButton-${mockTag.id}`);
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByTestId('tagFormDialog')).toBeInTheDocument();
      });

      // 編集ダイアログを閉じる
      const formCloseButton = screen.getByTestId('formCloseButton');
      await user.click(formCloseButton);

      await waitFor(() => {
        expect(screen.queryByTestId('tagFormDialog')).not.toBeInTheDocument();
      });

      // 削除ダイアログを開く
      const deleteButton = screen.getByTestId(`deleteTagButton-${mockTag.id}`);
      await user.click(deleteButton);

      await waitFor(() => {
        expect(
          screen.getByTestId('tagDeleteConfirmDialog')
        ).toBeInTheDocument();
      });
    });

    test('作成ダイアログを開いて閉じた後に編集ダイアログを開けること', async () => {
      const user = userEvent.setup();
      await renderTagManagementDialog();

      // 作成ダイアログを開く
      const createButton = screen.getByTestId('createTagButton');
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByTestId('tagFormDialog')).toBeInTheDocument();
      });
      expect(screen.getByTestId('formMode')).toHaveTextContent('create');

      // 作成ダイアログを閉じる
      const formCloseButton = screen.getByTestId('formCloseButton');
      await user.click(formCloseButton);

      await waitFor(() => {
        expect(screen.queryByTestId('tagFormDialog')).not.toBeInTheDocument();
      });

      // 編集ダイアログを開く
      const editButton = screen.getByTestId(`editTagButton-${mockTag.id}`);
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByTestId('tagFormDialog')).toBeInTheDocument();
      });
      expect(screen.getByTestId('formMode')).toHaveTextContent('edit');
      expect(screen.getByTestId('formTagId')).toHaveTextContent(mockTag.id);
    });
  });
});
