import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { mockFile } from '@/__fixtures__/files';
import { mockTag, mockTag2, mockTag3, mockTags } from '@/__fixtures__/tags';
import { RepositoryTestWrapper } from '@/__fixtures__/testWrappers';
import type { DocumentFile } from '@/domain/models/file/type';
import { i18n } from '@/i18n/config';

import { FileCard } from '../FileCard';

describe('FileCard', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ja');
  });

  const renderComponent = async (props: {
    file: DocumentFile;
    onView?: (fileId: string) => void;
  }) => {
    const result = render(
      <RepositoryTestWrapper
        hasSuspense
        override={{
          tags: {
            getTags: vi.fn(async () => mockTags),
          },
        }}
      >
        <FileCard {...props} />
      </RepositoryTestWrapper>
    );

    // Suspenseの解決を待つ
    await waitFor(() => {
      expect(screen.queryByTestId('suspense')).not.toBeInTheDocument();
    });

    return result;
  };

  describe('多言語リソースの確認', () => {
    describe('i18n: filesPage.recentFilesSection.fileCard.viewButton', () => {
      test('locale:ja "文書を見る" が表示される', async () => {
        await renderComponent({ file: mockFile });

        expect(screen.getByText('文書を見る')).toBeInTheDocument();
      });
    });
  });

  describe('初期表示', () => {
    test('ファイル名が正しく表示されること', async () => {
      await renderComponent({ file: mockFile });

      expect(screen.getByText('document.pdf')).toBeInTheDocument();
    });

    test('アップロード日時が"yyyy/MM/dd"形式で表示されること', async () => {
      const file: DocumentFile = {
        ...mockFile,
        uploadedAt: new Date('2025-01-15T10:30:00Z'),
      };
      await renderComponent({ file });

      expect(screen.getByText('2025/01/15')).toBeInTheDocument();
    });

    test('ViewButtonが表示されること', async () => {
      await renderComponent({ file: mockFile });

      const viewButton = screen.getByRole('button', { name: '文書を見る' });
      expect(viewButton).toBeInTheDocument();
    });

    test('ViewButtonにArrowOutwardIconが表示されること', async () => {
      await renderComponent({ file: mockFile });

      const viewButton = screen.getByRole('button', { name: '文書を見る' });
      const icon = viewButton.querySelector(
        'svg[data-testid="ArrowOutwardIcon"]'
      );
      expect(icon).toBeInTheDocument();
    });

    test('ファイルアイコンが表示されること', async () => {
      await renderComponent({ file: mockFile });

      const fileIcon = screen.getByTestId('DescriptionIcon');
      expect(fileIcon).toBeInTheDocument();
    });

    test('日付アイコンが表示されること', async () => {
      await renderComponent({ file: mockFile });

      const dateIcon = screen.getByTestId('CalendarTodayOutlinedIcon');
      expect(dateIcon).toBeInTheDocument();
    });
  });

  describe('タグ表示', () => {
    test('tagIdsが空の場合、タグが表示されないこと', async () => {
      const file: DocumentFile = {
        ...mockFile,
        tagIds: [],
      };
      await renderComponent({ file });

      expect(screen.queryByText('Important')).not.toBeInTheDocument();
      expect(screen.queryByText('Review')).not.toBeInTheDocument();
      expect(screen.queryByText('Urgent')).not.toBeInTheDocument();
    });

    test('tagIdsに1つのタグIDが含まれる場合、該当するタグが表示されること', async () => {
      const file: DocumentFile = {
        ...mockFile,
        tagIds: [mockTag.id],
      };
      await renderComponent({ file });

      expect(screen.getByText('Important')).toBeInTheDocument();
      expect(screen.queryByText('Review')).not.toBeInTheDocument();
      expect(screen.queryByText('Urgent')).not.toBeInTheDocument();
    });

    test('tagIdsに複数のタグIDが含まれる場合、該当するタグが全て表示されること', async () => {
      const file: DocumentFile = {
        ...mockFile,
        tagIds: [mockTag.id, mockTag2.id, mockTag3.id],
      };
      await renderComponent({ file });

      expect(screen.getByText('Important')).toBeInTheDocument();
      expect(screen.getByText('Review')).toBeInTheDocument();
      expect(screen.getByText('Urgent')).toBeInTheDocument();
    });

    test('tagIdsに存在しないタグIDが含まれる場合、該当するタグのみ表示されること', async () => {
      const file: DocumentFile = {
        ...mockFile,
        tagIds: [mockTag.id, 'non-existent-tag-id', mockTag2.id],
      };
      await renderComponent({ file });

      expect(screen.getByText('Important')).toBeInTheDocument();
      expect(screen.getByText('Review')).toBeInTheDocument();
      expect(screen.queryByText('Urgent')).not.toBeInTheDocument();
    });

    test('TagChipsコンポーネントにsize="small"が渡されること', async () => {
      const file: DocumentFile = {
        ...mockFile,
        tagIds: [mockTag.id],
      };
      await renderComponent({ file });

      const chip = screen.getByText('Important');
      expect(chip.closest('.MuiChip-root')).toHaveClass('MuiChip-sizeSmall');
    });
  });

  describe('ユーザー操作', () => {
    test('ViewButtonをクリックするとonViewコールバックが呼ばれること', async () => {
      const user = userEvent.setup();
      const onView = vi.fn();

      await renderComponent({ file: mockFile, onView });

      const viewButton = screen.getByRole('button', { name: '文書を見る' });
      await user.click(viewButton);

      expect(onView).toHaveBeenCalledTimes(1);
      expect(onView).toHaveBeenCalledWith(mockFile.id);
    });

    test('ViewButtonをクリックした時、正しいファイルIDが渡されること', async () => {
      const user = userEvent.setup();
      const onView = vi.fn();
      const customFile: DocumentFile = {
        ...mockFile,
        id: 'custom-file-123',
      };

      await renderComponent({ file: customFile, onView });

      const viewButton = screen.getByRole('button', { name: '文書を見る' });
      await user.click(viewButton);

      expect(onView).toHaveBeenCalledWith('custom-file-123');
    });

    test('onViewが渡されていない場合でも、ViewButtonをクリックしてもエラーが発生しないこと', async () => {
      const user = userEvent.setup();

      await renderComponent({ file: mockFile });

      const viewButton = screen.getByRole('button', { name: '文書を見る' });
      await expect(user.click(viewButton)).resolves.not.toThrow();
    });

    test('ViewButtonを複数回クリックするとonViewが複数回呼ばれること', async () => {
      const user = userEvent.setup();
      const onView = vi.fn();

      await renderComponent({ file: mockFile, onView });

      const viewButton = screen.getByRole('button', { name: '文書を見る' });

      await user.click(viewButton);
      await user.click(viewButton);
      await user.click(viewButton);

      expect(onView).toHaveBeenCalledTimes(3);
      expect(onView).toHaveBeenCalledWith(mockFile.id);
    });
  });

  describe('エッジケース', () => {
    test('ファイル名が非常に長い場合でも正しく表示されること', async () => {
      const file: DocumentFile = {
        ...mockFile,
        name: 'very-long-file-name-that-exceeds-normal-length-and-should-be-handled-properly-by-the-component.pdf',
      };
      await renderComponent({ file });

      expect(
        screen.getByText(
          'very-long-file-name-that-exceeds-normal-length-and-should-be-handled-properly-by-the-component.pdf'
        )
      ).toBeInTheDocument();
    });

    test('日本語のファイル名が正しく表示されること', async () => {
      const file: DocumentFile = {
        ...mockFile,
        name: 'とても長いファイル名のドキュメント_非常に詳細な説明付き_バージョン1.2.3_最終版.pdf',
      };
      await renderComponent({ file });

      expect(
        screen.getByText(
          'とても長いファイル名のドキュメント_非常に詳細な説明付き_バージョン1.2.3_最終版.pdf'
        )
      ).toBeInTheDocument();
    });

    test('uploadedAtが過去の日付の場合でも正しく表示されること', async () => {
      const file: DocumentFile = {
        ...mockFile,
        uploadedAt: new Date('2020-01-01T00:00:00Z'),
      };
      await renderComponent({ file });

      expect(screen.getByText('2020/01/01')).toBeInTheDocument();
    });

    test('uploadedAtが未来の日付の場合でも正しく表示されること', async () => {
      const file: DocumentFile = {
        ...mockFile,
        uploadedAt: new Date('2030-06-15T10:00:00Z'),
      };
      await renderComponent({ file });

      expect(screen.getByText('2030/06/15')).toBeInTheDocument();
    });

    test('descriptionがnullの場合でも正常に表示されること', async () => {
      const file: DocumentFile = {
        ...mockFile,
        description: null,
      };
      await renderComponent({ file });

      expect(screen.getByText('document.pdf')).toBeInTheDocument();
      expect(screen.getByText('2025/01/11')).toBeInTheDocument();
    });

    test('異なるMIMEタイプのファイルでも表示されること', async () => {
      const file: DocumentFile = {
        ...mockFile,
        id: 'excel-file',
        name: 'spreadsheet.xlsx',
        // cSpell:disable-next-line
        mimeType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
      await renderComponent({ file });

      expect(screen.getByText('spreadsheet.xlsx')).toBeInTheDocument();
    });

    test('複数のFileCardを並べて表示した場合、それぞれが独立して動作すること', async () => {
      const user = userEvent.setup();
      const onView1 = vi.fn();
      const onView2 = vi.fn();

      const file1: DocumentFile = {
        ...mockFile,
        id: 'file-1',
        name: 'file1.pdf',
      };
      const file2: DocumentFile = {
        ...mockFile,
        id: 'file-2',
        name: 'file2.pdf',
      };

      render(
        <RepositoryTestWrapper
          hasSuspense
          override={{
            tags: {
              getTags: vi.fn(async () => mockTags),
            },
          }}
        >
          <FileCard file={file1} onView={onView1} />
          <FileCard file={file2} onView={onView2} />
        </RepositoryTestWrapper>
      );

      // Suspenseの解決を待つ
      await waitFor(() => {
        expect(screen.queryByTestId('suspense')).not.toBeInTheDocument();
      });

      const viewButtons = screen.getAllByRole('button', { name: '文書を見る' });
      expect(viewButtons).toHaveLength(2);

      await user.click(viewButtons[0]);
      expect(onView1).toHaveBeenCalledTimes(1);
      expect(onView1).toHaveBeenCalledWith('file-1');
      expect(onView2).not.toHaveBeenCalled();

      await user.click(viewButtons[1]);
      expect(onView2).toHaveBeenCalledTimes(1);
      expect(onView2).toHaveBeenCalledWith('file-2');
      expect(onView1).toHaveBeenCalledTimes(1);
    });
  });

  describe('日付フォーマットの検証', () => {
    test('1桁の月日が0埋めされて表示されること', async () => {
      const file: DocumentFile = {
        ...mockFile,
        uploadedAt: new Date('2025-01-05T10:00:00Z'),
      };
      await renderComponent({ file });

      expect(screen.getByText('2025/01/05')).toBeInTheDocument();
    });

    test('2桁の月日が正しく表示されること', async () => {
      const file: DocumentFile = {
        ...mockFile,
        uploadedAt: new Date('2025-12-25T10:00:00Z'),
      };
      await renderComponent({ file });

      expect(screen.getByText('2025/12/25')).toBeInTheDocument();
    });

    test('年末年始の日付が正しく表示されること', async () => {
      const file: DocumentFile = {
        ...mockFile,
        uploadedAt: new Date('2024-12-31T10:00:00Z'),
      };
      await renderComponent({ file });

      expect(screen.getByText('2024/12/31')).toBeInTheDocument();
    });

    test('年始の日付が正しく表示されること', async () => {
      const file: DocumentFile = {
        ...mockFile,
        uploadedAt: new Date('2025-01-01T00:00:00Z'),
      };
      await renderComponent({ file });

      expect(screen.getByText('2025/01/01')).toBeInTheDocument();
    });

    test('月末の日付が正しく表示されること', async () => {
      const file: DocumentFile = {
        ...mockFile,
        uploadedAt: new Date('2025-02-28T10:00:00Z'),
      };
      await renderComponent({ file });

      expect(screen.getByText('2025/02/28')).toBeInTheDocument();
    });

    test('うるう年の2月29日が正しく表示されること', async () => {
      const file: DocumentFile = {
        ...mockFile,
        uploadedAt: new Date('2024-02-29T12:00:00Z'),
      };
      await renderComponent({ file });

      expect(screen.getByText('2024/02/29')).toBeInTheDocument();
    });
  });

  describe('CardのUI構造', () => {
    test('StyledCardコンポーネントが描画されること', async () => {
      await renderComponent({ file: mockFile });

      const card = screen.getByText('document.pdf').closest('.MuiBox-root');
      expect(card).toBeInTheDocument();
    });

    test('StyledCardContentが描画されること', async () => {
      await renderComponent({ file: mockFile });

      const cardContent = screen
        .getByText('document.pdf')
        .closest('.MuiCardContent-root');
      expect(cardContent).toBeInTheDocument();
    });

    test('StyledCardActionsが描画されること', async () => {
      await renderComponent({ file: mockFile });

      const viewButton = screen.getByRole('button', { name: '文書を見る' });
      const cardActions = viewButton.closest('.MuiCardActions-root');
      expect(cardActions).toBeInTheDocument();
    });

    test('ViewButtonがfullWidth属性を持つこと', async () => {
      await renderComponent({ file: mockFile });

      const viewButton = screen.getByRole('button', { name: '文書を見る' });
      expect(viewButton.closest('.MuiButton-root')).toHaveClass(
        'MuiButton-fullWidth'
      );
    });

    test('ViewButtonがvariant="contained"であること', async () => {
      await renderComponent({ file: mockFile });

      const viewButton = screen.getByRole('button', { name: '文書を見る' });
      expect(viewButton.closest('.MuiButton-root')).toHaveClass(
        'MuiButton-contained'
      );
    });

    test('ViewButtonがsize="small"であること', async () => {
      await renderComponent({ file: mockFile });

      const viewButton = screen.getByRole('button', { name: '文書を見る' });
      expect(viewButton.closest('.MuiButton-root')).toHaveClass(
        'MuiButton-sizeSmall'
      );
    });
  });
});
